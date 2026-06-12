// Reference: context/06-contracts/01-apis/rest/*.yaml
// Types matching OpenAPI contracts

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryId: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryId: string;
  coverUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  customerId: string;
  bookId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  bookId: string;
  quantity: number;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StockMovement {
  id: string;
  bookId: string;
  oldStock: number;
  newStock: number;
  quantity: number;
  reason: 'order_deduction' | 'manual_restock' | 'manual_adjustment' | 'correction' | 'cancellation';
  referenceId?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  entityType: 'book' | 'customer' | 'order';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  previousState?: any;
  newState?: any;
  performedBy: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverUrl?: string;
  categoryName?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export interface CartValidateRequest {
  items: { bookId: string; quantity: number }[];
}

export interface CartValidateResponse {
  valid: boolean;
  errors: { bookId: string; title: string; requested: number; available: number }[];
}

export interface CheckoutRequest {
  customerId: string;
  items: { bookId: string; quantity: number }[];
}

export interface CheckoutResponse {
  checkoutId: string;
  status: string;
  totalPrice: number;
  items: { bookId: string; title: string; quantity: number; unitPrice: number; subtotal: number }[];
  createdAt: string;
}
