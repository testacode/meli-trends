import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/mocks/**', // Exclude MSW mock configuration folder
      '**/*.mock.ts', // Exclude mock files from test runs
    ],
    // Silence console logs during tests (except for failures)
    // https://vitest.dev/config/#onconsolelog
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
      // Suppress React Testing Library act() warnings (stderr)
      if (
        type === 'stderr' &&
        (log.includes('act(...)') ||
          log.includes('wrap-tests-with-act') ||
          log.includes('An update to'))
      ) {
        return false;
      }
      // Suppress logger test outputs (outputs with [Test] tag from logger tests)
      if (log.includes('[Test]')) {
        return false;
      }
      // Allow all other console logs
      return true;
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '*.config.ts',
        '.next/',
        'dist/',
        'mocks/', // Exclude MSW mock configuration folder
        '**/*.mock.ts', // Exclude mock files from coverage
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
