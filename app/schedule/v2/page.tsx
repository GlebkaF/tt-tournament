import ScheduleV2 from "@/component/ScheduleV2/ScheduleV2";
import { PlayedMatch, PlayerV2 } from "@/component/ScheduleV2/types";
import createDeps from "@/service/create-deps";
import { getPlayerImage } from "@/service/user-service";
import { CURRENT_TOURNAMENT_ID, CURRENT_TOURNAMENT_NAME } from "@/app/const";
import { MatchResult } from "@/app/interface";

const { tournamentService } = createDeps();

export const metadata = {
  title: "Табло организатора · " + CURRENT_TOURNAMENT_NAME,
};

export default async function ScheduleV2Page() {
  const [rawPlayers, rawMatches] = await Promise.all([
    tournamentService.getPlayers(CURRENT_TOURNAMENT_ID),
    tournamentService.getMatches(CURRENT_TOURNAMENT_ID),
  ]);

  const players: PlayerV2[] = rawPlayers.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    image: p.imageMimeType
      ? `/api/player-image/${p.id}`
      : getPlayerImage(p.id),
  }));

  const serverMatches: PlayedMatch[] = rawMatches.map((m) => ({
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    result: m.result as unknown as MatchResult,
    date: m.date.toISOString(),
  }));

  return (
    <ScheduleV2
      players={players}
      serverMatches={serverMatches}
      tournamentName={CURRENT_TOURNAMENT_NAME}
      tournamentId={CURRENT_TOURNAMENT_ID}
    />
  );
}
