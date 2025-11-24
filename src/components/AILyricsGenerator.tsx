import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check, X, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LyricLine {
  time: number;
  text: string;
}

interface AILyricsGeneratorProps {
  audioUrl: string;
  onAccept: (lyrics: LyricLine[]) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export default function AILyricsGenerator({ 
  audioUrl, 
  onAccept, 
  onCancel,
  darkMode = false 
}: AILyricsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<LyricLine[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();

  const generateLyrics = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lyrics-ai', {
        body: { audioUrl }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'AI Service Configuration',
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      setGeneratedLyrics(data.lyrics || []);
      toast({
        title: 'Lyrics Generated',
        description: `Found ${data.lyrics?.length || 0} lyric lines. Review and edit before accepting.`
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate lyrics',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(generatedLyrics[index].text);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...generatedLyrics];
      updated[editingIndex].text = editText;
      setGeneratedLyrics(updated);
      setEditingIndex(null);
    }
  };

  const deleteLine = (index: number) => {
    setGeneratedLyrics(generatedLyrics.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${darkMode ? 'text-white' : ''}`}>
      {generatedLyrics.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-semibold mb-2">AI Lyrics Generator</h3>
          <p className="text-sm text-gray-500 mb-4">
            Automatically detect vocals and generate timestamped lyrics
          </p>
          <Button onClick={generateLyrics} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Audio...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Lyrics with AI
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Review Generated Lyrics</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={() => onAccept(generatedLyrics)}>
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {generatedLyrics.map((line, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">
                  {Math.floor(line.time / 60)}:{(line.time % 60).toFixed(1).padStart(4, '0')}
                </span>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span className="flex-1">{line.text}</span>
                )}
                <div className="flex gap-1">
                  {editingIndex === index ? (
                    <Button size="sm" variant="ghost" onClick={saveEdit}>
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteLine(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}