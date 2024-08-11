import type { Metadata } from "next";
import StandingsTable from "@/component/StandingsTable";

import createDeps from "@/service/create-deps";

const { tournamentService } = createDeps();

export const metadata: Metadata = {
  title: "Турнирная таблица",
};

const StandingsPage = async ({ params }: { params: { id: string } }) => {
  const tournamentId = parseInt(params.id, 10);
  const tournament = await tournamentService.getTournament(tournamentId);

  if (!tournament) {
    return <div>Турнир не найден</div>;
  }

  const standings = await tournamentService.getStandings(tournamentId);

  return <StandingsTable title={tournament.title} standings={standings} />;
};

export default StandingsPage;

export const fetchCache = "force-no-store";
