import { MELI_API_BASE_URL } from '@/utils/constants';
import type { ApiError } from '@/types/meli';

/**
 * Base API client for MercadoLibre
 */
export class MeliApiClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string) {
    this.baseUrl = MELI_API_BASE_URL;
    this.token = token;
  }

  /**
   * Make a GET request to MercadoLibre API
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error: ApiError = {
          message: `API request failed: ${response.statusText}`,
          error: response.statusText,
          status: response.status,
        };

        // Try to get error details from response
        try {
          const errorData = await response.json();
          error.message = errorData.message || error.message;
          error.cause = errorData.cause;
        } catch {
          // Response body is not JSON, use default error
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }

      // Network or other error
      throw {
        message: 'Network error or server unavailable',
        error: 'NETWORK_ERROR',
        status: 0,
        cause: error instanceof Error ? error.message : 'Unknown error',
      } as ApiError;
    }
  }

  /**
   * Update the token
   */
  setToken(token: string) {
    this.token = token;
  }
}
