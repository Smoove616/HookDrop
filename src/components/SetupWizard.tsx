import { useState, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { saveSupabaseConfig } from '@/lib/setupConfig';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // Auto-complete setup if .env credentials exist
  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // Credentials exist in .env, auto-test connection
      const autoTest = async () => {
        setTesting(true);
        const testClient = createClient(
          import.meta.env.VITE_SUPABASE_URL, 
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        
        try {
          const { error: testError } = await testClient.from('hooks').select('count').limit(1);
          
          if (!testError) {
            saveSupabaseConfig({ 
              url: import.meta.env.VITE_SUPABASE_URL, 
              anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY 
            });
            onComplete();
            window.location.reload();
          } else {
            setError(testError.message || 'Connection failed');
            setTesting(false);
          }
        } catch (err: any) {
          setError(err.message || 'Connection failed');
          setTesting(false);
        }
      };
      autoTest();
    }
  }, []);



  const testConnection = async () => {
    setTesting(true);
    setError('');
    setProgress(25);

    try {
      const testClient = createClient(url, anonKey);
      setProgress(50);
      
      const { error: testError } = await testClient.from('hooks').select('count').limit(1);
      setProgress(75);
      
      if (testError) throw testError;
      
      setProgress(100);
      return true;
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      return false;
    } finally {
      setTesting(false);
    }
  };

  const handleTest = async () => {
    const success = await testConnection();
    if (success) setStep(2);
  };

  const handleComplete = () => {
    saveSupabaseConfig({ url, anonKey });
    onComplete();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to HookDrop</CardTitle>
          <CardDescription>Let's set up your Supabase connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">Supabase Project URL</Label>
                  <Input
                    id="url"
                    placeholder="https://xxxxx.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="key">Supabase Anon Key</Label>
                  <Input
                    id="key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                  />
                </div>
              </div>

              {testing && <Progress value={progress} />}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleTest} disabled={!url || !anonKey || testing} className="w-full">
                {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : 'Test Connection'}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Connection successful!</AlertDescription>
              </Alert>
              <Button onClick={handleComplete} className="w-full">Complete Setup</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
