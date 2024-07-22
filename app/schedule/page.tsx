import { PrismaClient } from "@prisma/client";
import { Player } from "@/app/interface";
import Schedule from "@/component/Schedule";
import { Summer2024Service } from "@/service/summer-2024-service";

const prisma = new PrismaClient();
const summer2024Service = new Summer2024Service(prisma);

export default async function MatchesPage() {
  const players: Player[] = await summer2024Service.getPlayers();

  return <Schedule players={players} />;
}
