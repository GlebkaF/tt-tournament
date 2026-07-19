import { timingSafeEqual } from "node:crypto";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import createDeps from "@/service/create-deps";
import { dateInNovosibirsk } from "@/service/daily-digest-service";
import { getExternalFetch } from "@/service/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.DIGEST_CRON_SECRET;
  const header = request.headers.get("Authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

async function probeTelegram(): Promise<{
  status: "ready";
  forum: boolean;
  botRole: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) {
    throw new Error("Telegram credentials are not configured");
  }

  const call = async <T>(method: string, params: Record<string, string> = {}) => {
    const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = await getExternalFetch()(url);
    const body = (await response.json()) as {
      ok?: boolean;
      description?: string;
      result?: T;
    };
    if (!response.ok || !body.ok || body.result === undefined) {
      throw new Error(
        `${method}: ${body.description || `HTTP ${response.status}`}`
      );
    }
    return body.result;
  };

  const bot = await call<{ id: number }>("getMe");
  const chat = await call<{ is_forum?: boolean }>("getChat", {
    chat_id: chatId,
  });
  const member = await call<{ status: string }>("getChatMember", {
    chat_id: chatId,
    user_id: String(bot.id),
  });
  if (!chat.is_forum || member.status !== "administrator") {
    throw new Error("Telegram forum or bot permissions are not ready");
  }

  await call("deleteWebhook");
  const commands = JSON.stringify([
    { command: "start", description: "Познакомиться с ботом" },
    {
      command: "remaining",
      description: "С кем мне осталось сыграть",
    },
  ]);
  await call("setMyCommands", { commands });
  await call("setMyCommands", {
    commands,
    scope: JSON.stringify({ type: "all_group_chats" }),
  });
  await call("setMyCommands", {
    commands,
    scope: JSON.stringify({ type: "chat", chat_id: chatId }),
  });
  await call("setMyCommands", { commands, language_code: "ru" });
  await call("setMyCommands", {
    commands,
    language_code: "ru",
    scope: JSON.stringify({ type: "all_group_chats" }),
  });
  await call("setMyCommands", {
    commands,
    language_code: "ru",
    scope: JSON.stringify({ type: "chat", chat_id: chatId }),
  });
  return { status: "ready", forum: true, botRole: member.status };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";
    const inspect = url.searchParams.get("inspect") === "1";
    const probe = url.searchParams.get("probe") === "1";
    const requestedDate = url.searchParams.get("date") ?? undefined;
    const date =
      (dryRun || inspect) &&
      requestedDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
        ? requestedDate
        : undefined;
    const { dailyDigestService, prisma } = createDeps();
    if (probe) {
      return Response.json({ telegram: await probeTelegram() });
    }
    if (inspect) {
      const digestDate = date ?? dateInNovosibirsk();
      const digest = await prisma.dailyDigest.findUnique({
        where: {
          tournamentId_digestDate: {
            tournamentId: CURRENT_TOURNAMENT_ID,
            digestDate,
          },
        },
        select: {
          status: true,
          attempts: true,
          editorSource: true,
          telegramMessageId: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return Response.json({ date: digestDate, digest });
    }
    const result = await dailyDigestService.run({ dryRun, date });
    return Response.json({
      status: result.status,
      date: result.date,
      editorSource: result.editorSource,
      telegramMessageId: result.telegramMessageId,
      ...(dryRun ? { message: result.message, analysis: result.analysis } : {}),
    });
  } catch (error) {
    console.error("Daily digest cron failed:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Daily digest failed", detail: detail.slice(0, 1000) },
      { status: 500 }
    );
  }
}
