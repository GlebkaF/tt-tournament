import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../tournament-service";

describe("TournamentService participants", () => {
  it("reads the current tournament roster only from TournamentParticipant", async () => {
    const tournamentParticipantFindMany = jest.fn().mockResolvedValue([
      { playerId: 28, active: true },
      { playerId: 29, active: false },
      { playerId: 72, active: true },
    ]);
    const userFindMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      tournamentParticipant: { findMany: tournamentParticipantFindMany },
      user: { findMany: userFindMany },
    } as unknown as PrismaClient;

    await new TournamentService(prisma).getPlayers(4);

    expect(tournamentParticipantFindMany).toHaveBeenCalledWith({
      where: { tournamentId: 4 },
      select: { playerId: true, active: true },
    });
    expect(userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [28, 72] } } })
    );
  });
});
