import { PrismaClient } from "@prisma/client";
import PlayerProfile from "@/component/PlayerProfile";

const prisma = new PrismaClient();

async function fetchPlayerData(id: string) {
  const player = await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      matches1: {
        include: {
          player1: true,
          player2: true,
        },
      },
      matches2: {
        include: {
          player1: true,
          player2: true,
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  const matches = [...player.matches1, ...player.matches2];

  const matchDetails = new Array(10).fill(0).map((_, roundIndex) => ({
    round: roundIndex + 1,
    matches: matches
      .slice(roundIndex * 4, (roundIndex + 1) * 4)
      .map((match) => ({
        // date: match.date,
        opponent:
          match.player1Id === player.id
            ? `${match.player2.lastName} ${match.player2.firstName}`
            : `${match.player1.lastName} ${match.player1.firstName}`,
        result:
          match.player1Id === player.id
            ? match.result
            : match.result === "PLAYER1_WIN"
            ? "PLAYER2_WIN"
            : match.result === "PLAYER2_WIN"
            ? "PLAYER1_WIN"
            : "DRAW",
      })),
  }));

  return {
    player: {
      id: player.id,
      name:
        `${player.lastName || ""} ${player.firstName || ""}`.trim() ??
        "Без имени",
      gamesPlayed: matches.length,
    },
    matchDetails,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const playerData = await fetchPlayerData(id);

  if (!playerData) {
    return {
      notFound: true,
    };
  }

  return (
    <PlayerProfile
      player={playerData.player}
      matchDetails={playerData.matchDetails}
    />
  );
}
