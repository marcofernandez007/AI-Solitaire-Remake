
import React from 'react';
import { GameStats } from '../types';

interface StatsUIProps {
  stats: GameStats;
  onClose: () => void;
  onReset: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; sublabel?: string }> = ({ label, value, sublabel }) => (
  <div className="bg-emerald-800/40 border border-emerald-400/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 mb-1">{label}</p>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    {sublabel && <p className="text-[10px] text-emerald-100/40 mt-1 uppercase">{sublabel}</p>}
  </div>
);

const StatsUI: React.FC<StatsUIProps> = ({ stats, onClose, onReset }) => {
  const winRate = stats.gamesStarted > 0 
    ? Math.round((stats.gamesWon / stats.gamesStarted) * 100) 
    : 0;

  const avgMoves = stats.gamesWon > 0 
    ? Math.round(stats.totalMovesInWonGames / stats.gamesWon) 
    : 0;

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[160] p-4">
      <div className="bg-emerald-950 border border-emerald-400/30 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              📊
            </div>
            <h2 className="text-3xl font-bold serif text-emerald-100 tracking-tight">Oracle Records</h2>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white transition-colors text-2xl">✕</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Win Rate" value={`${winRate}%`} sublabel={`${stats.gamesWon} Wins`} />
          <StatCard label="Best Time" value={formatTime(stats.bestTime)} />
          <StatCard label="Best Moves" value={stats.bestMoves || '---'} />
          <StatCard label="Started" value={stats.gamesStarted} />
          <StatCard label="Avg Moves" value={avgMoves} sublabel="on wins" />
          <StatCard label="Longest Game" value={formatTime(stats.longestGameTime)} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            Continue Journey
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all your wisdom records?')) {
                onReset();
              }
            }}
            className="px-6 py-4 bg-transparent border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 text-white/40 hover:text-red-400 rounded-2xl font-medium text-sm transition-all"
          >
            Reset Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsUI;
