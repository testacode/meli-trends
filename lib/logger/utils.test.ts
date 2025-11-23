import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startTimer, formatDuration, sanitizeUrl } from './utils';

describe('startTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track elapsed time in milliseconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(245);
    const result = timer.end();

    expect(result.duration).toBe(245);
    expect(result.formatted).toBe('245ms');
  });

  it('should format durations under 1000ms as milliseconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(850);
    const result = timer.end();

    expect(result.formatted).toBe('850ms');
  });

  it('should format durations over 1000ms as seconds', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(1234);
    const result = timer.end();

    expect(result.formatted).toBe('1.2s');
  });

  it('should format durations over 1000ms with one decimal', () => {
    const timer = startTimer();
    vi.advanceTimersByTime(3567);
    const result = timer.end();

    expect(result.formatted).toBe('3.6s');
  });
});

describe('formatDuration', () => {
  it('should format milliseconds correctly', () => {
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(1)).toBe('1ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('should format seconds with one decimal', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1234)).toBe('1.2s');
    expect(formatDuration(5678)).toBe('5.7s');
  });
});

describe('sanitizeUrl', () => {
  it('should remove query parameters from URL', () => {
    const url = 'https://api.mercadolibre.com/sites/MLA/search?access_token=SECRET123';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.mercadolibre.com/sites/MLA/search');
  });

  it('should keep pathname intact', () => {
    const url = 'https://api.example.com/v1/users/123?token=abc';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.example.com/v1/users/123');
  });

  it('should handle URLs without query parameters', () => {
    const url = 'https://api.example.com/endpoint';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://api.example.com/endpoint');
  });

  it('should handle URLs with hash fragments', () => {
    const url = 'https://example.com/page?token=secret#section';
    const result = sanitizeUrl(url);
    expect(result).toBe('https://example.com/page');
  });
});
