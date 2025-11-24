import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Hook {
  id: number;
  title: string;
  artist: string;
  price: number;
  genre: string;
  bpm: number;
  duration: string;
  image: string;
  audioUrl?: string;
}

type RepeatMode = 'off' | 'all' | 'one';

interface AudioContextType {
  currentHook: Hook | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playlist: Hook[];
  shuffle: boolean;
  repeat: RepeatMode;
  playHook: (hook: Hook) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToPlaylist: (hook: Hook) => void;
  removeFromPlaylist: (hookId: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlaylist: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playPlaylist: (hooks: Hook[], startIndex?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentHook, setCurrentHook] = useState<Hook | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Hook[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [playHistory, setPlayHistory] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentHook, playlist]);

  const playHook = (hook: Hook) => {
    if (audioRef.current) {
      setCurrentHook(hook);
      audioRef.current.src = hook.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addToPlaylist = (hook: Hook) => {
    setPlaylist(prev => [...prev, hook]);
  };

  const removeFromPlaylist = (hookId: number) => {
    setPlaylist(prev => prev.filter(h => h.id !== hookId));
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(h => h.id === currentHook?.id);
    
    if (shuffle) {
      const unplayedIndices = playlist
        .map((_, i) => i)
        .filter(i => !playHistory.includes(i) && i !== currentIndex);
      
      if (unplayedIndices.length === 0) {
        setPlayHistory([]);
        if (repeat === 'all') {
          const randomIndex = Math.floor(Math.random() * playlist.length);
          playHook(playlist[randomIndex]);
          setPlayHistory([randomIndex]);
        }
      } else {
        const randomIndex = unplayedIndices[Math.floor(Math.random() * unplayedIndices.length)];
        playHook(playlist[randomIndex]);
        setPlayHistory(prev => [...prev, randomIndex]);
      }
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      if (nextIndex === 0 && repeat !== 'all') {
        setIsPlaying(false);
      } else {
        playHook(playlist[nextIndex]);
      }
    }
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(h => h.id === currentHook?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    playHook(playlist[prevIndex]);
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setPlayHistory([]);
  };

  const toggleShuffle = () => {
    setShuffle(prev => !prev);
    setPlayHistory([]);
  };

  const toggleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const playPlaylist = (hooks: Hook[], startIndex = 0) => {
    setPlaylist(hooks);
    setPlayHistory([startIndex]);
    if (hooks.length > 0) {
      playHook(hooks[startIndex]);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentHook, isPlaying, volume, currentTime, duration, playlist,
      shuffle, repeat, playHook, togglePlay, setVolume, seekTo, addToPlaylist,
      removeFromPlaylist, playNext, playPrevious, clearPlaylist,
      toggleShuffle, toggleRepeat, playPlaylist
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
