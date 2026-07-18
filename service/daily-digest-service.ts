import { DailyDigestStatus, Prisma, PrismaClient } from "@prisma/client";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import {
  analyzeDailyDigest,
  DailyDigestAnalysis,
  DigestEventCandidate,
  DigestMatch,
} from "@/utils/dailyDigest";
import { TournamentService } from "./tournament-service";
import {
  EditorialSelection,
  formatDailyDigestMessage,
  selectDigestEvents,
} from "./daily-digest/editor";

const TIME_ZONE = "Asia/Novosibirsk";
const PROCESSING_STALE_MS = 2 * 60 * 1000;

export interface DailyDigestRunResult {
  status: "dry_run" | "published" | "skipped" | "already_published" | "processing";
  date: string;
  message?: string;
  analysis?: DailyDigestAnalysis;
  events?: DigestEventCandidate[];
  editorSource?: EditorialSelection["source"];
  telegramMessageId?: number;
}

export function dateInNovosibirsk(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function bounds(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new Error(`Invalid digest date: ${date}`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function parseMatchIds(value: Prisma.JsonValue): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is number => Number.isInteger(id) && Number(id) > 0);
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 2000);
}

async function sendTelegramMessage(text: string): Promise<number> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  const threadId = Number(process.env.TELEGRAM_THREAD_ID);
  if (!token || !chatId || !Number.isInteger(threadId)) {
    throw new Error("Telegram digest credentials are not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: threadId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: controller.signal,
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };
    if (!response.ok || !payload.ok || !payload.result?.message_id) {
      throw new Error(payload.description || `Telegram HTTP ${response.status}`);
    }
    return payload.result.message_id;
  } finally {
    clearTimeout(timeout);
  }
}

export class DailyDigestService {
  constructor(
    private prisma: PrismaClient,
    private tournamentService: TournamentService
  ) {}

  private async snapshotMatchIds(date: string): Promise<number[]> {
    const { start, end } = bounds(date);
    const matches = await this.prisma.match.findMany({
      where: {
        tournamentId: CURRENT_TOURNAMENT_ID,
        date: { gte: start, lt: end },
      },
      orderBy: { id: "asc" },
      select: { id: true },
    });
    return matches.map(({ id }) => id);
  }

  private async build(
    date: string,
    snapshotMatchIds: number[]
  ): Promise<{
    analysis: DailyDigestAnalysis;
    selection: EditorialSelection;
    message: string;
  }> {
    const { start } = bounds(date);
    const activePlayers = await this.tournamentService.getPlayers(
      CURRENT_TOURNAMENT_ID
    );
    const activePlayerIds = activePlayers.map(({ id }) => id);
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { date: { lt: start } },
          ...(snapshotMatchIds.length ? [{ id: { in: snapshotMatchIds } }] : []),
        ],
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      select: {
        id: true,
        tournamentId: true,
        player1Id: true,
        player2Id: true,
        result: true,
        date: true,
      },
    });
    const referencedIds = new Set<number>(activePlayerIds);
    for (const match of matches) {
      referencedIds.add(match.player1Id);
      referencedIds.add(match.player2Id);
    }
    const players = await this.prisma.user.findMany({
      where: { id: { in: [...referencedIds] } },
      select: { id: true, firstName: true, lastName: true },
    });

    const analysis = analyzeDailyDigest({
      date,
      tournamentId: CURRENT_TOURNAMENT_ID,
      activePlayerIds,
      players,
      matches: matches as DigestMatch[],
    });
    const selection = await selectDigestEvents(analysis);
    if (selection.warning) {
      console.warn("Daily digest editor fallback:", selection.warning);
    }
    const message = formatDailyDigestMessage(
      analysis,
      selection.events,
      `https://ebtt.ru/tournament/${CURRENT_TOURNAMENT_ID}`
    );
    return { analysis, selection, message };
  }

  async run(options: {
    date?: string;
    dryRun?: boolean;
  } = {}): Promise<DailyDigestRunResult> {
    const date = options.date ?? dateInNovosibirsk();
    const freshMatchIds = await this.snapshotMatchIds(date);

    if (options.dryRun) {
      if (freshMatchIds.length === 0) return { status: "skipped", date };
      const built = await this.build(date, freshMatchIds);
      return {
        status: "dry_run",
        date,
        message: built.message,
        analysis: built.analysis,
        events: built.selection.events,
        editorSource: built.selection.source,
      };
    }

    let digest;
    let ownsAttempt = false;
    try {
      digest = await this.prisma.dailyDigest.create({
        data: {
          tournamentId: CURRENT_TOURNAMENT_ID,
          digestDate: date,
          status: freshMatchIds.length
            ? DailyDigestStatus.PROCESSING
            : DailyDigestStatus.SKIPPED,
          matchIds: freshMatchIds,
        },
      });
      ownsAttempt = true;
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
      digest = await this.prisma.dailyDigest.findUniqueOrThrow({
        where: {
          tournamentId_digestDate: {
            tournamentId: CURRENT_TOURNAMENT_ID,
            digestDate: date,
          },
        },
      });
    }

    if (digest.status === DailyDigestStatus.PUBLISHED) {
      return {
        status: "already_published",
        date,
        message: digest.content ?? undefined,
        telegramMessageId: digest.telegramMessageId ?? undefined,
      };
    }
    if (digest.status === DailyDigestStatus.SKIPPED) {
      return { status: "skipped", date };
    }

    if (!ownsAttempt) {
      const isFreshProcessing =
        digest.status === DailyDigestStatus.PROCESSING &&
        Date.now() - digest.updatedAt.getTime() < PROCESSING_STALE_MS;
      if (isFreshProcessing) return { status: "processing", date };

      const claimed = await this.prisma.dailyDigest.updateMany({
        where: {
          id: digest.id,
          updatedAt: digest.updatedAt,
          status: {
            in: [DailyDigestStatus.PROCESSING, DailyDigestStatus.FAILED],
          },
        },
        data: {
          status: DailyDigestStatus.PROCESSING,
          attempts: { increment: 1 },
          lastError: null,
        },
      });
      if (claimed.count !== 1) return { status: "processing", date };
    }

    const snapshotMatchIds = parseMatchIds(digest.matchIds);
    try {
      const built = digest.content
        ? null
        : await this.build(date, snapshotMatchIds);
      const message = digest.content ?? built!.message;
      const editorSource =
        (digest.editorSource as EditorialSelection["source"] | null) ??
        built?.selection.source ??
        "fallback";

      // Сохраняем готовый текст до внешнего запроса. Если Telegram временно
      // недоступен, retry отправит тот же снимок, не пересчитывая поздние правки.
      if (!digest.content) {
        await this.prisma.dailyDigest.update({
          where: { id: digest.id },
          data: {
            content: message,
            editorSource,
          },
        });
      }

      const telegramMessageId = await sendTelegramMessage(message);
      await this.prisma.dailyDigest.update({
        where: { id: digest.id },
        data: {
          status: DailyDigestStatus.PUBLISHED,
          content: message,
          editorSource,
          telegramMessageId,
          lastError: null,
        },
      });
      return {
        status: "published",
        date,
        message,
        analysis: built?.analysis,
        events: built?.selection.events,
        editorSource,
        telegramMessageId,
      };
    } catch (error) {
      await this.prisma.dailyDigest.update({
        where: { id: digest.id },
        data: {
          status: DailyDigestStatus.FAILED,
          lastError: errorMessage(error),
        },
      });
      throw error;
    }
  }
}
