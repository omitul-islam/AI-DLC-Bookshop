import { useEffect } from 'react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartContext } from '../../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart, checkout } = useCartContext();
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[420px] max-w-full bg-white shadow-modal h-full flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 flex items-center justify-center text-white">
              <ShoppingCartIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Shopping Cart</h2>
              <p className="text-xs text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500">Add some books to get started.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.bookId} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-12 h-16 shrink-0 rounded-md bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 overflow-hidden">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      item.title.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.author}</p>
                    {item.categoryName && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                        {item.categoryName}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.bookId)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="text-gray-700">{totalItems}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => checkout('6c616af5-1073-4087-98d4-f28cb97a36d6')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 transition-all"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
