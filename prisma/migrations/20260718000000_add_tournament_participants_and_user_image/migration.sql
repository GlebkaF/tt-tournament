-- Новые участники управляются из админки, фото хранятся в PostgreSQL.
-- IF NOT EXISTS позволяет безопасно применять файл при каждом деплое.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" BYTEA;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imageMimeType" TEXT;

CREATE TABLE IF NOT EXISTS "TournamentParticipant" (
    "tournamentId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("tournamentId", "playerId"),
    CONSTRAINT "TournamentParticipant_tournamentId_fkey"
      FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentParticipant_playerId_fkey"
      FOREIGN KEY ("playerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);
