import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150;

// Different food types with their properties
const FOOD_TYPES = {
  normal: { color: 'bg-red-500', points: 1, speedChange: 0 },
  speed: { color: 'bg-yellow-400', points: 2, speedChange: -20 },
  slow: { color: 'bg-blue-400', points: 3, speedChange: 20 },
  bonus: { color: 'bg-purple-500', points: 5, speedChange: 0 },
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15, type: 'normal' });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [theme, setTheme] = useState('default');
  const [powerUp, setPowerUp] = useState(null);
  const [difficulty, setDifficulty] = useState('normal');
  const [showSettings, setShowSettings] = useState(false);
  const [achievements, setAchievements] = useState([]);

  // Theme configurations
  const themes = {
    default: {
      background: 'bg-gray-900',
      grid: 'bg-gray-800',
      snake: 'bg-green-500',
      text: 'text-white'
    },
    neon: {
      background: 'bg-black',
      grid: 'bg-gray-900',
      snake: 'bg-pink-500',
      text: 'text-pink-500'
    },
    forest: {
      background: 'bg-green-900',
      grid: 'bg-green-800',
      snake: 'bg-yellow-500',
      text: 'text-yellow-500'
    },
    ocean: {
      background: 'bg-blue-900',
      grid: 'bg-blue-800',
      snake: 'bg-cyan-400',
      text: 'text-cyan-400'
    }
  };

  // Difficulty settings
  const difficulties = {
    easy: { speed: 180, wallCollision: false },
    normal: { speed: 150, wallCollision: true },
    hard: { speed: 120, wallCollision: true }
  };

  // Generate random food position and type
  const generateFood = useCallback(() => {
    const foodTypes = ['normal', 'normal', 'normal', 'speed', 'slow', 'bonus'];
    const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      type
    };
  }, []);

  // Check for achievements
  const checkAchievements = useCallback((newScore) => {
    const newAchievements = [];
    if (newScore >= 10 && !achievements.includes('Novice')) {
      newAchievements.push('Novice');
    }
    if (newScore >= 25 && !achievements.includes('Intermediate')) {
      newAchievements.push('Intermediate');
    }
    if (newScore >= 50 && !achievements.includes('Expert')) {
      newAchievements.push('Expert');
    }
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [achievements]);

  // Check for collisions
  const checkCollision = useCallback((head) => {
    if (difficulties[difficulty].wallCollision) {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }
    } else {
      // Wrap around walls
      head.x = (head.x + GRID_SIZE) % GRID_SIZE;
      head.y = (head.y + GRID_SIZE) % GRID_SIZE;
    }
    return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
  }, [snake, difficulty]);

  // Handle key presses
  const handleKeyPress = useCallback((event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === ' ') {
      setIsPaused(prev => !prev);
      return;
    }

    if (isPaused) return;

    const keyDirections = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const newDirection = keyDirections[event.key];
    if (newDirection) {
      if (!(direction.x === -newDirection.x && direction.y === -newDirection.y)) {
        setDirection(newDirection);
      }
    }
  }, [direction, isPaused]);

  // Timer
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameOver, isPaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        if (checkCollision(newHead)) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
          }
          clearInterval(gameLoop);
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Check if snake ate food
        if (newHead.x === food.x && newHead.y === food.y) {
          const foodProps = FOOD_TYPES[food.type];
          setScore(s => {
            const newScore = s + foodProps.points;
            checkAchievements(newScore);
            return newScore;
          });
          setGameSpeed(prev => Math.max(80, prev + foodProps.speedChange));
          setFood(generateFood());

          if (food.type === 'bonus') {
            setPowerUp('invincible');
            setTimeout(() => setPowerUp(null), 5000);
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, generateFood, checkCollision, isPaused, score, highScore, gameSpeed, checkAchievements]);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setTime(0);
    setIsPaused(false);
    setGameSpeed(difficulties[difficulty].speed);
    setPowerUp(null);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${themes[theme].background} p-4`}>
      {/* Stats Bar */}
      <div className={`mb-4 ${themes[theme].text} text-xl space-x-4`}>
        <span>Score: {score} | High Score: {highScore}</span>
        <span>Time: {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(prev => !prev)}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ⚙️ Settings
      </button>

      {/* Game Grid */}
      <div 
        className={`relative ${themes[theme].grid} rounded-lg overflow-hidden`}
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${themes[theme].snake} rounded-sm ${powerUp === 'invincible' ? 'animate-pulse' : ''}`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              transition: 'all 0.1s'
            }}
          />
        ))}

        {/* Food */}
        <div
          className={`absolute ${FOOD_TYPES[food.type].color} rounded-full animate-pulse`}
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
      </div>

      {/* Controls */}
      <div className={`mt-4 space-y-2 ${themes[theme].text} text-center`}>
        <div>Use arrow keys or buttons to move</div>
        <div>Press space or pause button to pause</div>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => !isPaused && !gameOver && setDirection({ x: 0, y: -1 })}
            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
            onKeyDown={(e) => e.preventDefault()}
          >
            ⬆️
          </button>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => !isPaused && !gameOver && setDirection({ x: -1, y: 0 })}
            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
            onKeyDown={(e) => e.preventDefault()}
          >
            ⬅️
          </button>
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
            onKeyDown={(e) => e.preventDefault()}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            onClick={() => !isPaused && !gameOver && setDirection({ x: 1, y: 0 })}
            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
            onKeyDown={(e) => e.preventDefault()}
          >
            ➡️
          </button>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => !isPaused && !gameOver && setDirection({ x: 0, y: 1 })}
            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
            onKeyDown={(e) => e.preventDefault()}
          >
            ⬇️
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${themes[theme].background} p-6 rounded-lg ${themes[theme].text}`}>
            <h2 className="text-2xl mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Theme:</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-gray-700 rounded p-2"
                >
                  {Object.keys(themes).map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Difficulty:</label>
                <select 
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setGameSpeed(difficulties[e.target.value].speed);
                  }}
                  className="bg-gray-700 rounded p-2"
                >
                  {Object.keys(difficulties).map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${themes[theme].background} p-6 rounded-lg ${themes[theme].text} text-center`}>
            <h2 className="text-2xl mb-4">Game Over!</h2>
            <p className="mb-2">Final Score: {score}</p>
            <p className="mb-2">High Score: {highScore}</p>
            <p className="mb-4">Time: {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</p>
            
            {/* Achievements Section */}
            {achievements.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl mb-2">Achievements Unlocked:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm animate-bounce"
                    >
                      {achievement} 🏆
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                Speed: {Math.round(1000/gameSpeed)} fps
              </div>
              <div className="bg-gray-700 p-2 rounded">
                Length: {snake.length}
              </div>
            </div>

            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Power-up Indicator */}
      {powerUp && (
        <div className="fixed top-4 left-4 bg-purple-500 text-white px-4 py-2 rounded animate-pulse">
          {powerUp.charAt(0).toUpperCase() + powerUp.slice(1)} Active!
        </div>
      )}

      {/* Game Status */}
      {isPaused && !gameOver && (
        <div className={`${themes[theme].text} text-xl mt-4`}>PAUSED</div>
      )}
    </div>
  );
};

export default SnakeGame;