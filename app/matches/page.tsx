import { Player } from "@/app/interface";
import MatchPage from "@/component/MatchPage";
import { Metadata } from "next";
import createDeps from "@/service/create-deps";

const { summer2024Service } = createDeps();

export default async function MatchesPage() {
  const players: Player[] = await summer2024Service.getPlayers();
  const totalMatchesCount = await summer2024Service.getTotalMatchesCount();

  return <MatchPage players={players} totalMatchesCount={totalMatchesCount} />;
}

export const metadata: Metadata = {
  title: "Матчи летнего турнира",
};
