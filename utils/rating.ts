import { Glicko2 } from "glicko2";

export const RATING_INITIAL = 1500;
export const RATING_INITIAL_RD = 350;
export const RATING_INITIAL_VOLATILITY = 0.06;
export const RATING_TAU = 0.5;
export const RATING_CALIBRATION_RD = 150;

const GLICKO_SCALE = 173.7178;
const INACTIVITY_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_CALIBRATION_ESTIMATE = 50;

export type RatingMatchResult = "PLAYER1_WIN" | "PLAYER2_WIN" | "DRAW";

export interface RatingPlayerInput {
  id: number;
}

export interface RatingMatchInput {
  id: number;
  player1Id: number;
  player2Id: number;
  result: RatingMatchResult;
  date: Date;
}

interface MutableRatingState {
  playerId: number;
  rating: number;
  rd: number;
  volatility: number;
  matchesPlayed: number;
  everCalibrated: boolean;
  lastMatchAt: Date | null;
}

export interface PlayerRating {
  playerId: number;
  rating: number;
  rd: number;
  volatility: number;
  matchesPlayed: number;
  isCalibrating: boolean;
  estimatedGamesToCalibration: number;
}

export interface PlayerMatchRatingDelta {
  playerId: number;
  before: number;
  after: number;
  delta: number;
}

export interface MatchRatingDelta {
  matchId: number;
  player1: PlayerMatchRatingDelta;
  player2: PlayerMatchRatingDelta;
}

export interface RatingHistory {
  players: Map<number, PlayerRating>;
  matches: Map<number, MatchRatingDelta>;
}

function initialState(playerId: number): MutableRatingState {
  return {
    playerId,
    rating: RATING_INITIAL,
    rd: RATING_INITIAL_RD,
    volatility: RATING_INITIAL_VOLATILITY,
    matchesPlayed: 0,
    everCalibrated: false,
    lastMatchAt: null,
  };
}

function outcomeForPlayer1(result: RatingMatchResult): number {
  if (result === "PLAYER1_WIN") return 1;
  if (result === "PLAYER2_WIN") return 0;
  return 0.5;
}

/** Canonical Glicko-2 RD increase for full 30-day periods without matches. */
export function applyInactivity(
  rd: number,
  volatility: number,
  periods: number
): number {
  if (periods <= 0) return rd;
  const phi = rd / GLICKO_SCALE;
  return Math.sqrt(phi * phi + periods * volatility * volatility) * GLICKO_SCALE;
}

function inactivityPeriods(lastMatchAt: Date | null, nextMatchAt: Date): number {
  if (!lastMatchAt) return 0;
  return Math.max(
    0,
    Math.floor((nextMatchAt.getTime() - lastMatchAt.getTime()) / INACTIVITY_PERIOD_MS)
  );
}

function playMatch(
  player1: MutableRatingState,
  player2: MutableRatingState,
  match: RatingMatchInput
): { player1: MutableRatingState; player2: MutableRatingState } {
  const p1Rd = applyInactivity(
    player1.rd,
    player1.volatility,
    inactivityPeriods(player1.lastMatchAt, match.date)
  );
  const p2Rd = applyInactivity(
    player2.rd,
    player2.volatility,
    inactivityPeriods(player2.lastMatchAt, match.date)
  );

  // A match is a rating period: only its two participants are updated.
  const ranking = new Glicko2({
    tau: RATING_TAU,
    rating: RATING_INITIAL,
    rd: RATING_INITIAL_RD,
    vol: RATING_INITIAL_VOLATILITY,
  });
  const glickoPlayer1 = ranking.makePlayer(
    player1.rating,
    p1Rd,
    player1.volatility
  );
  const glickoPlayer2 = ranking.makePlayer(
    player2.rating,
    p2Rd,
    player2.volatility
  );
  ranking.updateRatings([
    [glickoPlayer1, glickoPlayer2, outcomeForPlayer1(match.result)],
  ]);

  const nextPlayer1: MutableRatingState = {
    ...player1,
    rating: glickoPlayer1.getRating(),
    rd: glickoPlayer1.getRd(),
    volatility: glickoPlayer1.getVol(),
    matchesPlayed: player1.matchesPlayed + 1,
    lastMatchAt: match.date,
    everCalibrated:
      player1.everCalibrated || glickoPlayer1.getRd() <= RATING_CALIBRATION_RD,
  };
  const nextPlayer2: MutableRatingState = {
    ...player2,
    rating: glickoPlayer2.getRating(),
    rd: glickoPlayer2.getRd(),
    volatility: glickoPlayer2.getVol(),
    matchesPlayed: player2.matchesPlayed + 1,
    lastMatchAt: match.date,
    everCalibrated:
      player2.everCalibrated || glickoPlayer2.getRd() <= RATING_CALIBRATION_RD,
  };

  return { player1: nextPlayer1, player2: nextPlayer2 };
}

export function estimateGamesToCalibration(state: {
  rating: number;
  rd: number;
  volatility: number;
}): number {
  if (state.rd <= RATING_CALIBRATION_RD) return 0;

  let simulated: MutableRatingState = {
    playerId: -1,
    rating: state.rating,
    rd: state.rd,
    volatility: state.volatility,
    matchesPlayed: 0,
    everCalibrated: false,
    lastMatchAt: null,
  };

  for (let games = 1; games <= MAX_CALIBRATION_ESTIMATE; games += 1) {
    const opponent: MutableRatingState = {
      playerId: -2,
      rating: simulated.rating,
      rd: 100,
      volatility: RATING_INITIAL_VOLATILITY,
      matchesPlayed: 20,
      everCalibrated: true,
      lastMatchAt: null,
    };
    simulated = playMatch(simulated, opponent, {
      id: -games,
      player1Id: simulated.playerId,
      player2Id: opponent.playerId,
      result: "DRAW",
      date: new Date(0),
    }).player1;
    if (simulated.rd <= RATING_CALIBRATION_RD) return games;
  }

  return MAX_CALIBRATION_ESTIMATE;
}

function publicRating(
  state: MutableRatingState,
  asOf: Date
): PlayerRating {
  const currentRd = applyInactivity(
    state.rd,
    state.volatility,
    inactivityPeriods(state.lastMatchAt, asOf)
  );
  const isCalibrating = !state.everCalibrated;

  return {
    playerId: state.playerId,
    rating: Math.round(state.rating),
    rd: currentRd,
    volatility: state.volatility,
    matchesPlayed: state.matchesPlayed,
    isCalibrating,
    estimatedGamesToCalibration: isCalibrating
      ? estimateGamesToCalibration({
          rating: state.rating,
          rd: currentRd,
          volatility: state.volatility,
        })
      : 0,
  };
}

/**
 * Replays all tournament matches in deterministic real-time order.
 * Ratings are derived data: editing an old match changes every later snapshot.
 */
export function calculateRatingHistory(
  players: RatingPlayerInput[],
  matches: RatingMatchInput[],
  asOf = new Date()
): RatingHistory {
  const states = new Map<number, MutableRatingState>();
  players.forEach(({ id }) => states.set(id, initialState(id)));
  const matchDeltas = new Map<number, MatchRatingDelta>();

  const orderedMatches = [...matches].sort((a, b) => {
    const byDate = a.date.getTime() - b.date.getTime();
    return byDate || a.id - b.id;
  });

  for (const match of orderedMatches) {
    // A Match can be used as a scheduled placeholder; it becomes rated only
    // when its date is reached, matching the profile's TBD semantics.
    if (match.date.getTime() > asOf.getTime()) continue;

    const before1 = states.get(match.player1Id) ?? initialState(match.player1Id);
    const before2 = states.get(match.player2Id) ?? initialState(match.player2Id);
    states.set(match.player1Id, before1);
    states.set(match.player2Id, before2);

    const next = playMatch(before1, before2, match);
    states.set(match.player1Id, next.player1);
    states.set(match.player2Id, next.player2);

    const before1Rounded = Math.round(before1.rating);
    const before2Rounded = Math.round(before2.rating);
    const after1Rounded = Math.round(next.player1.rating);
    const after2Rounded = Math.round(next.player2.rating);
    matchDeltas.set(match.id, {
      matchId: match.id,
      player1: {
        playerId: match.player1Id,
        before: before1Rounded,
        after: after1Rounded,
        delta: after1Rounded - before1Rounded,
      },
      player2: {
        playerId: match.player2Id,
        before: before2Rounded,
        after: after2Rounded,
        delta: after2Rounded - before2Rounded,
      },
    });
  }

  return {
    players: new Map(
      [...states.entries()].map(([playerId, state]) => [
        playerId,
        publicRating(state, asOf),
      ])
    ),
    matches: matchDeltas,
  };
}
