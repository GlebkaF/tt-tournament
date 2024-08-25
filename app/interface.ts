import { Match as DBMatch } from "@prisma/client";

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
  matches: DBMatch[];
}

export type Standings = StandingsItem[];

export interface Post {
  id: number;
  title: string;
  description: string;
  slug: string;
  content: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  author: string;
  date: Date;
}
