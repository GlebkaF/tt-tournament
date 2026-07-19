import { timingSafeEqual } from "node:crypto";
import { getExternalFetch } from "@/service/proxy";
import {
  handleTelegramUpdate,
  TelegramUpdate,
} from "@/service/telegram-update-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

const globalForPolling = globalThis as unknown as {
  __ttTelegramNextUpdateId?: number;
  __ttTelegramPollActive?: boolean;
};

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
async function getUpdates(
  token: string,
  offset: number,
  timeout: number
): Promise<TelegramUpdate[]> {
  const url = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("timeout", String(timeout));
  url.searchParams.set("limit", "25");
  url.searchParams.set("allowed_updates", JSON.stringify(["message"]));

  const response = await getExternalFetch()(url, {
    signal: AbortSignal.timeout((timeout + 10) * 1000),
  });
  const body = (await response.json()) as {
    ok?: boolean;
    description?: string;
    result?: TelegramUpdate[];
  };
  if (!response.ok || !body.ok || !body.result) {
    throw new Error(
      `getUpdates: ${body.description || `HTTP ${response.status}`}`
    );
  }
  return body.result;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (globalForPolling.__ttTelegramPollActive) {
    return Response.json({ status: "already_polling" }, { status: 409 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return Response.json({ error: "Telegram is not configured" }, { status: 503 });
  }

  globalForPolling.__ttTelegramPollActive = true;
  try {
    const initializing = globalForPolling.__ttTelegramNextUpdateId === undefined;
    const offset = initializing
      ? -1
      : globalForPolling.__ttTelegramNextUpdateId ?? 0;
    const updates = await getUpdates(token, offset, initializing ? 0 : 20);
    let handled = 0;

    for (const update of updates) {
      if (await handleTelegramUpdate(update)) handled += 1;
      globalForPolling.__ttTelegramNextUpdateId = update.update_id + 1;
    }
    if (initializing && updates.length === 0) {
      globalForPolling.__ttTelegramNextUpdateId = 0;
    }

    return Response.json({
      status: "ready",
      received: updates.length,
      handled,
      nextUpdateId: globalForPolling.__ttTelegramNextUpdateId,
    });
  } catch (error) {
    console.error("Telegram polling error:", error);
    return Response.json({ error: "Telegram polling failed" }, { status: 502 });
  } finally {
    globalForPolling.__ttTelegramPollActive = false;
  }
}
