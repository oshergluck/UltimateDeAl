import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, Volume2, VolumeX, Crown, Clock, Trophy } from 'lucide-react';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScores, setHighScores] = useState([]);
  const [shake, setShake] = useState(false);

  const difficulties = {
    easy: { pairs: 6, timeLimit: 120 },
    medium: { pairs: 8, timeLimit: 180 },
    hard: { pairs: 12, timeLimit: 240 }
  };

  const emojis = {
    easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
    medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🐮', '🐷']
  };

  // Sound effects using Web Audio API
  const playSound = (type) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'flip':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
      case 'match':
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
      case 'win':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
      default:
        break;
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying && timer < difficulties[difficulty].timeLimit) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer + 1 >= difficulties[difficulty].timeLimit) {
            setIsPlaying(false);
            return difficulties[difficulty].timeLimit;
          }
          return prevTimer + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timer, difficulty]);

  const calculateScore = useCallback(() => {
    const timeBonus = difficulties[difficulty].timeLimit - timer;
    const movePenalty = moves * 10;
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    }[difficulty];
    
    return Math.max(0, Math.floor((1000 + timeBonus * 10 - movePenalty) * difficultyMultiplier));
  }, [difficulty, timer, moves]);

  const initializeGame = () => {
    const selectedEmojis = emojis[difficulty];
    const duplicatedEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffledEmojis = shuffleArray(duplicatedEmojis);
    const newCards = shuffledEmojis.map((emoji, index) => ({
      id: index,
      content: emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameWon(false);
    setTimer(0);
    setIsPlaying(true);
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (cardId) => {
    if (!isPlaying || flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId)) {
      return;
    }

    playSound('flip');
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlipped.map(id => cards.find(card => card.id === id));

      if (firstCard.content === secondCard.content) {
        playSound('match');
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          const finalScore = calculateScore();
          setScore(finalScore);
          setGameWon(true);
          setIsPlaying(false);
          playSound('win');
          setHighScores(prev => [...prev, finalScore].sort((a, b) => b - a).slice(0, 5));
        }
      } else {
        setShake(true);
        setTimeout(() => {
          setFlipped([]);
          setShake(false);
        }, 1000);
      }
    }
  };

  const getGridCols = () => {
    switch (difficulty) {
      case 'easy': return 'grid-cols-3';
      case 'medium': return 'grid-cols-4';
      case 'hard': return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock />
              <span className="text-xl">
                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Crown />
              <span className="text-xl">Moves: {moves}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
            <button 
              onClick={initializeGame}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              <Shuffle size={20} />
              New Game
            </button>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {Object.keys(difficulties).map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                initializeGame();
              }}
              className={`px-4 py-2 rounded ${
                difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {gameWon && (
        <div className="text-center mb-6 p-4 bg-green-100 text-green-800 rounded animate-bounce">
          🎉 Congratulations! You won with {score} points in {moves} moves! 🎉
        </div>
      )}

      {highScores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">High Scores:</h3>
          <div className="flex gap-4">
            {highScores.map((score, index) => (
              <div key={index} className="bg-yellow-100 p-2 rounded">
                {score}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`grid ${getGridCols()} gap-4`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square text-4xl flex items-center justify-center rounded-lg transition-all duration-300 transform ${
              flipped.includes(card.id) || matched.includes(card.id)
                ? 'bg-white rotate-0 hover:scale-105'
                : 'bg-blue-500 rotate-180 hover:bg-blue-600'
            } ${
              matched.includes(card.id)
                ? 'bg-green-100 animate-pulse'
                : ''
            } ${
              shake && flipped.includes(card.id)
                ? 'animate-shake'
                : ''
            }`}
            disabled={matched.includes(card.id)}
          >
            <span 
              className={`transform transition-all duration-300 ${
                flipped.includes(card.id) || matched.includes(card.id)
                  ? 'scale-100 rotate-0'
                  : 'scale-0 rotate-180'
              }`}
            >
              {card.content}
            </span>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;