import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, X } from 'lucide-react';

interface Hook {
  id: string;
  title: string;
  price_non_exclusive: number;
  price_exclusive: number;
}

export function BundleCreator() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [selectedHooks, setSelectedHooks] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
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

  const calculateBundlePrice = (type: 'non_exclusive' | 'exclusive') => {
    const total = selectedHooks.reduce((sum, id) => {
      const hook = hooks.find(h => h.id === id);
      return sum + (hook?.[`price_${type}`] || 0);
    }, 0);
    return (total * (1 - discountPercentage / 100)).toFixed(2);
  };

  const handleCreate = async () => {
    if (selectedHooks.length < 2) {
      toast({ title: 'Select at least 2 hooks', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('bundles').insert({
      title,
      description,
      hook_ids: selectedHooks,
      bundle_price_non_exclusive: parseFloat(calculateBundlePrice('non_exclusive')),
      bundle_price_exclusive: parseFloat(calculateBundlePrice('exclusive')),
      discount_percentage: discountPercentage
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error creating bundle', variant: 'destructive' });
    } else {
      toast({ title: 'Bundle created successfully!' });
      setTitle('');
      setDescription('');
      setSelectedHooks([]);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Create Bundle</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Bundle Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Premium Hook Pack" />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Discount %</Label>
          <Input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} />
        </div>

        <div>
          <Label>Select Hooks</Label>
          <div className="space-y-2 mt-2">
            {hooks.map(hook => (
              <div key={hook.id} className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedHooks.includes(hook.id)}
                  onCheckedChange={(checked) => {
                    setSelectedHooks(checked 
                      ? [...selectedHooks, hook.id]
                      : selectedHooks.filter(id => id !== hook.id)
                    );
                  }}
                />
                <span>{hook.title}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedHooks.length >= 2 && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">Bundle Pricing:</p>
            <p>Non-Exclusive: ${calculateBundlePrice('non_exclusive')}</p>
            <p>Exclusive: ${calculateBundlePrice('exclusive')}</p>
          </div>
        )}

        <Button onClick={handleCreate} disabled={loading} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Create Bundle
        </Button>
      </div>
    </Card>
  );
}
