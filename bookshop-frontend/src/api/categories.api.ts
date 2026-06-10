import apiClient from './client';
import type { Category, CreateCategoryRequest } from '../types';

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    return apiClient.get('/categories');
  },

  async getById(id: string): Promise<Category> {
    return apiClient.get(`/categories/${id}`);
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post('/categories', data);
  },

  async update(id: string, data: Partial<CreateCategoryRequest>): Promise<Category> {
    return apiClient.put(`/categories/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/categories/${id}`);
  },
};
