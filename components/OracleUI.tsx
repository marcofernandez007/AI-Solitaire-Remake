
import React, { useState } from 'react';
import { GameState } from '../types';
import { getOracleAdvice, OracleResponse } from '../services/geminiService';
import { playSound } from '../services/audioService';

interface OracleUIProps {
  gameState: GameState;
}

const OracleUI: React.FC<OracleUIProps> = ({ gameState }) => {
  const [advice, setAdvice] = useState<OracleResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const askOracle = async () => {
    playSound('oracle');
    setLoading(true);
    const result = await getOracleAdvice(gameState);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl shadow-lg animate-pulse">
          ✧
        </div>
        <div>
          <h3 className="text-xl font-bold serif text-emerald-200">The Oracle</h3>
          <p className="text-xs text-white/60 tracking-widest uppercase">Ancient Wisdom Awaits</p>
        </div>
      </div>

      <div className="min-h-[60px] italic text-emerald-50/90 leading-relaxed transition-opacity">
        {loading ? (
          <div className="flex gap-1 items-center h-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          advice?.message || "Draw a card, initiate a sequence, or seek my guidance."
        )}
      </div>

      <button 
        onClick={askOracle}
        disabled={loading}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all rounded-lg font-semibold uppercase tracking-widest text-sm shadow-inner active:scale-95"
      >
        Seek Guidance
      </button>
      
      {advice?.suggestedAction && (
        <div className="text-xs text-emerald-300 font-mono">
          Tip: {advice.suggestedAction}
        </div>
      )}
    </div>
  );
};

export default OracleUI;
