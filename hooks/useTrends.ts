'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SiteId, TrendsResponse, ApiError } from '@/types/meli';
import { createTrendsService } from '@/services/meli/trends';

interface UseTrendsOptions {
  token: string | null;
  siteId: SiteId;
  categoryId?: string;
}

interface UseTrendsReturn {
  data: TrendsResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch trends from MercadoLibre API
 */
export function useTrends({ token, siteId, categoryId }: UseTrendsOptions): UseTrendsReturn {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTrends = useCallback(async () => {
    if (!token) {
      setError({
        message: 'No authentication token provided',
        error: 'NO_TOKEN',
        status: 401,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = createTrendsService(token);
      const trends = categoryId
        ? await service.getTrendsByCategory(siteId, categoryId)
        : await service.getTrendsByCountry(siteId);

      setData(trends);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [token, siteId, categoryId]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrends,
  };
}
