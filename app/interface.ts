export interface Player {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Match {
  id: number;
  player1: Player;
  player2: Player;
  player1Score: number;
  player2Score: number;
  result: string; // MatchResult
  date: string;
}

export enum MatchResult {
  draw = "DRAW",
  player1Win = "PLAYER1_WIN",
  player2Win = "PLAYER2_WIN",
}

export interface Pair {
  player1: Player;
  player2: Player;
}

export interface StandingsItem {
  position: number;
  player: string;
  playerId: number;
  rounds: number[];
  totalPoints: number;
  gamesPlayed: number;
  league: string;
}

export type Standings = StandingsItem[];
