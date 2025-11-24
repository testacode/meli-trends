import { http, HttpResponse } from 'msw';
import type { SiteId } from '@/types/meli';
import {
  mockAccessToken,
  mockCategories,
  mockSearchResponse,
  mockTrends,
} from './data';

/**
 * MSW request handlers for MercadoLibre APIs
 * Uses MSW 2.0 syntax with http.get/post
 */
export const handlers = [
  /**
   * Mock MercadoLibre OAuth token endpoint
   * Used by server-side API route /api/token
   */
  http.post('https://api.mercadolibre.com/oauth/token', () => {
    return HttpResponse.json(
      {
        access_token: mockAccessToken.access_token,
        token_type: mockAccessToken.token_type,
        expires_in: mockAccessToken.expires_in,
      },
      { status: 200 }
    );
  }),

  /**
   * Mock /api/token endpoint
   * Returns a valid OAuth access token
   */
  http.get('http://localhost:3000/api/token', () => {
    return HttpResponse.json(
      {
        access_token: mockAccessToken.access_token,
        token_type: mockAccessToken.token_type,
        expires_in: mockAccessToken.expires_in,
      },
      { status: 200 }
    );
  }),

  /**
   * Mock MercadoLibre Trends API
   * Returns trending keywords for the specified country
   */
  http.get('https://api.mercadolibre.com/trends/:country', ({ params }) => {
    const { country } = params;

    // Validate country parameter
    const validSites: SiteId[] = [
      'MLA',
      'MLB',
      'MLC',
      'MLM',
      'MCO',
      'MLU',
      'MPE',
    ];
    if (!validSites.includes(country as SiteId)) {
      return HttpResponse.json(
        {
          message: 'invalid site_id',
          error: 'bad_request',
          status: 400,
        },
        { status: 400 }
      );
    }

    // Return mock trends data
    return HttpResponse.json(mockTrends, { status: 200 });
  }),

  /**
   * Mock MercadoLibre Categories API
   * Returns category tree for the specified site
   */
  http.get('https://api.mercadolibre.com/sites/:siteId/categories', ({ params }) => {
    const { siteId } = params;

    // Validate site ID
    const validSites: SiteId[] = [
      'MLA',
      'MLB',
      'MLC',
      'MLM',
      'MCO',
      'MLU',
      'MPE',
    ];
    if (!validSites.includes(siteId as SiteId)) {
      return HttpResponse.json(
        {
          message: 'invalid site_id',
          error: 'bad_request',
          status: 400,
        },
        { status: 400 }
      );
    }

    // Return mock categories data
    return HttpResponse.json(mockCategories, { status: 200 });
  }),

  /**
   * Mock /api/trends/:country/enriched endpoint (cache check)
   * Returns null by default (cache miss) - tests can override
   */
  http.get('http://localhost:3000/api/trends/:country/enriched', () => {
    return HttpResponse.json(null, {
      status: 200,
      headers: { 'X-Cache-Status': 'MISS' },
    });
  }),

  /**
   * Mock /api/trends/:country/enriched POST endpoint (cache write)
   * Returns success response - tests can override
   */
  http.post('http://localhost:3000/api/trends/:country/enriched', () => {
    return HttpResponse.json(
      { success: true, cached: true },
      { status: 200 }
    );
  }),

  /**
   * Mock /api/trends/:country endpoint
   * Returns trending keywords for the specified country
   */
  http.get('http://localhost:3000/api/trends/:country', ({ params }) => {
    const { country } = params;

    // Validate country parameter
    const validSites: SiteId[] = [
      'MLA',
      'MLB',
      'MLC',
      'MLM',
      'MCO',
      'MLU',
      'MPE',
    ];
    if (!validSites.includes(country as SiteId)) {
      return HttpResponse.json(
        {
          error: 'Invalid site ID',
          message: `Site ${country} is not supported`,
          status: 400,
        },
        { status: 400 }
      );
    }

    // Return mock trends data
    return HttpResponse.json(mockTrends, { status: 200 });
  }),

  /**
   * Mock MercadoLibre Search API
   * Handles searches for any site with query parameters
   */
  http.get(
    'https://api.mercadolibre.com/sites/:siteId/search',
    ({ params, request }) => {
      const { siteId } = params;
      const url = new URL(request.url);
      const query = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);

      // Validate site ID
      const validSites: SiteId[] = [
        'MLA',
        'MLB',
        'MLC',
        'MLM',
        'MCO',
        'MLU',
        'MPE',
      ];
      if (!validSites.includes(siteId as SiteId)) {
        return HttpResponse.json(
          {
            message: 'invalid site_id',
            error: 'bad_request',
            status: 400,
          },
          { status: 400 }
        );
      }

      // Return empty results if no query
      if (!query) {
        return HttpResponse.json(
          {
            site_id: siteId,
            query: '',
            paging: {
              total: 0,
              offset: 0,
              limit,
              primary_results: 0,
            },
            results: [],
            sort: {
              id: 'relevance',
              name: 'Más relevantes',
            },
            available_sorts: mockSearchResponse.available_sorts,
          },
          { status: 200 }
        );
      }

      // Return mock search response with query and pagination
      return HttpResponse.json(
        {
          ...mockSearchResponse,
          site_id: siteId,
          query,
          paging: {
            ...mockSearchResponse.paging,
            limit,
            offset,
          },
        },
        { status: 200 }
      );
    }
  ),

  /**
   * Mock error handler for 403 CloudFront blocking scenario
   * This can be used to test error handling in client-side API calls
   */
  http.get(
    'https://api.mercadolibre.com/sites/:siteId/search-blocked',
    () => {
      return new HttpResponse(
        '<!DOCTYPE html><html><body>Request blocked</body></html>',
        {
          status: 403,
          headers: {
            'Content-Type': 'text/html',
            'X-Cache': 'Error from cloudfront',
          },
        }
      );
    }
  ),
];
