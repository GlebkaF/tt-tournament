import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  DailyDigestAnalysis,
  DigestEventCandidate,
  selectFallbackEvents,
} from "@/utils/dailyDigest";
import { getExternalFetch } from "../proxy";

const SelectionSchema = z.object({
  selectedCandidateIds: z.array(z.string()).max(3),
});

export interface EditorialSelection {
  events: DigestEventCandidate[];
  source: "openai" | "fallback";
  warning?: string;
}

function normalizeSelection(
  requestedIds: string[],
  candidates: DigestEventCandidate[],
  limit: number
): DigestEventCandidate[] {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const requested = [...new Set(requestedIds)]
    .map((id) => byId.get(id))
    .filter((candidate): candidate is DigestEventCandidate => !!candidate);
  const fallback = selectFallbackEvents(candidates, limit);
  const ordered = [...requested, ...fallback, ...candidates].filter(
    (candidate, index, all) => all.findIndex((item) => item.id === candidate.id) === index
  );

  const selected: DigestEventCandidate[] = [];
  const usedPlayers = new Set<number>();
  const usedKinds = new Set<DigestEventCandidate["kind"]>();
  for (const candidate of ordered) {
    if (candidate.playerIds.some((id) => usedPlayers.has(id))) continue;
    if (usedKinds.has(candidate.kind)) continue;
    selected.push(candidate);
    candidate.playerIds.forEach((id) => usedPlayers.add(id));
    usedKinds.add(candidate.kind);
    if (selected.length === limit) return selected;
  }

  // Если игроков не хватает, повторяем игрока раньше, чем тип сюжета.
  for (const candidate of ordered) {
    if (selected.some((item) => item.id === candidate.id)) continue;
    if (usedKinds.has(candidate.kind)) continue;
    selected.push(candidate);
    usedKinds.add(candidate.kind);
    if (selected.length === limit) break;
  }
  for (const candidate of ordered) {
    if (selected.some((item) => item.id === candidate.id)) continue;
    selected.push(candidate);
    if (selected.length === limit) break;
  }
  return selected;
}

export async function selectDigestEvents(
  analysis: DailyDigestAnalysis
): Promise<EditorialSelection> {
  const limit = Math.min(3, analysis.summary.matches);
  const fallback = selectFallbackEvents(analysis.candidates, limit);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || limit === 0) {
    return { events: fallback, source: "fallback", warning: "OpenAI is not configured" };
  }

  const client = new OpenAI({
    apiKey,
    fetch: getExternalFetch(),
    timeout: 20_000,
    maxRetries: 1,
  });
  try {
    const response = await client.responses.parse({
      model: process.env.OPENAI_EDITOR_MODEL || "gpt-5.4-mini",
      reasoning: { effort: "low" },
      instructions: [
        "Ты редактор ежедневной сводки локального турнира по настольному теннису.",
        `Выбери ровно ${limit} самых интересных карточек из переданного списка.`,
        "Не создавай новые факты и не пиши текст публикации: верни только идентификаторы существующих карточек.",
        "Приоритет: перелом личной серии, смена лидера, завершение круга, серия побед, день без поражений, равная ничья, личный рубеж, марафон.",
        "Старайся не выбирать одного игрока в несколько карточек. Повтор допустим только если иначе невозможно набрать нужное число.",
        "Низкоприоритетные MATCH_RESULT используй только когда более содержательных сюжетов недостаточно.",
      ].join("\n"),
      input: JSON.stringify({
        date: analysis.date,
        summary: analysis.summary,
        completionPercent: Math.round(analysis.completionPercent * 10) / 10,
        finalStretch: analysis.finalStretch,
        candidates: analysis.candidates.map((candidate) => ({
          id: candidate.id,
          kind: candidate.kind,
          priority: candidate.priority,
          playerIds: candidate.playerIds,
          headline: candidate.headline,
          fact: candidate.body,
        })),
      }),
      text: {
        format: zodTextFormat(SelectionSchema, "daily_digest_selection"),
      },
    });

    if (!response.output_parsed) {
      return { events: fallback, source: "fallback", warning: "OpenAI returned no selection" };
    }
    const events = normalizeSelection(
      response.output_parsed.selectedCandidateIds,
      analysis.candidates,
      limit
    );
    if (events.length !== limit) {
      return { events: fallback, source: "fallback", warning: "OpenAI selection was incomplete" };
    }
    return { events, source: "openai" };
  } catch (error) {
    const warning = error instanceof Error ? error.message : "Unknown OpenAI error";
    return { events: fallback, source: "fallback", warning };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function plural(value: number, forms: [string, string, string]): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function formatDailyDigestMessage(
  analysis: DailyDigestAnalysis,
  events: DigestEventCandidate[],
  tournamentUrl: string
): string {
  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Novosibirsk",
  }).format(new Date(`${analysis.date}T12:00:00.000Z`));
  const { matches, players, draws } = analysis.summary;
  const blocks = events.map(
    (event) => `<b>${escapeHtml(event.headline)}</b>\n${escapeHtml(event.body)}`
  );

  return [
    "<b>ВЕЧЕРНЯЯ ПОДАЧА</b>",
    `${dateLabel} · Европейский берег`,
    "",
    `<b>${matches}</b> ${plural(matches, ["матч", "матча", "матчей"])}`,
    `<b>${players}</b> ${plural(players, ["игрок", "игрока", "игроков"])}`,
    `<b>${draws}</b> ${plural(draws, ["ничья", "ничьи", "ничьих"])}`,
    "",
    blocks.join("\n\n"),
    "",
    `<a href="${escapeHtml(tournamentUrl)}">Актуальная таблица →</a>`,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}
