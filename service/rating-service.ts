import {
  getCache,
  RATING_CACHE_KEY,
  resetCache,
  setCache,
} from "@/helpers/cache";
import {
  calculateRatingHistory,
  type PlayerRating,
  type RatingHistory,
} from "@/utils/rating";
import { PrismaClient } from "@prisma/client";

const RATING_CACHE_TTL = 10 * 60 * 1000;

export interface RatingPerson {
  id: number;
  firstName: string;
  lastName: string;
}

export interface RatingData {
  history: RatingHistory;
  people: RatingPerson[];
}

export function resetRatingCache(): void {
  resetCache(RATING_CACHE_KEY);
}

export class RatingService {
  constructor(private prisma: PrismaClient) {}

  async getRatingData(): Promise<RatingData> {
    const cached = getCache(RATING_CACHE_KEY, RATING_CACHE_TTL) as
      | RatingData
      | undefined;
    if (cached) return cached;

    const [people, matches] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true },
      }),
      this.prisma.match.findMany({
        orderBy: [{ date: "asc" }, { id: "asc" }],
        select: {
          id: true,
          player1Id: true,
          player2Id: true,
          result: true,
          date: true,
        },
      }),
    ]);

    const data: RatingData = {
      people,
      history: calculateRatingHistory(people, matches),
    };
    setCache(RATING_CACHE_KEY, data);
    return data;
  }

  async getPlayerRating(playerId: number): Promise<PlayerRating | undefined> {
    const { history } = await this.getRatingData();
    return history.players.get(playerId);
  }
}
