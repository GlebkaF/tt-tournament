import { PrismaClient } from "@prisma/client";
import { UserService } from "./user-service";
import { TournamentService } from "./tournament-service";
import { PostService } from "./post-service";
import { DailyDigestService } from "./daily-digest-service";

interface Deps {
  prisma: PrismaClient;
  userService: UserService;
  tournamentService: TournamentService;
  postService: PostService;
  dailyDigestService: DailyDigestService;
}

// Кэшируем на globalThis, чтобы dev-режим Next (hot-reload пересоздаёт
// модули) переиспользовал один PrismaClient, а не открывал новый пул
// соединений на каждый Fast Refresh (иначе исчерпываются слоты Postgres).
const globalForDeps = globalThis as unknown as { __ttDeps?: Deps };

export default function createDeps(): Deps {
  if (globalForDeps.__ttDeps) {
    return globalForDeps.__ttDeps;
  }

  const prisma = new PrismaClient();
  const tournamentService = new TournamentService(prisma);
  const userService = new UserService(prisma, tournamentService);
  const postService = new PostService();
  const dailyDigestService = new DailyDigestService(prisma, tournamentService);

  const deps = {
    prisma,
    userService,
    tournamentService,
    postService,
    dailyDigestService,
  };

  globalForDeps.__ttDeps = deps;

  return deps;
}
