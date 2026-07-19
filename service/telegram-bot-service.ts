import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import { PrismaClient } from "@prisma/client";
import { TournamentService } from "./tournament-service";

interface TelegramPlayer {
  id: number;
  firstName: string;
  lastName: string;
}

export type TelegramRegistrationResult =
  | { status: "registered"; player: TelegramPlayer }
  | { status: "already_registered"; player: TelegramPlayer }
  | { status: "username_required" }
  | { status: "player_not_found" }
  | { status: "player_already_linked" };

export interface RemainingOpponentsResult {
  player: TelegramPlayer;
  opponents: TelegramPlayer[];
  isActiveParticipant: boolean;
}

const playerSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

export class TelegramBotService {
  constructor(
    private prisma: PrismaClient,
    private tournamentService: TournamentService
  ) {}

  async registerPlayer(
    telegramUserId: number,
    username?: string
  ): Promise<TelegramRegistrationResult> {
    const telegramId = BigInt(telegramUserId);
    const linkedPlayer = await this.prisma.user.findFirst({
      where: { telegramId },
      select: playerSelect,
    });
    if (linkedPlayer) {
      return { status: "already_registered", player: linkedPlayer };
    }

    const normalizedUsername = username?.trim().replace(/^@/, "");
    if (!normalizedUsername) return { status: "username_required" };

    const player = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            telegram: {
              equals: `@${normalizedUsername}`,
              mode: "insensitive",
            },
          },
          {
            telegram: {
              equals: normalizedUsername,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { ...playerSelect, telegramId: true },
    });
    if (!player) return { status: "player_not_found" };
    if (player.telegramId !== null) return { status: "player_already_linked" };

    const update = await this.prisma.user.updateMany({
      where: { id: player.id, telegramId: null },
      data: { telegramId },
    });
    if (update.count === 0) return { status: "player_already_linked" };
    return { status: "registered", player };
  }

  async getTelegramChatId(username: string): Promise<string | null> {
    const normalizedUsername = username.trim().replace(/^@/, "");
    const player = await this.prisma.user.findFirst({
      where: {
        telegramId: { not: null },
        OR: [
          {
            telegram: {
              equals: `@${normalizedUsername}`,
              mode: "insensitive",
            },
          },
          {
            telegram: {
              equals: normalizedUsername,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { telegramId: true },
    });
    return player?.telegramId?.toString() ?? null;
  }

  async getRemainingOpponents(
    telegramUserId: number
  ): Promise<RemainingOpponentsResult | null> {
    const player = await this.prisma.user.findFirst({
      where: { telegramId: BigInt(telegramUserId) },
      select: playerSelect,
    });
    if (!player) return null;

    const roster = await this.tournamentService.getPlayers(
      CURRENT_TOURNAMENT_ID
    );
    const isActiveParticipant = roster.some(({ id }) => id === player.id);
    if (!isActiveParticipant) {
      return { player, opponents: [], isActiveParticipant };
    }

    const matches = await this.prisma.match.findMany({
      where: {
        tournamentId: CURRENT_TOURNAMENT_ID,
        OR: [{ player1Id: player.id }, { player2Id: player.id }],
      },
      select: { player1Id: true, player2Id: true },
    });
    const playedOpponentIds = new Set(
      matches.map((match) =>
        match.player1Id === player.id ? match.player2Id : match.player1Id
      )
    );
    const opponents = roster
      .filter(
        (candidate) =>
          candidate.id !== player.id && !playedOpponentIds.has(candidate.id)
      )
      .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))
      .sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
          "ru"
        )
      );

    return { player, opponents, isActiveParticipant };
  }
}
