import { Player, Standings } from "@/app/interface";
import { getCache, resetCache, setCache } from "@/helpers/cache";
import { Match, MatchResult, PrismaClient } from "@prisma/client";

const summerTournament2024PlayersIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35,
];

const MATCHES_CACHE_KEY = "matches_cache";
const STANDINGS_CACHE_KEY = "standinmgs_cache";

export class Summer2024Service {
  constructor(private prisma: PrismaClient) {}

  async getPlayers(): Promise<Player[]> {
    return this.prisma.user.findMany({
      where: {
        id: {
          in: summerTournament2024PlayersIds,
        },
      },
    });
  }

  async getStandings(): Promise<Standings> {
    const cahcedStandings = getCache(STANDINGS_CACHE_KEY);
    if (cahcedStandings) {
      return cahcedStandings;
    }

    try {
      // Получаем всех пользователей
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: summerTournament2024PlayersIds,
          },
        },
      });

      // Получаем все матчи
      const matches = await this.prisma.match.findMany({
        where: {
          AND: [
            { player1Id: { in: summerTournament2024PlayersIds } },
            { player2Id: { in: summerTournament2024PlayersIds } },
          ],
        },
      });

      // Создаем карту для хранения данных о игроках
      const playerData = new Map<number, any>();

      // Инициализация данных игроков
      users.forEach((user) => {
        playerData.set(user.id, {
          player: `${user.lastName} ${user.firstName}`,
          playerId: user.id,
          // Зависит от количества юзеров
          rounds: new Array(10).fill(0),
          totalPoints: 0,
          gamesPlayed: 0,
          matches: [],
        });
      });

      // Обрабатываем все матчи
      matches.forEach((match) => {
        // Обновляем данные для player1
        if (playerData.has(match.player1Id)) {
          const player1Data = playerData.get(match.player1Id);
          player1Data.gamesPlayed++;
          player1Data.matches.push(match);
          player1Data.totalPoints +=
            match.result === "PLAYER1_WIN"
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1;
        }

        // Обновляем данные для player2
        if (playerData.has(match.player2Id)) {
          const player2Data = playerData.get(match.player2Id);
          player2Data.gamesPlayed++;
          player2Data.matches.push(match);
          player2Data.totalPoints +=
            match.result === "PLAYER2_WIN"
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1;
        }
      });

      // Обработка раундов
      playerData.forEach((player) => {
        player.matches.sort(
          (a: Match, b: Match) => a.date.getTime() - b.date.getTime()
        );
        player.rounds = new Array(10).fill(0).map((_, roundIndex) => {
          return player.matches
            .slice(roundIndex * 4, (roundIndex + 1) * 4)
            .reduce((total: number, match: Match) => {
              if (match.player1Id === player.playerId) {
                return (
                  total +
                  (match.result === "PLAYER1_WIN"
                    ? 3
                    : match.result === "DRAW"
                    ? 2
                    : 1)
                );
              } else {
                return (
                  total +
                  (match.result === "PLAYER2_WIN"
                    ? 3
                    : match.result === "DRAW"
                    ? 2
                    : 1)
                );
              }
            }, 0);
        });
      });

      const standings = Array.from(playerData.values());

      // Сортируем по общим очкам и обновляем позиции
      standings
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .forEach((player, index) => {
          player.position = index + 1;
          player.league =
            index < 8 ? "🥇" : index < 16 ? "🥈" : index < 24 ? "🥉" : "";
        });

      setCache(STANDINGS_CACHE_KEY, standings);

      return standings;
    } catch (error) {
      console.error("Error fetching standings:", error);
      return [];
    }
  }

  async getUserMatches(playerId: number): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        AND: [
          { player1Id: { in: summerTournament2024PlayersIds } },
          { player2Id: { in: summerTournament2024PlayersIds } },
          { OR: [{ player1Id: playerId }, { player2Id: playerId }] },
        ],
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async getMatches(): Promise<Match[]> {
    const cahcedMatches = getCache(MATCHES_CACHE_KEY);
    if (cahcedMatches) {
      return cahcedMatches;
    }

    const matches = await this.prisma.match.findMany({
      where: {
        AND: [
          { player1Id: { in: summerTournament2024PlayersIds } },
          { player2Id: { in: summerTournament2024PlayersIds } },
        ],
      },
      orderBy: {
        date: "asc",
      },
      include: {
        player1: true,
        player2: true,
      },
    });

    setCache(MATCHES_CACHE_KEY, matches);

    return matches;
  }

  async createMatch(
    player1Id: number,
    player2Id: number,
    player1Score: number,
    player2Score: number,
    result: MatchResult,
    date: Date
  ) {
    const prisma = this.prisma;
    // Проверка на существование записи с аналогичными данными
    const existingMatch = await prisma.match.findFirst({
      where: {
        player1Id,
        player2Id,
      },
    });
    const existingMatch2 = await prisma.match.findFirst({
      where: {
        player1Id: player2Id,
        player2Id: player1Id,
      },
    });

    if (existingMatch || existingMatch2) {
      throw new Error("Match already exists");
    }

    // Создание новой записи
    await prisma.match.create({
      data: {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        result,
        date: date,
      },
    });

    resetCache(STANDINGS_CACHE_KEY);
    resetCache(MATCHES_CACHE_KEY);

    return;
  }
}
