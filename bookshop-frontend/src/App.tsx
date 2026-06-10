import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider, useCartContext } from './context/CartContext';
import { CartDrawer } from './components/cart/CartDrawer';
import { MainLayout } from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import CustomersPage from './pages/CustomersPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import ContextPage from './pages/ContextPage';
import AuditLogPage from './pages/AuditLogPage';

function CartDrawerWrapper() {
  const { isOpen, closeCart, items, totalItems, subtotal, updateQuantity, removeItem, clearCart } = useCartContext();
  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={closeCart}
      items={items}
      totalItems={totalItems}
      subtotal={subtotal}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onClear={clearCart}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="context" element={<ContextPage />} />
            </Route>
          </Routes>
          <CartDrawerWrapper />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
