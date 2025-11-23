import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { server } from './mocks/server';

// MSW server lifecycle
// https://mswjs.io/docs/integrations/node/
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Mock console methods globally to suppress noisy logs during tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.restoreAllMocks();
});

afterAll(() => {
  server.close();
});

// Mock Next.js environment variables
process.env.NEXT_PUBLIC_MELI_APP_ID = 'test-app-id';
process.env.MELI_CLIENT_SECRET = 'test-client-secret';
process.env.NEXT_PUBLIC_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

// Mock window.matchMedia for Mantine components
// https://mantine.dev/guides/vitest/
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for Mantine components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
