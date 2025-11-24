import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Button } from './ui/button';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, X } from 'lucide-react';
import { Slider } from './ui/slider';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Card } from './ui/card';

export const AudioPlayer: React.FC = () => {
  const { 
    currentHook, 
    isPlaying, 
    volume, 
    currentTime, 
    duration, 
    playlist,
    togglePlay, 
    setVolume, 
    seekTo,
    playNext,
    playPrevious,
    removeFromPlaylist
  } = useAudio();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!currentHook) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(0.7);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 md:bottom-20 md:right-4 md:left-auto md:w-96 bg-gray-900 border-purple-700 p-4 md:p-6 shadow-2xl z-40 md:rounded-lg">
      <div className="space-y-3 md:space-y-4">
        {/* Album Art & Info */}
        <div className="flex items-center gap-3 md:gap-4">
          <img src={currentHook.image} alt={currentHook.title} className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate text-sm md:text-base">{currentHook.title}</h3>
            <p className="text-purple-300 text-xs md:text-sm truncate">{currentHook.artist}</p>
            <p className="text-gray-400 text-xs">{currentHook.genre} • {currentHook.bpm} BPM</p>
          </div>
        </div>

        {/* Waveform - Hidden on mobile */}
        <div className="hidden md:block">
          <WaveformVisualizer isPlaying={isPlaying} currentTime={currentTime} duration={duration} />
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 md:space-y-2">
          <Slider 
            value={[currentTime]} 
            onValueChange={(val) => seekTo(val[0])}
            max={duration}
            step={0.1}
            className="w-full cursor-pointer touch-none"
          />
          <div className="flex justify-between text-xs text-purple-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 md:px-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={playPrevious} 
            className="text-white h-12 w-12 md:h-auto md:w-auto"
          >
            <SkipBack className="w-6 h-6 md:w-5 md:h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={togglePlay} 
            className="text-white h-14 w-14 md:h-auto md:w-auto"
          >
            {isPlaying ? <Pause className="w-10 h-10 md:w-8 md:h-8" /> : <Play className="w-10 h-10 md:w-8 md:h-8" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={playNext} 
            className="text-white h-12 w-12 md:h-auto md:w-auto"
          >
            <SkipForward className="w-6 h-6 md:w-5 md:h-5" />
          </Button>
        </div>

        {/* Volume & Playlist */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleVolumeToggle} 
            className="text-purple-300 h-10 w-10 md:h-auto md:w-auto flex-shrink-0"
          >
            {isMuted ? <VolumeX className="w-5 h-5 md:w-4 md:h-4" /> : <Volume2 className="w-5 h-5 md:w-4 md:h-4" />}
          </Button>
          <Slider 
            value={[volume * 100]} 
            onValueChange={(val) => setVolume(val[0] / 100)}
            max={100}
            step={1}
            className="flex-1 cursor-pointer touch-none"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="text-purple-300 h-10 w-10 md:h-auto md:w-auto flex-shrink-0"
          >
            <List className="w-5 h-5 md:w-4 md:h-4" />
            <span className="ml-1 text-sm">{playlist.length}</span>
          </Button>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <div className="max-h-40 md:max-h-48 overflow-y-auto space-y-2 border-t border-purple-700 pt-3 md:pt-4">
            {playlist.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between text-sm">
                <span className="text-white truncate flex-1">{hook.title}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFromPlaylist(hook.id)}
                  className="text-red-400 h-8 w-8 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
