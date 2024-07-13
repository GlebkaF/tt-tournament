import type { NextPage } from "next";
import StandingsTable from "@/component/StandingsTable";
import { PrismaClient } from "@prisma/client";
import { Standings } from "../interface";
import { getCache, setCache, STANDINGS_CACHE_KEY } from "@/helpers/cache";

const prisma = new PrismaClient();

export async function fetchStandings(): Promise<Standings> {
  try {
    // Получаем всех пользователей
    const users = await prisma.user.findMany();

    // Получаем все матчи
    const matches = await prisma.match.findMany();

    // Создаем карту для хранения данных о игроках
    const playerData = new Map<number, any>();

    // Инициализация данных игроков
    users.forEach((user) => {
      playerData.set(user.id, {
        player: `${user.lastName} ${user.firstName}`,
        playerId: user.id,
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
          match.result === "PLAYER1_WIN" ? 3 : match.result === "DRAW" ? 2 : 1;
      }

      // Обновляем данные для player2
      if (playerData.has(match.player2Id)) {
        const player2Data = playerData.get(match.player2Id);
        player2Data.gamesPlayed++;
        player2Data.matches.push(match);
        player2Data.totalPoints +=
          match.result === "PLAYER2_WIN" ? 3 : match.result === "DRAW" ? 2 : 1;
      }
    });

    // Обработка раундов
    playerData.forEach((player) => {
      player.matches.sort((a, b) => a.date.getTime() - b.date.getTime());
      player.rounds = new Array(10).fill(0).map((_, roundIndex) => {
        return player.matches
          .slice(roundIndex * 4, (roundIndex + 1) * 4)
          .reduce((total, match) => {
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

    return standings;
  } catch (error) {
    console.error("Error fetching standings:", error);
    return [];
  }
}

const StandingsPage: NextPage = async () => {
  const cachedStandings = getCache(STANDINGS_CACHE_KEY);

  const standings = cachedStandings ? cachedStandings : await fetchStandings();

  setCache(STANDINGS_CACHE_KEY, standings);

  return <StandingsTable standings={standings} />;
};

export default StandingsPage;
