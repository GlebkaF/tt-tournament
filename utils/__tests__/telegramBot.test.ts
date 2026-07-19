import {
  formatRemainingMessage,
  parseTelegramCommand,
  unknownTelegramUserMessage,
} from "../telegramBot";

describe("parseTelegramCommand", () => {
  it.each([
    ["/start", "start"],
    ["/start payload", "start"],
    ["/remaining", "remaining"],
    ["/remaining@ebtt_bot", "remaining"],
    ["С кем мне осталось сыграть", "remaining"],
  ])("parses %s", (text, expected) => {
    expect(parseTelegramCommand(text)).toBe(expected);
  });

  it.each(["", "привет", "/unknown", "текст /remaining"])(
    "ignores %s",
    (text) => {
      expect(parseTelegramCommand(text)).toBeNull();
    }
  );
});

describe("formatRemainingMessage", () => {
  it("lists remaining opponents", () => {
    expect(
      formatRemainingMessage("Глеб", [
        { firstName: "Анна", lastName: "Николенко" },
        { firstName: "Дмитрий", lastName: "Куртеков" },
      ])
    ).toBe(
      "Глеб, тебе осталось сыграть с 2 соперниками:\n\n" +
        "1. Николенко Анна\n2. Куртеков Дмитрий"
    );
  });

  it("reports a completed round robin", () => {
    expect(formatRemainingMessage("Глеб", [])).toContain(
      "все матчи сыграны"
    );
  });

  it("reports an inactive known player", () => {
    expect(formatRemainingMessage("Глеб", [], false)).toContain(
      "не участвуешь"
    );
  });
});

test("unknown user is directed to /start", () => {
  expect(unknownTelegramUserMessage()).toContain("/start");
});
