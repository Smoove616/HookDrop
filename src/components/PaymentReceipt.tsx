import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface PaymentReceiptProps {
  purchase: {
    id: string;
    amount: number;
    created_at: string;
    license_type: string;
    license_key?: string;
    stripe_payment_intent_id?: string;
    hooks?: {
      title: string;
      genre?: string;
    };
  };
  buyerEmail: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ purchase, buyerEmail }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${purchase.hooks?.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { color: #8b5cf6; margin: 0; }
            .section { margin: 20px 0; }
            .section h2 { font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: 600; }
            .total { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: right; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600">
          <FileText size={14} className="mr-1" />
          Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        <div id="receipt-content" className="p-6 bg-white text-black rounded">
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">HookDrop</h1>
            <p className="text-gray-600">Payment Receipt</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-sm text-gray-600 uppercase mb-2">Receipt Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Receipt #:</span>
                <span className="font-mono">{purchase.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Date:</span>
                <span>{new Date(purchase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Customer Email:</span>
                <span>{buyerEmail}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm text-gray-600 uppercase mb-2">Purchase Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Item:</span>
                <span>{purchase.hooks?.title || 'Music Hook'}</span>
              </div>
              {purchase.hooks?.genre && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Genre:</span>
                  <span>{purchase.hooks.genre}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">License Type:</span>
                <span className="capitalize">{purchase.license_type.replace('_', ' ')}</span>
              </div>
              {purchase.license_key && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">License Key:</span>
                  <span className="font-mono">{purchase.license_key}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total Paid:</span>
              <span className="text-3xl font-bold text-green-600">${purchase.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>Thank you for your purchase!</p>
            <p className="mt-2">This is an official receipt from HookDrop</p>
            {purchase.stripe_payment_intent_id && (
              <p className="mt-1 font-mono">Transaction ID: {purchase.stripe_payment_intent_id}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1 bg-purple-600 hover:bg-purple-700">
            Print Receipt
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 border-gray-600">
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
