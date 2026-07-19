import {
  analyzeDailyDigest,
  DigestMatch,
  DigestPlayer,
  selectFallbackEvents,
} from "../dailyDigest";

const players: DigestPlayer[] = [
  { id: 1, firstName: "Глеб", lastName: "Фокин" },
  { id: 2, firstName: "Виктория", lastName: "Емельянова" },
  { id: 3, firstName: "Антон", lastName: "Шестернин" },
  { id: 4, firstName: "Наталья", lastName: "Зайцева" },
];

function match(
  id: number,
  date: string,
  player1Id: number,
  player2Id: number,
  result: DigestMatch["result"],
  tournamentId = 4
): DigestMatch {
  return {
    id,
    date: new Date(`${date}T00:00:00.000Z`),
    player1Id,
    player2Id,
    result,
    tournamentId,
  };
}

describe("daily digest analysis", () => {
  it("detects the first non-loss after two head-to-head defeats", () => {
    const analysis = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [
        match(1, "2024-06-01", 1, 2, "PLAYER2_WIN", 1),
        match(2, "2025-06-01", 2, 1, "PLAYER1_WIN", 3),
        match(3, "2026-07-14", 1, 2, "DRAW"),
      ],
    });

    const event = analysis.candidates.find(
      ({ kind }) => kind === "PERSONAL_SERIES_BREAK"
    );
    expect(event).toBeDefined();
    expect(event?.body).toContain("Ничья в паре");
    expect(event?.body).toContain("0:2");
    expect(event?.evidence).toMatchObject({ priorWins: 2, result: "DRAW" });
  });

  it("does not invent a favorite for a 2:1 personal history", () => {
    const analysis = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [
        match(1, "2024-06-01", 1, 2, "PLAYER2_WIN", 1),
        match(2, "2024-07-01", 2, 1, "PLAYER1_WIN", 1),
        match(3, "2025-06-01", 1, 2, "PLAYER1_WIN", 3),
        match(4, "2026-07-14", 1, 2, "PLAYER1_WIN"),
      ],
    });

    expect(
      analysis.candidates.some(({ kind }) => kind === "PERSONAL_SERIES_BREAK")
    ).toBe(false);
  });

  it("uses match id order to calculate a same-day win streak", () => {
    const analysis = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [
        match(10, "2026-07-14", 1, 2, "PLAYER1_WIN"),
        match(11, "2026-07-14", 3, 1, "PLAYER2_WIN"),
        match(12, "2026-07-14", 1, 4, "PLAYER1_WIN"),
      ],
    });

    const event = analysis.candidates.find(({ kind }) => kind === "WIN_STREAK");
    expect(event?.evidence).toMatchObject({ playerId: 1, streak: 3 });
  });

  it("enables position stories only at 70 percent completion", () => {
    const base = [
      match(1, "2026-07-01", 1, 2, "PLAYER1_WIN"),
      match(2, "2026-07-02", 1, 3, "PLAYER1_WIN"),
      match(3, "2026-07-03", 2, 3, "PLAYER2_WIN"),
      match(4, "2026-07-04", 2, 4, "PLAYER2_WIN"),
    ];
    const below = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [...base, match(5, "2026-07-14", 3, 4, "PLAYER2_WIN")],
    });
    expect(below.completionPercent).toBeCloseTo(83.33, 1);
    expect(below.finalStretch).toBe(true);

    const early = analyzeDailyDigest({
      date: "2026-07-03",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: base.slice(0, 3),
    });
    expect(early.completionPercent).toBe(50);
    expect(early.finalStretch).toBe(false);
    expect(
      early.candidates.some(({ kind }) => kind === "FINAL_STRETCH_MOVE")
    ).toBe(false);
  });

  it("does not announce a leader change while first place is tied on points", () => {
    const analysis = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [
        match(1, "2026-07-01", 1, 2, "PLAYER1_WIN"),
        match(2, "2026-07-02", 3, 4, "PLAYER1_WIN"),
        match(3, "2026-07-14", 2, 3, "PLAYER2_WIN"),
      ],
    });

    expect(
      analysis.candidates.some(({ kind }) => kind === "LEADER_CHANGE")
    ).toBe(false);
  });

  it("selects diverse candidates first and relaxes only to fill the limit", () => {
    const analysis = analyzeDailyDigest({
      date: "2026-07-14",
      tournamentId: 4,
      activePlayerIds: players.map(({ id }) => id),
      players,
      matches: [
        match(1, "2026-07-14", 1, 2, "PLAYER1_WIN"),
        match(2, "2026-07-14", 1, 3, "PLAYER1_WIN"),
        match(3, "2026-07-14", 1, 4, "PLAYER1_WIN"),
      ],
    });
    const selected = selectFallbackEvents(analysis.candidates, 3);

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map(({ id }) => id)).size).toBe(3);
    expect(selected.map(({ kind }) => kind)).toContain("WIN_STREAK");
  });

  it("prefers a different story type over a second milestone", () => {
    const selected = selectFallbackEvents(
      [
        {
          id: "MATCH_MILESTONE:1:10",
          kind: "MATCH_MILESTONE",
          priority: 90,
          playerIds: [1],
          headline: "КРУГЛАЯ ДАТА",
          body: "Первая дата",
          evidence: {},
        },
        {
          id: "MATCH_MILESTONE:2:10",
          kind: "MATCH_MILESTONE",
          priority: 89,
          playerIds: [2],
          headline: "КРУГЛАЯ ДАТА",
          body: "Вторая дата",
          evidence: {},
        },
        {
          id: "MARATHON:3",
          kind: "MARATHON",
          priority: 80,
          playerIds: [3],
          headline: "МАРАФОН",
          body: "Шесть матчей",
          evidence: {},
        },
      ],
      2
    );

    expect(selected.map(({ kind }) => kind)).toEqual([
      "MATCH_MILESTONE",
      "MARATHON",
    ]);
  });
});
