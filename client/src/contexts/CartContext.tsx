import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  exportCart: () => string;
  importCart: (encoded: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = 'shop_cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart());

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.size === item.size);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: number, size: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId, size); return; }
    setItems(prev => prev.map(i =>
      i.productId === productId && i.size === size ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const exportCart = () => {
    return btoa(JSON.stringify(items));
  };

  const importCart = (encoded: string) => {
    try {
      const decoded = JSON.parse(atob(encoded));
      if (Array.isArray(decoded)) {
        setItems(decoded);
      }
    } catch {
      throw new Error('Invalid cart data');
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, exportCart, importCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be within CartProvider');
  return ctx;
}