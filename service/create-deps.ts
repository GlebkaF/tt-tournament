import { Summer2024Service } from "@/service/summer-2024-service";
import { PrismaClient } from "@prisma/client";
import { UserService } from "./user-service";
import { TournamentService } from "./tournament-service";

interface Deps {
  prisma: PrismaClient;
  summer2024Service: Summer2024Service;
  userService: UserService;
  tournamentService: TournamentService;
}

let cachedDeps = null as null | Deps;

export default function createDeps(): Deps {
  if (cachedDeps) {
    return cachedDeps;
  }

  const prisma = new PrismaClient();
  const summer2024Service = new Summer2024Service(prisma);
  const userService = new UserService(prisma, summer2024Service);
  const tournamentService = new TournamentService(prisma);
  const deps = {
    prisma,
    summer2024Service,
    userService,
    tournamentService,
  };

  cachedDeps = deps;

  return deps;
}
