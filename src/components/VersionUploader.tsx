import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const VERSION_TYPES = [
  { value: 'original', label: 'Original' },
  { value: 'radio_edit', label: 'Radio Edit' },
  { value: 'extended', label: 'Extended' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'acapella', label: 'Acapella' },
  { value: 'stems', label: 'Stems' }
];

export default function VersionUploader({ hookId, onClose }: { hookId: string; onClose: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    version_type: '',
    version_number: '1.0',
    title: '',
    description: '',
    price: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.version_type) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${hookId}_${formData.version_type}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hooks')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hooks')
        .getPublicUrl(fileName);

      const audio = new Audio(URL.createObjectURL(formData.file));
      audio.addEventListener('loadedmetadata', async () => {
        const { error } = await supabase.from('hook_versions').insert({
          hook_id: hookId,
          version_type: formData.version_type,
          version_number: formData.version_number,
          title: formData.title,
          description: formData.description,
          audio_url: publicUrl,
          duration: Math.floor(audio.duration),
          file_size: formData.file!.size,
          price: parseFloat(formData.price)
        });

        if (error) throw error;
        toast.success('Version uploaded successfully');
        onClose();
      });
    } catch (error) {
      toast.error('Failed to upload version');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Version</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Version Type *</Label>
            <Select value={formData.version_type} onValueChange={(v) => setFormData({ ...formData, version_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VERSION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <Label>Price *</Label>
            <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
          </div>
          <div>
            <Label>Audio File *</Label>
            <Input type="file" accept="audio/*" onChange={handleFileChange} required />
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Version'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
