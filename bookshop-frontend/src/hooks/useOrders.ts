import { useState, useCallback } from 'react';
import { ordersApi } from '../api/orders.api';
import type { Order, CreateOrderRequest } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchOrders = useCallback(async (p = page, l = limit, params?: { status?: string; customerId?: string }) => {
    setLoading(true);
    try {
      const { data, pagination } = await ordersApi.getAll(p, l, params);
      setOrders(data);
      setTotalPages(pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createOrder = useCallback(async (data: CreateOrderRequest) => {
    const order = await ordersApi.create(data);
    return order;
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    const order = await ordersApi.updateStatus(id, { status });
    return order;
  }, []);

  return { orders, loading, page, totalPages, limit, setPage, setLimit, fetchOrders, createOrder, updateOrderStatus };
}
