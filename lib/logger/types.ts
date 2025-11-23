/**
 * Logger context types for tag-based organization
 * - API: Server-side API route handlers
 * - Hook: Client-side React hooks
 * - External: External API calls (MercadoLibre)
 */
export type LogContext =
  | `API:${string}`
  | `Hook:${string}`
  | `External:${string}`;

/**
 * Timer result returned by startTimer().end()
 */
export type TimerResult = {
  duration: number; // milliseconds
  formatted: string; // "245ms" or "1.2s"
};

/**
 * Logger interface
 * All methods are no-op in production/test environments
 */
export type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
};

/**
 * Timer interface for duration tracking
 */
export type Timer = {
  end: () => TimerResult;
};
