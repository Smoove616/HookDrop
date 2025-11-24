import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek?: (time: number) => void;
  compact?: boolean;
}

export function LyricsDisplay({ lyrics, currentTime, onSeek, compact = false }: LyricsDisplayProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Find current lyric index
  const currentIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // Auto-scroll to active lyric
  useEffect(() => {
    if (activeRef.current && !compact) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, compact]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No lyrics available
      </div>
    );
  }

  return (
    <ScrollArea className={compact ? "h-16" : "h-full"}>
      <div className={compact ? "space-y-1 py-2" : "space-y-4 py-8 px-4"}>
        {lyrics.map((line, index) => (
          <div
            key={index}
            ref={index === currentIndex ? activeRef : null}
            onClick={() => onSeek?.(line.time)}
            className={`transition-all duration-300 ${
              onSeek ? 'cursor-pointer hover:text-primary' : ''
            } ${
              index === currentIndex
                ? compact 
                  ? 'text-primary font-semibold text-sm'
                  : 'text-primary font-bold text-2xl scale-105'
                : compact
                  ? 'text-muted-foreground text-xs'
                  : index < currentIndex
                    ? 'text-muted-foreground/60 text-lg'
                    : 'text-muted-foreground text-lg'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
