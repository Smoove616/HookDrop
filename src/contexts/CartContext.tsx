import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  hookId: string;
  hookTitle: string;
  artistName: string;
  price: number;
  licenseType: 'non_exclusive' | 'exclusive';
  sellerId: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (hookId: string, licenseType: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.hookId === item.hookId && i.licenseType === item.licenseType);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (hookId: string, licenseType: string) => {
    setItems(prev => prev.filter(i => !(i.hookId === hookId && i.licenseType === licenseType)));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
