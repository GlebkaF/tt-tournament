export type DigestMatchResult = "PLAYER1_WIN" | "PLAYER2_WIN" | "DRAW";

export interface DigestMatch {
  id: number;
  tournamentId: number;
  player1Id: number;
  player2Id: number;
  result: DigestMatchResult;
  date: Date;
}

export interface DigestPlayer {
  id: number;
  firstName: string;
  lastName: string;
}

export type DigestEventKind =
  | "LEADER_CHANGE"
  | "PERSONAL_SERIES_BREAK"
  | "WIN_STREAK"
  | "UNBEATEN_DAY"
  | "MARATHON"
  | "CLOSE_DRAW"
  | "FIRST_WIN"
  | "MATCH_MILESTONE"
  | "TOURNAMENT_COMPLETE"
  | "FINAL_STRETCH_MOVE"
  | "MATCH_RESULT";

export interface DigestEventCandidate {
  id: string;
  kind: DigestEventKind;
  priority: number;
  playerIds: number[];
  headline: string;
  body: string;
  evidence: Record<string, string | number | boolean | null>;
}

export interface DailyDigestAnalysis {
  date: string;
  summary: {
    matches: number;
    players: number;
    draws: number;
  };
  completionPercent: number;
  finalStretch: boolean;
  candidates: DigestEventCandidate[];
}

interface AnalyzeDailyDigestInput {
  date: string;
  tournamentId: number;
  activePlayerIds: number[];
  players: DigestPlayer[];
  matches: DigestMatch[];
}

interface PlayerStanding {
  playerId: number;
  points: number;
  wins: number;
  games: number;
  position: number;
}

interface HeadToHead {
  wins: Map<number, number>;
  draws: number;
  matches: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayBounds(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

function fullName(player?: DigestPlayer): string {
  if (!player) return "Неизвестный игрок";
  return `${player.firstName} ${player.lastName}`.trim();
}

function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function countWord(value: number, forms: [string, string, string]): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  const form =
    mod10 === 1 && mod100 !== 11
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? forms[1]
      : forms[2];
  return `${value} ${form}`;
}

function winnerId(match: DigestMatch): number | null {
  if (match.result === "DRAW") return null;
  return match.result === "PLAYER1_WIN" ? match.player1Id : match.player2Id;
}

function resultFor(match: DigestMatch, playerId: number): "WIN" | "DRAW" | "LOSS" {
  if (match.result === "DRAW") return "DRAW";
  return winnerId(match) === playerId ? "WIN" : "LOSS";
}

function buildHeadToHead(matches: DigestMatch[]): Map<string, HeadToHead> {
  const result = new Map<string, HeadToHead>();
  for (const match of matches) {
    const key = pairKey(match.player1Id, match.player2Id);
    const item = result.get(key) ?? {
      wins: new Map<number, number>(),
      draws: 0,
      matches: 0,
    };
    item.matches += 1;
    const winner = winnerId(match);
    if (winner === null) item.draws += 1;
    else item.wins.set(winner, (item.wins.get(winner) ?? 0) + 1);
    result.set(key, item);
  }
  return result;
}

function pointsFor(match: DigestMatch, playerId: number): number {
  const result = resultFor(match, playerId);
  return result === "WIN" ? 3 : result === "DRAW" ? 2 : 1;
}

function calculateStandings(
  activePlayerIds: number[],
  matches: DigestMatch[]
): PlayerStanding[] {
  const active = new Set(activePlayerIds);
  const items = new Map<number, PlayerStanding>();
  for (const id of activePlayerIds) {
    items.set(id, { playerId: id, points: 0, wins: 0, games: 0, position: 0 });
  }

  for (const match of matches) {
    if (!active.has(match.player1Id) || !active.has(match.player2Id)) continue;
    for (const playerId of [match.player1Id, match.player2Id]) {
      const item = items.get(playerId)!;
      item.games += 1;
      item.points += pointsFor(match, playerId);
      if (winnerId(match) === playerId) item.wins += 1;
    }
  }

  const sorted = [...items.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const shared = matches.find(
      (match) =>
        (match.player1Id === a.playerId && match.player2Id === b.playerId) ||
        (match.player1Id === b.playerId && match.player2Id === a.playerId)
    );
    if (shared && shared.result !== "DRAW") {
      return winnerId(shared) === a.playerId ? -1 : 1;
    }

    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.playerId - b.playerId;
  });
  sorted.forEach((item, index) => (item.position = index + 1));
  return sorted;
}

function uniqueLeader(standings: PlayerStanding[]): PlayerStanding | undefined {
  const played = standings.filter((item) => item.games > 0);
  if (!played.length) return undefined;
  if (played[1]?.points === played[0].points) return undefined;
  return played[0];
}

function addCandidate(
  target: DigestEventCandidate[],
  candidate: Omit<DigestEventCandidate, "id">,
  suffix: string
) {
  target.push({ ...candidate, id: `${candidate.kind}:${suffix}` });
}

export function analyzeDailyDigest({
  date,
  tournamentId,
  activePlayerIds,
  players,
  matches,
}: AnalyzeDailyDigestInput): DailyDigestAnalysis {
  const { start, end } = dayBounds(date);
  const playerById = new Map(players.map((player) => [player.id, player]));
  const active = new Set(activePlayerIds);
  const currentMatches = matches.filter(
    (match) =>
      match.tournamentId === tournamentId &&
      active.has(match.player1Id) &&
      active.has(match.player2Id)
  );
  const matchesBeforeDay = matches.filter((match) => match.date < start);
  const currentBeforeDay = currentMatches.filter((match) => match.date < start);
  const matchesOfDay = currentMatches
    .filter((match) => match.date >= start && match.date < end)
    .sort((a, b) => a.id - b.id);
  const currentThroughDay = currentMatches.filter((match) => match.date < end);
  const historicalH2h = buildHeadToHead(matchesBeforeDay);
  const candidates: DigestEventCandidate[] = [];

  const dailyStats = new Map<
    number,
    { games: number; wins: number; draws: number; losses: number; maxWinStreak: number }
  >();
  const currentStreak = new Map<number, number>();
  for (const match of matchesOfDay) {
    for (const playerId of [match.player1Id, match.player2Id]) {
      const stat = dailyStats.get(playerId) ?? {
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        maxWinStreak: 0,
      };
      stat.games += 1;
      const result = resultFor(match, playerId);
      if (result === "WIN") {
        stat.wins += 1;
        const streak = (currentStreak.get(playerId) ?? 0) + 1;
        currentStreak.set(playerId, streak);
        stat.maxWinStreak = Math.max(stat.maxWinStreak, streak);
      } else {
        if (result === "DRAW") stat.draws += 1;
        else stat.losses += 1;
        currentStreak.set(playerId, 0);
      }
      dailyStats.set(playerId, stat);
    }
  }

  // Личная серия — главный и наиболее надёжный сигнал неожиданного результата.
  for (const match of matchesOfDay) {
    const h2h = historicalH2h.get(pairKey(match.player1Id, match.player2Id));
    if (!h2h || h2h.draws > 0) continue;

    const p1Wins = h2h.wins.get(match.player1Id) ?? 0;
    const p2Wins = h2h.wins.get(match.player2Id) ?? 0;
    let favoriteId: number | null = null;
    let trailingId: number | null = null;
    let priorWins = 0;
    if (p1Wins >= 2 && p2Wins === 0) {
      favoriteId = match.player1Id;
      trailingId = match.player2Id;
      priorWins = p1Wins;
    } else if (p2Wins >= 2 && p1Wins === 0) {
      favoriteId = match.player2Id;
      trailingId = match.player1Id;
      priorWins = p2Wins;
    }
    if (favoriteId === null || trailingId === null) continue;

    const currentResult = resultFor(match, trailingId);
    if (currentResult !== "WIN" && currentResult !== "DRAW") continue;
    const trailingName = fullName(playerById.get(trailingId));
    const favoriteName = fullName(playerById.get(favoriteId));
    addCandidate(
      candidates,
      {
        kind: "PERSONAL_SERIES_BREAK",
        priority: currentResult === "WIN" ? 100 : 94,
        playerIds: [trailingId, favoriteId],
        headline: currentResult === "WIN" ? "ПЕРВАЯ ПОБЕДА" : "ПЕРЕЛОМ В СЕРИИ",
        body:
          currentResult === "WIN"
            ? `Победитель — ${trailingName}. До матча в паре ${trailingName} — ${favoriteName} счёт личных встреч был 0:${priorWins}.`
            : `Ничья в паре ${trailingName} — ${favoriteName}. До этого счёт личных встреч был 0:${priorWins}.`,
        evidence: { trailingId, favoriteId, priorWins, result: currentResult },
      },
      String(match.id)
    );
  }

  for (const [playerId, stat] of dailyStats) {
    const name = fullName(playerById.get(playerId));
    if (stat.maxWinStreak >= 3) {
      addCandidate(
        candidates,
        {
          kind: "WIN_STREAK",
          priority: 88 + stat.maxWinStreak,
          playerIds: [playerId],
          headline: "СЕРИЯ ДНЯ",
          body: `${name}: ${countWord(stat.maxWinStreak, [
            "победа",
            "победы",
            "побед",
          ])} подряд.`,
          evidence: { playerId, streak: stat.maxWinStreak },
        },
        String(playerId)
      );
    }
    if (stat.games >= 3 && stat.wins >= 3 && stat.losses === 0) {
      addCandidate(
        candidates,
        {
          kind: "UNBEATEN_DAY",
          priority: 84 + stat.wins + stat.games,
          playerIds: [playerId],
          headline: "БЕЗ ПОРАЖЕНИЙ",
          body: `${name}: ${countWord(stat.games, [
            "встреча",
            "встречи",
            "встреч",
          ])}, ${countWord(stat.wins, ["победа", "победы", "побед"])}${
            stat.draws
              ? ` и ${countWord(stat.draws, ["ничья", "ничьи", "ничьих"])}`
              : ""
          }.`,
          evidence: { playerId, ...stat },
        },
        String(playerId)
      );
    }
    if (stat.games >= 4) {
      addCandidate(
        candidates,
        {
          kind: "MARATHON",
          priority: 55 + stat.games,
          playerIds: [playerId],
          headline: "МАРАФОН",
          body: `${name}: ${countWord(stat.games, [
            "матч",
            "матча",
            "матчей",
          ])} за день, ${countWord(stat.wins, [
            "победа",
            "победы",
            "побед",
          ])}, ${countWord(stat.draws, [
            "ничья",
            "ничьи",
            "ничьих",
          ])} и ${countWord(stat.losses, [
            "поражение",
            "поражения",
            "поражений",
          ])}.`,
          evidence: { playerId, ...stat },
        },
        String(playerId)
      );
    }
  }

  // Равная ничья по накопленной личной истории.
  for (const match of matchesOfDay.filter((item) => item.result === "DRAW")) {
    const h2h = historicalH2h.get(pairKey(match.player1Id, match.player2Id));
    if (!h2h || h2h.matches < 2) continue;
    const p1Wins = h2h.wins.get(match.player1Id) ?? 0;
    const p2Wins = h2h.wins.get(match.player2Id) ?? 0;
    if (Math.abs(p1Wins - p2Wins) > 1) continue;
    addCandidate(
      candidates,
      {
        kind: "CLOSE_DRAW",
        priority: 72,
        playerIds: [match.player1Id, match.player2Id],
        headline: "РАВНЫЕ",
        body: `${fullName(playerById.get(match.player1Id))} и ${fullName(
          playerById.get(match.player2Id)
        )} сыграли вничью. До этого дня: ${p1Wins}:${p2Wins} по победам, ничьих — ${h2h.draws}.`,
        evidence: { p1Wins, p2Wins, priorDraws: h2h.draws },
      },
      String(match.id)
    );
  }

  const careerWinsBefore = new Map<number, number>();
  const seasonGamesBefore = new Map<number, number>();
  const seasonGamesThrough = new Map<number, number>();
  for (const match of matchesBeforeDay) {
    const winner = winnerId(match);
    if (winner !== null) careerWinsBefore.set(winner, (careerWinsBefore.get(winner) ?? 0) + 1);
  }
  for (const match of currentBeforeDay) {
    for (const id of [match.player1Id, match.player2Id]) {
      seasonGamesBefore.set(id, (seasonGamesBefore.get(id) ?? 0) + 1);
    }
  }
  for (const match of currentThroughDay) {
    for (const id of [match.player1Id, match.player2Id]) {
      seasonGamesThrough.set(id, (seasonGamesThrough.get(id) ?? 0) + 1);
    }
  }

  for (const [playerId, stat] of dailyStats) {
    const name = fullName(playerById.get(playerId));
    if ((careerWinsBefore.get(playerId) ?? 0) === 0 && stat.wins > 0) {
      addCandidate(
        candidates,
        {
          kind: "FIRST_WIN",
          priority: 82,
          playerIds: [playerId],
          headline: "ПЕРВАЯ ПОБЕДА",
          body: `${name}: первая победа в истории турниров.`,
          evidence: { playerId },
        },
        String(playerId)
      );
    }

    const before = seasonGamesBefore.get(playerId) ?? 0;
    const through = seasonGamesThrough.get(playerId) ?? 0;
    for (const milestone of [10, 20, 30]) {
      if (before < milestone && through >= milestone) {
        addCandidate(
          candidates,
          {
            kind: "MATCH_MILESTONE",
            priority: 62 + milestone / 10,
            playerIds: [playerId],
            headline: "КРУГЛАЯ ДАТА",
            body: `${name}: ${milestone}-й матч сезона.`,
            evidence: { playerId, milestone },
          },
          `${playerId}:${milestone}`
        );
      }
    }
  }

  const beforeStandings = calculateStandings(activePlayerIds, currentBeforeDay);
  const afterStandings = calculateStandings(activePlayerIds, currentThroughDay);
  // При равенстве очков таблица может зависеть от тай-брейков, поэтому смену
  // лидера объявляем только для единоличного первого места до и после дня.
  const beforeLeader = uniqueLeader(beforeStandings);
  const afterLeader = uniqueLeader(afterStandings);
  if (
    beforeLeader &&
    afterLeader &&
    beforeLeader.playerId !== afterLeader.playerId
  ) {
    addCandidate(
      candidates,
      {
        kind: "LEADER_CHANGE",
        priority: 98,
        playerIds: [afterLeader.playerId, beforeLeader.playerId],
        headline: "НОВЫЙ ЛИДЕР",
        body: `Новый лидер — ${fullName(
          playerById.get(afterLeader.playerId)
        )}. Предыдущий лидер — ${fullName(playerById.get(beforeLeader.playerId))}.`,
        evidence: {
          beforeLeaderId: beforeLeader.playerId,
          afterLeaderId: afterLeader.playerId,
        },
      },
      date
    );
  }

  const possiblePairs = (activePlayerIds.length * (activePlayerIds.length - 1)) / 2;
  const playedPairs = new Set(
    currentThroughDay.map((match) => pairKey(match.player1Id, match.player2Id))
  ).size;
  const completionPercent = possiblePairs ? (playedPairs / possiblePairs) * 100 : 0;
  const finalStretch = completionPercent >= 70;

  if (finalStretch) {
    const beforeById = new Map(beforeStandings.map((item) => [item.playerId, item]));
    for (const after of afterStandings) {
      const before = beforeById.get(after.playerId);
      if (!before || before.games === 0 || after.games === 0) continue;
      const movement = before.position - after.position;
      if (movement < 2) continue;
      addCandidate(
        candidates,
        {
          kind: "FINAL_STRETCH_MOVE",
          priority: 64 + movement,
          playerIds: [after.playerId],
          headline: "РЫВОК В ТАБЛИЦЕ",
          body: `${fullName(playerById.get(after.playerId))}: движение с ${before.position}-й на ${after.position}-ю строчку.`,
          evidence: {
            playerId: after.playerId,
            beforePosition: before.position,
            afterPosition: after.position,
          },
        },
        String(after.playerId)
      );
    }
  }

  // Если игрок закрыл все пары текущего ростера именно сегодня.
  const beforePairKeys = new Set(currentBeforeDay.map((match) => pairKey(match.player1Id, match.player2Id)));
  const throughPairKeys = new Set(currentThroughDay.map((match) => pairKey(match.player1Id, match.player2Id)));
  for (const playerId of dailyStats.keys()) {
    const opponents = activePlayerIds.filter((id) => id !== playerId);
    const beforeRemaining = opponents.filter(
      (id) => !beforePairKeys.has(pairKey(playerId, id))
    ).length;
    const afterRemaining = opponents.filter(
      (id) => !throughPairKeys.has(pairKey(playerId, id))
    ).length;
    if (beforeRemaining > 0 && afterRemaining === 0) {
      addCandidate(
        candidates,
        {
          kind: "TOURNAMENT_COMPLETE",
          priority: 96,
          playerIds: [playerId],
          headline: "КРУГ ЗАМКНУТ",
          body: `${fullName(playerById.get(playerId))}: сыграны встречи со всеми активными участниками турнира.`,
          evidence: { playerId },
        },
        String(playerId)
      );
    }
  }

  // Низкоприоритетные фактические карточки гарантируют, что при любом числе
  // матчей редактору есть из чего выбрать, не изобретая сюжет.
  for (const match of matchesOfDay) {
    const winner = winnerId(match);
    const player1Name = fullName(playerById.get(match.player1Id));
    const player2Name = fullName(playerById.get(match.player2Id));
    addCandidate(
      candidates,
      {
        kind: "MATCH_RESULT",
        priority: 10,
        playerIds: [match.player1Id, match.player2Id],
        headline: match.result === "DRAW" ? "НИЧЬЯ" : "РЕЗУЛЬТАТ",
        body:
          winner === null
            ? `${player1Name} и ${player2Name} сыграли вничью.`
            : `Победа ${fullName(playerById.get(winner))} во встрече ${player1Name} — ${player2Name}.`,
        evidence: { matchId: match.id, winnerId: winner },
      },
      String(match.id)
    );
  }

  const uniquePlayers = new Set(matchesOfDay.flatMap((match) => [match.player1Id, match.player2Id]));
  return {
    date,
    summary: {
      matches: matchesOfDay.length,
      players: uniquePlayers.size,
      draws: matchesOfDay.filter((match) => match.result === "DRAW").length,
    },
    completionPercent,
    finalStretch,
    candidates: candidates.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)),
  };
}

export function selectFallbackEvents(
  candidates: DigestEventCandidate[],
  limit: number
): DigestEventCandidate[] {
  const ordered = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.id.localeCompare(b.id)
  );
  const selected: DigestEventCandidate[] = [];
  const usedPlayers = new Set<number>();
  const usedKinds = new Set<DigestEventKind>();
  for (const candidate of ordered) {
    if (candidate.playerIds.some((id) => usedPlayers.has(id))) continue;
    if (usedKinds.has(candidate.kind)) continue;
    selected.push(candidate);
    candidate.playerIds.forEach((id) => usedPlayers.add(id));
    usedKinds.add(candidate.kind);
    if (selected.length >= limit) break;
  }

  // Сначала ослабляем уникальность игроков, но сохраняем разнообразие сюжетов.
  if (selected.length < limit) {
    for (const candidate of ordered) {
      if (selected.some((item) => item.id === candidate.id)) continue;
      if (usedKinds.has(candidate.kind)) continue;
      selected.push(candidate);
      usedKinds.add(candidate.kind);
      if (selected.length >= limit) break;
    }
  }

  // Повтор типа допустим только когда иначе физически нельзя заполнить сводку.
  if (selected.length < limit) {
    for (const candidate of ordered) {
      if (selected.some((item) => item.id === candidate.id)) continue;
      selected.push(candidate);
      if (selected.length >= limit) break;
    }
  }
  return selected;
}
