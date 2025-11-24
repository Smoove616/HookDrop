import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AILyricsGenerator from './AILyricsGenerator';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsEditorProps {
  lyrics: LyricLine[];
  onLyricsChange: (lyrics: LyricLine[]) => void;
  darkMode?: boolean;
  audioUrl?: string;
}

export default function LyricsEditor({ lyrics, onLyricsChange, darkMode = false, audioUrl }: LyricsEditorProps) {
  const [manualMode, setManualMode] = useState(lyrics.length > 0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const parseLrcFile = (content: string): LyricLine[] => {
    const lines = content.split('\n');
    const parsed: LyricLine[] = [];
    lines.forEach(line => {
      const match = line.match(/\[(\d+):(\d+)\.?(\d+)?\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = match[3] ? parseInt(match[3]) : 0;
        const time = minutes * 60 + seconds + centiseconds / 100;
        const text = match[4].trim();
        if (text) parsed.push({ time, text });
      }
    });
    return parsed.sort((a, b) => a.time - b.time);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseLrcFile(content);
      if (parsed.length > 0) {
        onLyricsChange(parsed);
        setManualMode(true);
        toast.success(`Loaded ${parsed.length} lyric lines`);
      } else {
        toast.error('No valid lyrics found in file');
      }
    };
    reader.readAsText(file);
  };

  const addLine = () => onLyricsChange([...lyrics, { time: 0, text: '' }]);

  const updateLine = (index: number, field: 'time' | 'text', value: string | number) => {
    const updated = [...lyrics];
    updated[index] = { ...updated[index], [field]: value };
    onLyricsChange(updated);
  };

  const removeLine = (index: number) => onLyricsChange(lyrics.filter((_, i) => i !== index));

  const handleAIAccept = (aiLyrics: LyricLine[]) => {
    onLyricsChange(aiLyrics);
    setShowAIGenerator(false);
    setManualMode(true);
    toast.success('AI-generated lyrics added. Review and edit as needed.');
  };

  const textClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white' : '';

  if (showAIGenerator && audioUrl) {
    return (
      <AILyricsGenerator
        audioUrl={audioUrl}
        onAccept={handleAIAccept}
        onCancel={() => setShowAIGenerator(false)}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {audioUrl && (
          <Button onClick={() => setShowAIGenerator(true)} variant="outline" className="flex-1 min-w-[150px]">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
        )}
        <Label htmlFor="lrc-upload" className="cursor-pointer flex-1 min-w-[150px]">
          <div className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent ${darkMode ? 'border-gray-600' : ''}`}>
            <Upload className="w-4 h-4" />
            <span>Upload .lrc</span>
          </div>
          <Input id="lrc-upload" type="file" accept=".lrc" className="hidden" onChange={handleFileUpload} />
        </Label>
        <Button onClick={() => setManualMode(!manualMode)} variant="outline" className="flex-1 min-w-[150px]">
          {manualMode ? 'Hide Editor' : 'Manual Entry'}
        </Button>
      </div>
      {manualMode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className={textClass}>Timestamped Lyrics</Label>
            <Button onClick={addLine} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />Add Line
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lyrics.map((line, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input type="number" step="0.1" value={line.time} onChange={(e) => updateLine(index, 'time', parseFloat(e.target.value))} className={`w-24 ${inputClass}`} placeholder="0.0" />
                <Input value={line.text} onChange={(e) => updateLine(index, 'text', e.target.value)} placeholder="Lyric text" className={`flex-1 ${inputClass}`} />
                <Button onClick={() => removeLine(index)} size="icon" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
