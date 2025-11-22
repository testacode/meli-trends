import type { SiteId, TrendsResponse } from '@/types/meli';
import { MeliApiClient } from './api';

/**
 * Service for MercadoLibre Trends API
 */
export class TrendsService {
  private client: MeliApiClient;

  constructor(token: string) {
    this.client = new MeliApiClient(token);
  }

  /**
   * Get trends for a specific country
   * @param siteId - The site ID (e.g., 'MLA', 'MLB')
   * @returns Array of trending products
   */
  async getTrendsByCountry(siteId: SiteId): Promise<TrendsResponse> {
    return this.client.get<TrendsResponse>(`/trends/${siteId}`);
  }

  /**
   * Get trends for a specific country and category
   * @param siteId - The site ID (e.g., 'MLA', 'MLB')
   * @param categoryId - The category ID
   * @returns Array of trending products in that category
   */
  async getTrendsByCategory(siteId: SiteId, categoryId: string): Promise<TrendsResponse> {
    return this.client.get<TrendsResponse>(`/trends/${siteId}/${categoryId}`);
  }

  /**
   * Update the token used by the service
   */
  setToken(token: string) {
    this.client.setToken(token);
  }
}

/**
 * Create a trends service instance with a token
 */
export function createTrendsService(token: string): TrendsService {
  return new TrendsService(token);
}
