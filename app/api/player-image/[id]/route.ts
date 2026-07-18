import createDeps from "@/service/create-deps";

const { prisma } = createDeps();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isInteger(playerId) || playerId <= 0) {
    return new Response(null, { status: 404 });
  }

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { image: true, imageMimeType: true },
  });
  if (!player?.image || !player.imageMimeType) {
    return new Response(null, { status: 404 });
  }

  return new Response(Buffer.from(player.image), {
    headers: {
      "Content-Type": player.imageMimeType,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
