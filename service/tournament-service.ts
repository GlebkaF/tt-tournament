import { Player, Standings } from "@/app/interface";
import { Match, MatchResult, PrismaClient } from "@prisma/client";

const summerTournament2024PlayersIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 26, 27, 28, 29, 30, 31, 32, 34, 35,
];

const summerTournament2023PlayersIds = [
  4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 20, 22, 26, 27, 28, 30, 33, 34, 55, 54, 53,
  52, 51, 50, 49, 47, 46,
];

const summerTournament2025PlayersIds = [
  55, 5, 4, 6, 7, 27, 1, 23, 19, 2, 63, 22, 9, 43, 15, 10, 54, 13, 16, 59, 60,
  61, 62, 65, 21,
];

// Базовый состав 2026; новые участники добавляются через TournamentParticipant.
const summerTournament2026PlayersIds = [
  5, 67, 22, 1, 15, 20, 65, 62, 61, 54, 55, 21, 59, 7, 16, 23, 2, 68, 29, 4, 30,
  69, 70, 71, 32, 10, 27,
];

interface PlayerData {
  player: string;
  playerId: number;
  gamesPlayed: number;
  winsCount: number;
  totalPoints: number;
  rounds: number[];
  matches: Match[];
  position: number;
  league: "🥇" | "🥈" | "🥉" | "";
}

export class TournamentService {
  constructor(private prisma: PrismaClient) {}

  async getPlayers(tournamentId: number): Promise<Player[]> {
    return this.prisma.user.findMany({
      where: {
        id: {
          in: await this.getPlayersByTournamentId(tournamentId),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageMimeType: true,
      },
    });
  }

  async getTournament(tournamentId: number): Promise<{ title: string } | null> {
    return this.prisma.tournament.findFirst({
      where: {
        id: tournamentId,
      },
    });
  }

  async getTournaments(): Promise<
    { id: number; title: string; date: Date; playersCount: number }[]
  > {
    const tournaments = await this.prisma.tournament.findMany({
      orderBy: { date: "desc" },
    });

    return Promise.all(
      tournaments.map(async (tournament) => ({
        id: tournament.id,
        title: tournament.title,
        date: tournament.date,
        playersCount: (await this.getPlayersIdsByTournamentId(tournament.id))
          .length,
      }))
    );
  }

  async getStandings(tournamentId: number): Promise<Standings> {
    const tournamentsPlayers = await this.getPlayersByTournamentId(
      tournamentId
    );
    try {
      // Получаем всех пользователей
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: tournamentsPlayers,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      // Получаем все матчи
      const matches = await this.prisma.match.findMany({
        where: {
          AND: [
            { tournamentId },
            { player1Id: { in: tournamentsPlayers } },
            { player2Id: { in: tournamentsPlayers } },
          ],
        },
      });

      const totalRounds = 11;
      const roundGames = 3;

      // Создаем карту для хранения данных о игроках
      const playerData = new Map<number, PlayerData>();

      // Инициализация данных игроков
      users.forEach((user) => {
        playerData.set(user.id, {
          player: `${user.lastName} ${user.firstName}`,
          playerId: user.id,
          // Зависит от количества юзеров
          rounds: new Array(totalRounds).fill(0),
          totalPoints: 0,
          gamesPlayed: 0,
          matches: [],
          position: 0,
          league: "",
          winsCount: 0,
        });
      });

      // Обрабатываем все матчи
      matches.forEach((match) => {
        // Обновляем данные для player1
        if (playerData.has(match.player1Id)) {
          const player1Data = playerData.get(match.player1Id);

          if (!player1Data) {
            console.error("Player1 not found", match.id);
          } else {
            const isWin = match.result === "PLAYER1_WIN";

            if (isWin) {
              player1Data.winsCount++;
            }

            player1Data.gamesPlayed++;
            player1Data.matches.push(match);
            player1Data.totalPoints += isWin
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1;
          }
        }

        // Обновляем данные для player2
        if (playerData.has(match.player2Id)) {
          const player2Data = playerData.get(match.player2Id);

          if (!player2Data) {
            console.error("Player2 not found", match.id);
          } else {
            const isWin = match.result === "PLAYER2_WIN";
            if (isWin) {
              player2Data.winsCount++;
            }
            player2Data.gamesPlayed++;
            player2Data.matches.push(match);
            player2Data.totalPoints += isWin
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1;
          }
        }
      });

      // Обработка раундов
      playerData.forEach((player) => {
        player.matches.sort(
          (a: Match, b: Match) => a.date.getTime() - b.date.getTime()
        );
        player.rounds = new Array(totalRounds).fill(0).map((_, roundIndex) => {
          return player.matches
            .slice(roundIndex * roundGames, (roundIndex + 1) * roundGames)
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
      // TODO: написать на это тесты
      standings
        .sort((playerA, playerB) => {
          if (playerB.totalPoints === playerA.totalPoints) {
            const sharedMatch = playerA.matches.find(
              (match) =>
                (match.player1Id === playerA.playerId &&
                  match.player2Id === playerB.playerId) ||
                (match.player1Id === playerB.playerId &&
                  match.player2Id === playerA.playerId)
            );

            // Если у них ничья или они не играли, смотрим на количество побед
            if (!sharedMatch || sharedMatch?.result === MatchResult.DRAW) {
              return playerB.winsCount - playerA.winsCount;
            }

            // Если у них не ничья, то ставим выше того, кто победил
            if (sharedMatch.result === MatchResult.PLAYER1_WIN) {
              if (sharedMatch.player1Id === playerA.playerId) {
                // playerA won
                return -1;
              } else {
                // playerB won
                return 1;
              }
            }

            if (sharedMatch.result === MatchResult.PLAYER2_WIN) {
              if (sharedMatch.player2Id === playerA.playerId) {
                // playerA won
                return -1;
              } else {
                // playerB won
                return 1;
              }
            }
          }

          return playerB.totalPoints - playerA.totalPoints;
        })
        .forEach((player, index) => {
          player.position = index + 1;
          player.league =
            index < 8 ? "🥇" : index < 16 ? "🥈" : index < 24 ? "🥉" : "";
        });

      return standings;
    } catch (error) {
      console.error("Error fetching standings:", error);
      return [];
    }
  }

  private async getPlayersByTournamentId(
    tournamentId: number
  ): Promise<number[]> {
    return this.getPlayersIdsByTournamentId(tournamentId);
  }

  private async getPlayersIdsByTournamentId(
    tournamentId: number
  ): Promise<number[]> {
    const legacyPlayerIds =
      this.getLegacyPlayersIdsByTournamentId(tournamentId);
    const managedParticipants =
      await this.prisma.tournamentParticipant.findMany({
        where: { tournamentId },
        select: { playerId: true },
      });

    return [
      ...new Set([
        ...legacyPlayerIds,
        ...managedParticipants.map(({ playerId }) => playerId),
      ]),
    ];
  }

  private getLegacyPlayersIdsByTournamentId(tournamentId: number): number[] {
    if (tournamentId === 1) {
      return summerTournament2024PlayersIds;
    }

    if (tournamentId === 2) {
      return summerTournament2023PlayersIds;
    }

    if (tournamentId === 3) {
      return summerTournament2025PlayersIds;
    }

    if (tournamentId === 4) {
      return summerTournament2026PlayersIds;
    }

    return [];
  }

  async getMatches(tournamentId: number): Promise<Match[]> {
    const tournamentsPlayers = await this.getPlayersByTournamentId(
      tournamentId
    );

    const matches = await this.prisma.match.findMany({
      where: {
        AND: [
          { tournamentId },
          { player1Id: { in: tournamentsPlayers } },
          { player2Id: { in: tournamentsPlayers } },
        ],
      },
      orderBy: {
        date: "asc",
      },
      include: {
        // Только нужные поля: telegramId — BigInt, он не сериализуется в JSON
        // и ломает GET /api/match (а также server→client пропсы schedule/v2).
        player1: { select: { id: true, firstName: true, lastName: true } },
        player2: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return matches;
  }

  async createMatch(
    player1Id: number,
    player2Id: number,
    player1Score: number,
    player2Score: number,
    result: MatchResult,
    date: Date,
    tournamentId: number
  ) {
    if ([1, 2, 3].includes(tournamentId)) {
      throw new Error("Tournament closed");
    }

    const prisma = this.prisma;
    // Проверка на существование записи с аналогичными данными
    const existingMatch = await prisma.match.findFirst({
      where: {
        player1Id,
        player2Id,
        tournamentId,
      },
    });
    const existingMatch2 = await prisma.match.findFirst({
      where: {
        player1Id: player2Id,
        player2Id: player1Id,
        tournamentId,
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
        tournamentId,
      },
    });

    return;
  }

  async updateMatch(
    matchId: number,
    result: MatchResult,
    player1Score: number,
    player2Score: number,
    tournamentId: number
  ) {
    if ([1, 2, 3].includes(tournamentId)) {
      throw new Error("Tournament closed");
    }

    const match = await this.prisma.match.findFirst({
      where: { id: matchId, tournamentId },
    });
    if (!match) {
      throw new Error("Match not found");
    }

    await this.prisma.match.update({
      where: { id: matchId },
      data: { result, player1Score, player2Score },
    });
  }

  async deleteMatch(matchId: number, tournamentId: number) {
    if ([1, 2, 3].includes(tournamentId)) {
      throw new Error("Tournament closed");
    }

    const match = await this.prisma.match.findFirst({
      where: { id: matchId, tournamentId },
    });
    if (!match) {
      throw new Error("Match not found");
    }

    await this.prisma.match.delete({ where: { id: matchId } });
  }

  async getTotalMatchesCount(tournamentId: number): Promise<number> {
    // Функция для вычисления факториала
    function factorial(num: number): number {
      if (num === 0 || num === 1) return 1;
      let result = 1;
      for (let i = 1; i <= num; i++) {
        result *= i;
      }
      return result;
    }

    const players = await this.getPlayersByTournamentId(tournamentId);

    const n = players.length;
    const k = 2;

    if (k > n) return 0;
    if (k === n) return 1;

    return Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
  }
}
