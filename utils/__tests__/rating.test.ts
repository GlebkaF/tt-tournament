import {
  applyInactivity,
  calculateRatingHistory,
  estimateGamesToCalibration,
  RATING_CALIBRATION_RD,
  RATING_INITIAL,
  RATING_INITIAL_RD,
  RATING_INITIAL_VOLATILITY,
  RatingMatchInput,
} from "../rating";

const day = (iso: string) => new Date(`${iso}T12:00:00.000Z`);

const match = (
  id: number,
  player1Id: number,
  player2Id: number,
  result: RatingMatchInput["result"],
  date = day("2026-06-01")
): RatingMatchInput => ({ id, player1Id, player2Id, result, date });

describe("calculateRatingHistory", () => {
  it("starts every player at 1500 and marks them as calibrating", () => {
    const result = calculateRatingHistory([{ id: 1 }], [], day("2026-06-01"));
    const player = result.players.get(1);

    expect(player).toMatchObject({
      rating: RATING_INITIAL,
      matchesPlayed: 0,
      isCalibrating: true,
    });
    expect(player?.estimatedGamesToCalibration).toBeGreaterThan(0);
  });

  it("updates both players immediately and stores reconciling deltas", () => {
    const result = calculateRatingHistory(
      [{ id: 1 }, { id: 2 }],
      [match(10, 1, 2, "PLAYER1_WIN")],
      day("2026-06-01")
    );
    const delta = result.matches.get(10);

    expect(result.players.get(1)?.rating).toBeGreaterThan(RATING_INITIAL);
    expect(result.players.get(2)?.rating).toBeLessThan(RATING_INITIAL);
    expect(delta?.player1.after).toBe(
      (delta?.player1.before ?? 0) + (delta?.player1.delta ?? 0)
    );
    expect(delta?.player2.after).toBe(
      (delta?.player2.before ?? 0) + (delta?.player2.delta ?? 0)
    );
  });

  it("keeps equal players at 1500 after a draw", () => {
    const result = calculateRatingHistory(
      [{ id: 1 }, { id: 2 }],
      [match(1, 1, 2, "DRAW")],
      day("2026-06-01")
    );

    expect(result.players.get(1)?.rating).toBe(1500);
    expect(result.players.get(2)?.rating).toBe(1500);
    expect(result.matches.get(1)?.player1.delta).toBe(0);
    expect(result.matches.get(1)?.player2.delta).toBe(0);
  });

  it("sorts by date and then id regardless of input order", () => {
    const matches = [
      match(3, 1, 3, "PLAYER2_WIN", day("2026-06-02")),
      match(2, 1, 2, "PLAYER1_WIN", day("2026-06-01")),
      match(1, 2, 3, "DRAW", day("2026-06-01")),
    ];
    const players = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const normal = calculateRatingHistory(players, matches, day("2026-06-02"));
    const reversed = calculateRatingHistory(
      players,
      [...matches].reverse(),
      day("2026-06-02")
    );

    expect([...normal.players.values()]).toEqual([...reversed.players.values()]);
    expect([...normal.matches.values()]).toEqual([...reversed.matches.values()]);
  });

  it("recalculates later deltas when an old result is edited", () => {
    const players = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const original = calculateRatingHistory(
      players,
      [
        match(1, 1, 2, "PLAYER1_WIN", day("2026-06-01")),
        match(2, 1, 3, "PLAYER1_WIN", day("2026-06-02")),
      ],
      day("2026-06-02")
    );
    const edited = calculateRatingHistory(
      players,
      [
        match(1, 1, 2, "PLAYER2_WIN", day("2026-06-01")),
        match(2, 1, 3, "PLAYER1_WIN", day("2026-06-02")),
      ],
      day("2026-06-02")
    );

    expect(edited.matches.get(2)?.player1.before).not.toBe(
      original.matches.get(2)?.player1.before
    );
    expect(edited.players.get(1)?.rating).not.toBe(
      original.players.get(1)?.rating
    );
  });

  it("adds players found only in match history", () => {
    const result = calculateRatingHistory(
      [{ id: 1 }],
      [match(1, 1, 99, "PLAYER1_WIN")],
      day("2026-06-01")
    );

    expect(result.players.get(99)?.matchesPlayed).toBe(1);
  });

  it("does not rate scheduled matches before their date", () => {
    const result = calculateRatingHistory(
      [{ id: 1 }, { id: 2 }],
      [match(1, 1, 2, "PLAYER1_WIN", day("2026-07-01"))],
      day("2026-06-01")
    );

    expect(result.players.get(1)?.rating).toBe(RATING_INITIAL);
    expect(result.players.get(1)?.matchesPlayed).toBe(0);
    expect(result.matches.has(1)).toBe(false);
  });

  it("removes calibration permanently after RD crosses the threshold", () => {
    const matches: RatingMatchInput[] = [];
    for (let i = 0; i < 20; i += 1) {
      matches.push(
        match(
          i + 1,
          1,
          i + 2,
          "DRAW",
          new Date(day("2020-01-01").getTime() + i * 24 * 60 * 60 * 1000)
        )
      );
    }
    const players = Array.from({ length: 21 }, (_, index) => ({ id: index + 1 }));
    const result = calculateRatingHistory(players, matches, day("2030-01-01"));
    const player = result.players.get(1);

    expect(player?.rd).toBeGreaterThan(RATING_CALIBRATION_RD);
    expect(player?.isCalibrating).toBe(false);
    expect(player?.estimatedGamesToCalibration).toBe(0);
  });
});

describe("calibration and inactivity", () => {
  it("estimates a short calibration for a new player", () => {
    const games = estimateGamesToCalibration({
      rating: RATING_INITIAL,
      rd: RATING_INITIAL_RD,
      volatility: RATING_INITIAL_VOLATILITY,
    });

    expect(games).toBeGreaterThanOrEqual(4);
    expect(games).toBeLessThanOrEqual(9);
  });

  it("returns zero when calibration is already complete", () => {
    expect(
      estimateGamesToCalibration({
        rating: 1600,
        rd: RATING_CALIBRATION_RD,
        volatility: RATING_INITIAL_VOLATILITY,
      })
    ).toBe(0);
  });

  it("caps an extremely uncertain estimate", () => {
    expect(
      estimateGamesToCalibration({
        rating: 1500,
        rd: RATING_INITIAL_RD,
        volatility: 0.5,
      })
    ).toBe(50);
  });

  it("uses the canonical Glicko-2 inactivity formula", () => {
    const onePeriod = applyInactivity(100, 0.06, 1);
    const twoPeriods = applyInactivity(100, 0.06, 2);

    expect(applyInactivity(100, 0.06, 0)).toBe(100);
    expect(onePeriod).toBeGreaterThan(100);
    expect(twoPeriods).toBeGreaterThan(onePeriod);
    expect(twoPeriods ** 2 - 100 ** 2).toBeCloseTo(
      2 * (173.7178 * 0.06) ** 2,
      6
    );
  });
});
