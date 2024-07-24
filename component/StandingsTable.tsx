import { Standings } from "@/app/interface";
import React from "react";

const StandingsTable = ({ standings }: { standings: Standings }) => {
  const totalGames = standings.length - 1;
  const roundGames = 4;
  const maxRounds = Math.ceil(totalGames / roundGames);

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

  return (
    <div className="container mx-auto py-5">
      <h2 className="text-3xl font-bold mb-4">Летний турнир 2024</h2>
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-xs text-gray-700 text-center">
              Место
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
              Очки
            </th>
            <th className="px-4 py-2 text-xs text-gray-700 text-center">
              Игры
            </th>
            <th className="px-4 py-2 text-xs text-gray-700 hidden lg:table-cell text-center">
              Среднее очков
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((item, index) => (
            <tr key={index}>
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
              <td className="px-4 py-4 text-sm text-gray-700 text-center">
                {item.gamesPlayed}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700 text-center hidden lg:table-cell  relative group">
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
