import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, MonthlySales, AnalyticsSummary } from '../api/analytics.api';

export function useAnalytics() {
  const [months, setMonths] = useState<MonthlySales[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getSalesByMonth();
      setMonths(data.months);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { months, summary, loading, error, refetch: fetch };
}
