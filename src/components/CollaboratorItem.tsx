import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserMinus } from 'lucide-react';

interface CollaboratorItemProps {
  collaborator: {
    id: string;
    user_id: string;
    email: string;
    permission: 'view' | 'edit' | 'manage';
  };
  isOwner: boolean;
  onPermissionChange: (userId: string, permission: string) => void;
  onRemove: (userId: string) => void;
}

export function CollaboratorItem({ collaborator, isOwner, onPermissionChange, onRemove }: CollaboratorItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{collaborator.email[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{collaborator.email}</p>
          <p className="text-xs text-gray-500 capitalize">{collaborator.permission} access</p>
        </div>
      </div>
      
      {isOwner && (
        <div className="flex items-center gap-2">
          <Select
            value={collaborator.permission}
            onValueChange={(value) => onPermissionChange(collaborator.user_id, value)}
          >
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
              <SelectItem value="manage">Manage</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(collaborator.user_id)}
            className="h-8 w-8 p-0"
          >
            <UserMinus className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
