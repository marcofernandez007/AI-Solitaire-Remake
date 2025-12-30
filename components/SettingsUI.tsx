
import React from 'react';
import { Settings, CardStyle, Suit, Rank } from '../types';
import { SuitIcon, rankLabel } from '../constants';

interface SettingsUIProps {
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
  onClose: () => void;
}

const CardPreview: React.FC<{ style: CardStyle; isBack?: boolean }> = ({ style, isBack }) => {
  const getStyleClasses = () => {
    switch (style) {
      case 'classic':
        return {
          front: 'bg-white border-gray-200 text-red-600',
          back: 'bg-blue-800 border-white text-white/50',
        };
      case 'midnight':
        return {
          front: 'bg-gray-900 border-emerald-500/30 text-rose-500',
          back: 'bg-black border-emerald-900 text-emerald-500/20',
        };
      case 'ocean-breeze':
        return {
          front: 'bg-cyan-50 border-cyan-200 text-rose-600',
          back: 'bg-sky-600 border-sky-300 text-cyan-100/40',
        };
      case 'rustic-wood':
        return {
          front: 'bg-orange-50 border-amber-200 text-red-800',
          back: 'bg-amber-900 border-amber-700 text-amber-100/10',
        };
      case 'zen':
      default:
        return {
          front: 'bg-white border-gray-100 text-red-600',
          back: 'bg-emerald-800 border-white/20 text-white/20',
        };
    }
  };

  const classes = getStyleClasses();

  if (isBack) {
    return (
      <div className={`w-8 h-12 rounded border-2 flex items-center justify-center shadow-sm ${classes.back}`}>
        <div className="text-[10px]">◈</div>
      </div>
    );
  }

  return (
    <div className={`w-8 h-12 rounded border flex flex-col p-0.5 shadow-sm ${classes.front}`}>
      <div className="text-[8px] font-bold leading-none">A</div>
      <div className="flex-1 flex items-center justify-center text-[10px]">♥</div>
    </div>
  );
};

const SettingsUI: React.FC<SettingsUIProps> = ({ settings, onUpdate, onClose }) => {
  const toggleSound = () => onUpdate({ ...settings, soundEnabled: !settings.soundEnabled });
  const toggleAnimations = () => onUpdate({ ...settings, animationsEnabled: !settings.animationsEnabled });
  const setCardStyle = (style: CardStyle) => onUpdate({ ...settings, cardStyle: style });

  const availableStyles: CardStyle[] = ['zen', 'classic', 'midnight', 'ocean-breeze', 'rustic-wood'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-emerald-900 border border-emerald-400/30 p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold serif text-emerald-100">Settings</h2>
          <button onClick={onClose} className="text-emerald-300 hover:text-white transition-colors text-2xl">✕</button>
        </div>

        <div className="space-y-8">
          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 font-medium tracking-wide">Sound Effects</span>
              <button 
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-emerald-400' : 'bg-emerald-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.soundEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-emerald-100 font-medium tracking-wide">Animations</span>
              <button 
                onClick={toggleAnimations}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.animationsEnabled ? 'bg-emerald-400' : 'bg-emerald-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.animationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Card Styles with Previews */}
          <div>
            <span className="block text-emerald-100 font-medium tracking-wide mb-4 text-center md:text-left">Card Style</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {availableStyles.map(style => (
                <button
                  key={style}
                  onClick={() => setCardStyle(style)}
                  className={`flex flex-col items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    settings.cardStyle === style 
                      ? 'bg-emerald-400/20 border-emerald-400' 
                      : 'bg-emerald-800/30 border-emerald-700/50 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex gap-1">
                    <CardPreview style={style} isBack />
                    <CardPreview style={style} />
                  </div>
                  <span className={`capitalize text-xs font-bold tracking-wider whitespace-nowrap ${
                    settings.cardStyle === style ? 'text-emerald-100' : 'text-emerald-300/70'
                  }`}>
                    {style.replace('-', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-10 w-full py-4 bg-emerald-700 hover:bg-emerald-600 rounded-2xl font-bold text-emerald-100 transition-colors shadow-lg active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsUI;
