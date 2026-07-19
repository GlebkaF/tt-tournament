import type { PlayerRating } from "./rating";

export interface RatingLeaderboardEntry {
  id: number;
  lastName: string;
  active: boolean;
  rating: PlayerRating;
}

export function groupRatingPlayers<T extends RatingLeaderboardEntry>(
  players: T[]
): {
  ranks: Map<number, number>;
  active: T[];
  inactive: T[];
  calibrating: T[];
} {
  const byRating = (a: T, b: T) =>
    b.rating.rating - a.rating.rating ||
    a.lastName.localeCompare(b.lastName, "ru");
  const calibrated = players
    .filter((player) => !player.rating.isCalibrating)
    .sort(byRating);
  const ranks = new Map(
    calibrated.map((player, index) => [player.id, index + 1])
  );

  return {
    ranks,
    active: calibrated.filter((player) => player.active),
    inactive: calibrated.filter((player) => !player.active),
    calibrating: players
      .filter((player) => player.rating.isCalibrating)
      .sort(byRating),
  };
}
