import { MatchResult } from "@/app/interface";

const PASSWORD_LS_KEY = "auth_password";

export function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PASSWORD_LS_KEY);
}

export function storePassword(pw: string) {
  localStorage.setItem(PASSWORD_LS_KEY, pw);
}

export function clearStoredPassword() {
  localStorage.removeItem(PASSWORD_LS_KEY);
}

export function promptPassword(): string {
  const pw = prompt("Введите пароль организатора:") ?? "";
  return pw.match(/^[a-zA-Z0-9]+$/) ? pw : "";
}

const SCORE: Record<MatchResult, { player1Score: number; player2Score: number }> = {
  [MatchResult.player1Win]: { player1Score: 2, player2Score: 0 },
  [MatchResult.player2Win]: { player1Score: 0, player2Score: 2 },
  [MatchResult.draw]: { player1Score: 1, player2Score: 1 },
};

export type RecordOutcome =
  | { ok: true }
  | { ok: false; reason: "auth" | "duplicate" | "error" };

/**
 * Записывает результат матча в /api/match.
 * Пароль берётся из localStorage; при 401 чистим его, чтобы запросить заново.
 */
export async function recordMatch(params: {
  player1Id: number;
  player2Id: number;
  result: MatchResult;
  password: string;
  date?: string;
}): Promise<RecordOutcome> {
  const { player1Id, player2Id, result, password, date } = params;
  const { player1Score, player2Score } = SCORE[result];

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Basic ${btoa(`admin:${password}`)}`);

  const today = date ?? new Date().toISOString().slice(0, 10);

  const res = await fetch("/api/match", {
    method: "POST",
    headers,
    body: JSON.stringify({
      player1Id,
      player2Id,
      player1Score,
      player2Score,
      result,
      date: today,
    }),
  });

  if (res.ok) return { ok: true };
  if (res.status === 401) {
    clearStoredPassword();
    return { ok: false, reason: "auth" };
  }
  // createMatch бросает "Match already exists" → 500. Различим по тексту.
  try {
    const body = await res.text();
    if (body.toLowerCase().includes("exist")) {
      return { ok: false, reason: "duplicate" };
    }
  } catch {
    /* ignore */
  }
  return { ok: false, reason: "error" };
}
