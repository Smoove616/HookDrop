import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LyricsEditor from './LyricsEditor';

interface LyricLine { time: number; text: string; }

interface UploadModalStep1Props {
  title: string; setTitle: (v: string) => void;
  genre: string; setGenre: (v: string) => void;
  keyValue: string; setKeyValue: (v: string) => void;
  bpm: string; setBpm: (v: string) => void;
  licenseType: string; setLicenseType: (v: string) => void;
  nonExclusivePrice: string; setNonExclusivePrice: (v: string) => void;
  exclusivePrice: string; setExclusivePrice: (v: string) => void;
  licenseTerms: string; setLicenseTerms: (v: string) => void;
  file: File | null; setFile: (f: File | null) => void;
  lyrics: LyricLine[]; setLyrics: (l: LyricLine[]) => void;
  uploading: boolean; limitReached: boolean;
  uploadCount: number; uploadLimit: number;
  subscriptionTier: string;
  audioUrl?: string;
  onNext: () => void; onCancel: () => void;
}


const UploadModalStep1: React.FC<UploadModalStep1Props> = (props) => {
  return (
    <>
      {props.limitReached && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">Upload limit reached ({props.uploadCount}/{props.uploadLimit}). Upgrade to continue.</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <input type="file" accept="audio/*" onChange={(e) => props.setFile(e.target.files?.[0] || null)} className="hidden" id="audio-upload" />
          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('audio-upload')?.click()}>Choose File</Button>
          {props.file && <p className="text-sm text-green-600 mt-2">{props.file.name}</p>}
        </div>
      </div>
      <Input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Hook Title" required />
      <div className="grid grid-cols-2 gap-4">
        <Input value={props.genre} onChange={(e) => props.setGenre(e.target.value)} placeholder="Genre" required />
        <Input value={props.keyValue} onChange={(e) => props.setKeyValue(e.target.value)} placeholder="Key" required />
      </div>
      <Input type="number" value={props.bpm} onChange={(e) => props.setBpm(e.target.value)} placeholder="BPM" required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
        <select value={props.licenseType} onChange={(e) => props.setLicenseType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="both">Both</option>
          <option value="non_exclusive">Non-Exclusive</option>
          <option value="exclusive">Exclusive</option>
        </select>
      </div>
      {props.licenseType !== 'exclusive' && <Input type="number" value={props.nonExclusivePrice} onChange={(e) => props.setNonExclusivePrice(e.target.value)} placeholder="Non-Exclusive Price ($)" required />}
      {props.licenseType !== 'non_exclusive' && <Input type="number" value={props.exclusivePrice} onChange={(e) => props.setExclusivePrice(e.target.value)} placeholder="Exclusive Price ($)" required />}
      <Textarea value={props.licenseTerms} onChange={(e) => props.setLicenseTerms(e.target.value)} placeholder="License Terms (optional)" rows={3} />
      
      <LyricsEditor lyrics={props.lyrics} onLyricsChange={props.setLyrics} audioUrl={props.audioUrl} />

      
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={props.onCancel} className="flex-1">Cancel</Button>
        <Button type="button" onClick={props.onNext} disabled={props.uploading || props.limitReached || !props.file} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">{props.uploading ? 'Processing...' : 'Next'}</Button>
      </div>
    </>
  );
};

export default UploadModalStep1;
