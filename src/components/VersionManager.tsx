import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Upload, GitCompare, Package } from 'lucide-react';
import { toast } from 'sonner';
import VersionUploader from './VersionUploader';
import VersionComparison from './VersionComparison';
import VersionBundleCreator from './VersionBundleCreator';

interface Version {
  id: string;
  version_type: string;
  version_number: string;
  title: string;
  audio_url: string;
  duration: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export default function VersionManager({ hookId }: { hookId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showBundleCreator, setShowBundleCreator] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    loadVersions();
  }, [hookId]);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('hook_versions')
      .select('*')
      .eq('hook_id', hookId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load versions');
      return;
    }
    setVersions(data || []);
  };

  const toggleVersion = (versionId: string) => {
    setSelectedVersions(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Version Control</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Version
          </Button>
          <Button onClick={() => setShowComparison(true)} disabled={selectedVersions.length !== 2}>
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </Button>
          <Button onClick={() => setShowBundleCreator(true)}>
            <Package className="w-4 h-4 mr-2" />
            Create Bundle
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {versions.map(version => (
          <Card key={version.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedVersions.includes(version.id)}
                  onChange={() => toggleVersion(version.id)}
                  className="w-4 h-4"
                />
                <Music className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{version.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {version.version_type} • v{version.version_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={version.is_active ? 'default' : 'secondary'}>
                  {version.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="font-semibold">${version.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showUploader && (
        <VersionUploader hookId={hookId} onClose={() => { setShowUploader(false); loadVersions(); }} />
      )}
      {showComparison && (
        <VersionComparison versionIds={selectedVersions} onClose={() => setShowComparison(false)} />
      )}
      {showBundleCreator && (
        <VersionBundleCreator hookId={hookId} versions={versions} onClose={() => setShowBundleCreator(false)} />
      )}
    </div>
  );
}
