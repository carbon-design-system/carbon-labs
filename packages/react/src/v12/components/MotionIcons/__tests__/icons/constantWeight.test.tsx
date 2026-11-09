/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZoomReset } from '../../icons/navigation';
import {
  NotSent,
  NotSentFilled,
  Review,
  Search,
  TagNone,
} from '../../icons/operations';
import {
  AsleepAwakeToggle,
  AsleepToggle,
  FavoriteToggle,
  LockedToggle,
  LockedUnlockedToggle,
  NotificationOffToggle,
  NotificationToggle,
} from '../../icons/toggle';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { FrameHoverIcon } from '../../utils/frameIcon';

// These icons move geometry on hover at constant line weight: no scale
// transforms (a transform on stroked or outlined art thickens the line with
// it), stroke widths unchanged.

beforeEach(() => {
  // jsdom's own rAF is slow and stalls under a parallel run; the hand-rolled
  // rAF hovers only need frames to arrive.
  vi.stubGlobal(
    'requestAnimationFrame',
    (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 16) as unknown as number
  );
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
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

/** Every scale transform on the icon, as an attribute or inline style. */
function scales(svg: SVGSVGElement): string[] {
  return [svg, ...svg.querySelectorAll('*')]
    .flatMap((el) => [
      el.getAttribute('transform') ?? '',
      (el as SVGElement).style?.transform ?? '',
    ])
    .filter((t) => /scale/i.test(t));
}
const strokeWidths = (svg: SVGSVGElement) =>
  [...svg.querySelectorAll('[stroke-width]')].map((el) =>
    el.getAttribute('stroke-width')
  );
const geometry = (svg: SVGSVGElement) =>
  [...svg.querySelectorAll('path, rect, circle, line')]
    .map((el) =>
      ['d', 'x', 'y', 'width', 'height', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2']
        .map((a) => el.getAttribute(a))
        .join(',')
    )
    .join('|');

describe.each([
  ['ZoomReset', ZoomReset],
  ['NotSent', NotSent],
  ['NotSentFilled', NotSentFilled],
  ['Search', Search],
  ['Review', Review],
  ['TagNone', TagNone],
] as const)('%s (frame icon)', (_, Icon) => {
  const geo = (Icon as FrameHoverIcon).geo;

  it('keeps every stroke at its resting weight, with no transforms, through the hover', () => {
    for (const size of [16, 32]) {
      const rest = geo({ h: 0 }, size);
      for (const h of [0.25, 0.5, 1]) {
        const shapes = geo({ h }, size);
        expect(Object.keys(shapes)).toEqual(Object.keys(rest));
        for (const [k, attrs] of Object.entries(shapes)) {
          expect(attrs.strokeWidth).toBe(rest[k].strokeWidth);
          expect(attrs.transform).toBeUndefined();
        }
      }
    }
  });

  it('moves its geometry on hover', () => {
    expect(JSON.stringify(geo({ h: 1 }, 32))).not.toBe(
      JSON.stringify(geo({ h: 0 }, 32))
    );
  });
});

describe.each([
  ['LockedToggle', LockedToggle],
  ['LockedUnlockedToggle', LockedUnlockedToggle],
  ['FavoriteToggle', FavoriteToggle],
  ['NotificationToggle', NotificationToggle],
  ['NotificationOffToggle', NotificationOffToggle],
  [
    'NotificationOffToggle filled',
    (p: React.ComponentProps<typeof NotificationOffToggle>) => (
      <NotificationOffToggle {...p} filled />
    ),
  ],
  [
    'NotificationToggle ring',
    (p: React.ComponentProps<typeof NotificationToggle>) => (
      <NotificationToggle {...p} variant="ring" />
    ),
  ],
  ['AsleepToggle', AsleepToggle],
  ['AsleepAwakeToggle', AsleepAwakeToggle],
] as const)('%s', (_, Toggle) => {
  it('hovers by moving geometry at constant stroke width, never by scaling', async () => {
    const Icon = Toggle as React.ComponentType<{
      size?: number;
      'aria-label'?: string;
    }>;
    const { container } = render(
      <MotionIconProvider animated>
        <Icon size={32} aria-label="t" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    const [restWidths, restGeometry] = [strokeWidths(svg), geometry(svg)];
    fireEvent.mouseEnter(svg);
    await waitFor(() => expect(geometry(svg)).not.toBe(restGeometry));
    await new Promise((r) => setTimeout(r, 250)); // let the hover finish
    expect(scales(svg)).toEqual([]);
    expect(strokeWidths(svg)).toEqual(restWidths);
  });
});

describe('16px art', () => {
  // Carbon's 16px outline moon and bell are their own drawings, but it has
  // no 16px filled ones: the art eases to the 32px drawing as the fill comes in.
  it('AsleepToggle uses the 16px moon outlined and the 32px moon filled', async () => {
    const { container } = render(
      <MotionIconProvider animated>
        <AsleepToggle size={16} aria-label="t" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    const moon = () => svg.querySelector('path[stroke-width]')!;
    expect(moon().getAttribute('stroke-width')).toBe('2.2');
    fireEvent.click(svg);
    await waitFor(() => expect(moon().getAttribute('stroke-width')).toBe('2'));
  });

  it('NotificationToggle uses the 16px bell outlined and the 32px bell filled', async () => {
    const { container } = render(
      <MotionIconProvider animated>
        <NotificationToggle size={16} aria-label="t" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    // The bell body's rim is at y=24.1 (16px drawing) or 23 (32px).
    const bell = () =>
      [...svg.querySelectorAll('path[stroke]')]
        .map((p) => p.getAttribute('d') ?? '')
        .find((d) => d.includes('L4 '))!;
    expect(bell()).toContain('L4 24.1');
    fireEvent.click(svg);
    await waitFor(() => expect(bell()).toContain('L4 23L'));
  });
});
