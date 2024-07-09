"use client";

import { Match, Player } from "@/app/interface";
import { useState, useEffect } from "react";
import MatchForm from "./MatchForm";
import MatchList from "./MatchList";
import { Typography } from "antd";
import { Loading } from "./Loading";

const { Text } = Typography;

const MatchPage = ({ players }: { players: Player[] }) => {
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
    <div className="container mx-auto">
      {showForm && (
        <MatchForm
          players={players}
          playedMatches={matches}
          onSubmit={refreshMatches}
        />
      )}
      {loading ? <Loading></Loading> : <MatchList matches={matches} />}
    </div>
  );
};

export default MatchPage;
