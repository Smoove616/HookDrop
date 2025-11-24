import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hookId: string;
  title: string;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ isOpen, onClose, hookId, title }) => {
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;
  
  const iframeCode = `<iframe src="${baseUrl}/embed/${hookId}" width="100%" height="200" frameborder="0" allowfullscreen></iframe>`;
  const linkCode = `${baseUrl}/hook/${hookId}`;
  const htmlCode = `<div class="hookdrop-embed"><a href="${baseUrl}/hook/${hookId}" target="_blank">${title}</a></div>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Code</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          <TabsContent value="iframe" className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <code className="text-sm text-green-400 break-all">{iframeCode}</code>
            </div>
            <Button onClick={() => copyToClipboard(iframeCode)} className="w-full bg-purple-600 hover:bg-purple-700">
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              Copy iFrame Code
            </Button>
          </TabsContent>
          <TabsContent value="link" className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <code className="text-sm text-green-400 break-all">{linkCode}</code>
            </div>
            <Button onClick={() => copyToClipboard(linkCode)} className="w-full bg-purple-600 hover:bg-purple-700">
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              Copy Link
            </Button>
          </TabsContent>
          <TabsContent value="html" className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <code className="text-sm text-green-400 break-all">{htmlCode}</code>
            </div>
            <Button onClick={() => copyToClipboard(htmlCode)} className="w-full bg-purple-600 hover:bg-purple-700">
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              Copy HTML Code
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
