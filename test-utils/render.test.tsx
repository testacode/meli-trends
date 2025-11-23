import { describe, it, expect } from 'vitest';
import { render, screen } from './index';
import { Button } from '@mantine/core';

describe('Test utilities', () => {
  describe('render', () => {
    it('should render components with Mantine provider', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDefined();
    });

    it('should apply Mantine theme correctly', () => {
      render(<Button color="meliBlue">Themed button</Button>);

      const button = screen.getByRole('button', { name: /themed button/i });
      expect(button).toBeDefined();
    });
  });
});
