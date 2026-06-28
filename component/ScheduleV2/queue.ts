import { QueuePair } from "./types";

/** Неупорядоченный ключ пары: "меньший-больший". */
export function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

interface BuildQueueInput {
  /** Пришедшие и сейчас свободные игроки (не за столом). */
  idlePlayerIds: number[];
  /** Ключи уже сыгранных пар (сервер + занесённые в этой сессии). */
  playedPairKeys: Set<string>;
  /** Сыграно всего за турнир (для справедливости по «новичкам»). */
  gamesTotal: Map<number, number>;
  /** Сыграно сегодня (главный приоритет — кто меньше играл сегодня). */
  gamesToday: Map<number, number>;
}

/**
 * Строит справедливую очередь пар среди свободных игроков.
 *
 * Жадный алгоритм:
 * 1. Сортируем игроков по «нужде»: меньше игр сегодня → меньше игр всего.
 * 2. Берём самого «обделённого» и подбираем ему самого обделённого
 *    соперника, с которым он ещё не играл.
 * 3. Повторяем, пока есть кого свести. Кто не нашёл соперника (сыграл со
 *    всеми присутствующими) — выпадает из очереди.
 *
 * Возвращает пары в порядке приоритета: первые — те, кого звать в первую
 * очередь.
 */
export function buildQueue({
  idlePlayerIds,
  playedPairKeys,
  gamesTotal,
  gamesToday,
}: BuildQueueInput): QueuePair[] {
  const need = (id: number) => ({
    today: gamesToday.get(id) ?? 0,
    total: gamesTotal.get(id) ?? 0,
  });

  const sorted = [...idlePlayerIds].sort((a, b) => {
    const na = need(a);
    const nb = need(b);
    if (na.today !== nb.today) return na.today - nb.today;
    if (na.total !== nb.total) return na.total - nb.total;
    return a - b;
  });

  const used = new Set<number>();
  const queue: QueuePair[] = [];

  for (const a of sorted) {
    if (used.has(a)) continue;
    // Ищем самого нуждающегося соперника, с кем ещё не играли.
    let opponent: number | null = null;
    for (const b of sorted) {
      if (b === a || used.has(b)) continue;
      if (playedPairKeys.has(pairKey(a, b))) continue;
      opponent = b;
      break;
    }
    if (opponent === null) continue;
    used.add(a);
    used.add(opponent);
    queue.push({ player1Id: a, player2Id: opponent });
  }

  return queue;
}

/**
 * Сколько ещё уникальных соперников осталось у игрока среди присутствующих.
 * 0 → сыграл со всеми, кто сегодня есть.
 */
export function remainingOpponents(
  playerId: number,
  presentIds: number[],
  playedPairKeys: Set<string>
): number {
  let count = 0;
  for (const other of presentIds) {
    if (other === playerId) continue;
    if (!playedPairKeys.has(pairKey(playerId, other))) count++;
  }
  return count;
}
