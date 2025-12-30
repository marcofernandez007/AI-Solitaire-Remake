
import React from 'react';
import { Card, Rank, CardStyle } from '../types';
import { SuitIcon, rankLabel } from '../constants';

interface CardUIProps {
  card: Card;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isSelected?: boolean;
  className?: string;
  cardStyle?: CardStyle;
  noAnimations?: boolean;
}

const CardUI: React.FC<CardUIProps> = ({ 
  card, 
  onClick,
  onDoubleClick,
  onDragStart, 
  onDragEnd,
  isSelected, 
  className = "", 
  cardStyle = 'zen',
  noAnimations = false
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const getStyleClasses = () => {
    switch (cardStyle) {
      case 'classic':
        return {
          front: 'bg-white border-gray-200',
          back: 'bg-blue-800 border-white',
          text: isRed ? 'text-red-600' : 'text-black',
          backPattern: 'opacity-50'
        };
      case 'midnight':
        return {
          front: 'bg-gray-900 border-emerald-500/30',
          back: 'bg-black border-emerald-900',
          text: isRed ? 'text-rose-500' : 'text-emerald-400',
          backPattern: 'text-emerald-500/20'
        };
      case 'ocean-breeze':
        return {
          front: 'bg-cyan-50 border-cyan-200',
          back: 'bg-sky-600 border-sky-300',
          text: isRed ? 'text-rose-600' : 'text-sky-900',
          backPattern: 'text-cyan-100/40'
        };
      case 'rustic-wood':
        return {
          front: 'bg-orange-50 border-amber-200',
          back: 'bg-amber-900 border-amber-700',
          text: isRed ? 'text-red-800' : 'text-stone-900',
          backPattern: 'text-amber-100/10'
        };
      case 'zen':
      default:
        return {
          front: 'bg-white',
          back: 'bg-emerald-800 border-white/20',
          text: isRed ? 'text-red-600' : 'text-gray-900',
          backPattern: 'text-white/20'
        };
    }
  };

  const style = getStyleClasses();

  return (
    <div 
      className={`card-perspective w-16 h-24 sm:w-20 sm:h-32 ${card.isFaceUp ? 'is-face-up' : 'is-face-down'} ${className}`}
      draggable={card.isFaceUp}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={`card-inner w-full h-full ${noAnimations ? 'transition-none' : ''} ${isSelected ? 'card-dragging ring-2 ring-emerald-400' : ''}`}>
        
        {/* Front Face */}
        <div className={`card-face card-shadow flex flex-col p-2 cursor-grab active:cursor-grabbing border ${style.front}`}>
          <div className={`flex justify-between items-start pointer-events-none ${style.text}`}>
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-lg font-bold leading-none">{rankLabel(card.rank)}</span>
              <SuitIcon suit={card.suit} className="text-xs sm:text-sm" />
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center pointer-events-none">
            <SuitIcon suit={card.suit} className="text-2xl sm:text-4xl" />
          </div>

          <div className={`flex justify-between items-end rotate-180 pointer-events-none ${style.text}`}>
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-lg font-bold leading-none">{rankLabel(card.rank)}</span>
              <SuitIcon suit={card.suit} className="text-xs sm:text-sm" />
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div className={`card-face card-back card-shadow flex items-center justify-center cursor-pointer hover:brightness-110 border-2 ${style.back}`}>
          <div className={`w-12 h-20 sm:w-16 sm:h-28 rounded-md border border-white/10 flex items-center justify-center pointer-events-none ${style.backPattern}`}>
             <div className="text-3xl sm:text-4xl">◈</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardUI;
