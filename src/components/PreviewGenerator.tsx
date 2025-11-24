import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Scissors, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PreviewGeneratorProps {
  audioUrl: string;
  hookId?: string;
  onPreviewGenerated: (previewUrl: string, startTime: number, endTime: number) => void;
}

const PreviewGenerator: React.FC<PreviewGeneratorProps> = ({ audioUrl, hookId, onPreviewGenerated }) => {

  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const dur = audio.duration;
      setDuration(dur);
      setEndTime(Math.min(30, dur));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [audioUrl]);

  const togglePlayPreview = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = startTime;
      audio.play();
      setIsPlaying(true);

      const checkTime = setInterval(() => {
        if (audio.currentTime >= endTime) {
          audio.pause();
          setIsPlaying(false);
          clearInterval(checkTime);
        }
      }, 100);
    }
  };

  const handleGeneratePreview = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-preview', {
        body: { audioUrl, startTime, endTime, hookId }
      });


      if (error) throw error;

      setGenerated(true);
      onPreviewGenerated(data.previewUrl, startTime, endTime);
      
      toast({
        title: "Preview Generated!",
        description: "Your watermarked preview is ready",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const previewDuration = endTime - startTime;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Preview Generator</h3>
        {generated && <Check className="text-green-600" size={20} />}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Preview Range: {startTime.toFixed(1)}s - {endTime.toFixed(1)}s ({previewDuration.toFixed(1)}s)
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Start Time</label>
            <Slider
              value={[startTime]}
              onValueChange={([val]) => setStartTime(Math.min(val, endTime - 15))}
              max={duration}
              step={0.1}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">End Time</label>
            <Slider
              value={[endTime]}
              onValueChange={([val]) => setEndTime(Math.max(val, startTime + 15))}
              max={duration}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={togglePlayPreview}
          className="flex-1"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span className="ml-2">Preview Selection</span>
        </Button>
        <Button
          type="button"
          onClick={handleGeneratePreview}
          disabled={generating || previewDuration < 15 || previewDuration > 30}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Scissors size={16} />}
          <span className="ml-2">{generated ? 'Regenerate' : 'Generate'}</span>
        </Button>
      </div>

      {previewDuration < 15 && (
        <p className="text-xs text-red-600">Preview must be at least 15 seconds</p>
      )}
      {previewDuration > 30 && (
        <p className="text-xs text-red-600">Preview must be 30 seconds or less</p>
      )}
    </div>
  );
};

export default PreviewGenerator;
