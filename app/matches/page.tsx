import { PrismaClient } from "@prisma/client";
import { Player, Match } from "@/app/interface";
import MatchPage from "@/component/MatchPage";
import { Metadata } from "next";
import { Summer2024Service } from "@/service/summer-2024-service";

const prisma = new PrismaClient();
const summer2024Service = new Summer2024Service(prisma);

export default async function MatchesPage() {
  const players: Player[] = await summer2024Service.getPlayers();

  return <MatchPage players={players} />;
}

export const metadata: Metadata = {
  title: "Матчи летнего турнира",
};
