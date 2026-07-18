import { timingSafeEqual } from "node:crypto";
import createDeps from "@/service/create-deps";

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
    const requestedDate = url.searchParams.get("date") ?? undefined;
    const date =
      dryRun && requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
        ? requestedDate
        : undefined;
    const { dailyDigestService } = createDeps();
    const result = await dailyDigestService.run({ dryRun, date });
    return Response.json({
      status: result.status,
      date: result.date,
      editorSource: result.editorSource,
      telegramMessageId: result.telegramMessageId,
    });
  } catch (error) {
    console.error("Daily digest cron failed:", error);
    return Response.json({ error: "Daily digest failed" }, { status: 500 });
  }
}
