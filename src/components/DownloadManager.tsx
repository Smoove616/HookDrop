import React from 'react';
import { Download, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Purchase {
  id: string;
  hook_id: string;
  license_type: string;
  created_at: string;
  hooks: {
    title: string;
    artist_name: string;
    audio_url: string;
  };
}

interface DownloadManagerProps {
  purchases: Purchase[];
}

export const DownloadManager: React.FC<DownloadManagerProps> = ({ purchases }) => {
  const handleDownload = async (hookId: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('hooks')
        .createSignedUrl(`${hookId}.mp3`, 3600);
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = `${title}.mp3`;
        link.click();
        toast.success('Download started');
      }
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (purchases.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 text-center">
        <FileAudio className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No purchases yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {purchases.map((purchase) => (
        <Card key={purchase.id} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileAudio className="text-purple-400" size={24} />
              <div>
                <h3 className="text-white font-semibold text-sm">{purchase.hooks?.title}</h3>
                <p className="text-gray-400 text-xs">{purchase.hooks?.artist_name}</p>
                <p className="text-purple-400 text-xs capitalize mt-1">
                  {purchase.license_type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleDownload(purchase.hook_id, purchase.hooks?.title)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DownloadManager;
