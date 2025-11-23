import type { SearchResponse, SiteId } from '@/types/meli';

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
  const variants = getKeywordVariants(keyword);

  // Try each variant until we get results
  for (const variant of variants) {
    try {
      const encodedKeyword = encodeURIComponent(variant);
      const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodedKeyword}&limit=${limit}`;

      console.log(`🔍 [CLIENT] Fetching Search API: ${url}`);

      // Direct fetch from browser - no auth needed!
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(
          `❌ [CLIENT] Search API error for "${variant}":`,
          response.status
        );
        continue; // Try next variant
      }

      const data: SearchResponse = await response.json();

      // If we got results, return them
      if (data.paging.total > 0) {
        if (variant !== keyword) {
          console.log(
            `✅ [CLIENT] Found results for "${keyword}" using variant "${variant}" (${data.paging.total} results)`
          );
        } else {
          console.log(
            `✅ [CLIENT] Found ${data.paging.total} results for "${keyword}"`
          );
        }
        return data;
      }

      console.log(`⚠️  [CLIENT] No results for variant "${variant}", trying next...`);
    } catch (error) {
      console.error(`❌ [CLIENT] Error with variant "${variant}":`, error);
      continue;
    }
  }

  // No variants worked, return empty response
  console.log(`❌ [CLIENT] No results found for "${keyword}" with any variant`);
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
