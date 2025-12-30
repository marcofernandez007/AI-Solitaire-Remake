
import React, { useState, useEffect } from 'react';
import { GameState, Card, Location, PileType, Settings, GameStats } from './types';
import { initializeGame, canMoveToTableau, canMoveToFoundation, checkWin } from './utils/gameLogic';
import CardUI from './components/CardUI';
import OracleUI from './components/OracleUI';
import SettingsUI from './components/SettingsUI';
import StatsUI from './components/StatsUI';
import VictoryCelebration from './components/VictoryCelebration';
import { playSound, setSoundEnabled } from './services/audioService';

const SAVE_KEY = 'zen-solitaire-save';
const SETTINGS_KEY = 'zen-solitaire-settings';
const STATS_KEY = 'zen-solitaire-stats';

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  animationsEnabled: true,
  cardStyle: 'zen'
};

const DEFAULT_STATS: GameStats = {
  gamesStarted: 0,
  gamesWon: 0,
  bestTime: null,
  bestMoves: null,
  longestGameTime: 0,
  totalMovesInWonGames: 0
};

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(initializeGame());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<Location | null>(null);
  const [lastMovedToFoundation, setLastMovedToFoundation] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    const savedStats = localStorage.getItem(STATS_KEY);

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setSoundEnabled(parsedSettings.soundEnabled);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }

    if (saved) {
      try {
        const { savedGame, savedTimer } = JSON.parse(saved);
        if (savedGame && !savedGame.won) {
          setGame(savedGame);
          setTimer(savedTimer || 0);
        }
      } catch (e) {
        console.error("Failed to load saved game", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save game & stats
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ savedGame: game, savedTimer: timer }));
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [game, timer, stats, isInitialized]);

  // Save settings
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSoundEnabled(settings.soundEnabled);
  }, [settings, isInitialized]);

  // Timer effect
  useEffect(() => {
    if (game.won || !isInitialized) return;
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [game.won, isInitialized]);

  const updateStatsOnWin = (finalMoves: number, finalTime: number) => {
    setStats(prev => ({
      ...prev,
      gamesWon: prev.gamesWon + 1,
      bestTime: prev.bestTime === null ? finalTime : Math.min(prev.bestTime, finalTime),
      bestMoves: prev.bestMoves === null ? finalMoves : Math.min(prev.bestMoves, finalMoves),
      longestGameTime: Math.max(prev.longestGameTime, finalTime),
      totalMovesInWonGames: prev.totalMovesInWonGames + finalMoves
    }));
  };

  const handleNewGame = () => {
    playSound('shuffle');
    const newGame = initializeGame();
    setGame(newGame);
    setTimer(0);
    setSelectedLocation(null);
    setLastMovedToFoundation(null);
    setStats(prev => ({ ...prev, gamesStarted: prev.gamesStarted + 1 }));
    localStorage.removeItem(SAVE_KEY);
  };

  // Fix: Added missing handleUpdateSettings function to resolve the "Cannot find name" error.
  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const resetStats = () => {
    setStats(DEFAULT_STATS);
    localStorage.removeItem(STATS_KEY);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onStockClick = () => {
    playSound('flip');
    setGame(prev => {
      const newState = { ...prev, moves: prev.moves + 1 };
      if (prev.stock.length === 0) {
        newState.stock = [...prev.waste].reverse().map(c => ({ ...c, isFaceUp: false }));
        newState.waste = [];
      } else {
        const drawn = newState.stock.pop()!;
        drawn.isFaceUp = true;
        newState.waste.push(drawn);
      }
      return newState;
    });
    setSelectedLocation(null);
  };

  const performMove = (from: Location, to: Location) => {
    setGame(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      let sourcePile: Card[] = [];
      let cardsToMove: Card[] = [];

      if (from.type === 'waste') sourcePile = newState.waste;
      else if (from.type === 'foundation') sourcePile = newState.foundation[from.index];
      else if (from.type === 'tableau') sourcePile = newState.tableau[from.index];

      if (sourcePile.length === 0) return prev;

      if (from.type === 'tableau') {
        const firstFaceUp = sourcePile.findIndex(c => c.isFaceUp);
        cardsToMove = sourcePile.slice(firstFaceUp);
      } else {
        cardsToMove = [sourcePile[sourcePile.length - 1]];
      }

      let valid = false;
      const targetPile = (to.type === 'tableau') ? newState.tableau[to.index] : newState.foundation[to.index];

      if (to.type === 'tableau') {
        if (canMoveToTableau(cardsToMove[0], targetPile)) valid = true;
      } else if (to.type === 'foundation' && cardsToMove.length === 1) {
        if (canMoveToFoundation(cardsToMove[0], targetPile)) valid = true;
      }

      if (valid) {
        if (from.type === 'tableau') {
          const firstFaceUp = newState.tableau[from.index].findIndex(c => c.isFaceUp);
          newState.tableau[from.index].splice(firstFaceUp);
          if (newState.tableau[from.index].length > 0 && !newState.tableau[from.index][newState.tableau[from.index].length - 1].isFaceUp) {
            newState.tableau[from.index][newState.tableau[from.index].length - 1].isFaceUp = true;
            playSound('flip');
          }
        } else {
          sourcePile.pop();
        }

        if (to.type === 'tableau') newState.tableau[to.index].push(...cardsToMove);
        else {
          newState.foundation[to.index].push(...cardsToMove);
          setLastMovedToFoundation(to.index);
          setTimeout(() => setLastMovedToFoundation(null), 300);
        }

        newState.moves += 1;
        newState.score += 10;
        if (checkWin(newState.foundation)) {
          newState.won = true;
          playSound('win');
          updateStatsOnWin(newState.moves, timer);
        } else {
          playSound('move');
        }
        return newState;
      }
      return prev;
    });
    setSelectedLocation(null);
    setDragOverLocation(null);
  };

  const handleCardClick = (type: PileType, index: number = 0) => {
    if (!selectedLocation) {
      if (type === 'stock') return;
      if (type === 'waste' && game.waste.length > 0) setSelectedLocation({ type, index });
      if (type === 'foundation' && game.foundation[index].length > 0) setSelectedLocation({ type, index });
      if (type === 'tableau' && game.tableau[index].length > 0) {
        const pile = game.tableau[index];
        const topCard = pile[pile.length - 1];
        if (topCard.isFaceUp) setSelectedLocation({ type, index });
        else {
          playSound('flip');
          setGame(prev => {
            const newState = { ...prev };
            newState.tableau[index][pile.length - 1].isFaceUp = true;
            return newState;
          });
        }
      }
      return;
    }
    if (selectedLocation.type === type && selectedLocation.index === index) {
      setSelectedLocation(null);
      return;
    }
    performMove(selectedLocation, { type, index });
  };

  const handleCardDoubleClick = (type: PileType, index: number = 0) => {
    if (type !== 'waste' && type !== 'tableau') return;
    
    let card: Card;
    if (type === 'waste') {
      if (game.waste.length === 0) return;
      card = game.waste[game.waste.length - 1];
    } else {
      if (game.tableau[index].length === 0) return;
      const pile = game.tableau[index];
      card = pile[pile.length - 1];
      if (!card.isFaceUp) return;
    }

    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, game.foundation[i])) {
        performMove({ type, index }, { type: 'foundation', index: i });
        return;
      }
    }
  };

  const onDragStart = (e: React.DragEvent, type: PileType, index: number) => {
    setSelectedLocation({ type, index });
    e.dataTransfer.setData('source', JSON.stringify({ type, index }));
    e.dataTransfer.effectAllowed = 'move';
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  const onDragEnd = (e: React.DragEvent) => {
    setSelectedLocation(null);
    setDragOverLocation(null);
  };

  const onDragOver = (e: React.DragEvent, type: PileType, index: number) => {
    e.preventDefault();
    if (dragOverLocation?.type !== type || dragOverLocation?.index !== index) {
      setDragOverLocation({ type, index });
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    setDragOverLocation(null);
  };

  const onDrop = (e: React.DragEvent, type: PileType, index: number) => {
    e.preventDefault();
    const sourceData = e.dataTransfer.getData('source');
    if (!sourceData) {
      setSelectedLocation(null);
      setDragOverLocation(null);
      return;
    }
    const source = JSON.parse(sourceData) as Location;
    performMove(source, { type, index });
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-emerald-950 flex items-center justify-center">
        <div className="text-emerald-100 text-xl font-bold animate-pulse">Restoring your Zen...</div>
      </div>
    );
  }

  const commonCardProps = {
    cardStyle: settings.cardStyle,
    noAnimations: !settings.animationsEnabled
  };

  return (
    <div className={`h-screen w-screen flex flex-col p-4 md:p-8 overflow-hidden select-none ${settings.animationsEnabled ? '' : 'no-animations'}`}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-emerald-300">Score</p>
            <p className="text-2xl font-bold">{game.score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-emerald-300">Moves</p>
            <p className="text-2xl font-bold">{game.moves}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-emerald-300">Time</p>
            <p className="text-2xl font-bold">{formatTime(timer)}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="p-2 bg-emerald-700/50 hover:bg-emerald-600 rounded-full border border-white/10 transition-colors shadow-lg"
            title="Statistics"
          >
            <span className="text-xl">📊</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-emerald-700/50 hover:bg-emerald-600 rounded-full border border-white/10 transition-colors shadow-lg"
            title="Settings"
          >
            <span className="text-xl">⚙️</span>
          </button>
          <button 
            onClick={handleNewGame}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-full font-semibold border border-white/10 transition-colors shadow-lg active:scale-95"
          >
            New Game
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 h-full">
        <div className="flex-1 flex flex-col gap-12">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div onClick={onStockClick} className="relative group cursor-pointer active:scale-95 transition-transform">
                <div className="w-16 h-24 sm:w-20 sm:h-32 rounded-lg border-2 border-white/10 bg-black/20 flex items-center justify-center absolute -z-10">
                   <span className="text-3xl text-white/5">↻</span>
                </div>
                {game.stock.length > 0 ? (
                  <CardUI card={game.stock[game.stock.length - 1]} {...commonCardProps} />
                ) : (
                  <div className="w-16 h-24 sm:w-20 sm:h-32 rounded-lg border-2 border-white/5 bg-white/5 flex items-center justify-center opacity-40">
                    <span className="text-2xl">↻</span>
                  </div>
                )}
              </div>
              
              <div className="w-16 h-24 sm:w-20 sm:h-32 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                {game.waste.length > 0 && (
                  <CardUI 
                    card={game.waste[game.waste.length - 1]} 
                    isSelected={selectedLocation?.type === 'waste'}
                    onClick={() => handleCardClick('waste')}
                    onDoubleClick={() => handleCardDoubleClick('waste')}
                    onDragStart={(e) => onDragStart(e, 'waste', 0)}
                    onDragEnd={onDragEnd}
                    className={settings.animationsEnabled ? "card-transition" : ""}
                    {...commonCardProps}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4">
              {game.foundation.map((pile, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleCardClick('foundation', idx)}
                  onDragOver={(e) => onDragOver(e, 'foundation', idx)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, 'foundation', idx)}
                  className={`w-16 h-24 sm:w-20 sm:h-32 rounded-lg border-2 border-white/10 bg-white/5 flex items-center justify-center cursor-pointer transition-all ${dragOverLocation?.type === 'foundation' && dragOverLocation.index === idx ? 'drop-target-active' : ''} ${lastMovedToFoundation === idx && settings.animationsEnabled ? 'animate-foundation' : ''}`}
                >
                  {pile.length > 0 ? (
                    <CardUI 
                      card={pile[pile.length - 1]} 
                      isSelected={selectedLocation?.type === 'foundation' && selectedLocation.index === idx} 
                      onDragStart={(e) => onDragStart(e, 'foundation', idx)}
                      onDragEnd={onDragEnd}
                      className={settings.animationsEnabled ? "card-transition" : ""}
                      {...commonCardProps}
                    />
                  ) : (
                    <span className="text-2xl opacity-20">
                      {idx === 0 ? '♥' : idx === 1 ? '♦' : idx === 2 ? '♣' : '♠'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between h-full">
            {game.tableau.map((pile, pileIdx) => (
              <div 
                key={pileIdx} 
                className={`flex flex-col w-16 sm:w-20 tableau-pile relative transition-all ${dragOverLocation?.type === 'tableau' && dragOverLocation.index === pileIdx ? 'drop-target-active' : ''}`}
                onClick={() => handleCardClick('tableau', pileIdx)}
                onDragOver={(e) => onDragOver(e, 'tableau', pileIdx)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, 'tableau', pileIdx)}
              >
                {pile.length === 0 && (
                  <div className="w-full h-24 sm:h-32 rounded-lg border-2 border-white/5 bg-white/5" />
                )}
                
                {pile.map((card, cardIdx) => (
                  <div 
                    key={card.id} 
                    className={`absolute ${settings.animationsEnabled ? "card-transition" : ""}`} 
                    style={{ top: `${cardIdx * 25}px`, zIndex: cardIdx }}
                  >
                    <CardUI 
                      card={card} 
                      isSelected={selectedLocation?.type === 'tableau' && selectedLocation.index === pileIdx && card.isFaceUp}
                      onDoubleClick={() => handleCardDoubleClick('tableau', pileIdx)}
                      onDragStart={(e) => onDragStart(e, 'tableau', pileIdx)}
                      onDragEnd={onDragEnd}
                      {...commonCardProps}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-80 flex flex-col gap-6">
          <OracleUI gameState={game} />
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5 text-sm text-white/40">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold uppercase tracking-widest">Instructions</h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Auto-Saving</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Drag cards to move them.</li>
              <li>Or click to select then click a target.</li>
              <li>Aces clear foundations.</li>
              <li><b>Double-click</b> to auto-move to Foundation.</li>
            </ul>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsUI 
          settings={settings} 
          onUpdate={handleUpdateSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {isStatsOpen && (
        <StatsUI 
          stats={stats} 
          onClose={() => setIsStatsOpen(false)} 
          onReset={resetStats}
        />
      )}

      {game.won && <VictoryCelebration cardStyle={settings.cardStyle} />}

      {game.won && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-emerald-900/90 border-4 border-emerald-400/50 p-12 rounded-[3rem] text-center max-w-lg shadow-[0_0_100px_rgba(16,185,129,0.3)] animate-in zoom-in-95 duration-500 victory-glow">
            <div className="mb-6 inline-block p-4 rounded-full bg-emerald-500/20 text-emerald-300 text-5xl animate-bounce">
              ✧
            </div>
            <h1 className="text-7xl font-bold serif mb-4 text-white drop-shadow-lg">Triumph</h1>
            <p className="text-xl text-emerald-100/80 mb-10 tracking-wide">The Oracle sees clearly: your path is balanced. Your mind has achieved perfect Zen.</p>
            
            <div className="grid grid-cols-2 gap-8 mb-10 bg-black/30 p-6 rounded-2xl border border-white/10">
              <div className="border-r border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70 mb-1">Score</p>
                <p className="text-4xl font-bold text-white tracking-tighter">{game.score}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70 mb-1">Time</p>
                <p className="text-4xl font-bold text-white tracking-tighter">{formatTime(timer)}</p>
              </div>
            </div>

            <button 
              onClick={handleNewGame}
              className="group relative px-12 py-5 bg-white text-emerald-950 rounded-full font-bold text-xl overflow-hidden transition-all hover:pr-14 active:scale-95"
            >
              <span className="relative z-10">Play Again</span>
              <div className="absolute inset-0 bg-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
