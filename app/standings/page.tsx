import type { Metadata, NextPage } from "next";
import StandingsTable from "@/component/StandingsTable";
import { PrismaClient } from "@prisma/client";
import { Summer2024Service } from "@/service/summer-2024-service";

const prisma = new PrismaClient();
const summer2024Service = new Summer2024Service(prisma);

export const metadata: Metadata = {
  title: "Турнирная таблица. Лето 2024",
};

const StandingsPage: NextPage = async () => {
  const standings = await summer2024Service.getStandings();

  return <StandingsTable standings={standings} />;
};

export default StandingsPage;

export const fetchCache = "force-no-store";
