import { createConsola } from 'consola';
import dayjs from 'dayjs';
import type { Logger, LogContext } from './types';

/**
 * Create a tagged logger instance
 *
 * @param tag - Context tag for this logger (e.g., 'API:token', 'Hook:useTrends')
 * @returns Logger instance (no-op in production/test, Consola in development)
 *
 * @example
 * ```typescript
 * const logger = createLogger('API:token');
 * logger.info('Token fetched successfully');
 * // Output: [2025-11-23 14:30:45] ℹ [API:token] Token fetched successfully
 * ```
 */
export function createLogger(tag: LogContext | string): Logger {
  const env = process.env.NODE_ENV;

  // Return no-op logger in production or test environments
  if (env === 'production' || env === 'test') {
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      success: () => {},
    };
  }

  // Development environment: create Consola instance
  try {
    const consola = createConsola({
      level: 3, // info and above (no debug/trace)
      formatOptions: {
        date: true,
        colors: true,
      },
    });

    // Wrap Consola methods to add custom timestamp and tag
    const withTimestamp = (level: 'info' | 'warn' | 'error' | 'success') => {
      return (message: string, meta?: Record<string, unknown>) => {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedMessage = `[${timestamp}] [${tag}] ${message}`;

        if (meta) {
          consola[level](formattedMessage, meta);
        } else {
          consola[level](formattedMessage);
        }
      };
    };

    return {
      info: withTimestamp('info'),
      warn: withTimestamp('warn'),
      error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedMessage = `[${timestamp}] [${tag}] ${message}`;

        if (error && meta) {
          consola.error(formattedMessage, error, meta);
        } else if (error) {
          consola.error(formattedMessage, error);
        } else if (meta) {
          consola.error(formattedMessage, meta);
        } else {
          consola.error(formattedMessage);
        }
      },
      success: withTimestamp('success'),
    };
  } catch (error) {
    // Fallback to console if Consola fails to initialize
    console.warn('Consola failed to initialize, using console fallback', error);

    return {
      info: (msg: string) => console.log(`[INFO] [${tag}] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] [${tag}] ${msg}`),
      error: (msg: string, err?: Error) => console.error(`[ERROR] [${tag}] ${msg}`, err),
      success: (msg: string) => console.log(`[SUCCESS] [${tag}] ${msg}`),
    };
  }
}

// Re-export utilities and types for convenience
export { startTimer, formatDuration, sanitizeUrl } from './utils';
export type { Logger, LogContext, Timer, TimerResult } from './types';
