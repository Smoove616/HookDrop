import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LyricsDisplay } from './LyricsDisplay';
import { Button } from '@/components/ui/button';
import { X, Music2 } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
}

interface FullScreenLyricsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  hookTitle: string;
  artist: string;
  albumArt?: string;
}

export function FullScreenLyrics({
  open,
  onOpenChange,
  lyrics,
  currentTime,
  onSeek,
  hookTitle,
  artist,
  albumArt,
}: FullScreenLyricsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {albumArt ? (
                <img src={albumArt} alt={hookTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{hookTitle}</h2>
              <p className="text-sm text-muted-foreground truncate">{artist}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Lyrics */}
          <div className="flex-1 overflow-hidden">
            <LyricsDisplay
              lyrics={lyrics}
              currentTime={currentTime}
              onSeek={onSeek}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
