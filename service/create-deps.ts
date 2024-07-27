import { Summer2024Service } from "@/service/summer-2024-service";
import { PrismaClient } from "@prisma/client";
import { UserService } from "./user-service";

interface Deps {
  prisma: PrismaClient;
  summer2024Service: Summer2024Service;
  userService: UserService;
}

let cachedDeps = null as null | Deps;

export default function createDeps(): Deps {
  if (cachedDeps) {
    return cachedDeps;
  }

  const prisma = new PrismaClient();
  const summer2024Service = new Summer2024Service(prisma);
  const userService = new UserService(prisma, summer2024Service);
  const deps = {
    prisma,
    summer2024Service,
    userService,
  };

  cachedDeps = deps;

  return deps;
}
