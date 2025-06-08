import { generateSuggestedQueue, Pair } from "../tournamentScheduling";

describe("generateSuggestedQueue", () => {
  // Helper function to create test pairs
  const createPair = (
    player1Id: number,
    player2Id: number,
    player1Matches = 0,
    player2Matches = 0
  ): Pair => ({
    player1Id,
    player2Id,
    player1Matches,
    player2Matches,
  });

  describe("Basic functionality", () => {
    it("should return empty array when no pairs provided", () => {
      const result = generateSuggestedQueue([], []);
      expect(result).toEqual([]);
    });

    it("should return single pair when only one pair available", () => {
      const allPairs = [createPair(1, 2)];
      const result = generateSuggestedQueue(allPairs, []);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(createPair(1, 2));
    });

    it("should handle basic case with 4 players (2 pairs)", () => {
      const allPairs = [
        createPair(1, 2),
        createPair(1, 3),
        createPair(1, 4),
        createPair(2, 3),
        createPair(2, 4),
        createPair(3, 4),
      ];

      const result = generateSuggestedQueue(allPairs, []);

      // Should return 2 pairs without duplicating players
      expect(result).toHaveLength(2);

      // Extract all used player IDs
      const usedPlayerIds = new Set<number>();
      result.forEach((pair) => {
        usedPlayerIds.add(pair.player1Id);
        usedPlayerIds.add(pair.player2Id);
      });

      // All 4 players should be used exactly once
      expect(usedPlayerIds.size).toBe(4);
      expect(Array.from(usedPlayerIds).sort()).toEqual([1, 2, 3, 4]);
    });
  });

  describe("Match count prioritization", () => {
    it("should prioritize pairs with fewer total matches", () => {
      const allPairs = [
        createPair(1, 2, 5, 5), // total: 10 matches
        createPair(3, 4, 1, 1), // total: 2 matches (should be prioritized)
        createPair(1, 3, 3, 1), // total: 4 matches
        createPair(2, 4, 5, 1), // total: 6 matches
      ];

      const result = generateSuggestedQueue(allPairs, []);

      expect(result).toHaveLength(2);

      // First pair should be the one with fewer total matches (3,4)
      const firstPair = result[0];
      expect([firstPair.player1Id, firstPair.player2Id].sort()).toEqual([3, 4]);
    });

    it("should sort pairs by ascending total match count", () => {
      const allPairs = [
        createPair(1, 2, 10, 8), // total: 18
        createPair(3, 4, 2, 3), // total: 5
        createPair(5, 6, 1, 1), // total: 2 (should be first)
        createPair(7, 8, 4, 3), // total: 7
      ];

      const result = generateSuggestedQueue(allPairs, []);

      // Should include pairs with least matches first
      expect(result).toHaveLength(4);

      // Verify pairs are sorted by total matches
      for (let i = 0; i < result.length - 1; i++) {
        const currentTotal =
          result[i].player1Matches + result[i].player2Matches;
        const nextTotal =
          result[i + 1].player1Matches + result[i + 1].player2Matches;
        expect(currentTotal).toBeLessThanOrEqual(nextTotal);
      }
    });
  });

  describe("Fixed pairs integration", () => {
    it("should handle virtual match counters for fixed pairs", () => {
      const allPairs = [
        createPair(1, 2, 0, 0), // base: 0 matches each
        createPair(1, 3, 0, 0), // player 1 will get +1 virtual from fixed pair
        createPair(2, 4, 0, 0), // player 2 will get +1 virtual from fixed pair
        createPair(3, 4, 0, 0), // both free players
      ];

      const fixedPairs = [createPair(1, 2, 0, 0)]; // players 1,2 are occupied

      const result = generateSuggestedQueue(allPairs, fixedPairs);

      // Should prioritize pair with completely free players (3,4) and one more pair
      expect(result).toHaveLength(1);

      // Should include the free players pair (3,4)
      const freePair = result.find(
        (pair) => [pair.player1Id, pair.player2Id].sort().join(",") === "3,4"
      );
      expect(freePair).toBeDefined();
    });

    it("should find next best pairs for remaining players", () => {
      const allPairs = [
        createPair(1, 2, 0, 0), // player 1 occupied by fixed pair
        createPair(1, 3, 0, 0), // will have virtual +1 for player 1
        createPair(1, 4, 0, 0), // will have virtual +1 for player 1
        createPair(2, 3, 0, 0), // will have virtual +1 for player 2
        createPair(2, 4, 0, 0), // will have virtual +1 for player 2
        createPair(3, 4, 0, 0), // free players pair - should be first
      ];

      const fixedPairs = [createPair(1, 2, 0, 0)];

      const result = generateSuggestedQueue(allPairs, fixedPairs);

      expect(result).toHaveLength(1);

      // Should include the free players pair (3,4) as it has the lowest virtual count
      const freePair = result.find(
        (pair) => [pair.player1Id, pair.player2Id].sort().join(",") === "3,4"
      );
      expect(freePair).toBeDefined();
    });

    it("should not include fixed pairs in suggestions", () => {
      const allPairs = [
        createPair(1, 2, 0, 0),
        createPair(1, 3, 0, 0),
        createPair(2, 3, 0, 0),
      ];

      const fixedPairs = [createPair(1, 2, 0, 0)];

      const result = generateSuggestedQueue(allPairs, fixedPairs);

      // Should not include the fixed pair (1,2)
      const hasFixedPair = result.some(
        (pair) =>
          (pair.player1Id === 1 && pair.player2Id === 2) ||
          (pair.player1Id === 2 && pair.player2Id === 1)
      );
      expect(hasFixedPair).toBe(false);
    });
  });

  describe("Player duplication prevention", () => {
    it("should never duplicate players in suggested queue", () => {
      const allPairs = [
        createPair(1, 2),
        createPair(1, 3),
        createPair(1, 4),
        createPair(2, 3),
        createPair(2, 4),
        createPair(3, 4),
      ];

      const result = generateSuggestedQueue(allPairs, []);

      // Collect all player IDs used in result
      const usedPlayerIds: number[] = [];
      result.forEach((pair) => {
        usedPlayerIds.push(pair.player1Id, pair.player2Id);
      });

      // Check for duplicates
      const uniquePlayerIds = new Set(usedPlayerIds);
      expect(uniquePlayerIds.size).toBe(usedPlayerIds.length);
    });

    it("should maximize player usage without duplication", () => {
      // 6 players = maximum 3 pairs without duplication
      const allPairs = [
        createPair(1, 2),
        createPair(1, 3),
        createPair(1, 4),
        createPair(1, 5),
        createPair(1, 6),
        createPair(2, 3),
        createPair(2, 4),
        createPair(2, 5),
        createPair(2, 6),
        createPair(3, 4),
        createPair(3, 5),
        createPair(3, 6),
        createPair(4, 5),
        createPair(4, 6),
        createPair(5, 6),
      ];

      const result = generateSuggestedQueue(allPairs, []);

      // Should return exactly 3 pairs (6 players / 2)
      expect(result).toHaveLength(3);

      // All 6 players should be used
      const usedPlayerIds = new Set<number>();
      result.forEach((pair) => {
        usedPlayerIds.add(pair.player1Id);
        usedPlayerIds.add(pair.player2Id);
      });
      expect(usedPlayerIds.size).toBe(6);
    });
  });

  describe("Edge cases", () => {
    it("should handle case with only 2 players", () => {
      const allPairs = [createPair(1, 2)];
      const result = generateSuggestedQueue(allPairs, []);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(createPair(1, 2));
    });

    it("should handle case where all pairs are fixed", () => {
      const allPairs = [createPair(1, 2), createPair(3, 4)];
      const fixedPairs = [createPair(1, 2), createPair(3, 4)];

      const result = generateSuggestedQueue(allPairs, fixedPairs);

      // No suggestions should be made if all pairs are fixed
      expect(result).toHaveLength(0);
    });

    it("should handle empty fixed pairs array", () => {
      const allPairs = [createPair(1, 2), createPair(3, 4)];
      const result = generateSuggestedQueue(allPairs, []);

      expect(result).toHaveLength(2);
    });

    it("should handle odd number of players (one player left out)", () => {
      // 5 players = maximum 2 pairs, 1 player left out
      const allPairs = [
        createPair(1, 2),
        createPair(1, 3),
        createPair(1, 4),
        createPair(1, 5),
        createPair(2, 3),
        createPair(2, 4),
        createPair(2, 5),
        createPair(3, 4),
        createPair(3, 5),
        createPair(4, 5),
      ];

      const result = generateSuggestedQueue(allPairs, []);

      // Should return exactly 2 pairs (4 players used, 1 left out)
      expect(result).toHaveLength(2);

      const usedPlayerIds = new Set<number>();
      result.forEach((pair) => {
        usedPlayerIds.add(pair.player1Id);
        usedPlayerIds.add(pair.player2Id);
      });
      expect(usedPlayerIds.size).toBe(4);
    });
  });

  describe("Real-world scenario", () => {
    it("should handle complex tournament scenario", () => {
      // Scenario: Victoria(2), Dmitry(5), Gleb(7), Artem(6)
      // Victoria and Dmitry have played more games
      const allPairs = [
        createPair(2, 5, 3, 2), // Victoria vs Dmitry - many games
        createPair(2, 7, 3, 0), // Victoria vs Gleb
        createPair(2, 6, 3, 1), // Victoria vs Artem
        createPair(5, 7, 2, 0), // Dmitry vs Gleb - fewer total games
        createPair(5, 6, 2, 1), // Dmitry vs Artem
        createPair(7, 6, 0, 1), // Gleb vs Artem - fewest games (should be prioritized)
      ];

      const result = generateSuggestedQueue(allPairs, []);

      expect(result).toHaveLength(2);

      // Should prioritize pair with fewest games (Gleb vs Artem)
      const firstPair = result[0];
      expect([firstPair.player1Id, firstPair.player2Id].sort()).toEqual([6, 7]);

      // Remaining pair should use Victoria and Dmitry
      const secondPair = result[1];
      expect([secondPair.player1Id, secondPair.player2Id].sort()).toEqual([
        2, 5,
      ]);
    });
  });
});
