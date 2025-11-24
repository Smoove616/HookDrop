import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import WaveformVisualizer from './WaveformVisualizer';

interface Version {
  id: string;
  title: string;
  version_type: string;
  audio_url: string;
  duration: number;
  price: number;
  waveform_data?: any;
}

export default function VersionComparison({ versionIds, onClose }: { versionIds: string[]; onClose: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({});
  const [audios, setAudios] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    loadVersions();
  }, [versionIds]);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('hook_versions')
      .select('*')
      .in('id', versionIds);

    if (error) {
      toast.error('Failed to load versions');
      return;
    }
    setVersions(data || []);
    
    const audioElements: { [key: string]: HTMLAudioElement } = {};
    data?.forEach(v => {
      audioElements[v.id] = new Audio(v.audio_url);
    });
    setAudios(audioElements);
  };

  const togglePlay = (versionId: string) => {
    const audio = audios[versionId];
    if (!audio) return;

    if (playing[versionId]) {
      audio.pause();
    } else {
      Object.values(audios).forEach(a => a.pause());
      audio.play();
    }
    setPlaying({ ...playing, [versionId]: !playing[versionId] });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          {versions.map(version => (
            <Card key={version.id} className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold">{version.title}</h3>
                <p className="text-sm text-muted-foreground">{version.version_type}</p>
              </div>
              
              <WaveformVisualizer audioUrl={version.audio_url} height={100} />
              
              <div className="flex items-center justify-between">
                <Button onClick={() => togglePlay(version.id)} variant="outline">
                  {playing[version.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Duration: {Math.floor(version.duration / 60)}:{(version.duration % 60).toString().padStart(2, '0')}</p>
                  <p className="text-lg font-bold">${version.price}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{version.version_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium">High</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
