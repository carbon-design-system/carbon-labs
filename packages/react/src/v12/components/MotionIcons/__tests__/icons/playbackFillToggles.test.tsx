/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PlayToggle,
  PlayOutlineToggle,
  PauseToggle,
  PauseOutlineToggle,
  StopToggle,
  StopOutlineToggle,
  SkipBackToggle,
  SkipBackOutlineToggle,
  SkipForwardToggle,
  SkipForwardOutlineToggle,
  RecordingToggle,
  SkipBackOutlineFilled,
  SkipForwardOutlineFilled,
} from '../../icons/toggle/playbackFillToggles';
import {
  playPause,
  Pause,
  PauseFilled,
  PauseOutline,
  PauseOutlineFilled,
  PlayFilledAlt,
  PlayOutline,
  PlayOutlineFilled,
  Recording,
  RecordingFilled,
  SkipBack,
  SkipBackFilled,
  SkipBackOutline,
  SkipForward,
  SkipForwardFilled,
  SkipForwardOutline,
  Stop,
  StopFilledAlt,
  StopOutline,
  StopOutlineFilled,
} from '../../icons/controls/playback';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { FrameToggleIcon, Shapes } from '../../utils/frameIcon';

/**
 * Playback outline ⇄ filled toggles: geometry is stable and finite, and at
 * rest each end paints exactly its hover icon's shapes (the same geometry
 * functions, so equal `d` strings), at every hover step and size.
 */

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

type End = (h: number, size?: number) => Shapes;
const ends =
  (icon: { geo: (f: { h: number }, size?: number) => Shapes }): End =>
  (h, size) =>
    icon.geo({ h }, size);

const TOGGLES: [string, FrameToggleIcon<'outline' | 'filled'>, End, End][] = [
  // Play.tsx has no geo; PlayPauseToggle's play end (playPause 'outline') is its frame-engine form.
  [
    'PlayToggle',
    PlayToggle,
    (h, size) => playPause('outline', h, 0, size),
    ends(PlayFilledAlt),
  ],
  [
    'PlayOutlineToggle',
    PlayOutlineToggle,
    ends(PlayOutline),
    ends(PlayOutlineFilled),
  ],
  ['PauseToggle', PauseToggle, ends(Pause), ends(PauseFilled)],
  [
    'PauseOutlineToggle',
    PauseOutlineToggle,
    ends(PauseOutline),
    ends(PauseOutlineFilled),
  ],
  ['StopToggle', StopToggle, ends(Stop), ends(StopFilledAlt)],
  [
    'StopOutlineToggle',
    StopOutlineToggle,
    ends(StopOutline),
    ends(StopOutlineFilled),
  ],
  ['SkipBackToggle', SkipBackToggle, ends(SkipBack), ends(SkipBackFilled)],
  [
    'SkipBackOutlineToggle',
    SkipBackOutlineToggle,
    ends(SkipBackOutline),
    ends(SkipBackOutlineFilled),
  ],
  [
    'SkipForwardToggle',
    SkipForwardToggle,
    ends(SkipForward),
    ends(SkipForwardFilled),
  ],
  [
    'SkipForwardOutlineToggle',
    SkipForwardOutlineToggle,
    ends(SkipForwardOutline),
    ends(SkipForwardOutlineFilled),
  ],
  ['RecordingToggle', RecordingToggle, ends(Recording), ends(RecordingFilled)],
];

const STEPS = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
const SIZES = [16, 20, 24, 32];
const HOVERS = [0, 0.5, 1];
const FRAMES = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);

/** The toggle's shapes under `prefix`, unprefixed. */
function under(shapes: Shapes, prefix: string): Shapes {
  const out: Shapes = {};
  for (const k in shapes)
    if (k.startsWith(`${prefix}-`)) out[k.slice(prefix.length + 1)] = shapes[k];
  return out;
}
const painted = (shapes: Shapes) =>
  Object.entries(shapes)
    .filter(([, a]) => a.d !== '')
    .map(([k]) => k)
    .sort();

describe.each(TOGGLES)('%s', (name, Toggle, outline, filled) => {
  it('keeps the same shape keys at every frame and size', () => {
    const keys = Object.keys(Toggle.geo({ h: 0, p: 0, e: 0 }, 32)).sort();
    for (const size of SIZES)
      for (const f of FRAMES)
        expect(
          Object.keys(Toggle.geo(f, size)).sort(),
          `${JSON.stringify(f)} @${size}`
        ).toEqual(keys);
  });

  it('never paints NaN or Infinity', () => {
    for (const size of SIZES)
      for (const f of FRAMES) {
        for (const [k, attrs] of Object.entries(Toggle.geo(f, size))) {
          for (const [a, v] of Object.entries(attrs))
            expect(
              /NaN|Infinity|undefined/.test(String(v)),
              `${k}.${a} ${JSON.stringify(f)} @${size}`
            ).toBe(false);
        }
      }
  });

  it('paints the outline hover icon exactly at p = 0', () => {
    for (const size of SIZES)
      for (const h of HOVERS) {
        const shapes = Toggle.geo({ h, p: 0, e: 0 }, size);
        expect(under(shapes, 'o'), `h ${h} @${size}`).toEqual(outline(h, size));
        expect(painted(shapes).every((k) => k.startsWith('o-'))).toBe(true);
      }
  });

  it('paints the filled hover icon exactly at p = 1', () => {
    for (const size of SIZES)
      for (const h of HOVERS) {
        const shapes = Toggle.geo({ h, p: 1, e: 0 }, size);
        expect(under(shapes, 'f'), `h ${h} @${size}`).toEqual(filled(h, size));
        expect(painted(shapes).every((k) => k.startsWith('f-'))).toBe(true);
      }
  });

  it('paints only the fill shapes mid-toggle, fill included', () => {
    for (const size of SIZES)
      for (const f of [
        { h: 0, p: 0.5, e: 0 },
        { h: 1, p: 1, e: 0.5 },
      ]) {
        const shapes = Toggle.geo(f, size);
        expect(painted(shapes).every((k) => k.startsWith('m-'))).toBe(true);
        expect(shapes['m-fill'].d).not.toBe('');
      }
  });

  it.each(['outline', 'filled'] as const)(
    'renders from initial %s, animated and static, without masks',
    (initial) => {
      const { container } = render(
        <>
          <MotionIconProvider animated>
            <Toggle
              size={32}
              initial={initial}
              aria-label={`${name} animated`}
            />
          </MotionIconProvider>
          <Toggle
            size={16}
            initial={initial}
            animated={false}
            aria-label={`${name} static`}
          />
        </>
      );
      expect(container.querySelectorAll('svg')).toHaveLength(2);
      expect(container.querySelector('mask, clipPath')).toBeNull();
      const ink = [
        ...container.querySelectorAll('[data-mc-ink] [data-k]'),
      ].filter((el) => el.getAttribute('d'));
      expect(ink.length).toBeGreaterThan(0);
      expect(
        ink.every((el) =>
          el
            .getAttribute('data-k')!
            .startsWith(initial === 'outline' ? 'o-' : 'f-')
        )
      ).toBe(true);
    }
  );

  it('toggles state as a button', () => {
    const onToggle = vi.fn();
    render(
      <MotionIconProvider animated>
        <Toggle size={32} asButton onToggle={onToggle} aria-label={name} />
      </MotionIconProvider>
    );
    const btn = screen.getByRole('button', { name });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(onToggle).toHaveBeenCalledWith('filled', true);
  });
});

describe('skip outline filled hover icons', () => {
  it("knock the bar out 1px further from the triangle than the outline's bar, as Carbon does", () => {
    expect(SkipBackOutlineFilled.geo({ h: 0 }).disc.d).toContain(
      'M8 10H10V22H8Z'
    );
    expect(SkipForwardOutlineFilled.geo({ h: 0 }).disc.d).toContain(
      'M22 10H24V22H22Z'
    );
  });

  it('stretch the bar 2px at each end on hover; nothing moves sideways', () => {
    expect(SkipBackOutlineFilled.geo({ h: 1 }).disc.d).toContain(
      'M8 8H10V24H8Z'
    );
    expect(SkipBackOutlineFilled.geo({ h: 1 }).inner).toEqual(
      SkipBackOutlineFilled.geo({ h: 0 }).inner
    );
  });
});
