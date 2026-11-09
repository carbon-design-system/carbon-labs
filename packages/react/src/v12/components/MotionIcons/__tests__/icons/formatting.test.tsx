/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Copy } from '../../icons/formatting/Copy';
import { Crop } from '../../icons/formatting/Crop';
import { Cut } from '../../icons/formatting/Cut';
import { MagicWand } from '../../icons/formatting/MagicWand';
import { Paste } from '../../icons/formatting/Paste';
import { MotionIconProvider } from '../../context/MotionIconProvider';

// Disable reduced-motion by default so MotionIconProvider resolves animated=true.
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

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * These icons are frame-engine icons: animated or not, they draw their own
 * SVG from the same geometry (the static one at rest). Both must paint it.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the name documents each call site
function expectAnimatedSvg(container: HTMLElement, _name: string) {
  expect(container.querySelectorAll('svg [data-k]').length).toBeGreaterThan(0);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the name documents each call site
function expectStaticIcon(container: HTMLElement, _name: string) {
  expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

describe('Copy', () => {
  it('renders without error in animated mode', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Copy size={32} aria-label="Copy" />
      </MotionIconProvider>
    );
    expect(container.firstChild).not.toBeNull();
    expectAnimatedSvg(container, 'copy__');
  });

  it('renders static Carbon icon when animated={false}', () => {
    const { container } = render(
      <Copy size={32} animated={false} aria-label="Copy" />
    );
    expectStaticIcon(container, 'copy__');
  });

  it('has role="img" when aria-label is provided', () => {
    render(
      <MotionIconProvider animated>
        <Copy size={32} aria-label="Copy icon" />
      </MotionIconProvider>
    );
    expect(screen.getByRole('img', { name: 'Copy icon' })).toBeInTheDocument();
  });

  it('has role="presentation" when no aria-label', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Copy size={32} />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('renders statically when MotionIconProvider animated={false}', () => {
    const { container } = render(
      <MotionIconProvider animated={false}>
        <Copy size={32} aria-label="Copy" />
      </MotionIconProvider>
    );
    expectStaticIcon(container, 'copy__');
  });
});

// ─── Crop ─────────────────────────────────────────────────────────────────────

describe('Crop', () => {
  it('renders without error in animated mode', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Crop size={32} aria-label="Crop" />
      </MotionIconProvider>
    );
    expect(container.firstChild).not.toBeNull();
    expectAnimatedSvg(container, 'crop__');
  });

  it('renders static Carbon icon when animated={false}', () => {
    const { container } = render(
      <Crop size={32} animated={false} aria-label="Crop" />
    );
    expectStaticIcon(container, 'crop__');
  });

  it('has role="img" when aria-label is provided', () => {
    render(
      <MotionIconProvider animated>
        <Crop size={32} aria-label="Crop icon" />
      </MotionIconProvider>
    );
    expect(screen.getByRole('img', { name: 'Crop icon' })).toBeInTheDocument();
  });

  it('has role="presentation" when no aria-label', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Crop size={32} />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('renders statically when MotionIconProvider animated={false}', () => {
    const { container } = render(
      <MotionIconProvider animated={false}>
        <Crop size={32} aria-label="Crop" />
      </MotionIconProvider>
    );
    expectStaticIcon(container, 'crop__');
  });
});

// ─── Cut ──────────────────────────────────────────────────────────────────────

describe('Cut', () => {
  it('renders without error in animated mode', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Cut size={32} aria-label="Cut" />
      </MotionIconProvider>
    );
    expect(container.firstChild).not.toBeNull();
    expectAnimatedSvg(container, 'cut__');
  });

  it('renders static Carbon icon when animated={false}', () => {
    const { container } = render(
      <Cut size={32} animated={false} aria-label="Cut" />
    );
    expectStaticIcon(container, 'cut__');
  });

  it('has role="img" when aria-label is provided', () => {
    render(
      <MotionIconProvider animated>
        <Cut size={32} aria-label="Cut icon" />
      </MotionIconProvider>
    );
    expect(screen.getByRole('img', { name: 'Cut icon' })).toBeInTheDocument();
  });

  it('has role="presentation" when no aria-label', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Cut size={32} />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('renders statically when MotionIconProvider animated={false}', () => {
    const { container } = render(
      <MotionIconProvider animated={false}>
        <Cut size={32} aria-label="Cut" />
      </MotionIconProvider>
    );
    expectStaticIcon(container, 'cut__');
  });
});

// ─── MagicWand ────────────────────────────────────────────────────────────────

describe('MagicWand', () => {
  it('renders without error in animated mode', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <MagicWand size={32} aria-label="Magic Wand" />
      </MotionIconProvider>
    );
    expect(container.firstChild).not.toBeNull();
    expectAnimatedSvg(container, 'magic-wand__');
  });

  it('renders static Carbon icon when animated={false}', () => {
    const { container } = render(
      <MagicWand size={32} animated={false} aria-label="Magic Wand" />
    );
    expectStaticIcon(container, 'magic-wand__');
  });

  it('has role="img" when aria-label is provided', () => {
    render(
      <MotionIconProvider animated>
        <MagicWand size={32} aria-label="Magic Wand icon" />
      </MotionIconProvider>
    );
    expect(
      screen.getByRole('img', { name: 'Magic Wand icon' })
    ).toBeInTheDocument();
  });

  it('has role="presentation" when no aria-label', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <MagicWand size={32} />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('renders statically when MotionIconProvider animated={false}', () => {
    const { container } = render(
      <MotionIconProvider animated={false}>
        <MagicWand size={32} aria-label="Magic Wand" />
      </MotionIconProvider>
    );
    expectStaticIcon(container, 'magic-wand__');
  });
});

// ─── Paste ────────────────────────────────────────────────────────────────────

describe('Paste', () => {
  it('renders without error in animated mode', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Paste size={32} aria-label="Paste" />
      </MotionIconProvider>
    );
    expect(container.firstChild).not.toBeNull();
    expectAnimatedSvg(container, 'paste__');
  });

  it('renders static Carbon icon when animated={false}', () => {
    const { container } = render(
      <Paste size={32} animated={false} aria-label="Paste" />
    );
    expectStaticIcon(container, 'paste__');
  });

  it('has role="img" when aria-label is provided', () => {
    render(
      <MotionIconProvider animated>
        <Paste size={32} aria-label="Paste icon" />
      </MotionIconProvider>
    );
    expect(screen.getByRole('img', { name: 'Paste icon' })).toBeInTheDocument();
  });

  it('has role="presentation" when no aria-label', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <Paste size={32} />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('renders statically when MotionIconProvider animated={false}', () => {
    const { container } = render(
      <MotionIconProvider animated={false}>
        <Paste size={32} aria-label="Paste" />
      </MotionIconProvider>
    );
    expectStaticIcon(container, 'paste__');
  });
});
