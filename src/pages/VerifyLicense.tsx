import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LicenseDetails {
  license_key: string;
  license_type: 'exclusive' | 'non_exclusive';
  purchase_date: string;
  hook_title: string;
  hook_id: string;
  buyer_email: string;
  amount: number;
  status: string;
}

export default function VerifyLicense() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  const handleVerify = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setLoading(true);
    setVerified(null);
    setLicenseDetails(null);

    try {
      // Query purchases table with license key and join with hooks
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          license_key,
          license_type,
          created_at,
          amount,
          status,
          hooks (
            id,
            title
          ),
          profiles (
            email
          )
        `)
        .eq('license_key', licenseKey.trim().toUpperCase())
        .single();

      if (error || !data) {
        setVerified(false);
        toast.error('License key not found');
      } else {
        setVerified(true);
        setLicenseDetails({
          license_key: data.license_key,
          license_type: data.license_type,
          purchase_date: data.created_at,
          hook_title: data.hooks?.title || 'Unknown',
          hook_id: data.hooks?.id || '',
          buyer_email: data.profiles?.email || 'Unknown',
          amount: data.amount,
          status: data.status
        });
        toast.success('License verified successfully');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerified(false);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 pb-24">

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-4xl font-bold mb-2">License Verification</h1>
          <p className="text-gray-600">Verify the authenticity of HookDrop licenses</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter License Key</CardTitle>
            <CardDescription>
              Enter the license key to verify its authenticity and view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={19}
              />
              <Button onClick={handleVerify} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>

        {verified !== null && (
          <Card className={verified ? 'border-green-500' : 'border-red-500'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {verified ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <CardTitle className={verified ? 'text-green-700' : 'text-red-700'}>
                    {verified ? 'License Verified' : 'Invalid License'}
                  </CardTitle>
                  <CardDescription>
                    {verified
                      ? 'This license is authentic and valid'
                      : 'This license key was not found in our database'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {verified && licenseDetails && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">License Key</p>
                    <p className="font-mono font-semibold">{licenseDetails.license_key}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Type</p>
                    <Badge variant={licenseDetails.license_type === 'exclusive' ? 'default' : 'secondary'}>
                      {licenseDetails.license_type === 'exclusive' ? 'Exclusive' : 'Non-Exclusive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hook Title</p>
                    <p className="font-semibold">{licenseDetails.hook_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-semibold">
                      {new Date(licenseDetails.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="font-semibold">${(licenseDetails.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
