import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js environment variables
process.env.NEXT_PUBLIC_MELI_APP_ID = 'test-app-id';
process.env.MELI_CLIENT_SECRET = 'test-client-secret';
process.env.NEXT_PUBLIC_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
