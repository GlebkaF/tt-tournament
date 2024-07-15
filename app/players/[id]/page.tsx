import { PrismaClient } from "@prisma/client";
import PlayerProfile from "@/component/PlayerProfile";
import { playersDB } from "./players";

const prisma = new PrismaClient();

async function fetchPlayerData(id: string) {
  const playerId = parseInt(id, 10);
  const players2 = await prisma.user.findMany();
  const matches2 = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: playerId }, { player2Id: playerId }],
    },
    orderBy: {
      date: "asc",
    },
  });

  const player = players2.find((p) => p.id === playerId);

  if (!player) {
    return null;
  }

  // Получаем всех соперников
  const allOpponents = players2.filter((p) => p.id !== playerId);

  // Получаем все возможные матчапы для текущего игрока
  const allPossibleMatches = allOpponents.map((opponent) => ({
    player1Id: playerId,
    player2Id: opponent.id,
    result: "TBD",
    date: new Date(),
  }));

  // Исключаем уже сыгранные матчи
  const remainingMatches = allPossibleMatches.filter((possibleMatch) => {
    return !matches2.some(
      (match) =>
        (match.player1Id === possibleMatch.player1Id &&
          match.player2Id === possibleMatch.player2Id) ||
        (match.player1Id === possibleMatch.player2Id &&
          match.player2Id === possibleMatch.player1Id)
    );
  });

  // Сортируем сыгранные матчи по дате
  const completedMatches = matches2.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Формируем детализированные матчи
  const detailedMatches = completedMatches.map((match) => ({
    match,
    opponent: players2.find(
      (p) =>
        p.id ===
        (match.player1Id === playerId ? match.player2Id : match.player1Id)
    ),
  }));

  // Формируем детализированные оставшиеся матчи
  const remainingDetailedMatches = remainingMatches.map((match) => ({
    match,
    opponent: players2.find((p) => p.id === match.player2Id),
  }));

  // Комбинируем сыгранные и оставшиеся матчи
  const combinedMatches = [...detailedMatches, ...remainingDetailedMatches];

  // Группируем матчи по турам (4 матча в каждом туре)
  const groupedMatches = [];
  for (let i = 0; i < combinedMatches.length; i += 4) {
    groupedMatches.push({
      round: i / 4 + 1,
      matches: combinedMatches.slice(i, i + 4).map(({ match, opponent }) => ({
        opponent: opponent
          ? `${opponent.lastName} ${opponent.firstName}`
          : "Неизвестный игрок",
        result:
          match.date <= new Date()
            ? match.player1Id === playerId
              ? match.result
              : match.result === "PLAYER1_WIN"
              ? "PLAYER2_WIN"
              : match.result === "PLAYER2_WIN"
              ? "PLAYER1_WIN"
              : "DRAW"
            : "TBD",
      })),
    });
  }

  const image = playersDB[player.id]?.image ?? "/image/profile/default.jpg";
  const facts = playersDB[player.id]?.facts ?? [];

  return {
    player: {
      id: player.id,
      name:
        `${player.lastName || ""} ${player.firstName || ""}`.trim() ??
        "Без имени",
      image,
      facts,
      gamesPlayed: matches2.length,
    },
    matchDetails: groupedMatches,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  console.time("playerData");
  const playerData = await fetchPlayerData(id);
  console.timeEnd("playerData");

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
