'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SiteId, TrendsResponse, ApiError } from '@/types/meli';

interface UseTrendsOptions {
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
 * Hook to fetch trends from internal API
 * No authentication required from user - handled server-side
 */
export function useTrends({ siteId, categoryId }: UseTrendsOptions): UseTrendsReturn {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Call internal API route (authentication handled server-side)
      const endpoint = categoryId
        ? `/api/trends/${siteId}/${categoryId}`
        : `/api/trends/${siteId}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Failed to fetch trends',
          error: 'API_ERROR',
          status: response.status,
        } as ApiError;
      }

      const trends = await response.json();
      setData(trends);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [siteId, categoryId]);

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
