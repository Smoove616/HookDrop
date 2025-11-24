import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, Send, FileText } from 'lucide-react';

interface DisputeDetailViewProps {
  disputeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisputeDetailView({ disputeId, open, onOpenChange }: DisputeDetailViewProps) {
  const { user } = useAuth();
  const [dispute, setDispute] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (disputeId && open) {
      loadDisputeDetails();
    }
  }, [disputeId, open]);

  const loadDisputeDetails = async () => {
    if (!disputeId) return;

    const [disputeRes, messagesRes, evidenceRes] = await Promise.all([
      supabase.from('disputes').select('*').eq('id', disputeId).single(),
      supabase.from('dispute_messages').select('*, sender:auth.users(email)').eq('dispute_id', disputeId).order('created_at'),
      supabase.from('dispute_evidence').select('*').eq('dispute_id', disputeId).order('created_at')
    ]);

    if (disputeRes.data) setDispute(disputeRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
    if (evidenceRes.data) setEvidence(evidenceRes.data);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !disputeId) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-dispute-message', {
        body: { disputeId, message: newMessage }
      });

      if (error) throw error;

      setNewMessage('');
      loadDisputeDetails();
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!dispute) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Dispute #{dispute.dispute_number}</span>
            <Badge>{dispute.status}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{dispute.subject}</h3>
              <p className="text-sm text-muted-foreground">{dispute.description}</p>
            </div>
            <Separator />
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
              <Button onClick={handleSendMessage} disabled={loading}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Evidence</h4>
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <a key={ev.id} href={ev.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <FileText className="h-4 w-4" />
                    {ev.file_name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
