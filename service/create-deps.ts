import { PrismaClient } from "@prisma/client";
import { UserService } from "./user-service";
import { TournamentService } from "./tournament-service";

interface Deps {
  prisma: PrismaClient;
  userService: UserService;
  tournamentService: TournamentService;
}

let cachedDeps = null as null | Deps;

export default function createDeps(): Deps {
  if (cachedDeps) {
    return cachedDeps;
  }

  const prisma = new PrismaClient();
  const tournamentService = new TournamentService(prisma);
  const userService = new UserService(prisma, tournamentService);

  const deps = {
    prisma,
    userService,
    tournamentService,
  };

  cachedDeps = deps;

  return deps;
}
