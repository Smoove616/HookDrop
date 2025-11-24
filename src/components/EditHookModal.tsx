import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import LyricsEditor from './LyricsEditor';

interface LyricLine { time: number; text: string; }

interface EditHookModalProps {
  isOpen: boolean;
  onClose: () => void;
  hook: any;
  onSuccess: () => void;
}

const EditHookModal: React.FC<EditHookModalProps> = ({ isOpen, onClose, hook, onSuccess }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [licenseType, setLicenseType] = useState('both');
  const [nonExclusivePrice, setNonExclusivePrice] = useState('');
  const [exclusivePrice, setExclusivePrice] = useState('');
  const [licenseTerms, setLicenseTerms] = useState('');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hook && isOpen) {
      setTitle(hook.title || '');
      setGenre(hook.genre || '');
      setKey(hook.key || '');
      setBpm(hook.bpm?.toString() || '');
      setLicenseType(hook.license_type || 'both');
      setNonExclusivePrice(hook.non_exclusive_price?.toString() || '');
      setExclusivePrice(hook.exclusive_price?.toString() || '');
      setLicenseTerms(hook.license_terms || '');
      setLyrics(hook.lyrics || []);
    }
  }, [hook, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {
        title, genre, key, bpm: parseInt(bpm),
        license_type: licenseType, license_terms: licenseTerms,
        lyrics: lyrics.length > 0 ? lyrics : null
      };
      if (licenseType !== 'exclusive') updates.non_exclusive_price = parseFloat(nonExclusivePrice);
      if (licenseType !== 'non_exclusive') updates.exclusive_price = parseFloat(exclusivePrice);

      const { error } = await supabase.from('hooks').update(updates).eq('id', hook.id);
      if (error) throw error;

      toast({ title: 'Success!', description: 'Hook updated successfully' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit Hook</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={20} className="text-white" /></Button>
        </div>
        <div className="p-6 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hook Title" className="bg-gray-700 border-gray-600 text-white" />
          <div className="grid grid-cols-2 gap-4">
            <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="bg-gray-700 border-gray-600 text-white" />
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key" className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <Input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} placeholder="BPM" className="bg-gray-700 border-gray-600 text-white" />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">License Type</label>
            <select value={licenseType} onChange={(e) => setLicenseType(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
              <option value="both">Both</option>
              <option value="non_exclusive">Non-Exclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>
          {licenseType !== 'exclusive' && <Input type="number" value={nonExclusivePrice} onChange={(e) => setNonExclusivePrice(e.target.value)} placeholder="Non-Exclusive Price ($)" className="bg-gray-700 border-gray-600 text-white" />}
          {licenseType !== 'non_exclusive' && <Input type="number" value={exclusivePrice} onChange={(e) => setExclusivePrice(e.target.value)} placeholder="Exclusive Price ($)" className="bg-gray-700 border-gray-600 text-white" />}
          <Textarea value={licenseTerms} onChange={(e) => setLicenseTerms(e.target.value)} placeholder="License Terms (optional)" rows={3} className="bg-gray-700 border-gray-600 text-white" />
          
          <LyricsEditor lyrics={lyrics} onLyricsChange={setLyrics} darkMode audioUrl={hook?.audio_url} />

          
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHookModal;
