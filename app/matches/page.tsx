import { PrismaClient } from "@prisma/client";
import { Player, Match } from "@/app/interface";
import MatchPage from "@/component/MatchPage";

const prisma = new PrismaClient();

export default async function MatchesPage() {
  const players: Player[] = await prisma.user.findMany();
  const matches: Match[] = await prisma.match.findMany({
    include: {
      player1: true,
      player2: true,
    },
  });

  return <MatchPage players={players} initialMatches={matches} />;
}
