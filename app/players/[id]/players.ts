export const playersDB: {
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
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
  },
  12: {
    id: 12,
    firstName: "noname",
    lastName: "lastname",
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
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
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
    firstName: "noname",
    lastName: "lastname",
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
    firstName: "noname",
    lastName: "lastname",
    image: "/image/profile/default.jpg",
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
  // Марина Воробьева, 2 место парный 2024,
  // Алексей Егоров, 1 место парный 2024
  // Мирзо Бронзовая Лига 2023 1
  //  Иванов Виктор парный 2023 3 место
};
