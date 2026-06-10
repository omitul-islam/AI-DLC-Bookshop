import { useState, useCallback, useEffect } from 'react';
import type { Cart, CartItem } from '../types';

const STORAGE_KEY = 'bookshop-cart';

function loadCart(): Cart {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { items: [], updatedAt: new Date().toISOString() };
}

function saveCart(cart: Cart) {
  cart.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(loadCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.bookId === item.bookId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.bookId === item.bookId ? { ...i, quantity: i.quantity + qty } : i
          ),
        };
      }
      return { ...prev, items: [...prev.items, { ...item, quantity: qty }] };
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.bookId !== bookId),
    }));
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity <= 0) {
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.bookId === bookId ? { ...i, quantity } : i
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], updatedAt: new Date().toISOString() });
  }, []);

  return { cart, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart };
}
