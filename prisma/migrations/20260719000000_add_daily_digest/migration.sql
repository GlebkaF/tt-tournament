-- Снимок ежедневной Telegram-сводки. Миграция идемпотентна, потому что
-- deploy-x260 применяет новые служебные миграции при каждом деплое.
DO $$
BEGIN
  CREATE TYPE "DailyDigestStatus" AS ENUM ('PROCESSING', 'SKIPPED', 'PUBLISHED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "DailyDigest" (
  "id" SERIAL NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "digestDate" TEXT NOT NULL,
  "status" "DailyDigestStatus" NOT NULL DEFAULT 'PROCESSING',
  "matchIds" JSONB NOT NULL,
  "content" TEXT,
  "editorSource" TEXT,
  "telegramMessageId" INTEGER,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyDigest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyDigest_tournamentId_fkey"
    FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyDigest_tournamentId_digestDate_key"
  ON "DailyDigest"("tournamentId", "digestDate");
