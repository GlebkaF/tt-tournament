-- This is an empty migration.CREATE UNIQUE INDEX unique_match_players
CREATE UNIQUE INDEX unique_match_players ON "Match" (
    LEAST("player1Id", "player2Id"),
    GREATEST("player1Id", "player2Id")
);