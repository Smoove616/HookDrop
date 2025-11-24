import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface MessagingPanelProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({ recipientId, recipientName, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [recipientId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user?.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.functions.invoke('send-message', {
      body: { receiverId: recipientId, content: newMessage }
    });
    if (error) toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    else { setNewMessage(''); fetchMessages(); }
    setLoading(false);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] bg-gray-800 border-gray-700 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <User size={20} className="text-purple-400" />
          <h3 className="text-white font-bold">{recipientName}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}><X size={16} /></Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-3 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${msg.sender_id === user?.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="bg-gray-700 border-gray-600 text-white" />
        <Button onClick={sendMessage} disabled={loading} className="bg-purple-600 hover:bg-purple-700"><Send size={16} /></Button>
      </div>
    </Card>
  );
};
