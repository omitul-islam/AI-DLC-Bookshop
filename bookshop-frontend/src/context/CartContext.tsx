import { createContext, useContext, useState, type ReactNode } from 'react';
import { useCart } from '../hooks/useCart';
import { useToast } from './ToastContext';
import type { CartItem } from '../types';

interface CartContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((v) => !v);

  const handleAddItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    addItem(item, qty);
    showToast('success', `Added "${item.title}" to cart`);
  };

  const handleRemoveItem = (bookId: string) => {
    removeItem(bookId);
    showToast('info', 'Removed from cart');
  };

  return (
    <CartContext.Provider value={{
      isOpen, openCart, closeCart, toggleCart,
      items: cart.items, totalItems, subtotal,
      addItem: handleAddItem, removeItem: handleRemoveItem,
      updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
