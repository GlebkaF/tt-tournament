import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import RatingPageClient from "@/component/RatingPageClient";
import type { RatingPagePlayer } from "@/component/RatingPageClient";
import createDeps from "@/service/create-deps";
import type { Metadata } from "next";
import {
  estimateGamesToCalibration,
  RATING_INITIAL,
  RATING_INITIAL_RD,
  RATING_INITIAL_VOLATILITY,
} from "@/utils/rating";

const { ratingService, tournamentService } = createDeps();

export const metadata: Metadata = {
  title: "Рейтинг силы — Теннис. Евроберег",
  description: "Экспериментальный сквозной рейтинг силы игроков Glicko-2.",
  robots: { index: false, follow: false },
};

export default async function RatingPage() {
  const [ratingData, currentPlayers] = await Promise.all([
    ratingService.getRatingData(),
    tournamentService.getPlayers(CURRENT_TOURNAMENT_ID),
  ]);
  const activeIds = new Set(currentPlayers.map(({ id }) => id));

  const players: RatingPagePlayer[] = ratingData.people.map((person) => ({
    ...person,
    active: activeIds.has(person.id),
    rating: ratingData.history.players.get(person.id) ?? {
      playerId: person.id,
      rating: RATING_INITIAL,
      rd: RATING_INITIAL_RD,
      volatility: RATING_INITIAL_VOLATILITY,
      matchesPlayed: 0,
      isCalibrating: true,
      estimatedGamesToCalibration: estimateGamesToCalibration({
        rating: RATING_INITIAL,
        rd: RATING_INITIAL_RD,
        volatility: RATING_INITIAL_VOLATILITY,
      }),
    },
  }));

  return <RatingPageClient players={players} />;
}

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
