import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '../context/ToastContext';
import { Table, type Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SearchInput } from '../components/common/SearchInput';
import { Card } from '../components/common/Card';
import { PageHeader } from '../layouts/PageHeader';
import { Modal } from '../components/common/Modal';
import { PageLoading } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { exportApi } from '../api/export.api';
import type { Customer } from '../types';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number too short').regex(/^\+?[\d\s\-()]+$/, 'Invalid phone format'),
  address: z.string().max(500).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const { customers, loading, page, totalPages, limit, setPage, setLimit, fetchCustomers, searchCustomers, createCustomer } = useCustomers();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) });

  useEffect(() => { fetchCustomers(page, limit); }, [fetchCustomers, page, limit]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
    if (value.trim()) {
      searchCustomers(value);
    } else {
      fetchCustomers();
    }
  }, [searchCustomers, fetchCustomers, setPage]);

  const openAddModal = () => {
    reset({ name: '', email: '', phone: '', address: '' });
    setModalOpen(true);
  };

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    try {
      await createCustomer(data);
      showToast('success', 'Customer added successfully');
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name', label: 'Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-semibold">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'email', label: 'Email',
      render: (c) => <span className="text-gray-600">{c.email}</span>,
    },
    {
      key: 'phone', label: 'Phone',
      render: (c) => <span className="font-mono text-sm text-gray-600">{c.phone}</span>,
    },
    {
      key: 'createdAt', label: 'Added',
      render: (c) => <span className="text-gray-500 text-sm">{new Date(c.createdAt).toLocaleDateString()}</span>,
    },
  ];

  if (loading && customers.length === 0) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportApi.downloadCsv('customers')}>
              <ArrowDownTrayIcon className="w-4 h-4" />Export CSV
            </Button>
            <Button onClick={openAddModal}><PlusIcon className="w-4 h-4" />Add Customer</Button>
          </div>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      {customers.length === 0 && searchQuery ? (
        <Card>
          <EmptyState
            icon={<MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />}
            title="No results found"
            message={`No customers matching "${searchQuery}". Try a different search term.`}
          />
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            data={customers}
            keyExtractor={(c) => c.id}
            emptyMessage="No customers yet. Add your first customer to get started."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} loading={loading} />
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer" size="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register('name')} error={errors.name?.message} required placeholder="Full name" />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required placeholder="email@example.com" />
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} required placeholder="+1 (555) 123-4567" />
          <Input label="Address" {...register('address')} error={errors.address?.message} placeholder="Optional" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
