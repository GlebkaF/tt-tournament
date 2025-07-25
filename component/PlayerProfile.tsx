"use client";
import {
  CURRENT_TOURNAMENT_NAME,
  CURRENT_TOURNAMENT_NAME_SHORT,
} from "@/app/const";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface MatchDetail {
  opponent: {
    name: string;
    id: number;
  };

  result: string;
}

interface PlayerProfileProps {
  player: {
    id: number;
    name: string;
    gamesPlayed: number;
    image: string;
    facts: { title: string; description: string }[];
  };
  matchDetails: {
    round: number;
    matches: MatchDetail[];
  }[];
}

const getMatchResultStyle = (result: string): string => {
  switch (result) {
    case "PLAYER1_WIN":
      return "bg-green-100 text-green-500"; // Green for win
    case "PLAYER2_WIN":
      return "bg-red-100 text-red-500"; // Red for loss
    case "DRAW":
      return "bg-yellow-100 text-yellow-500"; // Yellow for draw
    default:
      return "";
  }
};

const calculateStatistics = (matchDetails: MatchDetail[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let tbd = 0;

  matchDetails.forEach((match) => {
    if (match.result === "PLAYER1_WIN") wins += 1;
    else if (match.result === "PLAYER2_WIN") losses += 1;
    else if (match.result === "DRAW") draws += 1;
    else if (match.result === "TBD") tbd += 1;
  });

  let score = wins * 3 + draws * 2 + losses * 1;
  return { wins, draws, losses, score, tbd };
};

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  matchDetails,
}) => {
  const allMatches = matchDetails.flatMap((round) => round.matches);
  const { wins, draws, losses, score, tbd } = calculateStatistics(allMatches);
  const totalGames = wins + draws + losses + tbd; // Общее количество игр включает оставшиеся игры

  return (
    <div className="container pb-32 pt-24">
      {/* Player Info */}
      <div className="flex flex-col desktop:flex-row items-start space-y-4 desktop:space-y-0 desktop:space-x-16">
        <Image
          width={1200}
          height={1600}
          src={player.image}
          className="w-full max-h-144 desktop:max-h-[36rem] desktop:max-w-sm object-cover rounded-lg"
          alt="player image"
        />
        <div className="w-full">
          <h2 className="heading-l">{player.name}</h2>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between mt-4">
              <p className="text-l">Сыграно матчей: {player.gamesPlayed}</p>
            </div>

            <div className="w-full h-6 bg-[gray] rounded-full overflow-hidden mt-2 relative">
              <div
                className="h-full bg-[green] flex items-center justify-center"
                style={{ width: `${(wins / totalGames) * 100}%` }}
              >
                <span
                  className="text-white text-sm text-center"
                  style={{ width: `${(wins / totalGames) * 100}%` }}
                >
                  {wins}
                </span>
              </div>
              <div
                className="h-full bg-[#caca2a] absolute top-0 left-0 flex items-center justify-center"
                style={{
                  width: `${(draws / totalGames) * 100}%`,
                  left: `${(wins / totalGames) * 100}%`,
                }}
              >
                <span
                  className="text-white text-sm text-center"
                  style={{
                    width: `${(draws / totalGames) * 100}%`,
                  }}
                >
                  {draws}
                </span>
              </div>
              <div
                className="h-full bg-[tomato] absolute top-0 left-0 flex items-center justify-center"
                style={{
                  width: `${(losses / totalGames) * 100}%`,
                  left: `${((wins + draws) / totalGames) * 100}%`,
                }}
              >
                <span
                  className="text-white text-sm text-center"
                  style={{
                    width: `${(losses / totalGames) * 100}%`,
                  }}
                >
                  {losses}
                </span>
              </div>
              <div
                className="h-full bg-secondary-base absolute top-0 left-0 flex items-center justify-center"
                style={{
                  width: `${(tbd / totalGames) * 100}%`,
                  left: `${((wins + draws + losses) / totalGames) * 100}%`,
                }}
              >
                <span
                  className="text-white text-sm text-center"
                  style={{
                    width: `${(tbd / totalGames) * 100}%`,
                  }}
                >
                  {tbd}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-20 space-y-4">
            {player.facts.map((fact, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold">{fact.title}</h4>
                <p className="text-l">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matches by Rounds  */}
      <div>
        <h3 className="text-2xl font-bold mb-4 mt-4">
          Матчи {CURRENT_TOURNAMENT_NAME_SHORT}
        </h3>
        {matchDetails.map((round) => (
          <div key={round.round} className="">
            <ul className="space-y-2">
              {round.matches.map((match, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center py-2 px-4 rounded ${getMatchResultStyle(
                    match.result
                  )}`}
                >
                  <Link href={`/players/${match.opponent.id}`}>
                    {match.opponent.name}
                  </Link>
                  <span>
                    {match.result === "PLAYER1_WIN"
                      ? "💥 Победа"
                      : match.result === "PLAYER2_WIN"
                      ? "🍞 Поражение"
                      : match.result === "DRAW"
                      ? "Ничья"
                      : "Не сыграно"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerProfile;
