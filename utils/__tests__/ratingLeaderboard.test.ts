import type { PlayerRating } from "../rating";
import { groupRatingPlayers } from "../ratingLeaderboard";

const rating = (
  playerId: number,
  value: number,
  isCalibrating = false
): PlayerRating => ({
  playerId,
  rating: value,
  rd: isCalibrating ? 200 : 100,
  volatility: 0.06,
  matchesPlayed: 10,
  isCalibrating,
  estimatedGamesToCalibration: isCalibrating ? 3 : 0,
});

describe("groupRatingPlayers", () => {
  it("separates active, inactive and calibrating players", () => {
    const result = groupRatingPlayers([
      { id: 1, lastName: "Первый", active: true, rating: rating(1, 1600) },
      { id: 2, lastName: "Второй", active: false, rating: rating(2, 1700) },
      { id: 3, lastName: "Третий", active: true, rating: rating(3, 1800, true) },
    ]);

    expect(result.active.map(({ id }) => id)).toEqual([1]);
    expect(result.inactive.map(({ id }) => id)).toEqual([2]);
    expect(result.calibrating.map(({ id }) => id)).toEqual([3]);
  });

  it("assigns global all-time ranks before splitting active players", () => {
    const result = groupRatingPlayers([
      { id: 1, lastName: "Первый", active: true, rating: rating(1, 1600) },
      { id: 2, lastName: "Второй", active: false, rating: rating(2, 1700) },
      { id: 3, lastName: "Третий", active: true, rating: rating(3, 1500) },
    ]);

    expect(result.ranks.get(2)).toBe(1);
    expect(result.ranks.get(1)).toBe(2);
    expect(result.ranks.get(3)).toBe(3);
    expect(result.active.map(({ id }) => id)).toEqual([1, 3]);
  });

  it("orders equal ratings deterministically by last name", () => {
    const result = groupRatingPlayers([
      { id: 1, lastName: "Яковлев", active: true, rating: rating(1, 1500) },
      { id: 2, lastName: "Абрамов", active: true, rating: rating(2, 1500) },
    ]);

    expect(result.active.map(({ id }) => id)).toEqual([2, 1]);
  });
});
