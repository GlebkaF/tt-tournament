import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Недостающие игроки из турнира этого сезона
const missingParticipants = [
  { firstName: "Никита", lastName: "Скляров" },
  { firstName: "Дмитрий", lastName: "Ерзин" },
  { firstName: "Сергей", lastName: "Ерзин" },
  { firstName: "Елена", lastName: "Красовская" },
  { firstName: "noname", lastName: "Кусакин" },
  { firstName: "Сергей", lastName: "Протас" },
  { firstName: "Антон", lastName: "Герасимов" },
  { firstName: "Александр", lastName: "Максимов" },
  { firstName: "Михаил", lastName: "Сафронов" },
];

async function main() {
  console.log("Добавляю недостающих игроков в базу данных...");

  for (const participant of missingParticipants) {
    try {
      // Проверяем, есть ли уже такой игрок в базе
      const existingPlayer = await prisma.user.findFirst({
        where: {
          firstName: participant.firstName,
          lastName: participant.lastName,
        },
      });

      if (existingPlayer) {
        console.log(
          `⚠️  Игрок ${participant.firstName} ${participant.lastName} уже существует (ID: ${existingPlayer.id})`
        );
        continue;
      }

      // Создаем нового игрока
      const newPlayer = await prisma.user.create({
        data: participant,
      });

      console.log(
        `✅ Добавлен игрок: ${participant.firstName} ${participant.lastName} (ID: ${newPlayer.id})`
      );
    } catch (error) {
      console.error(
        `❌ Ошибка при добавлении игрока ${participant.firstName} ${participant.lastName}:`,
        error
      );
    }
  }

  console.log("Добавление недостающих игроков завершено.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
