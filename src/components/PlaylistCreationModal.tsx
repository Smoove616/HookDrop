import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PlaylistCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: () => void;
}

export default function PlaylistCreationModal({ isOpen, onClose, onPlaylistCreated }: PlaylistCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [allowCollaboration, setAllowCollaboration] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a playlist title');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const shareToken = Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase.from('playlists').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        is_public: isPublic,
        allow_collaboration: allowCollaboration,
        share_token: shareToken
      });

      if (error) throw error;

      toast.success('Playlist created successfully!');
      setTitle('');
      setDescription('');
      setIsPublic(false);
      setAllowCollaboration(false);
      onPlaylistCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Playlist Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Hooks"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite hooks..."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="public">Public Playlist</Label>
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="collab">Allow Collaboration</Label>
            <Switch id="collab" checked={allowCollaboration} onCheckedChange={setAllowCollaboration} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Playlist'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}