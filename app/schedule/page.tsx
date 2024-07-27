import { Player } from "@/app/interface";
import Schedule from "@/component/Schedule";

import createDeps from "@/service/create-deps";

const { summer2024Service } = createDeps();

export default async function MatchesPage() {
  const players: Player[] = await summer2024Service.getPlayers();

  return <Schedule players={players} />;
}
