import { Player } from "@/app/interface";
import MatchPage from "@/component/MatchPage";
import { Metadata } from "next";
import createDeps from "@/service/create-deps";

const { tournamentService } = createDeps();

export default async function MatchesPage() {
  const tournamentId = 2;
  const players: Player[] = await tournamentService.getPlayers(tournamentId);
  const totalMatchesCount = await tournamentService.getTotalMatchesCount(
    tournamentId
  );

  return <MatchPage players={players} totalMatchesCount={totalMatchesCount} />;
}

export const metadata: Metadata = {
  title: "Матчи летнего турнира 2024 — Теннис. Евроберег",
};
