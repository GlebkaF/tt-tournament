import { Player } from "@/app/interface";
import Schedule from "@/component/Schedule";

import createDeps from "@/service/create-deps";

const { tournamentService } = createDeps();

export default async function MatchesPage() {
  const players: Player[] = await tournamentService.getPlayers(1);

  return <Schedule players={players} />;
}
