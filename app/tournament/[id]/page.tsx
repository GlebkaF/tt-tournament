import type { Metadata } from "next";
import StandingsTable from "@/component/StandingsTable";

import createDeps from "@/service/create-deps";

const { tournamentService, ratingService } = createDeps();

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

  const [standings, ratingData] = await Promise.all([
    tournamentService.getStandings(tournamentId),
    ratingService.getRatingData(),
  ]);
  const standingsWithRating = standings.map((item) => ({
    ...item,
    strength: ratingData.history.players.get(item.playerId),
  }));

  return (
    <StandingsTable title={tournament.title} standings={standingsWithRating} />
  );
};

export default StandingsPage;

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
