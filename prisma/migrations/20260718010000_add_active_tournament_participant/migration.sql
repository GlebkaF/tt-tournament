-- Строка с active=false исключает из турнира даже игрока из legacy-ростера.
ALTER TABLE "TournamentParticipant"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
