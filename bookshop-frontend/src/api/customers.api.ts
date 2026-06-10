import apiClient from './client';
import type { Customer, CreateCustomerRequest, PaginatedResponse } from '../types';

export const customersApi = {
  getAll: (page = 1, limit = 20): Promise<PaginatedResponse<Customer>> =>
    apiClient.get(`/customers?page=${page}&limit=${limit}`),
  search: (query: string, page = 1, limit = 20): Promise<PaginatedResponse<Customer>> =>
    apiClient.get(`/customers/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getById: (id: string): Promise<Customer> => apiClient.get(`/customers/${id}`),
  create: (data: CreateCustomerRequest): Promise<Customer> => apiClient.post('/customers', data),
  update: (id: string, data: Partial<CreateCustomerRequest>): Promise<Customer> => apiClient.put(`/customers/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/customers/${id}`),
};
