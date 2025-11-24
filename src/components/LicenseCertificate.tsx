import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LicenseCertificateProps {
  hookTitle: string;
  sellerName: string;
  buyerEmail: string;
  licenseType: string;
  licenseKey: string;
  price: number;
  purchaseDate: string;
  terms?: string;
}

export function LicenseCertificate({
  hookTitle,
  sellerName,
  buyerEmail,
  licenseType,
  licenseKey,
  price,
  purchaseDate,
  terms
}: LicenseCertificateProps) {
  const downloadCertificate = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .certificate { border: 3px solid #8B5CF6; padding: 40px; background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%); }
    .header { text-align: center; margin-bottom: 30px; }
    .title { font-size: 32px; font-weight: bold; color: #8B5CF6; margin-bottom: 10px; }
    .subtitle { font-size: 18px; color: #6B7280; }
    .content { margin: 20px 0; line-height: 1.8; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #1F2937; }
    .license-key { background: #FEF3C7; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; margin: 20px 0; text-align: center; font-weight: bold; }
    .terms { margin-top: 30px; padding: 20px; background: white; border-radius: 8px; font-size: 12px; }
    .footer { margin-top: 30px; text-align: center; color: #6B7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="title">🎵 LICENSE CERTIFICATE</div>
      <div class="subtitle">HookDrop Marketplace</div>
    </div>
    <div class="content">
      <div class="field"><span class="label">Hook Title:</span> <span class="value">${hookTitle}</span></div>
      <div class="field"><span class="label">License Type:</span> <span class="value">${licenseType.toUpperCase()}</span></div>
      <div class="field"><span class="label">Seller:</span> <span class="value">${sellerName}</span></div>
      <div class="field"><span class="label">Licensee:</span> <span class="value">${buyerEmail}</span></div>
      <div class="field"><span class="label">Purchase Amount:</span> <span class="value">$${price.toFixed(2)}</span></div>
      <div class="field"><span class="label">Issue Date:</span> <span class="value">${new Date(purchaseDate).toLocaleDateString()}</span></div>
      <div class="license-key">LICENSE KEY: ${licenseKey}</div>
      <div class="terms">
        <strong>License Terms:</strong><br/><br/>
        ${terms || 'Standard license terms apply. This license grants you the right to use the audio hook according to the license type purchased.'}
      </div>
    </div>
    <div class="footer">
      This certificate serves as proof of license ownership.<br/>
      Verify at hookdrop.com with license key: ${licenseKey}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-${licenseKey}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={downloadCertificate} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      Download Certificate
    </Button>
  );
}
