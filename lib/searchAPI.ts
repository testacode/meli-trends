import type { SearchResponse, SiteId } from '@/types/meli';
import { createLogger, startTimer, sanitizeUrl } from '@/lib/logger';

const logger = createLogger('External:SearchAPI');

/**
 * Simplify keyword for better search results
 * Examples:
 * - "black edition 4x4" -> "black edition 4x4" (try exact first)
 * - If no results -> "black edition" (remove last word)
 * - If still no results -> "black" (first significant word)
 *
 * Exported for testing purposes
 */
export function getKeywordVariants(keyword: string): string[] {
  const variants: string[] = [keyword]; // Start with exact keyword

  // Split into words and remove common filler words
  const words = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2) // Remove very short words
    .filter((w) => !['de', 'la', 'el', 'los', 'las', 'con', 'para'].includes(w));

  // Add progressively shorter variants
  if (words.length > 2) {
    // Try first 2-3 words
    variants.push(words.slice(0, 3).join(' '));
    variants.push(words.slice(0, 2).join(' '));
  }

  if (words.length > 1) {
    // Try first word if it's meaningful
    const firstWord = words[0];
    if (firstWord.length > 3) {
      variants.push(firstWord);
    }
  }

  return [...new Set(variants)]; // Remove duplicates
}

/**
 * Fetch search results directly from MercadoLibre Search API (public, no auth needed)
 * This runs CLIENT-SIDE to avoid CloudFront blocking server IPs
 *
 * @param siteId - MercadoLibre site ID (MLA, MLB, etc.)
 * @param keyword - Search keyword
 * @param limit - Number of results to return (default: 3)
 * @returns SearchResponse with products or empty response if all variants fail
 */
export async function fetchSearchDirect(
  siteId: SiteId,
  keyword: string,
  limit: number = 3
): Promise<SearchResponse> {
  const timer = startTimer();
  const variants = getKeywordVariants(keyword);

  logger.info(`Searching for "${keyword}" (${variants.length} variants to try)`);

  // Try each variant until we get results
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const isLastVariant = i === variants.length - 1;

    logger.info(`Trying variant ${i + 1}/${variants.length}: "${variant}"`);

    const encodedKeyword = encodeURIComponent(variant);
    const searchUrl = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodedKeyword}&limit=${limit}`;

    try {
      const fetchTimer = startTimer();
      // Direct fetch from browser - no auth needed!
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        logger.warn(
          `Rate limited (429) on variant "${variant}"`,
          fetchTimer.end()
        );
        // Continue to next variant
        continue;
      }

      if (response.status === 403) {
        const cacheHeader = response.headers.get('x-cache');
        logger.error(
          `CloudFront blocking detected (403)`,
          undefined,
          {
            variant,
            'x-cache': cacheHeader,
            url: sanitizeUrl(searchUrl),
            ...fetchTimer.end(),
          }
        );
        // Continue to next variant
        continue;
      }

      if (!response.ok) {
        logger.error(
          `Search API failed with status ${response.status}`,
          undefined,
          { variant, url: sanitizeUrl(searchUrl), ...fetchTimer.end() }
        );

        if (isLastVariant) {
          throw new Error(
            `Search API failed for all variants: ${response.status} ${response.statusText}`
          );
        }
        continue;
      }

      const data: SearchResponse = await response.json();

      // If we got results, return them
      if (data.paging.total > 0) {
        logger.success(
          `Search completed: ${data.paging.total} products (variant: "${variant}")`,
          { ...timer.end(), fetchDuration: fetchTimer.end().formatted }
        );
        return data;
      }

      logger.warn(`No results for variant "${variant}", trying next`);
    } catch (error) {
      logger.error(
        `Search request failed for variant "${variant}"`,
        error instanceof Error ? error : new Error(String(error)),
        { url: sanitizeUrl(searchUrl) }
      );

      if (isLastVariant) {
        throw error;
      }
    }
  }

  // No variants worked, return empty response
  logger.warn(
    `All ${variants.length} variants exhausted, returning empty results`,
    timer.end()
  );

  return {
    site_id: siteId,
    query: keyword,
    paging: {
      total: 0,
      offset: 0,
      limit,
      primary_results: 0,
    },
    results: [],
    sort: { id: 'relevance', name: 'Relevance' },
    available_sorts: [],
  };
}
