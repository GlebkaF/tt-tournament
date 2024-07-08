import { PrismaClient } from "@prisma/client";
import { Player } from "@/app/interface";
import Schedule from "@/component/Schedule";

const prisma = new PrismaClient();

export default async function MatchesPage() {
  const players: Player[] = await prisma.user.findMany();

  return <Schedule players={players} />;
}
