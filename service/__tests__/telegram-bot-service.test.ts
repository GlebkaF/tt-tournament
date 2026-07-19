import { PrismaClient } from "@prisma/client";
import { TelegramBotService } from "../telegram-bot-service";
import { TournamentService } from "../tournament-service";

function createService() {
  const user = {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
  };
  const prisma = { user } as unknown as PrismaClient;
  const tournamentService = {} as TournamentService;
  return {
    service: new TelegramBotService(prisma, tournamentService),
    user,
  };
}

describe("TelegramBotService.registerPlayer", () => {
  it("stores Telegram ID when the player has no ID yet", async () => {
    const { service, user } = createService();
    user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 7,
        firstName: "Глеб",
        lastName: "Фокин",
        telegramId: null,
      });
    user.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.registerPlayer(123456, "gleb")).resolves.toMatchObject(
      { status: "registered", player: { id: 7 } }
    );
    expect(user.updateMany).toHaveBeenCalledWith({
      where: { id: 7, telegramId: null },
      data: { telegramId: BigInt(123456) },
    });
  });

  it("does not overwrite a Telegram ID already linked to the player", async () => {
    const { service, user } = createService();
    user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 7,
        firstName: "Глеб",
        lastName: "Фокин",
        telegramId: BigInt(999),
      });

    await expect(service.registerPlayer(123456, "gleb")).resolves.toEqual({
      status: "player_already_linked",
    });
    expect(user.updateMany).not.toHaveBeenCalled();
  });

  it("does not emit a new registration for an already known Telegram ID", async () => {
    const { service, user } = createService();
    user.findFirst.mockResolvedValueOnce({
      id: 7,
      firstName: "Глеб",
      lastName: "Фокин",
    });

    await expect(service.registerPlayer(123456, "gleb")).resolves.toMatchObject(
      { status: "already_registered", player: { id: 7 } }
    );
    expect(user.updateMany).not.toHaveBeenCalled();
  });
});

describe("TelegramBotService.getTelegramChatId", () => {
  it("returns the private chat ID for the configured admin username", async () => {
    const { service, user } = createService();
    user.findFirst.mockResolvedValueOnce({ telegramId: BigInt(654321) });

    await expect(service.getTelegramChatId("glebkaf")).resolves.toBe("654321");
    expect(user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ telegramId: { not: null } }),
      })
    );
  });

  it("returns null until the admin has run /start", async () => {
    const { service, user } = createService();
    user.findFirst.mockResolvedValueOnce(null);

    await expect(service.getTelegramChatId("glebkaf")).resolves.toBeNull();
  });
});
