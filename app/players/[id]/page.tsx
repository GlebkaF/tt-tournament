import { PrismaClient } from "@prisma/client";
import PlayerProfile from "@/component/PlayerProfile";
import { Metadata } from "next";
import { Summer2024Service } from "@/service/summer-2024-service";
import { UserService } from "@/service/user-service";

const prisma = new PrismaClient();
const summer2024Service = new Summer2024Service(prisma);
const userService = new UserService(prisma, summer2024Service);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;
  const playerId = parseInt(id, 10);
  const playerData = await userService.getUserProfile(playerId);

  if (!playerData) {
    return {
      title: "Игрок не найден",
    };
  }

  return {
    title: `${playerData.player.name} на ЕБ`,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const playerId = parseInt(id, 10);
  const playerData = await userService.getUserProfile(playerId);

  if (!playerData) {
    return <div>404</div>;
  }

  return (
    <PlayerProfile
      player={playerData.player}
      matchDetails={playerData.matchDetails}
    />
  );
}

export const fetchCache = "force-no-store";
