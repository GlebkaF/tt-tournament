import PlayerList from "@/component/PlayerList";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Player {
  id: number;
  firstName: string;
  lastName: string;
}

const PlayerListPage = async () => {
  const players: Player[] = await prisma.user.findMany();

  return (
    <div>
      <PlayerList players={players} />
    </div>
  );
};

export default PlayerListPage;
