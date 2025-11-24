import { useQuery } from "@tanstack/react-query";
import type { SiteId, HighlightsResponse } from "@/types/meli";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Hook:useBestSellers");

type UseBestSellersParams = {
  country: SiteId;
  categoryId: string | null;
  enabled?: boolean;
};

/**
 * Hook to fetch best sellers from Highlights API
 *
 * @param country - MercadoLibre site ID (MLA, MLB, etc.)
 * @param categoryId - Category ID to fetch best sellers for
 * @param enabled - Whether to enable the query (default: true if categoryId exists)
 * @returns Query result with best sellers data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBestSellers({
 *   country: 'MLA',
 *   categoryId: 'MLA1051',
 * });
 * ```
 */
export function useBestSellers({
  country,
  categoryId,
  enabled = true,
}: UseBestSellersParams) {
  return useQuery<HighlightsResponse, Error>({
    queryKey: ["best-sellers", country, categoryId],
    queryFn: async () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      logger.info(`Fetching best sellers for ${country}, category ${categoryId}`);

      const response = await fetch(
        `/api/highlights/${country}?category=${categoryId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for CloudFront blocking
        if (response.status === 403 && errorData.error?.includes("CloudFront")) {
          logger.error("🔴 CloudFront blocking detected on Highlights API", {
            status: 403,
            headers: errorData.headers,
          });
          throw new Error(
            "CloudFront blocking detected. Highlights API is blocked server-side. See console for details."
          );
        }

        logger.error("Failed to fetch best sellers", {
          status: response.status,
          error: errorData,
        });

        throw new Error(
          errorData.error || `Failed to fetch best sellers: ${response.status}`
        );
      }

      const data: HighlightsResponse = await response.json();

      // Log CloudFront status for debugging
      if (data._meta) {
        logger.info("CloudFront status", {
          status: data._meta.cloudfront_status,
          server: data._meta.server,
          tested_at: data._meta.tested_at,
        });
      }

      logger.success(`Fetched ${data.content?.length || 0} best sellers`);

      return data;
    },
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on CloudFront blocking errors
      if (error.message.includes("CloudFront blocking")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
