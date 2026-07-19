export type TelegramBotCommand = "start" | "remaining";

const REMAINING_PHRASE = "с кем мне осталось сыграть";

/**
 * Telegram передаёт выбранную команду как /command или /command@bot_name.
 * Текстовую фразу тоже поддерживаем для личного чата с отключённым privacy mode.
 */
export function parseTelegramCommand(text: string): TelegramBotCommand | null {
  const normalized = text.trim().toLocaleLowerCase("ru-RU");
  if (normalized === REMAINING_PHRASE) return "remaining";

  const match = normalized.match(/^\/([a-z0-9_]+)(?:@[a-z0-9_]+)?(?:\s|$)/i);
  if (!match) return null;

  if (match[1] === "start") return "start";
  if (match[1] === "remaining") return "remaining";
  return null;
}

function opponentWord(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return "соперниками";
  if (mod10 === 1) return "соперником";
  return "соперниками";
}

export function formatRemainingMessage(
  firstName: string,
  opponents: { firstName: string; lastName: string }[],
  isActiveParticipant = true
): string {
  if (!isActiveParticipant) {
    return `${firstName}, ты сейчас не участвуешь в текущем турнире.`;
  }

  if (opponents.length === 0) {
    return `${firstName}, у тебя не осталось соперников — все матчи сыграны 🏓`;
  }

  const names = opponents.map(
    ({ firstName: opponentFirstName, lastName }, index) =>
      `${index + 1}. ${lastName} ${opponentFirstName}`
  );

  return [
    `${firstName}, тебе осталось сыграть с ${opponents.length} ${opponentWord(
      opponents.length
    )}:`,
    "",
    ...names,
  ].join("\n");
}

export function unknownTelegramUserMessage(): string {
  return "Я пока тебя не знаю. Выполни /start, чтобы познакомиться.";
}
