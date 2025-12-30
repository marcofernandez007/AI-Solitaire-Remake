
import { Card, Suit, Rank, GameState } from '../types';
import { SUITS, RANKS } from '../constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isFaceUp: false,
      });
    });
  });
  return deck;
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const initializeGame = (): GameState => {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  
  let currentCardIndex = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck[currentCardIndex++];
      if (j === i) card.isFaceUp = true;
      tableau[i].push(card);
    }
  }

  const stock = deck.slice(currentCardIndex);
  
  return {
    stock,
    waste: [],
    foundation: Array.from({ length: 4 }, () => []),
    tableau,
    score: 0,
    moves: 0,
    startTime: Date.now(),
    won: false,
  };
};

export const isOppositeColor = (suit1: Suit, suit2: Suit): boolean => {
  const red = ['hearts', 'diamonds'];
  const black = ['clubs', 'spades'];
  return (red.includes(suit1) && black.includes(suit2)) || (black.includes(suit1) && red.includes(suit2));
};

export const canMoveToTableau = (card: Card, targetPile: Card[]): boolean => {
  if (targetPile.length === 0) {
    return card.rank === Rank.King;
  }
  const topCard = targetPile[targetPile.length - 1];
  return isOppositeColor(card.suit, topCard.suit) && card.rank === topCard.rank - 1;
};

export const canMoveToFoundation = (card: Card, targetPile: Card[]): boolean => {
  if (targetPile.length === 0) {
    return card.rank === Rank.Ace;
  }
  const topCard = targetPile[targetPile.length - 1];
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

export const checkWin = (foundation: Card[][]): boolean => {
  return foundation.every(pile => pile.length === 13);
};
