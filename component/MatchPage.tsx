"use client";

import { Match, Player } from "@/app/interface";
import { useState, useEffect } from "react";
import MatchForm from "./MatchForm";
import MatchList from "./MatchList";
import { Spin } from "antd";

const MatchPage = ({ players }: { players: Player[] }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshMatches = async () => {
    const res = await fetch("/api/match");
    const updatedMatches: Match[] = await res.json();
    setMatches(updatedMatches);
    setLoading(false);
  };

  useEffect(() => {
    refreshMatches();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <MatchForm
        players={players}
        playedMatches={matches}
        onSubmit={refreshMatches}
      />
      {loading ? (
        <Spin size="large" className="mt-8" />
      ) : (
        <MatchList matches={matches} />
      )}
    </div>
  );
};

export default MatchPage;
