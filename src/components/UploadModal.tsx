import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import UploadModalStep1 from './UploadModalStep1';
import UploadModalStep2 from './UploadModalStep2';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

interface LyricLine {
  time: number;
  text: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [licenseType, setLicenseType] = useState('both');
  const [nonExclusivePrice, setNonExclusivePrice] = useState('');
  const [exclusivePrice, setExclusivePrice] = useState('');
  const [licenseTerms, setLicenseTerms] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewStartTime, setPreviewStartTime] = useState(0);
  const [previewEndTime, setPreviewEndTime] = useState(30);
  const [step, setStep] = useState<1 | 2>(1);


  useEffect(() => {
    const checkUploadLimit = async () => {
      if (!user || !isOpen) return;
      const tier = subscriptionTier || 'free';
      const limits = { free: 3, pro: 10, premium: -1 };
      const limit = limits[tier as keyof typeof limits];
      setUploadLimit(limit);
      if (limit === -1) { setLimitReached(false); return; }
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase.from('hooks').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).gte('created_at', startOfMonth.toISOString());

      setUploadCount(count || 0);
      setLimitReached((count || 0) >= limit);
    };
    checkUploadLimit();
  }, [user, isOpen, subscriptionTier]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (!user || !file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('hooks').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('hooks').getPublicUrl(fileName);
      setAudioUrl(publicUrl);
      setStep(2);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewGenerated = (url: string, start: number, end: number) => {
    setPreviewUrl(url);
    setPreviewStartTime(start);
    setPreviewEndTime(end);
  };

  const handleFinish = async () => {
    if (!user || !audioUrl) return;
    setUploading(true);
    try {
      const price = licenseType === 'exclusive' ? parseFloat(exclusivePrice) : parseFloat(nonExclusivePrice);
      const { error } = await supabase.from('hooks').insert({
        title, genre, key, bpm: parseInt(bpm), price, license_type: licenseType,
        non_exclusive_price: licenseType !== 'exclusive' ? parseFloat(nonExclusivePrice) : null,
        exclusive_price: licenseType !== 'non_exclusive' ? parseFloat(exclusivePrice) : null,
        license_terms: licenseTerms, user_id: user.id,
        seller_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
        audio_url: audioUrl, preview_url: previewUrl, preview_start: previewStartTime,
        preview_duration: previewEndTime - previewStartTime,
        lyrics: lyrics.length > 0 ? lyrics : null
      });

      if (error) throw error;
      toast({ title: "Success!", description: "Hook uploaded successfully" });
      onClose();
      if (onUploadSuccess) onUploadSuccess();
      setTitle(''); setGenre(''); setKey(''); setBpm(''); setNonExclusivePrice('');
      setExclusivePrice(''); setLicenseTerms(''); setFile(null); setLyrics([]); setStep(1);
      setAudioUrl(null); setPreviewUrl(null);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {step === 1 ? 'Upload Your Hook' : 'Generate Preview'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
        </div>
        <div className="p-6 space-y-4">
          {step === 1 ? (
            <UploadModalStep1
              title={title} setTitle={setTitle} genre={genre} setGenre={setGenre}
              keyValue={key} setKeyValue={setKey} bpm={bpm} setBpm={setBpm}
              licenseType={licenseType} setLicenseType={setLicenseType}
              nonExclusivePrice={nonExclusivePrice} setNonExclusivePrice={setNonExclusivePrice}
              exclusivePrice={exclusivePrice} setExclusivePrice={setExclusivePrice}
              licenseTerms={licenseTerms} setLicenseTerms={setLicenseTerms}
              file={file} setFile={setFile} 
              lyrics={lyrics} setLyrics={setLyrics}
              audioUrl={audioUrl || undefined}
              uploading={uploading} limitReached={limitReached}
              uploadCount={uploadCount} uploadLimit={uploadLimit} subscriptionTier={subscriptionTier || 'free'}
              onNext={handleNext} onCancel={onClose}
            />


          ) : (
            <UploadModalStep2
              audioUrl={audioUrl!} uploading={uploading}
              onPreviewGenerated={handlePreviewGenerated}
              onBack={() => setStep(1)} onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
