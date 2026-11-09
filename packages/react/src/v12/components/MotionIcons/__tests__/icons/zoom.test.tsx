/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ZoomIn, ZoomOut, ZoomFit, ZoomReset } from '../../icons/navigation';
import { MotionIconProvider } from '../../context/MotionIconProvider';

describe('Navigation Zoom Icons', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('ZoomIn', () => {
    it('renders animated mode by default', () => {
      const { container } = render(<ZoomIn size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });

    it('renders static Carbon icon when animated={false}', () => {
      const { container } = render(<ZoomIn size={32} animated={false} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has role="img" when aria-label is provided', () => {
      const { container } = render(<ZoomIn size={32} aria-label="Zoom in" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Zoom in');
    });

    it('has role="presentation" when no aria-label is provided', () => {
      const { container } = render(<ZoomIn size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'presentation');
    });
  });

  describe('ZoomOut', () => {
    it('renders animated mode by default', () => {
      const { container } = render(<ZoomOut size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });

    it('renders static Carbon icon when animated={false}', () => {
      const { container } = render(<ZoomOut size={32} animated={false} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has role="img" when aria-label is provided', () => {
      const { container } = render(<ZoomOut size={32} aria-label="Zoom out" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Zoom out');
    });
  });

  describe('ZoomFit', () => {
    it('renders animated mode by default', () => {
      const { container } = render(<ZoomFit size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });

    it('renders static Carbon icon when animated={false}', () => {
      const { container } = render(<ZoomFit size={32} animated={false} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has role="img" when aria-label is provided', () => {
      const { container } = render(<ZoomFit size={32} aria-label="Zoom fit" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Zoom fit');
    });
  });

  describe('ZoomReset', () => {
    it('renders animated mode by default', () => {
      const { container } = render(<ZoomReset size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });

    it('renders static Carbon icon when animated={false}', () => {
      const { container } = render(<ZoomReset size={32} animated={false} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has role="img" when aria-label is provided', () => {
      const { container } = render(
        <ZoomReset size={32} aria-label="Zoom reset" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Zoom reset');
    });
  });

  describe('Context integration', () => {
    it('renders statically when MotionIconProvider animated={false}', () => {
      const { container } = render(
        <MotionIconProvider animated={false}>
          <ZoomIn size={32} />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
