import PlayerProfile from "@/component/PlayerProfile";
import { Metadata } from "next";

import createDeps from "@/service/create-deps";
import { notFound } from "next/navigation";

const { userService } = createDeps();

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
    title: `${playerData.player.name} — Теннис. Евроберег`,
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
    notFound();
  }

  return (
    <PlayerProfile
      player={playerData.player}
      matchDetails={playerData.matchDetails}
    />
  );
}

export const fetchCache = "force-no-store";
