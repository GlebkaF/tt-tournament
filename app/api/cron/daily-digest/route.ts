import { timingSafeEqual } from "node:crypto";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import createDeps from "@/service/create-deps";
import { dateInNovosibirsk } from "@/service/daily-digest-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.DIGEST_CRON_SECRET;
  const header = request.headers.get("Authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";
    const inspect = url.searchParams.get("inspect") === "1";
    const requestedDate = url.searchParams.get("date") ?? undefined;
    const date =
      (dryRun || inspect) &&
      requestedDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
        ? requestedDate
        : undefined;
    const { dailyDigestService, prisma } = createDeps();
    if (inspect) {
      const digestDate = date ?? dateInNovosibirsk();
      const digest = await prisma.dailyDigest.findUnique({
        where: {
          tournamentId_digestDate: {
            tournamentId: CURRENT_TOURNAMENT_ID,
            digestDate,
          },
        },
        select: {
          status: true,
          attempts: true,
          editorSource: true,
          telegramMessageId: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return Response.json({ date: digestDate, digest });
    }
    const result = await dailyDigestService.run({ dryRun, date });
    return Response.json({
      status: result.status,
      date: result.date,
      editorSource: result.editorSource,
      telegramMessageId: result.telegramMessageId,
    });
  } catch (error) {
    console.error("Daily digest cron failed:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Daily digest failed", detail: detail.slice(0, 1000) },
      { status: 500 }
    );
  }
}
