import { PrismaClient } from "@prisma/client";
import { Player, Match } from "@/app/interface";
import MatchPage from "@/component/MatchPage";
import { Metadata } from "next";

const prisma = new PrismaClient();

export default async function MatchesPage() {
  const players: Player[] = await prisma.user.findMany();

  return <MatchPage players={players} />;
}

export const metadata: Metadata = {
  title: "Матчи летнего турнира",
};
