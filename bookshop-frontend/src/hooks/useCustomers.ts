import { useState, useCallback } from 'react';
import { customersApi } from '../api/customers.api';
import type { Customer, CreateCustomerRequest } from '../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchCustomers = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const { data, pagination } = await customersApi.getAll(p, l);
      setCustomers(data);
      setTotalPages(pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const searchCustomers = useCallback(async (query: string, p = 1, l = limit) => {
    setLoading(true);
    try {
      const { data, pagination } = await customersApi.search(query, p, l);
      setCustomers(data);
      setTotalPages(pagination.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createCustomer = useCallback(async (data: CreateCustomerRequest) => {
    const customer = await customersApi.create(data);
    return customer;
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<CreateCustomerRequest>) => {
    const customer = await customersApi.update(id, data);
    return customer;
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    await customersApi.delete(id);
  }, []);

  return { customers, loading, page, totalPages, limit, setPage, setLimit, fetchCustomers, searchCustomers, createCustomer, updateCustomer, deleteCustomer };
}
