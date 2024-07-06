"use client";

import { Player } from "@/app/interface";
import { useState } from "react";

interface MatchFormProps {
  players: Player[];
  onSubmit: () => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onSubmit }) => {
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [result, setResult] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (player1Id === null || player2Id === null || result === "") {
      setMessage("All fields are required.");
      return;
    }

    if (player1Id === player2Id) {
      setMessage("Players must be different.");
      return;
    }

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player1Id,
        player2Id,
        player1Score: 0, // Dummy values to satisfy API schema
        player2Score: 0, // Dummy values to satisfy API schema
        result,
      }),
    });

    if (res.ok) {
      setMessage("Match recorded successfully!");
      onSubmit(); // Refresh matches after submission
    } else {
      setMessage("There was an error recording the match.");
    }

    setPlayer1Id(null);
    setPlayer2Id(null);
    setResult("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow-md rounded-lg w-full max-w-lg mx-auto overflow-hidden"
    >
      <h2 className="text-xl font-semibold mb-4">Record Match Result</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Player 1:</label>
        <select
          value={player1Id || ""}
          onChange={(e) => setPlayer1Id(Number(e.target.value))}
          className="mt-1 block w-full p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>
            Select Player
          </option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.firstName} {player.lastName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Player 2:</label>
        <select
          value={player2Id || ""}
          onChange={(e) => setPlayer2Id(Number(e.target.value))}
          className="mt-1 block w-full p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>
            Select Player
          </option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.firstName} {player.lastName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Result:</label>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="mt-1 block w-full p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>
            Select Result
          </option>
          <option value="PLAYER1_WIN">Player 1 Wins</option>
          <option value="PLAYER2_WIN">Player 2 Wins</option>
          <option value="DRAW">Draw</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Submit
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </form>
  );
};

export default MatchForm;
