
import React, { useEffect, useState } from 'react';
import { Card, CardStyle } from '../types';
import CardUI from './CardUI';

interface VictoryCelebrationProps {
  cardStyle: CardStyle;
}

const COLORS = ['#10b981', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];

const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({ cardStyle }) => {
  const [confetti, setConfetti] = useState<{ id: number; left: string; color: string; duration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    // Generate initial burst of confetti
    const newConfetti = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 5}s`,
      size: `${Math.random() * 8 + 4}px`
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[90]">
      {/* Confetti Elements */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti"
          style={{
            left: c.left,
            backgroundColor: c.color,
            animationDuration: c.duration,
            animationDelay: c.delay,
            width: c.size,
            height: c.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      {/* Radiant Background Glow */}
      <div className="absolute inset-0 bg-emerald-500/10 animate-pulse duration-[4000ms]" />
    </div>
  );
};

export default VictoryCelebration;
