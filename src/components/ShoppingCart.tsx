import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: items.map(item => ({
            hookId: item.hookId,
            hookTitle: item.hookTitle,
            price: item.price,
            sellerId: item.sellerId,
            licenseType: item.licenseType
          }))
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error('Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag size={24} />
            Cart ({items.length})
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11 sm:h-10 sm:w-10">
            <X size={24} />
          </Button>
        </div>


        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.hookId}-${item.licenseType}-${idx}`} className="bg-gray-800 rounded-lg p-3">
                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.hookTitle} className="w-16 h-16 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{item.hookTitle}</h3>
                    <p className="text-gray-400 text-xs">{item.artistName}</p>
                    <p className="text-purple-400 text-xs capitalize">{item.licenseType.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${item.price}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                      onClick={() => removeFromCart(item.hookId, item.licenseType)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-700 p-4 space-y-3">
            <div className="flex justify-between text-white">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? 'Processing...' : 'Checkout'}
            </Button>
            <Button variant="outline" onClick={clearCart} className="w-full">
              Clear Cart
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export { ShoppingCart };
export default ShoppingCart;
