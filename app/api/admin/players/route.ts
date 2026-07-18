import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import { resetCache } from "@/helpers/cache";
import createDeps from "@/service/create-deps";
import {
  isAdminAuthorized,
  unauthorizedResponse,
} from "@/utils/serverAdminAuth";

const { prisma } = createDeps();

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function readImage(formData: FormData): Promise<{
  image: Buffer;
  imageMimeType: string;
}> {
  const value = formData.get("image");
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("IMAGE_REQUIRED");
  }
  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new Error("IMAGE_TYPE");
  }
  if (value.size > MAX_IMAGE_SIZE) {
    throw new Error("IMAGE_SIZE");
  }

  return {
    image: Buffer.from(await value.arrayBuffer()),
    imageMimeType: value.type,
  };
}

function validationError(error: unknown): Response | null {
  if (!(error instanceof Error)) return null;

  const messages: Record<string, string> = {
    IMAGE_REQUIRED: "Выберите фотографию",
    IMAGE_TYPE: "Поддерживаются JPEG, PNG и WebP",
    IMAGE_SIZE: "Файл должен быть не больше 5 МБ",
  };
  const message = messages[error.message];
  return message ? Response.json({ error: message }, { status: 400 }) : null;
}

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  const players = await prisma.user.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      telegram: true,
      imageMimeType: true,
    },
  });

  return Response.json(
    players.map(({ imageMimeType, ...player }) => ({
      ...player,
      hasDatabaseImage: !!imageMimeType,
    }))
  );
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const firstName = readText(formData, "firstName");
    const lastName = readText(formData, "lastName");
    const telegramInput = readText(formData, "telegram").replace(/^@/, "");

    if (!firstName || !lastName) {
      return Response.json(
        { error: "Имя и фамилия обязательны" },
        { status: 400 }
      );
    }

    const existingPlayer = await prisma.user.findFirst({
      where: {
        firstName: { equals: firstName, mode: "insensitive" },
        lastName: { equals: lastName, mode: "insensitive" },
      },
      select: { id: true },
    });
    const { image, imageMimeType } = await readImage(formData);
    const player = await prisma.$transaction(async (tx) => {
      const newPlayerData = {
        firstName,
        lastName,
        telegram: telegramInput ? `@${telegramInput}` : null,
        image,
        imageMimeType,
      };
      const savedPlayer = existingPlayer
        ? await tx.user.update({
            where: { id: existingPlayer.id },
            data: {
              firstName,
              lastName,
              image,
              imageMimeType,
              ...(telegramInput ? { telegram: `@${telegramInput}` } : {}),
            },
            select: { id: true, firstName: true, lastName: true },
          })
        : await tx.user.create({
            data: newPlayerData,
            select: { id: true, firstName: true, lastName: true },
          });

      await tx.tournamentParticipant.upsert({
        where: {
          tournamentId_playerId: {
            tournamentId: CURRENT_TOURNAMENT_ID,
            playerId: savedPlayer.id,
          },
        },
        create: {
          tournamentId: CURRENT_TOURNAMENT_ID,
          playerId: savedPlayer.id,
        },
        update: {},
      });

      return savedPlayer;
    });

    resetCache(`profile${player.id}`);
    return Response.json(player, { status: existingPlayer ? 200 : 201 });
  } catch (error) {
    const response = validationError(error);
    if (response) return response;

    console.error("Create player error:", error);
    return Response.json(
      { error: "Не удалось добавить игрока" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const playerId = Number(readText(formData, "playerId"));
    if (!Number.isInteger(playerId) || playerId <= 0) {
      return Response.json({ error: "Выберите игрока" }, { status: 400 });
    }

    const { image, imageMimeType } = await readImage(formData);
    await prisma.user.update({
      where: { id: playerId },
      data: { image, imageMimeType },
    });

    resetCache(`profile${playerId}`);
    return Response.json({ id: playerId });
  } catch (error) {
    const response = validationError(error);
    if (response) return response;

    console.error("Update player image error:", error);
    return Response.json({ error: "Не удалось обновить фото" }, { status: 500 });
  }
}
