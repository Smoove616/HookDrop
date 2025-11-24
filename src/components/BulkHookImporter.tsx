import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload, FileText, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const BulkHookImporter: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setResult(null);
    } else {
      toast({ title: 'Invalid file', description: 'Please upload a CSV file', variant: 'destructive' });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => 
      f.type === 'audio/mpeg' || f.type === 'audio/wav' || f.name.endsWith('.mp3') || f.name.endsWith('.wav')
    );
    
    if (validFiles.length !== files.length) {
      toast({ title: 'Invalid files', description: 'Only MP3 and WAV files allowed', variant: 'destructive' });
    }
    
    setAudioFiles(validFiles);
    setResult(null);
  };

  const processBulkImport = async () => {
    if (!csvFile || audioFiles.length === 0) {
      toast({ title: 'Missing files', description: 'Upload both CSV and audio files', variant: 'destructive' });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const csvText = await csvFile.text();
      const formData = new FormData();
      formData.append('csv', csvText);
      
      audioFiles.forEach((file, idx) => {
        formData.append(`audio_${idx}`, file);
      });

      const { data, error } = await supabase.functions.invoke('process-bulk-hooks', {
        body: formData
      });

      if (error) throw error;

      setResult(data);
      setProgress(100);
      
      if (data.success > 0) {
        toast({ title: 'Import complete', description: `${data.success} hooks imported successfully` });
      }
      
      if (data.failed > 0) {
        toast({ title: 'Some imports failed', description: `${data.failed} hooks failed`, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Bulk Hook Importer</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2 flex items-center gap-2">
            <FileText size={20} />
            CSV Metadata File
          </label>
          <Input type="file" accept=".csv" onChange={handleCsvUpload} className="bg-gray-700 text-white" />
          {csvFile && <p className="text-green-400 text-sm mt-2">{csvFile.name}</p>}
        </div>

        <div>
          <label className="block text-white mb-2 flex items-center gap-2">
            <Music size={20} />
            Audio Files (MP3/WAV)
          </label>
          <Input type="file" accept=".mp3,.wav" multiple onChange={handleAudioUpload} className="bg-gray-700 text-white" />
          {audioFiles.length > 0 && <p className="text-green-400 text-sm mt-2">{audioFiles.length} files selected</p>}
        </div>

        {importing && <Progress value={progress} className="w-full" />}

        <Button onClick={processBulkImport} disabled={importing || !csvFile || audioFiles.length === 0} 
          className="w-full bg-purple-600 hover:bg-purple-700">
          <Upload className="mr-2" size={20} />
          {importing ? 'Importing...' : 'Import Hooks'}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>{result.success} hooks imported</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span>{result.failed} hooks failed</span>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="bg-red-900/20 p-3 rounded text-sm text-red-300 max-h-40 overflow-y-auto">
                {result.errors.map((err, idx) => <div key={idx}>{err}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
