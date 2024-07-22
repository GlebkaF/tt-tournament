"use client";
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
    <div className="py-5 space-y-8">
      {/* Player Info */}
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
        <Image
          width={1200}
          height={1600}
          src={player.image}
          className="w-full max-h-144 md:max-h-[36rem] md:max-w-sm object-cover rounded-lg"
          alt="player image"
        />
        <div className="w-full">
          <h2 className="text-3xl font-bold">{player.name}</h2>
          <div className="mt-4 space-y-4">
            <h4 className="text-xl font-semibold">Летний турнир 2024</h4>

            <div className="flex justify-between mt-4">
              <p className="text-gray-700">
                Сыграно матчей: {player.gamesPlayed}
              </p>
              <p className="text-gray-700">Очков: {score}</p>
            </div>

            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mt-2 relative">
              <div
                className="h-full bg-green-500 flex items-center justify-center"
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
                className="h-full bg-yellow-500 absolute top-0 left-0 flex items-center justify-center"
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
                className="h-full bg-red-500 absolute top-0 left-0 flex items-center justify-center"
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
                className="h-full bg-gray-400 absolute top-0 left-0 flex items-center justify-center"
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

          <div className="mt-6 space-y-4">
            {player.facts.map((fact, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold">{fact.title}</h4>
                <p className="text-gray-700">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matches by Rounds  */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Матчи по турам</h3>
        {matchDetails.map((round) => (
          <div key={round.round} className="mb-8">
            <h4 className="text-xl font-semibold mb-2">Тур {round.round}</h4>
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
                      ? "Победа"
                      : match.result === "PLAYER2_WIN"
                      ? "Поражение"
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
