import { PrismaClient } from "@prisma/client";
import { Player, Match } from "@/app/interface";
import PlayerList from "@/component/PlayerList";
import MatchPage from "@/component/MatchPage";

const prisma = new PrismaClient();

export default async function PlayerListPage() {
  const players: Player[] = await prisma.user.findMany();
  const matches: Match[] = await prisma.match.findMany({
    include: {
      player1: true,
      player2: true,
    },
  });

  return (
    <div className="flex flex-row">
      <PlayerList players={players} />
      <MatchPage players={players} initialMatches={matches} />
    </div>
  );
}
