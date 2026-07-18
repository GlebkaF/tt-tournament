import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import { MatchResult } from "@/app/interface";
import createDeps from "@/service/create-deps";
import {
  isAdminAuthorized,
  unauthorizedResponse,
} from "@/utils/serverAdminAuth";

const { tournamentService } = createDeps();

const tournamentId = CURRENT_TOURNAMENT_ID;

// Встреча = 2 партии: победа 2:0, ничья 1:1.
function scoresForResult(result: MatchResult): {
  player1Score: number;
  player2Score: number;
} {
  switch (result) {
    case MatchResult.player1Win:
      return { player1Score: 2, player2Score: 0 };
    case MatchResult.player2Win:
      return { player1Score: 0, player2Score: 2 };
    case MatchResult.draw:
      return { player1Score: 1, player2Score: 1 };
    default:
      throw new Error("Invalid result");
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdminAuthorized(req)) {
      return unauthorizedResponse();
    }

    const { player1Id, player2Id, player1Score, player2Score, result, date } =
      await req.json();

    await tournamentService.createMatch(
      player1Id,
      player2Id,
      player1Score,
      player2Score,
      result,
      new Date(date),
      tournamentId
    );
    return new Response(
      JSON.stringify({ message: "Match recorded successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Post Match Error:", error);
    return new Response(JSON.stringify({ error: "Error recording match" }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAdminAuthorized(req)) {
      return unauthorizedResponse();
    }

    const { matchId, result } = await req.json();
    const { player1Score, player2Score } = scoresForResult(result);

    await tournamentService.updateMatch(
      matchId,
      result,
      player1Score,
      player2Score,
      tournamentId
    );
    return new Response(
      JSON.stringify({ message: "Match updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Put Match Error:", error);
    return new Response(JSON.stringify({ error: "Error updating match" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAdminAuthorized(req)) {
      return unauthorizedResponse();
    }

    const { matchId } = await req.json();

    await tournamentService.deleteMatch(matchId, tournamentId);
    return new Response(
      JSON.stringify({ message: "Match deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Match Error:", error);
    return new Response(JSON.stringify({ error: "Error deleting match" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const matches = await tournamentService.getMatches(tournamentId);

    return new Response(JSON.stringify(matches), { status: 200 });
  } catch (error) {
    console.error("Get Matches Error:", error);
    return new Response(JSON.stringify({ error: "Error fetching matches" }), {
      status: 500,
    });
  }
}
