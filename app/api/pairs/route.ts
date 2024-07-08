import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function generatePossiblePairs(playerIds: number[]) {
  // Получаем все матчи, где участвуют выбранные игроки
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          player1Id: {
            in: playerIds,
          },
        },
        {
          player2Id: {
            in: playerIds,
          },
        },
      ],
    },
  });

  // Создаем хэш-набор для проверки уже сыгранных матчей
  const playedMatches = new Set<string>();
  matches.forEach((match) => {
    playedMatches.add(`${match.player1Id}-${match.player2Id}`);
    playedMatches.add(`${match.player2Id}-${match.player1Id}`);
  });

  // Генерируем все возможные комбинации пар игроков
  const pairs = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const player1Id = playerIds[i];
      const player2Id = playerIds[j];
      if (!playedMatches.has(`${player1Id}-${player2Id}`)) {
        pairs.push({
          player1Id,
          player2Id,
        });
      }
    }
  }

  // Сортируем пары по количеству матчей, в которых участвовали игроки
  pairs.sort((a, b) => {
    const player1ACount = matches.filter(
      (match) =>
        match.player1Id === a.player1Id || match.player2Id === a.player1Id
    ).length;
    const player2ACount = matches.filter(
      (match) =>
        match.player1Id === a.player2Id || match.player2Id === a.player2Id
    ).length;
    const player1BCount = matches.filter(
      (match) =>
        match.player1Id === b.player1Id || match.player2Id === b.player1Id
    ).length;
    const player2BCount = matches.filter(
      (match) =>
        match.player1Id === b.player2Id || match.player2Id === b.player2Id
    ).length;
    const totalMatchesA = player1ACount + player2ACount;
    const totalMatchesB = player1BCount + player2BCount;
    return totalMatchesA - totalMatchesB;
  });

  return pairs;
}

export async function POST(req: Request) {
  try {
    const { playerIds } = await req.json();

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 2) {
      return new Response(JSON.stringify({ error: "Invalid player IDs" }), {
        status: 400,
      });
    }

    const pairs = await generatePossiblePairs(playerIds);

    return new Response(JSON.stringify(pairs), { status: 200 });
  } catch (error) {
    console.error("Generate Pairs Error:", error);
    return new Response(JSON.stringify({ error: "Error generating pairs" }), {
      status: 500,
    });
  }
}
