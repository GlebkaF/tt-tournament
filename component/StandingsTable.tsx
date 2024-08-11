"use client";
import { Standings, StandingsItem } from "@/app/interface";
import React, { useState, useCallback } from "react";

function getMatches(standings: Standings, item: StandingsItem) {
  const playedMatches = item.matches
    .map((match) => {
      const opponentId =
        match.player1Id === item.playerId ? match.player2Id : match.player1Id;
      const isOpponentPlayer1 = match.player1Id === opponentId;
      const opponent = standings.find(
        (player) => player.playerId === opponentId
      );
      return {
        id: match.id,
        name: opponent?.player,
        result:
          isOpponentPlayer1 && match.result === "PLAYER1_WIN"
            ? "Lose"
            : isOpponentPlayer1 && match.result === "PLAYER2_WIN"
            ? "Win"
            : !isOpponentPlayer1 && match.result === "PLAYER1_WIN"
            ? "Win"
            : !isOpponentPlayer1 && match.result === "PLAYER2_WIN"
            ? "Lose"
            : "Draw",
      };
    })
    .sort((a, b) => {
      if (a.result === "Win" && b.result !== "Win") return -1;
      if (a.result !== "Win" && b.result === "Win") return 1;
      if (a.result === "Draw" && b.result !== "Draw") return -1;
      if (a.result !== "Draw" && b.result === "Draw") return 1;
      return 0;
    });

  const allOpponents = standings.filter(
    (opponent) => opponent.playerId !== item.playerId
  );
  const playedOpponentIds = new Set(
    item.matches.map((match) =>
      match.player1Id === item.playerId ? match.player2Id : match.player1Id
    )
  );

  const tbdMatches = allOpponents
    .filter((opponent) => !playedOpponentIds.has(opponent.playerId))
    .map((opponent) => ({
      id: `tbd_${opponent.playerId}`,
      name: opponent.player,
      result: "TBD",
    }));

  return [...playedMatches, ...tbdMatches];
}

const StandingsTable = ({
  standings,
  title,
}: {
  standings: Standings;
  title: string;
}) => {
  const totalGames = standings.length - 1;
  const roundGames = 4;
  const maxRounds = Math.ceil(totalGames / roundGames);

  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const predict = standings
    .map((item) => {
      const avgScore = item.totalPoints / item.gamesPlayed;
      const currentScore = item.totalPoints;
      const remainingGames = totalGames - item.gamesPlayed;
      const score = Math.round(currentScore + remainingGames * avgScore);
      return {
        avgScore: Math.round(100 * (item.totalPoints / item.gamesPlayed)) / 100,
        playerId: item.playerId,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .reduce(
      (
        acc: {
          [key: number]: { score: number; position: number; avgScore: number };
        },
        item,
        index
      ) => {
        acc[item.playerId] = {
          avgScore: item.avgScore,
          score: item.score,
          position: index + 1,
        };
        return acc;
      },
      {}
    );

  const toggleExpand = useCallback(
    (playerId: number) => {
      setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
    },
    [expandedPlayer]
  );

  return (
    <div className="main-container">
      <h2 className="page-title mb-4">{title}</h2>
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-xs text-gray-700 text-center">
              {" "}
              Место{" "}
            </th>
            <th className="px-4 py-2 text-xs text-gray-700 text-left">Игрок</th>
            {Array.from({ length: maxRounds }, (_, i) => (
              <th
                key={i}
                className="px-1 py-2 text-xs text-gray-700 hidden lg:table-cell text-center"
              >
                {i + 1}
              </th>
            ))}
            <th className="px-4 py-2 text-xs text-gray-700 text-center">
              {" "}
              Очки{" "}
            </th>
            <th className="px-4 py-2 text-xs text-gray-700 text-center">
              {" "}
              Игры{" "}
            </th>
            <th className="px-4 py-2 text-xs text-gray-700 hidden lg:table-cell text-center">
              {" "}
              Среднее очков{" "}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700 text-center">
                  {item.position} {item.league}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 text-left">
                  <a
                    href={`/players/${item.playerId}`}
                    className="text-blue-500 underline"
                  >
                    {item.player}
                  </a>
                </td>
                {Array.from({ length: maxRounds }, (_, i) => (
                  <td
                    key={i}
                    className="px-1 py-2 text-sm text-gray-700 hidden lg:table-cell text-center"
                  >
                    {item.rounds[i] !== undefined ? item.rounds[i] : "-"}
                  </td>
                ))}
                <td className="px-4 py-4 text-sm text-gray-700 text-center">
                  {item.totalPoints}
                </td>
                <td
                  className="px-4 py-4 text-sm text-gray-700 text-center cursor-pointer"
                  onClick={() => toggleExpand(item.playerId)}
                >
                  {item.gamesPlayed}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 text-center hidden lg:table-cell relative group">
                  <div className="group-hover:block">
                    {predict[item.playerId].avgScore}
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full mb-2 bg-black text-white text-xs rounded py-1 px-2">
                    <div>
                      Прогноз после {standings.length - 1} игр:
                      <br />
                      {predict[item.playerId].position} место
                      <br /> {predict[item.playerId].score} очков
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 h-0 w-0 border border-transparent border-t-black"></div>
                  </div>
                </td>
              </tr>
              {expandedPlayer === item.playerId && (
                <tr>
                  <td colSpan={6} className="p-4">
                    <ul>
                      {getMatches(standings, item).map((match) => (
                        <li
                          key={match.id}
                          className={
                            match.result === "Win"
                              ? "text-green-500"
                              : match.result === "Draw"
                              ? "text-yellow-500"
                              : match.result === "Lose"
                              ? "text-red-500"
                              : "text-gray-500"
                          }
                        >
                          {match.name} - {match.result}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
