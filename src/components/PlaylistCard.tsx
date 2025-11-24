import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Lock, Users } from 'lucide-react';

interface PlaylistCardProps {
  playlist: {
    id: string;
    title: string;
    description?: string;
    is_public: boolean;
    allow_collaboration: boolean;
    item_count?: number;
    created_at: string;
  };
  onClick: () => void;
}

export default function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{playlist.title}</h3>
          {!playlist.is_public && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        {playlist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{playlist.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="h-4 w-4" />
          <span>{playlist.item_count || 0} hooks</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {playlist.is_public && <Badge variant="secondary">Public</Badge>}
        {playlist.allow_collaboration && (
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            Collaborative
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}