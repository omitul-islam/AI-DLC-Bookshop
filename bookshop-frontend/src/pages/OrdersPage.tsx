import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusIcon, FunnelIcon, ClipboardDocumentListIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useOrders } from '../hooks/useOrders';
import { useBooks } from '../hooks/useBooks';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { PageHeader } from '../layouts/PageHeader';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageLoading } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { exportApi } from '../api/export.api';
import type { Order, OrderStatus } from '../types';

const orderSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  bookId: z.string().min(1, 'Please select a book'),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'Quantity must be at least 1'),
});

type OrderFormData = z.infer<typeof orderSchema>;

const filters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
] as const;

export default function OrdersPage() {
  const { orders, loading, page, totalPages, limit, setPage, setLimit, fetchOrders, createOrder, updateOrderStatus } = useOrders();
  const { books, fetchBooks } = useBooks();
  const { customers, fetchCustomers } = useCustomers();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ order: Order; nextStatus: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const {
    register, handleSubmit, reset, watch, formState: { errors },
  } = useForm<OrderFormData>({ resolver: zodResolver(orderSchema) });

  const selectedBookId = watch('bookId');
  const selectedQuantity = watch('quantity');
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const totalPrice = selectedBook ? selectedBook.price * (selectedQuantity || 0) : 0;
  const stockError = selectedBook && selectedQuantity > selectedBook.stock;

  useEffect(() => {
    fetchOrders(page, limit, statusFilter ? { status: statusFilter } : undefined);
    fetchBooks();
    fetchCustomers();
  }, [fetchOrders, fetchBooks, fetchCustomers, page, limit, statusFilter]);

  const openCreateModal = () => {
    reset({ customerId: '', bookId: '', quantity: 1 });
    setModalOpen(true);
  };

  const onSubmit = async (data: OrderFormData) => {
    if (stockError) {
      showToast('error', `Only ${selectedBook!.stock} units available`);
      return;
    }
    setSubmitting(true);
    try {
      await createOrder(data);
      showToast('success', 'Order created successfully');
      setModalOpen(false);
      fetchOrders();
      fetchBooks();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await updateOrderStatus(confirmTarget.order.id, confirmTarget.nextStatus);
      showToast('success', `Order marked as ${confirmTarget.nextStatus}`);
      setConfirmTarget(null);
      fetchOrders();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status');
    } finally {
      setConfirmLoading(false);
    }
  };

  const allowedNextStatus = (status: OrderStatus): string | null => {
    if (status === 'pending') return 'shipped';
    if (status === 'shipped') return 'delivered';
    return null;
  };

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id.slice(0, 8);
  const getBookTitle = (id: string) => books.find((b) => b.id === id)?.title ?? id.slice(0, 8);

  if (loading && orders.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Orders"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportApi.downloadCsv('orders', statusFilter ? { status: statusFilter } : undefined)}>
              <ArrowDownTrayIcon className="w-4 h-4" />Export CSV
            </Button>
            <Button onClick={openCreateModal}><PlusIcon className="w-4 h-4" />Create Order</Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-4 h-4 text-gray-400" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              statusFilter === f.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />}
          title={statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
          message={statusFilter ? `No orders with status "${statusFilter}".` : 'Create your first order to get started.'}
          action={statusFilter ? undefined : { label: 'Create Order', onClick: openCreateModal }}
        />
      ) : (
        <div>
          <div className="grid gap-4 mb-4">
            {filteredOrders.map((order) => {
              const next = allowedNextStatus(order.status);
              return (
                <Card key={order.id} hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        #{order.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Customer</span>
                      <p className="text-gray-900 font-medium mt-0.5">{getCustomerName(order.customerId)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Book</span>
                      <p className="text-gray-900 mt-0.5">{getBookTitle(order.bookId)} × {order.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Created</span>
                      <p className="text-gray-600 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {next && (
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant={next === 'shipped' ? 'primary' : 'secondary'}
                        onClick={() => setConfirmTarget({ order, nextStatus: next })}
                      >
                        Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} loading={loading} />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Order" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Customer"
            placeholder="Select a customer..."
            options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.email}` }))}
            error={errors.customerId?.message}
            required
            {...register('customerId')}
          />

          <Select
            label="Book"
            placeholder="Select a book..."
            options={books.map((b) => ({ value: b.id, label: `${b.title} — $${b.price.toFixed(2)} (${b.stock} in stock)` }))}
            error={errors.bookId?.message}
            required
            {...register('bookId')}
          />

          {selectedBook && (
            <Alert
              variant={selectedBook.stock === 0 ? 'error' : 'info'}
              title={`Available stock: ${selectedBook.stock} ${selectedBook.stock === 1 ? 'unit' : 'units'}`}
            />
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity *</label>
            <input
              type="number"
              min={1}
              max={selectedBook?.stock || 1}
              {...register('quantity')}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.quantity ? 'border-error' : 'border-gray-300'} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
            />
            {errors.quantity && <p className="text-xs text-error mt-1">{errors.quantity.message}</p>}
          </div>

          {stockError && (
            <Alert
              variant="error"
              title={`Only ${selectedBook!.stock} units available`}
            />
          )}

          {selectedBook && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Price</span>
                <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} disabled={stockError}>Create Order</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        message={`Mark order #${confirmTarget?.order.id.slice(0, 8)} as "${confirmTarget?.nextStatus}"?`}
        confirmText="Confirm"
        variant="primary"
        loading={confirmLoading}
      />
    </div>
  );
}
