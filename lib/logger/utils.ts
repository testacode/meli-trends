import type { Timer, TimerResult } from './types';

/**
 * Format duration in milliseconds to human-readable string
 * @param duration Duration in milliseconds
 * @returns Formatted string ("245ms" or "1.2s")
 */
export function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(1)}s`;
}

/**
 * Start a timer for duration tracking
 * @returns Timer object with end() method
 */
export function startTimer(): Timer {
  const start = Date.now();

  return {
    end: (): TimerResult => {
      const duration = Date.now() - start;
      return {
        duration,
        formatted: formatDuration(duration),
      };
    },
  };
}

/**
 * Remove query parameters and hash from URL to prevent logging sensitive data
 * @param url Full URL with potential query params and tokens
 * @returns Sanitized URL (origin + pathname only)
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    // If URL parsing fails, return as-is (better than crashing)
    return url;
  }
}
