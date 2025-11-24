import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DisputeCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hookId?: string;
  purchaseId?: string;
}

export function DisputeCreationModal({ open, onOpenChange, hookId, purchaseId }: DisputeCreationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'payout',
    subject: '',
    description: '',
    amount: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dispute', {
        body: {
          ...formData,
          hookId,
          purchaseId,
          amount: formData.amount ? parseFloat(formData.amount) : null
        }
      });

      if (error) throw error;

      toast.success('Dispute created successfully');
      onOpenChange(false);
      setFormData({ type: 'payout', subject: '', description: '', amount: '', priority: 'medium' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Dispute</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dispute Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payout">Payout Issue</SelectItem>
                <SelectItem value="licensing">Licensing Conflict</SelectItem>
                <SelectItem value="copyright">Copyright Claim</SelectItem>
                <SelectItem value="refund">Refund Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows={4} />
          </div>
          <div>
            <Label>Amount (if applicable)</Label>
            <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>Submit Dispute</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
