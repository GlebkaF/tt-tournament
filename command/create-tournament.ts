import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Создать новый турнир "Летний турнир 2024"
  const tournament = await prisma.tournament.create({
    data: {
      title: "Летний турнир 2024",
    },
  });

  // Получить все матчи
  const matches = await prisma.match.findMany();

  // Обновить каждый матч, привязав его к новому турниру
  await Promise.all(
    matches.map((match: any) => {
      return prisma.match.update({
        where: { id: match.id },
        data: { tournamentId: tournament.id },
      });
    })
  );

  console.log(
    'Все матчи были успешно привязаны к турниру "Летний турнир 2024"'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
