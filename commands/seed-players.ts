import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const participants = [
  { firstName: "Алексей", lastName: "Михалевич" },
  { firstName: "Виктория", lastName: "Емельянова" },
  { firstName: "Антон", lastName: "Тимочкин" },
  { firstName: "Наталья", lastName: "Зайцева" },
  { firstName: "Дмитрий", lastName: "Куртеков" },
  { firstName: "Артем", lastName: "Шаламов" },
  { firstName: "Глеб", lastName: "Фокин" },
  { firstName: "Евгений", lastName: "Шкретов" },
  { firstName: "Константин", lastName: "Назимов" },
  { firstName: "Антон", lastName: "Шестернин" },
  { firstName: "Роман", lastName: "Аникин" },
  { firstName: "Дмитрий", lastName: "Васильев" },
  { firstName: "Кирилл", lastName: "Ролдугин" },
  { firstName: "Андрей", lastName: "Ачкасов" },
  { firstName: "Андрей", lastName: "Рогозин" },
  { firstName: "Максим", lastName: "Ефименко" },
  { firstName: "Виктор", lastName: "Герасимов" },
  { firstName: "Николай", lastName: "Соловьев" },
  { firstName: "Максим", lastName: "Егоров" },
  { firstName: "Дмитрий", lastName: "Гондюхин" },
  { firstName: "Никита", lastName: "Рабчевский" },
  { firstName: "Илья", lastName: "Кургузов" },
  { firstName: "Антон", lastName: "Катренко" },
  { firstName: "Кирилл", lastName: "Козюрин" },
  { firstName: "Димитрий", lastName: "Ластовский" },
  { firstName: "Виталий", lastName: "Хомич" },
  { firstName: "Наталья", lastName: "Рыжкова" },
  { firstName: "Илья", lastName: "Исаев" },
  { firstName: "Сергей", lastName: "Соболев" },
  { firstName: "Анастасия", lastName: "Тамбовцева" },
  { firstName: "Наталья", lastName: "Боженова" },
  { firstName: "Марина", lastName: "Фокина" },
  { firstName: "Мирзоахад", lastName: "" },
  { firstName: "Елена", lastName: "Югай" },
  { firstName: "Вадим", lastName: "Боженов" },
  { firstName: "Егор", lastName: "Исаев" },
  { firstName: "Александр", lastName: "Талалаев" },
  { firstName: "Денис", lastName: "Самохин" },
  { firstName: "Алексей", lastName: "Егоров" },
  { firstName: "Борис", lastName: "Кусакин" },
  { firstName: "Руслан", lastName: "Руднев" },
  { firstName: "Данил", lastName: "Тилишевский" },
];

async function main() {
  for (const participant of participants) {
    await prisma.user.create({
      data: participant,
    });
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
