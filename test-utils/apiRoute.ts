/**
 * API Route Test Utilities
 *
 * Helpers for testing Next.js API routes (App Router)
 *
 * Usage:
 *   const response = await callApiRoute(GET, {
 *     params: { country: 'MLA' },
 *     searchParams: { category: 'electronics' }
 *   });
 *
 *   expect(response.status).toBe(200);
 *   const data = await response.json();
 */

import { NextRequest } from 'next/server';

type ApiRouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<Response>;

type ApiRouteOptions = {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
};

/**
 * Call an API route handler with mock request
 *
 * @param handler - The API route handler function (GET, POST, etc.)
 * @param options - Request options (params, searchParams, headers, body)
 * @returns Response from the handler
 */
export async function callApiRoute(
  handler: ApiRouteHandler,
  options: ApiRouteOptions = {}
): Promise<Response> {
  const {
    params = {},
    searchParams = {},
    headers = {},
    body,
    method = 'GET',
  } = options;

  // Build URL with search params
  const url = new URL('http://localhost:3000/api/test');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Create mock request
  const requestInit: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  const request = new NextRequest(url, requestInit);

  // Call handler with params context
  const context = Object.keys(params).length > 0 ? { params } : undefined;

  return await handler(request, context);
}

/**
 * Parse JSON response from API route
 *
 * @param response - Response from API route
 * @returns Parsed JSON data
 */
export async function parseJsonResponse<T = unknown>(
  response: Response
): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response body');
  }
  return JSON.parse(text) as T;
}

/**
 * Assert API route returns expected status and JSON
 *
 * @param handler - API route handler
 * @param options - Request options
 * @param expectedStatus - Expected HTTP status code
 * @returns Parsed JSON response
 */
export async function expectApiRoute<T = unknown>(
  handler: ApiRouteHandler,
  options: ApiRouteOptions,
  expectedStatus: number
): Promise<T> {
  const response = await callApiRoute(handler, options);

  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`
    );
  }

  return parseJsonResponse<T>(response);
}

/**
 * Mock environment variables for API route tests
 *
 * @param vars - Environment variables to mock
 * @returns Cleanup function to restore original env vars
 */
export function mockEnv(vars: Record<string, string | undefined>): () => void {
  const original: Record<string, string | undefined> = {};

  Object.entries(vars).forEach(([key, value]) => {
    original[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  return () => {
    Object.entries(original).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  };
}
