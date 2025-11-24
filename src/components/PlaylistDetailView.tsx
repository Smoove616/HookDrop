import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Copy, Trash2, Plus, GripVertical, Users, Music, Activity, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CollaboratorItem } from './CollaboratorItem';
import { PlaylistPresence } from './PlaylistPresence';
import { PlaylistActivityFeed } from './PlaylistActivityFeed';
import { useAudio } from '@/contexts/AudioContext';
import type { RealtimeChannel } from '@supabase/supabase-js';


interface PlaylistDetailViewProps {
  playlistId: string | null;
  onClose: () => void;
}

export default function PlaylistDetailView({ playlistId, onClose }: PlaylistDetailViewProps) {
  const { playPlaylist } = useAudio();
  const [playlist, setPlaylist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState('edit');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [showActivity, setShowActivity] = useState(false);


  // Setup real-time subscriptions
  useEffect(() => {
    if (!playlistId || !currentUserId) return;

    const channel = supabase
      .channel(`playlist-hooks:${playlistId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'playlist_hooks',
        filter: `playlist_id=eq.${playlistId}`
      }, (payload) => {
        // Optimistic update - add new hook
        loadPlaylist();
        toast.info('A collaborator added a hook');
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'playlist_hooks',
        filter: `playlist_id=eq.${playlistId}`
      }, (payload) => {
        // Optimistic update - remove hook
        setItems(prev => prev.filter(item => item.id !== payload.old.id));
        toast.info('A collaborator removed a hook');
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'playlist_hooks',
        filter: `playlist_id=eq.${playlistId}`
      }, (payload) => {
        // Optimistic update - reorder hooks
        loadPlaylist();
        toast.info('A collaborator reordered the playlist');
      })
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [playlistId, currentUserId]);

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
      loadCollaborators();
    }
    getCurrentUser();
  }, [playlistId]);


  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadPlaylist = async () => {
    setLoading(true);
    try {
      const { data: playlistData } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
      
      const { data: itemsData } = await supabase
        .from('playlist_hooks')
        .select('*, hooks(*)')
        .eq('playlist_id', playlistId)
        .order('position');

      setPlaylist(playlistData);
      setItems(itemsData || []);
    } catch (error: any) {
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async () => {
    try {
      const { data } = await supabase
        .from('playlist_collaborators')
        .select('*')
        .eq('playlist_id', playlistId)
        .not('accepted_at', 'is', null);
      
      setCollaborators(data || []);
    } catch (error) {
      console.error('Failed to load collaborators');
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('invite-playlist-collaborator', {
        body: { 
          playlistId, 
          emailOrUsername: inviteEmail, 
          permission: invitePermission 
        }
      });

      if (error) throw error;
      
      toast.success('Collaborator invited successfully!');
      setInviteEmail('');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite collaborator');
    }
  };

  const updatePermission = async (userId: string, permission: string) => {
    try {
      await supabase
        .from('playlist_collaborators')
        .update({ permission })
        .eq('playlist_id', playlistId)
        .eq('user_id', userId);
      
      toast.success('Permission updated');
      loadCollaborators();
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const removeCollaborator = async (userId: string) => {
    try {
      await supabase
        .from('playlist_collaborators')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('user_id', userId);
      
      toast.success('Collaborator removed');
      loadCollaborators();
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };


  const handleShare = () => {
    const shareUrl = `${window.location.origin}/playlist/${playlist.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    
    // Optimistic update - UI already updated
    const optimisticItems = [...items];
    
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        position: index
      }));

      for (const update of updates) {
        await supabase
          .from('playlist_hooks')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('playlist_activity').insert({
          playlist_id: playlistId,
          user_id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Someone',
          action: 'reordered the playlist'
        });
      }
      
      toast.success('Playlist order updated');
    } catch (error) {
      // Revert on error (conflict resolution)
      setItems(optimisticItems);
      toast.error('Failed to update order - changes reverted');
    }
    setDraggedIndex(null);
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update
    const itemToRemove = items.find(item => item.id === itemId);
    const optimisticItems = items.filter(item => item.id !== itemId);
    setItems(optimisticItems);
    
    try {
      await supabase.from('playlist_hooks').delete().eq('id', itemId);
      
      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('playlist_activity').insert({
          playlist_id: playlistId,
          user_id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Someone',
          action: `removed "${itemToRemove?.hooks?.title || 'a hook'}"`,
          hook_title: itemToRemove?.hooks?.title
        });
      }
      
      toast.success('Hook removed from playlist');
    } catch (error) {
      // Revert on error (conflict resolution)
      setItems(items);
      toast.error('Failed to remove hook - changes reverted');
    }
  };

  const handlePlayAll = () => {
    if (items.length === 0) {
      toast.error('No hooks in playlist to play');
      return;
    }
    
    const hooks = items.map(item => ({
      id: item.hooks.id,
      title: item.hooks.title,
      artist: item.hooks.artist || 'Unknown Artist',
      price: item.hooks.price || 0,
      genre: item.hooks.genre || 'Unknown',
      bpm: item.hooks.bpm || 0,
      duration: item.hooks.duration || '0:00',
      image: item.hooks.image || '/placeholder.svg',
      audioUrl: item.hooks.audio_url
    }));
    
    playPlaylist(hooks, 0);
    toast.success(`Playing ${items.length} hooks from playlist`);
  };





  if (!playlistId) return null;

  const isOwner = playlist?.user_id === currentUserId;

  return (
    <Dialog open={!!playlistId} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{playlist?.title}</DialogTitle>
              {playlist?.description && (
                <p className="text-sm text-muted-foreground">{playlist.description}</p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={playlist?.is_public ? "default" : "secondary"}>
                  {playlist?.is_public ? 'Public' : 'Private'}
                </Badge>
                {playlist?.allow_collaboration && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Collaborative
                  </Badge>
                )}
                {currentUserId && <PlaylistPresence playlistId={playlistId!} currentUserId={currentUserId} />}
              </div>
            </div>
            <div className="flex gap-2">
              {items.length > 0 && (
                <Button variant="default" size="sm" onClick={handlePlayAll}>
                  <Play className="h-4 w-4 mr-2" />
                  Play All
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowActivity(!showActivity)}>
                <Activity className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

          </div>
        </DialogHeader>

        {showActivity && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Recent Activity</h3>
            <PlaylistActivityFeed playlistId={playlistId!} />
          </div>
        )}

        <Tabs defaultValue="hooks" className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hooks">Hooks ({items.length})</TabsTrigger>
            <TabsTrigger value="collaborators">
              Collaborators ({collaborators.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hooks" className="space-y-4 mt-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hooks in this playlist yet</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-move"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{item.hooks?.title || 'Untitled Hook'}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4 mt-4">
            {playlist?.allow_collaboration && isOwner && (
              <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Invite Collaborator</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email or username"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={invitePermission}
                    onChange={(e) => setInvitePermission(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="view">View</option>
                    <option value="edit">Edit</option>
                    <option value="manage">Manage</option>
                  </select>
                  <Button onClick={inviteCollaborator}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>
            )}

            {collaborators.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <CollaboratorItem
                    key={collab.id}
                    collaborator={collab}
                    isOwner={isOwner}
                    onPermissionChange={updatePermission}
                    onRemove={removeCollaborator}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
