import { useState, useCallback } from 'react';
import { booksApi } from '../api/books.api';
import type { Book, CreateBookRequest } from '../types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchBooks = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const { data, pagination } = await booksApi.getAll(p, l);
      setBooks(data);
      setTotalPages(pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const searchBooks = useCallback(async (query: string, p = 1, l = limit) => {
    setLoading(true);
    try {
      const { data, pagination } = await booksApi.search(query, p, l);
      setBooks(data);
      setTotalPages(pagination.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createBook = useCallback(async (data: CreateBookRequest) => {
    const book = await booksApi.create(data);
    return book;
  }, []);

  const updateBook = useCallback(async (id: string, data: Partial<CreateBookRequest>) => {
    const book = await booksApi.update(id, data);
    return book;
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await booksApi.delete(id);
  }, []);

  return { books, loading, page, totalPages, limit, setPage, setLimit, fetchBooks, searchBooks, createBook, updateBook, deleteBook };
}
