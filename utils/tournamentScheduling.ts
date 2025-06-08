// Types for tournament scheduling
export interface Pair {
  player1Id: number;
  player2Id: number;
  player1Matches: number;
  player2Matches: number;
}

/**
 * Generates a suggested queue for tournament pairs without duplicating players
 *
 * Algorithm:
 * 1. Creates virtual match counts (real matches + fixed pairs)
 * 2. Sorts pairs by total virtual matches (prioritizes fewer games)
 * 3. Generates queue without player duplication
 * 4. For occupied players, finds next best pairs
 *
 * @param allPairs - All possible pairs with match counts
 * @param fixedPairs - Already confirmed pairs
 * @returns Array of suggested pairs without player duplication
 */
export function generateSuggestedQueue(
  allPairs: Pair[],
  fixedPairs: Pair[]
): Pair[] {
  // 1. Create map for virtual game counts (real + fixed)
  const virtualMatchCounts = new Map<number, number>();

  // Initialize with real match data
  allPairs.forEach((pair) => {
    if (!virtualMatchCounts.has(pair.player1Id)) {
      virtualMatchCounts.set(pair.player1Id, pair.player1Matches);
    }
    if (!virtualMatchCounts.has(pair.player2Id)) {
      virtualMatchCounts.set(pair.player2Id, pair.player2Matches);
    }
  });

  // 2. Add +1 virtual game for each player in fixed pairs
  const occupiedPlayerIds = new Set<number>();
  fixedPairs.forEach((pair) => {
    occupiedPlayerIds.add(pair.player1Id);
    occupiedPlayerIds.add(pair.player2Id);

    // Increase virtual match counter
    virtualMatchCounts.set(
      pair.player1Id,
      (virtualMatchCounts.get(pair.player1Id) || 0) + 1
    );
    virtualMatchCounts.set(
      pair.player2Id,
      (virtualMatchCounts.get(pair.player2Id) || 0) + 1
    );
  });

  // 3. Create new pair list with virtual counters
  const virtualPairs: Pair[] = allPairs.map((pair) => ({
    ...pair,
    player1Matches:
      virtualMatchCounts.get(pair.player1Id) || pair.player1Matches,
    player2Matches:
      virtualMatchCounts.get(pair.player2Id) || pair.player2Matches,
  }));

  // 4. Sort pairs by virtual match sum (priority to fewer games)
  const sortedVirtualPairs = virtualPairs.sort(
    (a, b) =>
      a.player1Matches +
      a.player2Matches -
      (b.player1Matches + b.player2Matches)
  );

  // 5. Generate suggested queue:
  // - For free players: normal logic
  // - For occupied players: next best pair for each
  const suggestedQueue: Pair[] = [];
  const usedPlayerIds = new Set<number>();

  // First add pairs for free players
  for (const pair of sortedVirtualPairs) {
    if (
      !occupiedPlayerIds.has(pair.player1Id) &&
      !occupiedPlayerIds.has(pair.player2Id) &&
      !usedPlayerIds.has(pair.player1Id) &&
      !usedPlayerIds.has(pair.player2Id)
    ) {
      suggestedQueue.push(pair);
      usedPlayerIds.add(pair.player1Id);
      usedPlayerIds.add(pair.player2Id);
    }
  }

  // Then find next best pairs for remaining free players (including those who were occupied)
  // Continue adding pairs until no more valid pairs can be found
  for (const pair of sortedVirtualPairs) {
    // Skip if this pair is already in the fixed pairs
    const isFixedPair = fixedPairs.some(
      (fp) =>
        (fp.player1Id === pair.player1Id && fp.player2Id === pair.player2Id) ||
        (fp.player1Id === pair.player2Id && fp.player2Id === pair.player1Id)
    );

    if (
      !isFixedPair &&
      !usedPlayerIds.has(pair.player1Id) &&
      !usedPlayerIds.has(pair.player2Id)
    ) {
      suggestedQueue.push(pair);
      usedPlayerIds.add(pair.player1Id);
      usedPlayerIds.add(pair.player2Id);
    }
  }

  return suggestedQueue;
}
