import apiClient from './client';
import type { Order, CreateOrderRequest, PaginatedResponse } from '../types';

export const ordersApi = {
  getAll: (page = 1, limit = 20, params?: { status?: string; customerId?: string; month?: string }): Promise<PaginatedResponse<Order>> =>
    apiClient.get(`/orders?page=${page}&limit=${limit}`, { params }),
  getById: (id: string): Promise<Order> => apiClient.get(`/orders/${id}`),
  create: (data: CreateOrderRequest): Promise<Order> => apiClient.post('/orders', data),
  updateStatus: (id: string, data: { status: string }): Promise<Order> => apiClient.put(`/orders/${id}/status`, data),
};
