export interface PlayerStats {
  best_score: number;
  total_apples: number;
  total_games: number;
  play_style: string;
}

export interface LeaderboardEntry {
  player: string;
  score: number;
}

export interface Challenge {
  id: string;
  challenger: string;
  opponent: string;
  challenger_score: number;
  opponent_score: number;
  status: 'pending' | 'resolved';
  winner: string | null;
}
