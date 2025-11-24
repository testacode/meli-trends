import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from './index';

describe('createLogger', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('in non-production environment', () => {
    it('should create a logger with all methods', () => {
      const logger = createLogger('Test');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('success');
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return no-op logger', () => {
      const logger = createLogger('Test');
      logger.info('this should not log');
      logger.warn('this should not log');
      logger.error('this should not log');
      logger.success('this should not log');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('in test environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return no-op logger', () => {
      const logger = createLogger('Test');
      logger.info('this should not log');
      logger.warn('this should not log');
      logger.error('this should not log');
      logger.success('this should not log');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
