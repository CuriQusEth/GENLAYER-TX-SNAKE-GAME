import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { useSkills } from '../hooks/useSkills';

interface GameCanvasProps {
  walletAddress: string;
  onGameOver: (score: number, apples: number, survival: number, deathsNearWall: number, moves: string[]) => void;
  aiInsight?: any;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export const GameCanvas: React.FC<GameCanvasProps> = ({ walletAddress, onGameOver, aiInsight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const appleRef = useRef({ x: 15, y: 15 });
  const blackHoleRef = useRef<{ x: number, y: number } | null>(null);
  const scoreMultiplierRef = useRef(1);
  const [oracleMessage, setOracleMessage] = useState<{ message: string, effect: string } | null>(null);
  const directionRef = useRef({ x: 1, y: 0 });
  const movesRef = useRef<string[]>([]);
  const startTimeRef = useRef(Date.now());
  const applesEatenRef = useRef(0);
  const deathsNearWallRef = useRef(0);

  const { submitScore } = useGenLayer();
  const { blackHoleOracle } = useSkills();

  const generateApple = useCallback(() => {
    let newApple;
    while (true) {
      newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if apple is on snake
      const onSnake = snakeRef.current.some(segment => segment.x === newApple.x && segment.y === newApple.y);
      if (!onSnake) break;
    }
    appleRef.current = newApple;
    
    // 10% chance to spawn a black hole if one doesn't exist
    if (Math.random() < 0.1 && !blackHoleRef.current) {
      let newHole;
      while (true) {
        newHole = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
        const onSnake = snakeRef.current.some(segment => segment.x === newHole.x && segment.y === newHole.y);
        const onApple = newHole.x === newApple.x && newHole.y === newApple.y;
        if (!onSnake && !onApple) break;
      }
      blackHoleRef.current = newHole;
    }
  }, []);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    movesRef.current = [];
    startTimeRef.current = Date.now();
    applesEatenRef.current = 0;
    deathsNearWallRef.current = 0;
    blackHoleRef.current = null;
    scoreMultiplierRef.current = 1;
    setOracleMessage(null);
    setScore(0);
    setLength(1);
    setIsGameOver(false);
    generateApple();
  };

  const handleDirection = useCallback((dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    switch (dir) {
      case 'UP':
        if (directionRef.current.y === 0) {
          directionRef.current = { x: 0, y: -1 };
          movesRef.current.push('UP');
        }
        break;
      case 'DOWN':
        if (directionRef.current.y === 0) {
          directionRef.current = { x: 0, y: 1 };
          movesRef.current.push('DOWN');
        }
        break;
      case 'LEFT':
        if (directionRef.current.x === 0) {
          directionRef.current = { x: -1, y: 0 };
          movesRef.current.push('LEFT');
        }
        break;
      case 'RIGHT':
        if (directionRef.current.x === 0) {
          directionRef.current = { x: 1, y: 0 };
          movesRef.current.push('RIGHT');
        }
        break;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          handleDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          handleDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          handleDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          handleDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirection]);

  // Swipe detection
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    // Prevent scrolling while swiping on the game canvas
    e.preventDefault();

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (Math.abs(dx) > 30) {
        if (dx > 0) handleDirection('RIGHT');
        else handleDirection('LEFT');
        touchStartRef.current = null;
      }
    } else {
      // Vertical swipe
      if (Math.abs(dy) > 30) {
        if (dy > 0) handleDirection('DOWN');
        else handleDirection('UP');
        touchStartRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (isGameOver) return;

    const moveSnake = () => {
      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        deathsNearWallRef.current = 1;
        handleGameOver();
        return;
      }

      // Self collision
      if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        deathsNearWallRef.current = 0;
        handleGameOver();
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      // Apple collision
      if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
        setScore(s => s + (100 * scoreMultiplierRef.current));
        setLength(l => l + 1);
        applesEatenRef.current += 1;
        generateApple();
        
        // Every 5 apples, batch submit score
        if (applesEatenRef.current % 5 === 0 && walletAddress && walletAddress !== 'undefined') {
          submitScore(
            walletAddress,
            score + (100 * scoreMultiplierRef.current),
            applesEatenRef.current,
            Math.floor((Date.now() - startTimeRef.current) / 1000),
            0, // Not dead yet
            'batch_update',
            'batch_update'
          ).catch(err => console.error('Batch update failed:', err));
        }
      } else if (blackHoleRef.current && head.x === blackHoleRef.current.x && head.y === blackHoleRef.current.y) {
        // Black hole collision
        blackHoleRef.current = null;
        
        // Call Oracle
        blackHoleOracle({ player: walletAddress, score }).then(result => {
          if (result) {
            setOracleMessage(result);
            if (result.effect === 'bonus') {
              scoreMultiplierRef.current = 2;
              setScore(s => s + 500);
            } else if (result.effect === 'curse') {
              setLength(l => Math.max(1, Math.floor(l / 2)));
              newSnake.splice(Math.max(1, Math.floor(newSnake.length / 2)));
            }
            
            setTimeout(() => {
              setOracleMessage(null);
              scoreMultiplierRef.current = 1;
            }, 5000);
          }
        });
        
        newSnake.pop();
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
    };

    const handleGameOver = () => {
      setIsGameOver(true);
      const survival = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onGameOver(score, applesEatenRef.current, survival, deathsNearWallRef.current, movesRef.current);
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.fillStyle = '#050a05';
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

      // Snake
      snakeRef.current.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#00ff41' : '#00cc33';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
      });

      // Apple
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(
        appleRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        appleRef.current.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Black Hole
      if (blackHoleRef.current) {
        ctx.fillStyle = '#8a2be2'; // Purple
        ctx.beginPath();
        ctx.arc(
          blackHoleRef.current.x * CELL_SIZE + CELL_SIZE / 2,
          blackHoleRef.current.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(
          blackHoleRef.current.x * CELL_SIZE + CELL_SIZE / 2,
          blackHoleRef.current.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // HUD
      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#00ff41';
      ctx.fillText(`SCORE: ${score}`, 10, 20);
      ctx.fillText(`LEN: ${length}`, 160, 20);
      ctx.fillText(walletAddress.slice(0, 6) + '...', 300, 20);
      
      ctx.font = '8px "Press Start 2P"';
      ctx.globalAlpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      ctx.fillText('PROOF OF PLAY', 140, 380);
      ctx.globalAlpha = 1;
    };

    const gameLoop = setInterval(() => {
      moveSnake();
      draw();
    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [isGameOver, score, length, walletAddress, generateApple, onGameOver, submitScore]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto">
      <div 
        className="relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="glitch-border bg-black max-w-full h-auto"
        />
        {oracleMessage && !isGameOver && (
          <div className="absolute top-10 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className={`p-3 border rounded-sm text-center max-w-[90%] w-full bg-black/80 backdrop-blur-sm ${
              oracleMessage.effect === 'bonus' ? 'border-green-500 text-green-400' : 
              oracleMessage.effect === 'curse' ? 'border-red-500 text-red-400' : 
              'border-purple-500 text-purple-400'
            }`}>
              <h3 className="font-bold mb-1 arcade-font text-xs">THE ORACLE SPEAKS</h3>
              <p className="text-xs font-mono italic">"{oracleMessage.message}"</p>
              <p className="text-[10px] arcade-font mt-2 uppercase">EFFECT: {oracleMessage.effect}</p>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-danger p-4 text-center z-10 overflow-y-auto">
            <h2 className="text-4xl mb-4 crt-flicker">GAME OVER</h2>
            <p className="mb-2 arcade-font text-white">FINAL SCORE: {score}</p>
            <p className="mb-4 arcade-font text-white">APPLES: {applesEatenRef.current}</p>
            
            {aiInsight && (
              <div className="mb-6 p-4 border border-matrix/40 bg-matrix/10 rounded-sm text-left max-w-sm w-full">
                <h3 className="text-matrix font-bold mb-2 text-center arcade-font text-sm">=== AI ANALYSIS ===</h3>
                <div className="text-xs font-mono text-matrix/80 space-y-1">
                  <p><span className="text-matrix">Style:</span> {aiInsight.style?.play_style || 'Unknown'} ({aiInsight.style?.confidence || 0}%)</p>
                  <p><span className="text-matrix">Pattern:</span> {aiInsight.replay?.pattern || 'Unknown'}</p>
                  <p><span className="text-matrix">Risk:</span> {aiInsight.replay?.risk_level || 'Unknown'}</p>
                  <div className="mt-3 pt-3 border-t border-matrix/20 italic text-matrix/90">
                    "{aiInsight.style?.reasoning || aiInsight.replay?.insight || 'Analyzing...'}"
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-matrix text-black arcade-font hover:bg-matrix-dark transition-colors"
            >
              RETRY
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-Pad */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-48">
        <div />
        <button 
          className="bg-matrix/20 border border-matrix p-4 rounded-sm active:bg-matrix active:text-black flex justify-center items-center"
          onClick={() => handleDirection('UP')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <div />
        <button 
          className="bg-matrix/20 border border-matrix p-4 rounded-sm active:bg-matrix active:text-black flex justify-center items-center"
          onClick={() => handleDirection('LEFT')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          className="bg-matrix/20 border border-matrix p-4 rounded-sm active:bg-matrix active:text-black flex justify-center items-center"
          onClick={() => handleDirection('DOWN')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button 
          className="bg-matrix/20 border border-matrix p-4 rounded-sm active:bg-matrix active:text-black flex justify-center items-center"
          onClick={() => handleDirection('RIGHT')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
};
