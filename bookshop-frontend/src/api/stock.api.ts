import apiClient from './client';
import type { StockMovement, PaginatedResponse, Book } from '../types';

export const stockApi = {
  getMovements: (bookId: string, page = 1, limit = 20): Promise<PaginatedResponse<StockMovement>> =>
    apiClient.get(`/books/${bookId}/stock-movements?page=${page}&limit=${limit}`),
  adjustStock: (bookId: string, newStock: number, reason: string): Promise<Book> =>
    apiClient.post(`/books/${bookId}/stock-adjust`, { newStock, reason }),
};
