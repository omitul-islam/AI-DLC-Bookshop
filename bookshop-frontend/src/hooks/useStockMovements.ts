import { useState, useCallback } from 'react';
import { stockApi } from '../api/stock.api';
import type { StockMovement } from '../types';

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovements = useCallback(async (bookId: string, p = 1) => {
    setLoading(true);
    try {
      const { data, pagination } = await stockApi.getMovements(bookId, p);
      setMovements(data);
      setTotalPages(pagination.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  return { movements, loading, page, totalPages, setPage, fetchMovements };
}
