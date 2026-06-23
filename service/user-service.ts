import { Match, PrismaClient } from "@prisma/client";

import { getCache, setCache } from "@/helpers/cache";
import { TournamentService } from "./tournament-service";
import {
  CURRENT_TOURNAMENT_ID,
  CURRENT_TOURNAMENT_MATCHES_PER_ROUND,
} from "@/app/const";

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
        title: "Открытие сезона 2025",
        description: "🥇 1 место",
      },
      {
        title: "Открытие сезона 2024",
        description: "🥈 2 место",
      },
    ],
  },
  2: {
    id: 2,
    firstName: "Виктория",
    lastName: "Емельянова",
    image: "/image/profile/emel.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Золотая лига. 🥇 1 место",
      },
    ],
  },
  3: {
    id: 3,
    firstName: "Антон",
    lastName: "Тимочкин",
    image: "/image/profile/timch.jpg",
  },
  4: {
    id: 4,
    firstName: "Наталья",
    lastName: "Зайцева",
    image: "/image/profile/zai.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Золотая лига. 🥈 2 место",
      },
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
    firstName: "Дмитрий",
    lastName: "Куртеков",
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
    firstName: "Артем",
    lastName: "Шаламов",
    image: "/image/profile/shalamov-2025.jpg",
    facts: [
      {
        title: "Открытие сезона 2025",
        description: "🥉 3 место",
      },
      {
        title: "Летний турнир 2024",
        description: "Серебряная лига. 🥉 3 место",
      },
    ],
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
    firstName: "Евгений",
    lastName: "Шкретов",
    image: "/image/profile/shkret.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Золотая лига. 🥉 3 место",
      },
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
    firstName: "Константин",
    lastName: "Назимов",
    image: "/image/profile/nazim.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Бронзовая лига. 🥈 2 место",
      },
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
    firstName: "Антон",
    lastName: "Шестернин",
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
    firstName: "Кирилл",
    lastName: "Ролдугин",
    image: "/image/profile/roldug.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Серебряная лига. 🥈 2 место",
      },
    ],
  },
  14: {
    id: 14,
    firstName: "Андрей",
    lastName: "Ачкасов",
    image: "/image/profile/аchkas.jpg",
  },
  15: {
    id: 15,
    firstName: "Андрей",
    lastName: "Рогозин",
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
    firstName: "Максим",
    lastName: "Ефименко",
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
    firstName: "Виктор",
    lastName: "Герасимов",
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
        title: "Летний турнир 2024",
        description: "Бронзовая лига. 🥇 1 место",
      },
      {
        title: "Случайные пары 2024",
        description: "🥈 2 место",
      },
    ],
  },
  19: {
    id: 19,
    firstName: "Максим",
    lastName: "Егоров",
    image: "/image/profile/egorov-maks.jpg",
  },
  20: {
    id: 20,
    firstName: "Дмитрий",
    lastName: "Гондюхин",
    image: "/image/profile/gonduh.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Бронзовая лига. 🥉 3 место",
      },
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
    firstName: "Никита",
    lastName: "Рабчевский",
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
    firstName: "Антон",
    lastName: "Катренко",
    image: "/image/profile/katrenko.jpg",
  },
  24: {
    id: 24,
    firstName: "Кирилл",
    lastName: "Козюрин",
    image: "/image/profile/kozurin.jpg",
  },
  25: {
    id: 25,
    firstName: "Димитрий",
    lastName: "Ластовский",
    image: "/image/profile/default.jpg",
  },
  26: {
    id: 26,
    firstName: "Виталий",
    lastName: "Хомич",
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
    firstName: "Наталья",
    lastName: "Рыжкова",
    image: "/image/profile/ryzkova.jpg",
  },
  28: {
    id: 28,
    firstName: "Илья",
    lastName: "Исаев",
    image: "/image/profile/isaev.jpg",
    facts: [
      {
        title: "Летний турнир 2024",
        description: "Серебряная лига. 🥇 1 место",
      },
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
    firstName: "Сергей",
    lastName: "Соболев",
    image: "/image/profile/sobolev.jpg",
  },
  30: {
    id: 30,
    firstName: "Анастасия",
    lastName: "Тамбовцева",
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
    firstName: "Наталья",
    lastName: "Боженова",
    image: "/image/profile/bojenova.jpg",
  },
  32: {
    id: 32,
    firstName: "Марина",
    lastName: "Фокина",
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
    firstName: "Елена",
    lastName: "Югай",
    image: "/image/profile/yugai.jpg",
  },
  35: {
    id: 35,
    firstName: "Вадим",
    lastName: "Боженов",
    image: "/image/profile/bojenov-vadim.jpg",
  },
  38: {
    id: 38,
    firstName: "Денис",
    lastName: "Самохин",
    image: "/image/profile/default.jpg",
  },
  43: {
    id: 43,
    firstName: "Виктор",
    lastName: "Иванов",
    image: "/image/profile/ivanov-viktor.jpg",
    facts: [
      {
        title: "Открытие сезона 2025",
        description: "🥈 2 место",
      },
      {
        title: "Случайные пары 2023",
        description: "🥉 3 место",
      },
    ],
  },
  44: {
    id: 44,
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
    id: 45,
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
  46: {
    id: 46,
    firstName: "Бузургмехр",
    lastName: "Рахматуллоев",
    image: "/image/profile/default.jpg",
  },
  47: {
    id: 47,
    firstName: "Андрей",
    lastName: "Сараев",
    image: "/image/profile/default.jpg",
  },
  48: {
    id: 48,
    firstName: "Иван",
    lastName: "Антонов",
    image: "/image/profile/default.jpg",
  },
  49: {
    id: 49,
    firstName: "Михаил",
    lastName: "Хан",
    image: "/image/profile/default.jpg",
  },
  50: {
    id: 50,
    firstName: "Джамал",
    lastName: "Муллоев",
    image: "/image/profile/default.jpg",
  },
  51: {
    id: 51,
    firstName: "Евгений",
    lastName: "Васильев",
    image: "/image/profile/default.jpg",
  },
  52: {
    id: 52,
    firstName: "Илья",
    lastName: "Хряков",
    image: "/image/profile/default.jpg",
  },
  53: {
    id: 53,
    firstName: "Роман",
    lastName: "Юсупов",
    image: "/image/profile/default.jpg",
  },
  54: {
    id: 54,
    firstName: "Сергей",
    lastName: "Герковенко",
    image: "/image/profile/default.jpg",
  },
  55: {
    id: 55,
    firstName: "Ксения",
    lastName: "Герковенко",
    image: "/image/profile/ksenya_ger.jpg",
  },
  56: {
    id: 56,
    firstName: "Алексей",
    lastName: "Гусев",
    image: "/image/profile/default.jpg",
  },
  57: {
    id: 57,
    firstName: "Владимир",
    lastName: "Афанасьев",
    image: "/image/profile/default.jpg",
  },
  58: {
    id: 58,
    firstName: "Алексей",
    lastName: "Башаев",
    image: "/image/profile/default.jpg",
  },
  59: {
    id: 59,
    firstName: "Никита",
    lastName: "Скляров",
    image: "/image/profile/sklyarov-nikita.jpg",
  },
  60: {
    id: 60,
    firstName: "Дмитрий",
    lastName: "Ерзин",
    image: "/image/profile/erzin-dima.jpg",
  },
  61: {
    id: 61,
    firstName: "Сергей",
    lastName: "Ерзин",
    image: "/image/profile/erzin-sergey.jpg",
  },
  62: {
    id: 62,
    firstName: "Елена",
    lastName: "Красовская",
    image: "/image/profile/krasovskaya_elena.jpg",
  },
  63: {
    id: 63,
    firstName: "Борис",
    lastName: "Кусакин",
    image: "/image/profile/default.jpg",
  },
  64: {
    id: 64,
    firstName: "Сергей",
    lastName: "Протас",
    image: "/image/profile/default.jpg",
  },
  65: {
    id: 65,
    firstName: "Антон",
    lastName: "Герасимов",
    image: "/image/profile/default.jpg",
  },
  66: {
    id: 66,
    firstName: "Александр",
    lastName: "Максимов",
    image: "/image/profile/default.jpg",
  },
  67: {
    id: 67,
    firstName: "Михаил",
    lastName: "Сафронов",
    image: "/image/profile/default.jpg",
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

    const players2 = await this.tournamentService.getPlayers(3);
    const matches2 = await this.getUserMatches(id);

    if (!player) {
      return null;
    }

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

    // Комбинируем сыгранные и оставшиеся матчи
    const combinedMatches = detailedMatches;

    // Группируем матчи по турам (4 матча в каждом туре)
    const groupedMatches: Round[] = [];
    for (
      let i = 0;
      i < combinedMatches.length;
      i += CURRENT_TOURNAMENT_MATCHES_PER_ROUND
    ) {
      groupedMatches.push({
        round: i / CURRENT_TOURNAMENT_MATCHES_PER_ROUND + 1,
        matches: combinedMatches
          .slice(i, i + CURRENT_TOURNAMENT_MATCHES_PER_ROUND)
          .map(({ match, opponent }) => ({
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
        AND: [
          { tournamentId: CURRENT_TOURNAMENT_ID },
          { OR: [{ player1Id: playerId }, { player2Id: playerId }] },
        ],
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}
