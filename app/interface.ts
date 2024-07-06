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
  result: string;
}
