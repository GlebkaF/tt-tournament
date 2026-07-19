import createDeps from "@/service/create-deps";
import { getExternalFetch } from "@/service/proxy";
import {
  formatRemainingMessage,
  parseTelegramCommand,
  unknownTelegramUserMessage,
} from "@/utils/telegramBot";

const ADMIN_TELEGRAM_USERNAME = "glebkaf";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    message_thread_id?: number;
    text?: string;
    chat: { id: number };
    from?: { id: number; username?: string };
  };
}
const { telegramBotService } = createDeps();

async function sendTelegramMessage(
  token: string,
  target: {
    chatId: number | string;
    messageThreadId?: number;
    replyToMessageId?: number;
  },
  text: string
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await getExternalFetch()(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: target.chatId,
          ...(target.messageThreadId
            ? { message_thread_id: target.messageThreadId }
            : {}),
          text,
          ...(target.replyToMessageId
            ? {
                reply_parameters: {
                  message_id: target.replyToMessageId,
                  allow_sending_without_reply: true,
                },
              }
            : {}),
        }),
        signal: controller.signal,
      }
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      description?: string;
    };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.description || `Telegram HTTP ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function sendLinkNotification(
  token: string,
  telegramUser: { id: number; username?: string },
  player: { firstName: string; lastName: string }
): Promise<void> {
  const adminChatId = await telegramBotService.getTelegramChatId(
    ADMIN_TELEGRAM_USERNAME
  );
  if (!adminChatId) {
    throw new Error(
      `Telegram link notification: @${ADMIN_TELEGRAM_USERNAME} must run /start first`
    );
  }

  const telegramLabel = telegramUser.username
    ? `@${telegramUser.username}`
    : `Telegram ID ${telegramUser.id}`;
  await sendTelegramMessage(
    token,
    { chatId: adminChatId },
    `🔗 Новая привязка: ${player.lastName} ${player.firstName} → ${telegramLabel}`
  );
}

function startMessage(
  result: Awaited<ReturnType<typeof telegramBotService.registerPlayer>>
): string {
  if (result.status === "username_required") {
    return "Не вижу у тебя Telegram username. Добавь его в настройках Telegram и снова выполни /start.";
  }
  if (result.status === "player_not_found") {
    return "Не смог тебя узнать по username. Попроси организатора проверить твой Telegram в списке участников, затем снова выполни /start.";
  }
  if (result.status === "player_already_linked") {
    return "Этот игрок уже привязан к другому Telegram-аккаунту. Попроси организатора проверить привязку.";
  }

  const verb = result.status === "registered" ? "Запомнил" : "Узнал";
  return `${verb} тебя, ${result.player.firstName}! Теперь /remaining покажет, с кем тебе осталось сыграть.`;
}

export async function handleTelegramUpdate(
  update: TelegramUpdate
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  const message = update.message;
  if (!message?.text || !message.from) return false;

  const command = parseTelegramCommand(message.text);
  if (!command) return false;

  let responseText: string;
  if (command === "start") {
    const result = await telegramBotService.registerPlayer(
      message.from.id,
      message.from.username
    );
    responseText = startMessage(result);
    if (result.status === "registered") {
      await sendLinkNotification(token, message.from, result.player);
    }
  } else {
    const result = await telegramBotService.getRemainingOpponents(
      message.from.id
    );
    responseText = result
      ? formatRemainingMessage(
          result.player.firstName,
          result.opponents,
          result.isActiveParticipant
        )
      : unknownTelegramUserMessage();
  }

  await sendTelegramMessage(
    token,
    {
      chatId: message.chat.id,
      messageThreadId: message.message_thread_id,
      replyToMessageId: message.message_id,
    },
    responseText
  );
  return true;
}
