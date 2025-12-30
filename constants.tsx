
import React from 'react';
import { Suit, Rank } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = Array.from({ length: 13 }, (_, i) => i + 1);

export const SuitIcon = ({ suit, className = "" }: { suit: Suit, className?: string }) => {
  switch (suit) {
    case 'hearts': return <span className={`text-red-500 ${className}`}>♥</span>;
    case 'diamonds': return <span className={`text-red-400 ${className}`}>♦</span>;
    case 'clubs': return <span className={`text-gray-900 ${className}`}>♣</span>;
    case 'spades': return <span className={`text-gray-800 ${className}`}>♠</span>;
  }
};

export const rankLabel = (rank: Rank): string => {
  if (rank === Rank.Ace) return 'A';
  if (rank === Rank.Jack) return 'J';
  if (rank === Rank.Queen) return 'Q';
  if (rank === Rank.King) return 'K';
  return rank.toString();
};
