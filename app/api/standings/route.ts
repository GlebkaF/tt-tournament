import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const players = await prisma.user.findMany({
      include: {
        matches1: true,
        matches2: true,
      },
    });

    const standings = players.map((player) => {
      const matches = [...player.matches1, ...player.matches2].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      const totalPoints = matches.reduce((total, match) => {
        if (match.player1Id === player.id) {
          return (
            total +
            (match.result === "PLAYER1_WIN"
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1)
          );
        } else {
          return (
            total +
            (match.result === "PLAYER2_WIN"
              ? 3
              : match.result === "DRAW"
              ? 2
              : 1)
          );
        }
      }, 0);

      const gamesPlayed = matches.length;

      const rounds = new Array(10).fill(0).map((_, roundIndex) => {
        return matches
          .slice(roundIndex * 4, (roundIndex + 1) * 4)
          .reduce((total, match) => {
            if (match.player1Id === player.id) {
              return (
                total +
                (match.result === "PLAYER1_WIN"
                  ? 3
                  : match.result === "DRAW"
                  ? 2
                  : 1)
              );
            } else {
              return (
                total +
                (match.result === "PLAYER2_WIN"
                  ? 3
                  : match.result === "DRAW"
                  ? 2
                  : 1)
              );
            }
          }, 0);
      });

      return {
        position: 0, // Placeholder; will sort and update later
        player: `${player.lastName} ${player.firstName}`,
        playerId: player.id,
        rounds,
        totalPoints,
        gamesPlayed,
        league: "", // Placeholder; will compute later
      };
    });

    // Sort by total points and update positions
    standings
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .forEach((player, index) => {
        player.position = index + 1;
        player.league =
          index < 8 ? "🥇" : index < 16 ? "🥈" : index < 24 ? "🥉" : "";
      });

    return NextResponse.json(standings);
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Error fetching standings" },
      { status: 500 }
    );
  }
}
