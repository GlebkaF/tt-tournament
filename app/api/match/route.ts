import {
  STANDINGS_CACHE_KEY,
  getCache,
  resetCache,
  setCache,
} from "@/helpers/cache";
import { PrismaClient } from "@prisma/client";

const MATCHES_CACHE_KEY = "matches";
const prisma = new PrismaClient();

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

  console.log({
    validUsername,
    validPassword,
  });

  return username === validUsername && password === validPassword;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const credentials = parseBasicAuth(authHeader);

    console.log({ credentials });

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

    // Проверка на существование записи с аналогичными данными
    const existingMatch = await prisma.match.findFirst({
      where: {
        player1Id,
        player2Id,
      },
    });
    const existingMatch2 = await prisma.match.findFirst({
      where: {
        player1Id: player2Id,
        player2Id: player1Id,
      },
    });

    if (existingMatch || existingMatch2) {
      return new Response(JSON.stringify({ error: "Match already exists" }), {
        status: 409,
      });
    }

    // Создание новой записи
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

    // Сброс кэша
    resetCache(STANDINGS_CACHE_KEY);
    resetCache(MATCHES_CACHE_KEY);

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
    const cahcedMatches = getCache(MATCHES_CACHE_KEY);
    const matches = cahcedMatches
      ? cahcedMatches
      : await prisma.match.findMany({
          include: {
            player1: true,
            player2: true,
          },
        });

    setCache(MATCHES_CACHE_KEY, matches);
    return new Response(JSON.stringify(matches), { status: 200 });
  } catch (error) {
    console.error("Get Matches Error:", error);
    return new Response(JSON.stringify({ error: "Error fetching matches" }), {
      status: 500,
    });
  }
}
