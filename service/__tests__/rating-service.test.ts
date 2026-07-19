import { PrismaClient } from "@prisma/client";
import { RatingService, resetRatingCache } from "../rating-service";

function createPrismaMock() {
  return {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, firstName: "Анна", lastName: "Первая" },
        { id: 2, firstName: "Борис", lastName: "Второй" },
      ]),
    },
    match: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          player1Id: 1,
          player2Id: 2,
          result: "PLAYER1_WIN",
          date: new Date("2026-06-01T12:00:00.000Z"),
        },
      ]),
    },
  };
}

describe("RatingService", () => {
  beforeEach(() => resetRatingCache());

  it("loads all players and matches and builds rating history", async () => {
    const prisma = createPrismaMock();
    const service = new RatingService(prisma as unknown as PrismaClient);

    const data = await service.getRatingData();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: { id: true, firstName: true, lastName: true },
    });
    expect(prisma.match.findMany).toHaveBeenCalledWith({
      orderBy: [{ date: "asc" }, { id: "asc" }],
      select: {
        id: true,
        player1Id: true,
        player2Id: true,
        result: true,
        date: true,
      },
    });
    expect(data.history.players.get(1)?.rating).toBeGreaterThan(1500);
    expect(data.history.matches.get(1)?.player1.delta).toBeGreaterThan(0);
  });

  it("reuses the cached derived result", async () => {
    const prisma = createPrismaMock();
    const service = new RatingService(prisma as unknown as PrismaClient);

    const first = await service.getRatingData();
    const second = await service.getRatingData();

    expect(second).toBe(first);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.match.findMany).toHaveBeenCalledTimes(1);
  });

  it("reloads data after explicit invalidation", async () => {
    const prisma = createPrismaMock();
    const service = new RatingService(prisma as unknown as PrismaClient);

    await service.getRatingData();
    resetRatingCache();
    await service.getRatingData();

    expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    expect(prisma.match.findMany).toHaveBeenCalledTimes(2);
  });
});
