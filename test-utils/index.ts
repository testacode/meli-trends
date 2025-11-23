/**
 * Test utilities for React component testing.
 *
 * This module re-exports all utilities from @testing-library/react
 * except for the `render` function, which is replaced with a custom
 * implementation that wraps components with necessary providers.
 *
 * Usage:
 * ```tsx
 * import { render, screen, userEvent } from '@/test-utils';
 *
 * test('example', async () => {
 *   render(<MyComponent />);
 *   const button = screen.getByRole('button');
 *   await userEvent.click(button);
 * });
 * ```
 */

// Re-export everything from @testing-library/react except render
export * from '@testing-library/react';

// Export custom render function and test query client creator
// This will override the default render export
export { render, createTestQueryClient } from './render';

// Export userEvent for user interactions
export { default as userEvent } from '@testing-library/user-event';
