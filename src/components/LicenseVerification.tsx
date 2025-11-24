import { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

export function LicenseVerification() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verifyLicense = async () => {
    if (!licenseKey.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          hook:hooks(title, genre),
          buyer:buyer_id(email),
          seller:user_id(email)

        `)
        .eq('license_key', licenseKey.trim().toUpperCase())
        .single();

      if (error || !data) {
        setResult({ valid: false });
      } else {
        setResult({ valid: true, data });
      }
    } catch (err) {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Verify License Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter license key (e.g., ABCD-1234-EFGH-5678)"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button onClick={verifyLicense} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg border-2 ${
              result.valid 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              {result.valid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Valid License
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Hook:</strong> {result.data.hook.title}</div>
                    <div><strong>Genre:</strong> {result.data.hook.genre}</div>
                    <div>
                      <strong>License Type:</strong>{' '}
                      <Badge variant={result.data.license_type === 'exclusive' ? 'default' : 'secondary'}>
                        {result.data.license_type}
                      </Badge>
                    </div>
                    <div><strong>Purchase Date:</strong> {new Date(result.data.created_at).toLocaleDateString()}</div>
                    <div><strong>Amount:</strong> ${result.data.amount.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <XCircle className="w-5 h-5" />
                  Invalid License Key
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
