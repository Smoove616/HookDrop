import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

interface Version {
  id: string;
  title: string;
  version_type: string;
  price: number;
}

export default function VersionBundleCreator({ 
  hookId, 
  versions, 
  onClose 
}: { 
  hookId: string; 
  versions: Version[]; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedVersions: [] as string[],
    discount: 20
  });

  const toggleVersion = (versionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedVersions: prev.selectedVersions.includes(versionId)
        ? prev.selectedVersions.filter(id => id !== versionId)
        : [...prev.selectedVersions, versionId]
    }));
  };

  const calculateBundlePrice = () => {
    const totalPrice = versions
      .filter(v => formData.selectedVersions.includes(v.id))
      .reduce((sum, v) => sum + v.price, 0);
    return totalPrice * (1 - formData.discount / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedVersions.length < 2) {
      toast.error('Select at least 2 versions for a bundle');
      return;
    }

    const { error } = await supabase.from('version_bundles').insert({
      hook_id: hookId,
      name: formData.name,
      description: formData.description,
      version_ids: formData.selectedVersions,
      bundle_price: calculateBundlePrice(),
      discount_percentage: formData.discount
    });

    if (error) {
      toast.error('Failed to create bundle');
      return;
    }

    toast.success('Bundle created successfully');
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Version Bundle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Bundle Name *</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Complete Collection"
              required 
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="All versions included..."
            />
          </div>
          <div>
            <Label>Discount Percentage</Label>
            <Input 
              type="number" 
              min="0" 
              max="100"
              value={formData.discount} 
              onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Select Versions *</Label>
            {versions.map(version => (
              <div key={version.id} className="flex items-center space-x-2">
                <Checkbox 
                  checked={formData.selectedVersions.includes(version.id)}
                  onCheckedChange={() => toggleVersion(version.id)}
                />
                <label className="flex-1 flex justify-between">
                  <span>{version.title} ({version.version_type})</span>
                  <span className="font-semibold">${version.price}</span>
                </label>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Bundle Price:</span>
              <span className="text-2xl font-bold text-primary">${calculateBundlePrice().toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Save {formData.discount}% on selected versions
            </p>
          </div>
          <Button type="submit" className="w-full">
            <Package className="w-4 h-4 mr-2" />
            Create Bundle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
