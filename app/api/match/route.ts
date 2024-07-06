import { PrismaClient } from "@prisma/client";
import { resetCache } from "../standings/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { player1Id, player2Id, player1Score, player2Score, result, date } =
      await req.json();
    await prisma.match.create({
      data: {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        result,
        date: new Date(date),
      },
    });

    resetCache();

    return new Response(
      JSON.stringify({ message: "Match recorded successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Post Match Error:", error);
    return new Response(JSON.stringify({ error: "Error recording match" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        player1: true,
        player2: true,
      },
    });
    return new Response(JSON.stringify(matches), {
      status: 200,
    });
  } catch (error) {
    console.error("Get Match Error:", error);
    return new Response(JSON.stringify({ error: "Error fetching matches" }), {
      status: 500,
    });
  }
}
