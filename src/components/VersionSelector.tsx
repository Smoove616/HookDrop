import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Music, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Version {
  id: string;
  title: string;
  version_type: string;
  price: number;
  duration: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  bundle_price: number;
  discount_percentage: number;
  version_ids: string[];
}

export default function VersionSelector({ hookId }: { hookId: string }) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [hookId]);

  const loadData = async () => {
    const [versionsRes, bundlesRes] = await Promise.all([
      supabase.from('hook_versions').select('*').eq('hook_id', hookId).eq('is_active', true),
      supabase.from('version_bundles').select('*').eq('hook_id', hookId).eq('is_active', true)
    ]);

    if (versionsRes.data) setVersions(versionsRes.data);
    if (bundlesRes.data) setBundles(bundlesRes.data);
  };

  const toggleVersion = (versionId: string) => {
    setSelectedBundle(null);
    setSelectedVersions(prev =>
      prev.includes(versionId) ? prev.filter(id => id !== versionId) : [...prev, versionId]
    );
  };

  const selectBundle = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (bundle) {
      setSelectedBundle(bundleId);
      setSelectedVersions(bundle.version_ids);
    }
  };

  const getTotalPrice = () => {
    if (selectedBundle) {
      return bundles.find(b => b.id === selectedBundle)?.bundle_price || 0;
    }
    return versions.filter(v => selectedVersions.includes(v.id)).reduce((sum, v) => sum + v.price, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-version-checkout', {
      body: { hookId, versionIds: selectedVersions, bundleId: selectedBundle }
    });

    if (error) {
      toast.error('Failed to create checkout');
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div className="space-y-6">
      {bundles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Bundles</h3>
          {bundles.map(bundle => (
            <Card key={bundle.id} className={`p-4 cursor-pointer ${selectedBundle === bundle.id ? 'ring-2 ring-primary' : ''}`} onClick={() => selectBundle(bundle.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">{bundle.name}</h4>
                    <p className="text-sm text-muted-foreground">{bundle.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="mb-1">Save {bundle.discount_percentage}%</Badge>
                  <p className="text-xl font-bold">${bundle.bundle_price}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Individual Versions</h3>
        {versions.map(version => (
          <Card key={version.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={selectedVersions.includes(version.id)} onCheckedChange={() => toggleVersion(version.id)} />
                <Music className="w-6 h-6" />
                <div>
                  <h4 className="font-semibold">{version.title}</h4>
                  <p className="text-sm text-muted-foreground">{version.version_type}</p>
                </div>
              </div>
              <span className="font-bold">${version.price}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-primary/5">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="text-2xl font-bold">${getTotalPrice().toFixed(2)}</span>
        </div>
        <Button onClick={handleCheckout} disabled={selectedVersions.length === 0} className="w-full mt-4">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Purchase Selected
        </Button>
      </Card>
    </div>
  );
}
