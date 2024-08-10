import { Match, PrismaClient } from "@prisma/client";

import { getCache, setCache } from "@/helpers/cache";
import { TournamentService } from "./tournament-service";

const playersDB: {
  [key: number]: {
    id: number;
    firstName: string;
    lastName: string;
    image: string;
    facts?: { title: string; description: string }[];
  };
} = {
  1: {
    id: 1,
    firstName: "Алексей",
    lastName: "Михалевич",
    image: "/image/profile/mih-al.jpg",
    facts: [
      {
        title: "Открытие сезона 2024",
        description: "🥈 2 место",
      },
    ],
  },
  2: {
    id: 2,
    firstName: "Виктория",
    lastName: "Емельяненко",
    image: "/image/profile/emel.jpg",
  },
  3: {
    id: 3,
    firstName: "Антон",
    lastName: "Тимченко",
    image: "/image/profile/timch.jpg",
  },
  4: {
    id: 4,
    firstName: "Наталья",
    lastName: "Зайцева",
    image: "/image/profile/zai.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥇 1 место",
      },
      {
        title: "Открытие сезона 2024",
        description: "🥇 1 место",
      },
      {
        title: "Закрытие сезона 2023",
        description: "🥇 1 место",
      },
      {
        title: "Летний турнир 2023",
        description: "Золотая лига. 🥇 1 место",
      },
    ],
  },
  5: {
    id: 5,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/kur-dim.jpg",
    facts: [
      {
        title: "Случайные пары 2023",
        description: "🥈 2 место",
      },
    ],
  },
  6: {
    id: 6,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/shal.jpg",
    facts: [],
  },
  7: {
    id: 7,
    firstName: "Глеб",
    lastName: "Фокин",
    image: "/image/profile/fokin-gleb.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥉 3 место",
      },
      {
        title: "Закрытие сезона 2023",
        description: "🥉 3 место",
      },
    ],
  },
  8: {
    id: 8,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/shkret.jpg",
    facts: [
      {
        title: "Закрытие сезона 2023",
        description: "🥈 2 место",
      },
      {
        title: "Летний турнир 2023",
        description: "Золотая лига. 🥈 2 место",
      },
      {
        title: "Летний турнир 2022",
        description: "🥇 1 место",
      },
      {
        title: "Самый главный",
        description: "Идейный вдохновитель и организатор турниров",
      },
    ],
  },
  9: {
    id: 9,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/nazim.jpg",
    facts: [
      {
        title: "Летний турнир 2023",
        description: "Серебряная лига. 🥇 1 место",
      },
      {
        title: "Случайные пары 2023",
        description: "🥈 2 место",
      },
    ],
  },
  10: {
    id: 10,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/shest-an.jpg",
  },
  11: {
    id: 11,
    firstName: "Роман",
    lastName: "Аникин",
    image: "/image/profile/anikin-roman.jpg",
  },
  12: {
    id: 12,
    firstName: "Дмитрий",
    lastName: "Васильев",
    image: "/image/profile/default.jpg",
  },
  13: {
    id: 13,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/roldug.jpg",
  },
  14: {
    id: 14,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/аchkas.jpg",
  },
  15: {
    id: 15,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/rogoz.jpg",
    facts: [
      {
        title: "Летний турнир 2023",
        description: "Серебряная лига. 🥉 3 место",
      },
    ],
  },
  16: {
    id: 16,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/efim.jpg",
    facts: [
      {
        title: "Случайные пары 2023",
        description: "🥇 1 место",
      },
    ],
  },
  17: {
    id: 17,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/gerasimov.jpg",
    facts: [
      {
        title: "Случайные пары 2023",
        description: "🥉 3 место",
      },
    ],
  },
  18: {
    id: 18,
    firstName: "Николай",
    lastName: "Соловьев",
    image: "/image/profile/solov.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥈 2 место",
      },
    ],
  },
  19: {
    id: 19,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/egorov-maks.jpg",
  },
  20: {
    id: 20,
    firstName: "Дмитрий",
    lastName: "Гондюхин",
    image: "/image/profile/gonduh.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥉 3 место",
      },
      {
        title: "Летний турнир 2023",
        description: "Бронзовая лига. 🥉 2 место",
      },
    ],
  },
  21: {
    id: 21,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/rabch.jpg",
  },
  22: {
    id: 22,
    firstName: "Илья",
    lastName: "Кургузов",
    image: "/image/profile/kurguzov.jpg",
  },
  23: {
    id: 23,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/katrenko.jpg",
  },
  24: {
    id: 24,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/kozurin.jpg",
  },
  25: {
    id: 25,
    firstName: "Дмитрий",
    lastName: "Ластовский",
    image: "/image/profile/default.jpg",
  },
  26: {
    id: 26,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/homich.jpg",
    facts: [
      {
        title: "Летний турнир 2023",
        description: "Бронзовая лига. 🥉 3 место",
      },
    ],
  },
  27: {
    id: 27,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/ryzkova.jpg",
  },
  28: {
    id: 28,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/isaev.jpg",
    facts: [
      {
        title: "Летний турнир 2023",
        description: "Золотая лига. 🥉 3 место",
      },
      {
        title: "Летний турнир 2022",
        description: "🥈 2 место",
      },
    ],
  },
  29: {
    id: 29,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/sobolev.jpg",
  },
  30: {
    id: 30,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/tam-n.jpg",
    facts: [
      {
        title: "Открытие сезона 2024",
        description: "🥉 3 место",
      },
      {
        title: "Летний турнир 2023",
        description: "Серебряная лига. 🥈 2 место",
      },
      {
        title: "Случайные пары 2023",
        description: "🥇 1 место",
      },
    ],
  },
  31: {
    id: 31,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/bojenova.jpg",
  },
  32: {
    id: 32,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/fokina-marina.jpg",
    facts: [],
  },
  33: {
    id: 33,
    firstName: "Мирзоахад",
    lastName: "Зайнидинов",
    image: "/image/profile/default.jpg",
    facts: [
      {
        title: "Летний турнир 2023",
        description: "Бронзовая лига. 🥇 1 место",
      },
    ],
  },
  34: {
    id: 34,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/yugai.jpg",
  },
  35: {
    id: 35,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/bojenov-vadim.jpg",
  },
  36: {
    id: 36,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  37: {
    id: 37,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  38: {
    id: 38,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  39: {
    id: 39,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  40: {
    id: 40,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  41: {
    id: 41,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  42: {
    id: 42,
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },

  43: {
    id: 42,
    firstName: "Виктор",
    lastName: "Иванов",
    image: "/image/profile/ivanov-viktor.jpg",
    facts: [
      {
        title: "Случайные пары 2023",
        description: "🥉 3 место",
      },
    ],
  },
  44: {
    id: 42,
    firstName: "Алексей",
    lastName: "Егоров",
    image: "/image/profile/default.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥇 1 место",
      },
    ],
  },
  45: {
    id: 42,
    firstName: "Марина",
    lastName: "Воробьева",
    image: "/image/profile/default.jpg",
    facts: [
      {
        title: "Случайные пары 2024",
        description: "🥈 2 место",
      },
    ],
  },
};

type MatchResult = "PLAYER1_WIN" | "PLAYER2_WIN" | "DRAW" | "TBD";

interface MatchDetail {
  opponent: {
    name: string;
    id: number;
  };

  result: MatchResult;
}

interface Round {
  round: number;
  matches: MatchDetail[];
}

interface PlayerProfile {
  player: {
    id: number;
    name: string;
    gamesPlayed: number;
    image: string;
    facts: { title: string; description: string }[];
  };
  matchDetails: Round[];
}

export class UserService {
  constructor(
    private prisma: PrismaClient,
    private tournamentService: TournamentService
  ) {}

  async getUserProfile(id: number): Promise<PlayerProfile | null> {
    const cacheKey = "profile" + id;
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      console.log(cacheKey + "_HIT");
      return cachedResult;
    }

    const player = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    const players2 = await this.tournamentService.getPlayers(1);
    const matches2 = await this.getUserMatches(id);

    if (!player) {
      return null;
    }

    // Получаем всех соперников
    const allOpponents = players2.filter((p) => p.id !== id);

    // Получаем все возможные матчапы для текущего игрока
    const allPossibleMatches = allOpponents.map((opponent) => ({
      player1Id: id,
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
          p.id === (match.player1Id === id ? match.player2Id : match.player1Id)
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
    const groupedMatches: Round[] = [];
    for (let i = 0; i < combinedMatches.length; i += 4) {
      groupedMatches.push({
        round: i / 4 + 1,
        matches: combinedMatches.slice(i, i + 4).map(({ match, opponent }) => ({
          opponent: opponent
            ? {
                id: opponent.id,
                name: `${opponent.lastName} ${opponent.firstName}`,
              }
            : {
                id: 0,
                name: "Неизвестный",
              },
          result: (match.date <= new Date()
            ? match.player1Id === id
              ? match.result
              : match.result === "PLAYER1_WIN"
              ? "PLAYER2_WIN"
              : match.result === "PLAYER2_WIN"
              ? "PLAYER1_WIN"
              : "DRAW"
            : "TBD") as MatchResult,
        })),
      });
    }

    const image = playersDB[player.id]?.image ?? "/image/profile/default.jpg";
    const facts = playersDB[player.id]?.facts ?? [];

    const output = {
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

    setCache(cacheKey, output);

    return output;
  }

  private async getUserMatches(playerId: number): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        AND: [{ OR: [{ player1Id: playerId }, { player2Id: playerId }] }],
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}
