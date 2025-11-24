import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Button } from './ui/button';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, Shuffle, Repeat, Repeat1, X, Activity, Type } from 'lucide-react';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { WaveformVisualizer } from './WaveformVisualizer';
import { LyricsDisplay } from './LyricsDisplay';
import { FullScreenLyrics } from './FullScreenLyrics';

export const MiniPlayer: React.FC = () => {
  const { 
    currentHook, isPlaying, volume, currentTime, duration, playlist,
    shuffle, repeat, togglePlay, setVolume, seekTo, playNext, playPrevious,
    toggleShuffle, toggleRepeat, playHook, removeFromPlaylist
  } = useAudio();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [fullScreenLyrics, setFullScreenLyrics] = useState(false);

  // Mock lyrics data - in production this would come from currentHook.lyrics
  const lyrics = currentHook?.lyrics || [];


  if (!currentHook) return null;

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-indigo-900 border-t border-purple-700 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 mb-2">
            <img src={currentHook.image} alt={currentHook.title} className="w-12 h-12 rounded-lg flex-shrink-0 object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{currentHook.title}</p>
              <p className="text-purple-300 text-xs truncate">{currentHook.artist}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowVisualizer(!showVisualizer)} 
              className={`h-10 w-10 ${showVisualizer ? 'text-purple-300' : 'text-purple-400/50'}`}
            >
              <Activity className="w-5 h-5" />
            </Button>
            {lyrics.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFullScreenLyrics(true)} 
                className="h-10 w-10 text-purple-300 hover:text-white"
              >
                <Type className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-purple-300 hover:text-white h-10 w-10">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Sheet open={showPlaylist} onOpenChange={setShowPlaylist}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white h-10 w-10">
                  <List className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader><SheetTitle>Playlist ({playlist.length})</SheetTitle></SheetHeader>
                <ScrollArea className="h-[calc(80vh-80px)] mt-4">
                  {playlist.map((hook) => (
                    <div key={hook.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${currentHook.id === hook.id ? 'bg-purple-50' : ''}`}>
                      <img src={hook.image} alt={hook.title} className="w-12 h-12 rounded object-cover" onClick={() => { playHook(hook); setShowPlaylist(false); }} />
                      <div className="flex-1 min-w-0" onClick={() => { playHook(hook); setShowPlaylist(false); }}>
                        <p className="font-medium text-sm truncate">{hook.title}</p>
                        <p className="text-xs text-gray-600 truncate">{hook.artist}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFromPlaylist(hook.id); }}><X className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Visualizer for Mobile */}
          {showVisualizer && (
            <div className="mb-2 px-1">
              <WaveformVisualizer isPlaying={isPlaying} currentTime={currentTime} duration={duration} />
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={toggleShuffle} className={`h-10 w-10 ${shuffle ? 'text-purple-300' : 'text-purple-400/50'}`}>
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrevious} className="text-white h-11 w-11">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button variant="default" size="icon" onClick={togglePlay} className="bg-white text-purple-900 hover:bg-purple-100 h-14 w-14 rounded-full">
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="text-white h-11 w-11">
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleRepeat} className={`h-10 w-10 ${repeat !== 'off' ? 'text-purple-300' : 'text-purple-400/50'}`}>
              <RepeatIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 w-10 text-center">{formatTime(currentTime)}</span>
            <Slider value={[progress]} onValueChange={(val) => seekTo((val[0] / 100) * duration)} max={100} step={0.1} className="flex-1" />
            <span className="text-xs text-purple-300 w-10 text-center">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 w-64">
              <img src={currentHook.image} alt={currentHook.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{currentHook.title}</p>
                <p className="text-purple-300 text-xs truncate">{currentHook.artist}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleShuffle} className={`h-9 w-9 ${shuffle ? 'text-purple-300' : 'text-purple-400/50'}`}>
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={playPrevious} className="text-white h-9 w-9">
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button variant="default" size="sm" onClick={togglePlay} className="bg-white text-purple-900 hover:bg-purple-100 h-10 w-10 rounded-full">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={playNext} className="text-white h-9 w-9">
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleRepeat} className={`h-9 w-9 ${repeat !== 'off' ? 'text-purple-300' : 'text-purple-400/50'}`}>
                  <RepeatIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full max-w-2xl flex items-center gap-3">
                <span className="text-xs text-purple-300 w-12 text-right">{formatTime(currentTime)}</span>
                <Slider value={[progress]} onValueChange={(val) => seekTo((val[0] / 100) * duration)} max={100} step={0.1} className="flex-1" />
                <span className="text-xs text-purple-300 w-12">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-56">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVisualizer(!showVisualizer)} 
                className={`h-9 w-9 ${showVisualizer ? 'text-purple-300' : 'text-purple-400/50'}`}
              >
                <Activity className="w-5 h-5" />
              </Button>
              {lyrics.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFullScreenLyrics(true)} 
                  className="h-9 w-9 text-purple-300 hover:text-white"
                >
                  <Type className="w-5 h-5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-purple-300 hover:text-white h-9 w-9">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider value={[volume * 100]} onValueChange={(val) => { setVolume(val[0] / 100); setIsMuted(false); }} max={100} step={1} className="w-24" />
              <Sheet open={showPlaylist} onOpenChange={setShowPlaylist}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white h-9">
                    <List className="w-5 h-5" />
                    <span className="text-xs ml-1">{playlist.length}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-96">
                  <SheetHeader><SheetTitle>Playlist ({playlist.length})</SheetTitle></SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    {playlist.map((hook) => (
                      <div key={hook.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${currentHook.id === hook.id ? 'bg-purple-50' : ''}`}>
                        <img src={hook.image} alt={hook.title} className="w-12 h-12 rounded object-cover" onClick={() => { playHook(hook); setShowPlaylist(false); }} />
                        <div className="flex-1 min-w-0" onClick={() => { playHook(hook); setShowPlaylist(false); }}>
                          <p className="font-medium text-sm truncate">{hook.title}</p>
                          <p className="text-xs text-gray-600 truncate">{hook.artist} • {hook.duration}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeFromPlaylist(hook.id); }}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          
          {/* Visualizer for Desktop */}
          {showVisualizer && (
            <div className="mt-2 px-2">
              <WaveformVisualizer isPlaying={isPlaying} currentTime={currentTime} duration={duration} />
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Lyrics Modal */}
      {lyrics.length > 0 && (
        <FullScreenLyrics
          open={fullScreenLyrics}
          onOpenChange={setFullScreenLyrics}
          lyrics={lyrics}
          currentTime={currentTime}
          onSeek={seekTo}
          hookTitle={currentHook.title}
          artist={currentHook.artist}
          albumArt={currentHook.image}
        />
      )}
    </div>
  );
};
