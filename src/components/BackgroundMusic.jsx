import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const BackgroundMusic = ({ audioFile }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);
  const hasAttemptedAutoplay = useRef(false);

  // Function to handle play attempt
  const attemptPlay = async () => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback failed:', err);
      setIsPlaying(false);
    }
  };

  // Initial setup and mobile autoplay
  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      audio.volume = volume;
      audio.preload = 'auto'; // Changed to auto for better mobile performance
      
      const handleCanPlay = () => {
        setIsReady(true);
        
        // Attempt autoplay for mobile
        if (isMobile && !hasAttemptedAutoplay.current) {
          hasAttemptedAutoplay.current = true;
          attemptPlay();
        }
      };

      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('ended', handleEnded);
      
      // Add user interaction listeners for mobile
      if (isMobile) {
        const startAudioOnInteraction = () => {
          if (!isPlaying) {
            attemptPlay();
          }
          // Remove the listeners after first interaction
          document.removeEventListener('touchstart', startAudioOnInteraction);
          document.removeEventListener('click', startAudioOnInteraction);
        };

        document.addEventListener('touchstart', startAudioOnInteraction);
        document.addEventListener('click', startAudioOnInteraction);
      }

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
        if (isMobile) {
          document.removeEventListener('touchstart', attemptPlay);
          document.removeEventListener('click', attemptPlay);
        }
      };
    }
  }, [isMobile]);

  // Auto-start when component mounts on mobile
  useEffect(() => {
    if (isMobile && isReady) {
      attemptPlay();
    }
  }, [isMobile, isReady]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Playback failed:', err);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg flex items-center gap-4 z-50 shadow-lg">
      <audio
        ref={audioRef}
        src={audioFile}
        loop
        playsInline
        autoPlay={isMobile} // Added autoPlay attribute for mobile
      />
      
      <button
        onClick={togglePlay}
        disabled={!isReady}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isReady 
            ? 'bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-black" />
        ) : (
          <VolumeX className="w-5 h-5 text-black" />
        )}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        aria-label="Volume control"
      />
    </div>
  );
};

export default BackgroundMusic;