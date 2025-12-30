
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export enum Rank {
  Ace = 1,
  Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten,
  Jack, Queen, King
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type PileType = 'tableau' | 'foundation' | 'stock' | 'waste';

export interface Location {
  type: PileType;
  index: number; // For tableau/foundation
}

export type CardStyle = 'zen' | 'classic' | 'midnight' | 'ocean-breeze' | 'rustic-wood';

export interface Settings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  cardStyle: CardStyle;
}

export interface GameStats {
  gamesStarted: number;
  gamesWon: number;
  bestTime: number | null; // in seconds
  bestMoves: number | null;
  longestGameTime: number; // in seconds
  totalMovesInWonGames: number;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundation: Card[][]; // 4 piles
  tableau: Card[][]; // 7 piles
  score: number;
  moves: number;
  startTime: number | null;
  won: boolean;
}
