import { createContext, useContext, useState, type ReactNode } from 'react';
import { useCart } from '../hooks/useCart';
import { useToast } from './ToastContext';
import { cartApi } from '../api/cart.api';
import { ordersApi } from '../api/orders.api';
import { paymentApi, type InitiatePaymentRequest } from '../api/payment.api';
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
  checkout: (customerId: string) => Promise<void>;
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

  const handleCheckout = async (customerId: string) => {
    try {
      if (cart.items.length === 0) {
        showToast('error', 'Cart is empty');
        return;
      }

      const checkoutRequest = {
        customerId,
        items: cart.items.map(item => ({ bookId: item.bookId, quantity: item.quantity })),
      };

      const checkoutResult = await cartApi.checkout(checkoutRequest);
      showToast('success', `Checkout created! Total: $${checkoutResult.totalPrice.toFixed(2)}`);

      const firstItem = cart.items[0];
      const order = await ordersApi.create({
        customerId,
        bookId: firstItem.bookId,
        quantity: firstItem.quantity,
      });

      const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
      const paymentRequest: InitiatePaymentRequest = {
        orderId: order.id,
        successUrl: `${baseUrl}/payment/success`,
        failUrl: `${baseUrl}/payment/failed`,
        cancelUrl: `${baseUrl}/payment/cancelled`,
        ipnUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/payment/ipn`,
      };

      const paymentResult = await paymentApi.initiate(paymentRequest);
      closeCart();
      clearCart();
      window.location.href = paymentResult.gatewayPageURL;
    } catch (error: any) {
      showToast('error', error.message || 'Checkout failed');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      isOpen, openCart, closeCart, toggleCart,
      items: cart.items, totalItems, subtotal,
      addItem: handleAddItem, removeItem: handleRemoveItem,
      updateQuantity, clearCart, checkout: handleCheckout,
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
