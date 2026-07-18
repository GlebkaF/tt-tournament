import { PrismaClient } from "@prisma/client";
import { DailyDigestService } from "@/service/daily-digest-service";
import { TournamentService } from "@/service/tournament-service";

const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const date = dateArg?.slice("--date=".length);
const send = process.argv.includes("--send");

const prisma = new PrismaClient();
const tournamentService = new TournamentService(prisma);
const service = new DailyDigestService(prisma, tournamentService);

try {
  const result = await service.run({ date, dryRun: !send });
  console.log(`status=${result.status} date=${result.date}`);
  if (result.editorSource) console.log(`editor=${result.editorSource}`);
  if (result.message) console.log(`\n${result.message}`);
} finally {
  await prisma.$disconnect();
}
