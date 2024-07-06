import { PrismaClient } from "@prisma/client";
import { Player, Match } from "@/app/interface";
import MatchPage from "@/component/MatchPage";

const prisma = new PrismaClient();

export default async function MatchesPage() {
  const players: Player[] = await prisma.user.findMany();

  return <MatchPage players={players} />;
}
