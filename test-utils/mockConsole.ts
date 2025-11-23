/**
 * Console Mocking Utilities
 *
 * Provides utilities for mocking console methods in tests.
 * Use this instead of global console mocking to maintain debugging capability.
 *
 * Usage:
 *   const restoreConsole = mockConsole();
 *   // ... run tests ...
 *   restoreConsole(); // Restore original console
 *
 * Or use with beforeEach/afterEach:
 *   let restoreConsole: () => void;
 *   beforeEach(() => {
 *     restoreConsole = mockConsole();
 *   });
 *   afterEach(() => {
 *     restoreConsole();
 *   });
 */

import { vi } from 'vitest';

type ConsoleMethods = 'log' | 'error' | 'warn' | 'info' | 'debug';

type MockedConsole = {
  [K in ConsoleMethods]: ReturnType<typeof vi.spyOn>;
};

/**
 * Mock all console methods and return a cleanup function
 *
 * @param methods - Specific console methods to mock (defaults to all)
 * @returns Cleanup function to restore original console methods
 */
export function mockConsole(
  methods: ConsoleMethods[] = ['log', 'error', 'warn', 'info', 'debug']
): () => void {
  const mocks: Partial<MockedConsole> = {};

  methods.forEach((method) => {
    mocks[method] = vi.spyOn(console, method).mockImplementation(() => {});
  });

  return () => {
    Object.values(mocks).forEach((mock) => mock?.mockRestore());
  };
}

/**
 * Mock console and return both mocks and cleanup function
 *
 * Useful when you need to assert console calls
 *
 * @param methods - Specific console methods to mock (defaults to all)
 * @returns Object with mocks and restore function
 */
export function mockConsoleWithSpies(
  methods: ConsoleMethods[] = ['log', 'error', 'warn', 'info', 'debug']
): {
  mocks: Partial<MockedConsole>;
  restore: () => void;
} {
  const mocks: Partial<MockedConsole> = {};

  methods.forEach((method) => {
    mocks[method] = vi.spyOn(console, method).mockImplementation(() => {});
  });

  const restore = () => {
    Object.values(mocks).forEach((mock) => mock?.mockRestore());
  };

  return { mocks, restore };
}

/**
 * Mock console.error only (useful for testing error logging)
 */
export function mockConsoleError(): () => void {
  return mockConsole(['error']);
}

/**
 * Mock console.log only (useful for testing info logging)
 */
export function mockConsoleLog(): () => void {
  return mockConsole(['log']);
}

/**
 * Mock console.warn only (useful for testing warnings)
 */
export function mockConsoleWarn(): () => void {
  return mockConsole(['warn']);
}
