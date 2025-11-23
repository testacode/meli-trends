import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from './route';
import * as redisModule from '@/lib/redis';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/redis', () => ({
  getCache: vi.fn(),
  setCache: vi.fn(),
}));

describe('GET /api/trends/[country]/enriched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return cached data when available', async () => {
    const mockCachedData = [
      { keyword: 'iPhone 15', url: 'https://...', products: [] },
    ];
    vi.mocked(redisModule.getCache).mockResolvedValue(mockCachedData);

    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCachedData);
    expect(response.headers.get('X-Cache-Status')).toBe('HIT');
    expect(redisModule.getCache).toHaveBeenCalledWith('enriched_trends:MLA');
  });

  it('should return null when cache miss', async () => {
    vi.mocked(redisModule.getCache).mockResolvedValue(null);

    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeNull();
    expect(response.headers.get('X-Cache-Status')).toBe('MISS');
  });

  it('should reject invalid country codes', async () => {
    const request = {} as NextRequest;
    const params = Promise.resolve({ country: 'INVALID' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid country ID' });
    expect(redisModule.getCache).not.toHaveBeenCalled();
  });
});

describe('POST /api/trends/[country]/enriched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should cache valid enriched data', async () => {
    const enrichedData = [
      { keyword: 'iPhone 15', url: 'https://...', products: [] },
      { keyword: 'Samsung Galaxy', url: 'https://...', products: [] },
    ];

    vi.mocked(redisModule.setCache).mockResolvedValue(undefined);

    const request = {
      json: async () => enrichedData,
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, cached: true });
    expect(redisModule.setCache).toHaveBeenCalledWith(
      'enriched_trends:MLA',
      enrichedData,
      3600
    );
  });

  it('should reject non-array data', async () => {
    const request = {
      json: async () => ({ invalid: 'data' }),
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'MLA' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid data format' });
    expect(redisModule.setCache).not.toHaveBeenCalled();
  });

  it('should reject invalid country codes', async () => {
    const request = {
      json: async () => [],
    } as unknown as NextRequest;
    const params = Promise.resolve({ country: 'INVALID' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid country ID' });
    expect(redisModule.setCache).not.toHaveBeenCalled();
  });
});
