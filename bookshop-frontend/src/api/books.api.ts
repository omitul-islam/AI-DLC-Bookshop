import apiClient from './client';
import type { Book, CreateBookRequest, PaginatedResponse } from '../types';

export const booksApi = {
  getAll: (page = 1, limit = 20): Promise<PaginatedResponse<Book>> =>
    apiClient.get(`/books?page=${page}&limit=${limit}`),
  search: (query: string, page = 1, limit = 20): Promise<PaginatedResponse<Book>> =>
    apiClient.get(`/books/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getById: (id: string): Promise<Book> => apiClient.get(`/books/${id}`),
  create: (data: CreateBookRequest): Promise<Book> => apiClient.post('/books', data),
  update: (id: string, data: Partial<CreateBookRequest>): Promise<Book> => apiClient.put(`/books/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/books/${id}`),
  uploadCover: (id: string, file: File): Promise<{ coverUrl: string; book: Book }> => {
    const formData = new FormData();
    formData.append('cover', file);
    return apiClient.post(`/books/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
