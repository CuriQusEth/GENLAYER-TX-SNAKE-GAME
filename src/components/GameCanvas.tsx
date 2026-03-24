import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';

interface GameCanvasProps {
  walletAddress: string;
  onGameOver: (score: number, apples: number, survival: number, deathsNearWall: number, moves: string[]) => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export const GameCanvas: React.FC<GameCanvasProps> = ({ walletAddress, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const appleRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 1, y: 0 });
  const movesRef = useRef<string[]>([]);
  const startTimeRef = useRef(Date.now());
  const applesEatenRef = useRef(0);
  const deathsNearWallRef = useRef(0);

  const { submitScore } = useGenLayer();

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
  }, []);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    movesRef.current = [];
    startTimeRef.current = Date.now();
    applesEatenRef.current = 0;
    setScore(0);
    setLength(1);
    setIsGameOver(false);
    generateApple();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (directionRef.current.y === 0) {
            directionRef.current = { x: 0, y: -1 };
            movesRef.current.push('UP');
          }
          break;
        case 'ArrowDown':
        case 's':
          if (directionRef.current.y === 0) {
            directionRef.current = { x: 0, y: 1 };
            movesRef.current.push('DOWN');
          }
          break;
        case 'ArrowLeft':
        case 'a':
          if (directionRef.current.x === 0) {
            directionRef.current = { x: -1, y: 0 };
            movesRef.current.push('LEFT');
          }
          break;
        case 'ArrowRight':
        case 'd':
          if (directionRef.current.x === 0) {
            directionRef.current = { x: 1, y: 0 };
            movesRef.current.push('RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        setScore(s => s + 100);
        setLength(l => l + 1);
        applesEatenRef.current += 1;
        generateApple();
        
        // Every 5 apples, batch submit score
        if (applesEatenRef.current % 5 === 0) {
          submitScore(
            walletAddress,
            score + 100,
            applesEatenRef.current,
            Math.floor((Date.now() - startTimeRef.current) / 1000),
            0, // Not dead yet
            'batch_update'
          );
        }
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
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="glitch-border bg-black"
      />
      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-danger p-4 text-center">
          <h2 className="text-4xl mb-4 crt-flicker">GAME OVER</h2>
          <p className="mb-2 arcade-font">FINAL SCORE: {score}</p>
          <p className="mb-4 arcade-font">APPLES: {applesEatenRef.current}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-matrix text-black arcade-font hover:bg-matrix-dark transition-colors"
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
};
