import type { Metadata, NextPage } from "next";
import StandingsTable from "@/component/StandingsTable";

import createDeps from "@/service/create-deps";

const { summer2024Service } = createDeps();

export const metadata: Metadata = {
  title: "Турнирная таблица. Лето 2024",
};

const StandingsPage: NextPage = async () => {
  const standings = await summer2024Service.getStandings();

  return <StandingsTable standings={standings} />;
};

export default StandingsPage;

export const fetchCache = "force-no-store";
