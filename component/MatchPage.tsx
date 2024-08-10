"use client";

import { Match, Player } from "@/app/interface";
import { useState, useEffect } from "react";
import MatchForm from "./MatchForm";
import MatchList from "./MatchList";
import { Loading } from "./Loading";

const MatchPage = ({
  players,
  totalMatchesCount,
}: {
  players: Player[];
  totalMatchesCount: number;
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    if (window.location.search === "?showForm") {
      setShowForm(true);
    }
  }, []);

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
    <div className="main-container">
      <h1 className="page-title mb-4">Матчи летнего турнира 2023</h1>
      {showForm && (
        <MatchForm
          players={players}
          playedMatches={matches}
          onSubmit={refreshMatches}
        />
      )}
      {loading ? (
        <Loading></Loading>
      ) : (
        <MatchList totalMatchesCount={totalMatchesCount} matches={matches} />
      )}
    </div>
  );
};

export default MatchPage;
