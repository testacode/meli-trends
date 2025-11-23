import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js environment (Vitest tests)
 * Follows MSW 2.0 pattern
 *
 * Usage in tests:
 * - Import this server in vitest.setup.ts
 * - Call server.listen() before all tests
 * - Call server.resetHandlers() after each test
 * - Call server.close() after all tests
 */
export const server = setupServer(...handlers);
