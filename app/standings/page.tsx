"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { Spin } from "antd";
import StandingsTable from "@/component/StandingsTable";
import { Loading } from "@/component/Loading";

const StandingsPage: NextPage = () => {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStandings = async () => {
      const res = await fetch("/api/standings");
      const data = await res.json();
      setStandings(data);
      setLoading(false);
    };

    fetchStandings();
  }, []);

  return (
    <div>
      {loading ? <Loading /> : <StandingsTable standings={standings} />}
    </div>
  );
};

export default StandingsPage;
