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

  const matches = [...player.matches1, ...player.matches2].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

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

  const playersDB = {
    1: {
      image: "/image/profile/mih-al.jpg",
      facts: [
        {
          title: "Турнир открытие 2024 года",
          description: "🥈 2 место",
        },
      ],
    },
    2: {
      image: "/image/profile/emel.jpg",
    },
    3: {
      image: "/image/profile/timch.jpg",
    },
    4: {
      image: "/image/profile/zai.jpg",
      facts: [
        {
          title: "Турнир открытие 2024 года",
          description: "🥇 1 место",
        },
        {
          title: "Турнир Закрытие сезона 2023",
          description: "🥇 1 место",
        },
        {
          title: "Летний турнир 2023",
          description: "Золотая лига. 🥇 1 место",
        },
      ],
    },
    5: {
      image: "/image/profile/kur-dim.jpg",
      facts: [
        {
          title: "Парный турнир 2023",
          description: "🥈 2 место",
        },
      ],
    },
    6: {
      image: "/image/profile/shal.jpg",
      facts: [],
    },
    7: {
      image: "/image/profile/fokin-gleb.jpg",
      facts: [
        {
          title: "Турнир Закрытие сезона 2023",
          description: "🥉 3 место",
        },
      ],
    },
    8: {
      image: "/image/profile/shkret.jpg",
      facts: [
        {
          title: "Турнир Закрытие сезона 2023",
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
      image: "/image/profile/nazim.jpg",
      facts: [
        {
          title: "Летний турнир 2023",
          description: "Серебряная лига. 🥇 1 место",
        },
        {
          title: "Парный турнир 2023",
          description: "🥈 2 место",
        },
      ],
    },
    10: {
      image: "/image/profile/shest-an.jpg",
    },
    11: {
      image: "/image/profile/default.jpg",
    },
    12: {
      image: "/image/profile/default.jpg",
    },
    13: {
      image: "/image/profile/roldug.jpg",
    },
    14: {
      image: "/image/profile/аchkas.jpg",
    },
    15: {
      image: "/image/profile/rogoz.jpg",
      facts: [
        {
          title: "Летний турнир 2023",
          description: "Серебряная лига. 🥉 3 место",
        },
      ],
    },
    16: {
      image: "/image/profile/efim.jpg",
      facts: [
        {
          title: "Парный турнир 2023",
          description: "🥇 1 место",
        },
      ],
    },
    17: {
      image: "/image/profile/gerasimov.jpg",
      facts: [
        {
          title: "Парный турнир 2023",
          description: "🥉 3 место",
        },
      ],
    },
    18: {
      image: "/image/profile/solov.jpg",
    },
    19: {
      image: "/image/profile/egorov-maks.jpg",
    },
    20: {
      image: "/image/profile/gonduh.jpg",
      facts: [
        {
          title: "Летний турнир 2023",
          description: "Бронзовая лига. 🥉 2 место",
        },
      ],
    },
    21: {
      image: "/image/profile/rabch.jpg",
    },
    22: {
      image: "/image/profile/default.jpg",
    },
    23: {
      image: "/image/profile/katrenko.jpg",
    },
    24: {
      image: "/image/profile/kozurin.jpg",
    },
    25: {
      image: "/image/profile/default.jpg",
    },
    26: {
      image: "/image/profile/homich.jpg",
      facts: [
        {
          title: "Летний турнир 2023",
          description: "Бронзовая лига. 🥉 3 место",
        },
      ],
    },
    27: {
      image: "/image/profile/ryzkova.jpg",
    },
    28: {
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
      image: "/image/profile/sobolev.jpg",
    },
    30: {
      image: "/image/profile/tam-n.jpg",
      facts: [
        {
          title: "Турнир открытие 2024 года",
          description: "🥉 3 место",
        },
        {
          title: "Летний турнир 2023",
          description: "Серебряная лига. 🥈 2 место",
        },
        {
          title: "Парный турнир 2023",
          description: "🥇 1 место",
        },
      ],
    },
    31: {
      image: "/image/profile/bojenova.jpg",
    },
    32: {
      image: "/image/profile/fokina-marina.jpg",
      facts: [],
    },
    33: {
      image: "/image/profile/default.jpg",
    },
    34: {
      image: "/image/profile/yugai.jpg",
    },
    35: {
      image: "/image/profile/bojenov-vadim.jpg",
    },
    36: {
      image: "/image/profile/default.jpg",
    },
    37: {
      image: "/image/profile/default.jpg",
    },
    38: {
      image: "/image/profile/default.jpg",
    },
    39: {
      image: "/image/profile/default.jpg",
    },
    40: {
      image: "/image/profile/default.jpg",
    },
    41: {
      image: "/image/profile/default.jpg",
    },
    42: {
      image: "/image/profile/default.jpg",
    },
  };

  // @ts-expect-error
  const image = playersDB[player.id]?.image ?? "/image/profile/default.jpg";
  // @ts-expect-error
  const facts = playersDB[player.id]?.facts ?? [];

  return {
    player: {
      id: player.id,
      name:
        `${player.lastName || ""} ${player.firstName || ""}`.trim() ??
        "Без имени",
      image,
      facts,
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
