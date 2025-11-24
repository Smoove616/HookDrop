import React, { useState } from 'react';
import { Edit2, Trash2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HookManagementCardProps {
  hook: any;
  onEdit: () => void;
  onDelete: () => void;
}

const HookManagementCard: React.FC<HookManagementCardProps> = ({ hook, onEdit, onDelete }) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('hooks')
        .delete()
        .eq('id', hook.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Hook deleted successfully' });
      onDelete();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 p-4 hover:border-purple-500 transition-all">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-bold text-lg">{hook.title}</h3>
              {!hook.is_available && (
                <Badge variant="destructive">SOLD</Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">
              {hook.genre} • {hook.key} • {hook.bpm} BPM
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={hook.license_type === 'exclusive' ? 'default' : 'secondary'}>
                {hook.license_type === 'both' ? 'Both Licenses' : 
                 hook.license_type === 'exclusive' ? 'Exclusive Only' : 'Non-Exclusive Only'}
              </Badge>
            </div>
            {hook.license_type === 'both' && (
              <p className="text-gray-500 text-xs">
                Non-Exclusive: ${hook.non_exclusive_price} • Exclusive: ${hook.exclusive_price}
              </p>
            )}
            {hook.license_type === 'non_exclusive' && (
              <p className="text-gray-500 text-xs">Price: ${hook.non_exclusive_price}</p>
            )}
            {hook.license_type === 'exclusive' && (
              <p className="text-gray-500 text-xs">Price: ${hook.exclusive_price}</p>
            )}
            <p className="text-gray-500 text-xs mt-2">{hook.plays || 0} plays</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onEdit}
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              <Edit2 size={14} className="mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Hook</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{hook.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HookManagementCard;
