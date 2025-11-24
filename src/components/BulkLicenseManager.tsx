import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, DollarSign, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Hook {
  id: string;
  title: string;
  price_non_exclusive: number;
  price_exclusive: number;
}

export function BulkLicenseManager() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHooks();
  }, []);

  const loadHooks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('hooks')
      .select('id, title, price_non_exclusive, price_exclusive')
      .eq('user_id', user.id);

    
    if (data) setHooks(data);
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-licenses-csv');
      
      if (error) throw error;

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `licenses-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      toast({ title: 'CSV exported successfully!' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleBulkPriceUpdate = async (hookId: string, nonExclusive: number, exclusive: number) => {
    const { error } = await supabase
      .from('hooks')
      .update({ 
        price_non_exclusive: nonExclusive,
        price_exclusive: exclusive 
      })
      .eq('id', hookId);

    if (error) {
      toast({ title: 'Update failed', variant: 'destructive' });
    } else {
      toast({ title: 'Prices updated!' });
      loadHooks();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Bulk License Management</h2>
          </div>
          <Button onClick={handleExportCSV} disabled={loading}>
            <Download className="mr-2 h-4 w-4" /> Export All Licenses
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-6 w-6" />
          <h3 className="text-xl font-bold">Bulk Pricing Updates</h3>
        </div>
        <div className="space-y-4">
          {hooks.map(hook => (
            <div key={hook.id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">{hook.title}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Non-Exclusive Price</Label>
                  <Input 
                    type="number" 
                    defaultValue={hook.price_non_exclusive}
                    onBlur={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      if (newPrice !== hook.price_non_exclusive) {
                        handleBulkPriceUpdate(hook.id, newPrice, hook.price_exclusive);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Exclusive Price</Label>
                  <Input 
                    type="number" 
                    defaultValue={hook.price_exclusive}
                    onBlur={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      if (newPrice !== hook.price_exclusive) {
                        handleBulkPriceUpdate(hook.id, hook.price_non_exclusive, newPrice);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
