-- Переносим актуальный состав 2026 из кода в БД.
-- ON CONFLICT DO NOTHING сохраняет уже заданные через админку active=false
-- и делает миграцию безопасной для повторного запуска при каждом деплое.
INSERT INTO "TournamentParticipant" ("tournamentId", "playerId", "active")
SELECT 4, "id", true
FROM "User"
WHERE "id" IN (
  1, 2, 4, 5, 7, 10, 15, 16, 20, 21, 22, 23, 27, 32, 54, 55, 59, 61, 62,
  65, 67, 68, 69
)
ON CONFLICT ("tournamentId", "playerId") DO NOTHING;
