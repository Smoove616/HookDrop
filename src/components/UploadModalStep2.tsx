import React from 'react';
import { ArrowLeft, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PreviewGenerator from './PreviewGenerator';

interface Step2Props {
  audioUrl: string;
  uploading: boolean;
  onPreviewGenerated: (previewUrl: string, startTime: number, endTime: number) => void;
  onBack: () => void;
  onFinish: () => void;
}

const UploadModalStep2: React.FC<Step2Props> = ({ 
  audioUrl, 
  uploading, 
  onPreviewGenerated, 
  onBack, 
  onFinish 
}) => {
  return (
    <>
      <PreviewGenerator 
        audioUrl={audioUrl} 
        onPreviewGenerated={onPreviewGenerated}
      />

      <div className="flex space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack} 
          className="flex-1"
          disabled={uploading}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Button 
          type="button"
          onClick={onFinish}
          disabled={uploading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Music className="mr-2" size={16} />
          {uploading ? 'Uploading...' : 'Complete Upload'}
        </Button>
      </div>
    </>
  );
};

export default UploadModalStep2;
