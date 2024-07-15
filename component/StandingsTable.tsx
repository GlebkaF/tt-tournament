import { Standings } from "@/app/interface";
import React from "react";

const StandingsTable = ({ standings }: { standings: Standings }) => {
  const maxRounds = 9;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold my-4">Летний турнир 2024</h2>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
