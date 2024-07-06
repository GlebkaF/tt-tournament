"use client";

import { Match, Player } from "@/app/interface";
import { useState } from "react";
import MatchForm from "./MatchForm";

const MatchList = ({ matches }: { matches: Match[] }) => {
  return (
    <div className="mt-8 px-2 sm:px-4">
      <h2 className="text-xl font-semibold mb-4">Match Results</h2>
      <ul className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
        {matches.map((match) => (
          <li key={match.id} className="p-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full">
              <div className="text-lg w-full sm:w-1/2 text-center sm:text-left overflow-hidden">
                <span className="font-semibold">
                  {match.player1.firstName} {match.player1.lastName}
                </span>
                <span> vs </span>
                <span className="font-semibold">
                  {match.player2.firstName} {match.player2.lastName}
                </span>
              </div>
              <div className="mt-2 sm:mt-0 text-xl font-bold w-full sm:w-auto text-center">
                {match.result.replace("_", " ")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function MatchPage({
  players,
  initialMatches,
}: {
  players: Player[];
  initialMatches: Match[];
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  const refreshMatches = async () => {
    const res = await fetch("/api/match");
    const updatedMatches: Match[] = await res.json();
    setMatches(updatedMatches);
  };

  return (
    <div className="container mx-auto px-4">
      <MatchForm players={players} onSubmit={refreshMatches} />
      <MatchList matches={matches} />
    </div>
  );
}
