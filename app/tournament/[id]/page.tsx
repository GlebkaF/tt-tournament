import type { Metadata } from "next";
import StandingsTable from "@/component/StandingsTable";

import createDeps from "@/service/create-deps";

const { tournamentService } = createDeps();

export const generateStaticParams = async (): Promise<{ id: string }[]> => {
  return [
    {
      id: "1",
    },
    {
      id: "2",
    },
  ];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournamentId = parseInt(id, 10);
  const tournament = await tournamentService.getTournament(tournamentId);

  if (!tournament) {
    return {
      title: "404",
    };
  }

  return {
    title: `${tournament.title} — Теннис. Евроберег`,
  };
}

const StandingsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const tournamentId = parseInt(id, 10);
  const tournament = await tournamentService.getTournament(tournamentId);

  if (!tournament) {
    return <div>Турнир не найден</div>;
  }

  const standings = await tournamentService.getStandings(tournamentId);

  return <StandingsTable title={tournament.title} standings={standings} />;
};

export default StandingsPage;

export const fetchCache = "force-no-store";
