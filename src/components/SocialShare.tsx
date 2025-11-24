import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Link as LinkIcon, Code } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { EmbedCodeModal } from '@/components/EmbedCodeModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SocialShareProps {
  hookId: string;
  title: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ hookId, title }) => {
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const url = `${window.location.origin}/hook/${hookId}`;
  const text = `Check out this hook: ${title}`;

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard!' });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={shareToTwitter}>
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToFacebook}>
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEmbedModalOpen(true)}>
            <Code className="w-4 h-4 mr-2" />
            Embed Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EmbedCodeModal isOpen={isEmbedModalOpen} onClose={() => setIsEmbedModalOpen(false)} hookId={hookId} title={title} />
    </>
  );
};

