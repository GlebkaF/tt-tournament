-- Удаление существующего индекса
DROP INDEX IF EXISTS unique_match_players;

-- Создание нового индекса с учётом tournamentId
CREATE UNIQUE INDEX unique_match_players_tournament ON "Match" (
    LEAST("player1Id", "player2Id"),
    GREATEST("player1Id", "player2Id"),
    "tournamentId"
);