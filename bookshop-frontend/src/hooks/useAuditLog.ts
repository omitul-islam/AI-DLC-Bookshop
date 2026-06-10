import { useState, useCallback } from 'react';
import { auditApi, AuditFilters } from '../api/audit.api';
import type { AuditEntry } from '../types';

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntries = useCallback(async (filters: AuditFilters = {}) => {
    setLoading(true);
    try {
      const { data, pagination } = await auditApi.getAll({ ...filters, page, limit: 20 });
      setEntries(data);
      setTotalPages(pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { entries, loading, page, totalPages, setPage, fetchEntries };
}
