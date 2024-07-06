import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, params: any) {
  const id = params.params.id;

  if (!id) {
    return NextResponse.json(
      { error: "Player id is required" },
      { status: 400 }
    );
  }

  try {
    const playerId = parseInt(id, 10);

    const playedMatches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: playerId }, { player2Id: playerId }],
      },
      select: {
        player1Id: true,
        player2Id: true,
      },
    });

    const playedAgainst = new Set(
      playedMatches.flatMap((m) => [m.player1Id, m.player2Id])
    );

    const players = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: playerId } }, // Exclude the current player
          { id: { notIn: Array.from(playedAgainst) } }, // Exclude players already played against
        ],
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching opponents:", error);
    return NextResponse.json(
      { error: "Error fetching opponents" },
      { status: 500 }
    );
  }
}
