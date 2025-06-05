import createDeps from "@/service/create-deps";

const { tournamentService } = createDeps();

const tournamentId = 3;

function parseBasicAuth(
  authHeader: string
): { username: string; password: string } | null {
  if (!authHeader.startsWith("Basic ")) {
    return null;
  }
  const base64Credentials = authHeader.slice("Basic ".length).trim();
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = credentials.split(":");
  return { username, password };
}

function validateCredentials(username: string, password: string) {
  const validUsername = process.env.BASIC_AUTH_USERNAME;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  return username === validUsername && password === validPassword;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const credentials = parseBasicAuth(authHeader);

    if (
      !credentials ||
      !validateCredentials(credentials.username, credentials.password)
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
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
