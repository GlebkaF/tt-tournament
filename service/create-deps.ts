import { PrismaClient } from "@prisma/client";
import { UserService } from "./user-service";
import { TournamentService } from "./tournament-service";
import { PostService } from "./post-service";

interface Deps {
  prisma: PrismaClient;
  userService: UserService;
  tournamentService: TournamentService;
  postService: PostService;
}

let cachedDeps = null as null | Deps;

export default function createDeps(): Deps {
  if (cachedDeps) {
    return cachedDeps;
  }

  const prisma = new PrismaClient();
  const tournamentService = new TournamentService(prisma);
  const userService = new UserService(prisma, tournamentService);
  const postService = new PostService();

  const deps = {
    prisma,
    userService,
    tournamentService,
    postService,
  };

  cachedDeps = deps;

  return deps;
}
