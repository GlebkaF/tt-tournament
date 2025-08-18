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
  const eliminatedIds = await tournamentService.getEliminatedPlayerIds(
    tournamentId
  );
  const activeStandings = standings.filter(
    (s) => !eliminatedIds.includes(s.playerId)
  );
  const eliminatedStandings = standings.filter((s) =>
    eliminatedIds.includes(s.playerId)
  );

  return (
    <>
      <StandingsTable title={tournament.title} standings={activeStandings} />
      {eliminatedStandings.length > 0 && (
        <div className="mt-24">
          <StandingsTable
            title="Выбывшие"
            standings={eliminatedStandings}
            simple
          />
        </div>
      )}
    </>
  );
};

export default StandingsPage;

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
