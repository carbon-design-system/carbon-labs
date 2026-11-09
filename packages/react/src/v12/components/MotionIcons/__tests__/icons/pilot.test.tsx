/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animate as engineAnimate } from '@carbon-labs/motion-icons-core/engine/animate';
import type { AnimatedIconProps } from '../../types';
import * as ControlIcons from '../../icons/controls';
import * as DataIcons from '../../icons/data';
import * as StatusIcons from '../../icons/status';
import * as FormattingShapes from '../../icons/formatting/shapes';
import * as FormattingEditing from '../../icons/formatting/editing';
import * as InstrumentIcons from '../../icons/instruments';
import * as AssortedIcons from '../../icons/assorted';
const Controls = {
  ...ControlIcons,
  ...DataIcons,
  ...StatusIcons,
  ...FormattingShapes,
  ...FormattingEditing,
  ...InstrumentIcons,
  ...AssortedIcons,
};
import {
  DoubleChevronLeft,
  DoubleChevronRight,
  Play,
  Settings,
  SidePanelOpen,
} from '../../icons/controls';
import { ChartColumn, ChartLine } from '../../icons/data';
import { Edit, Link, TrashCan } from '../../icons/formatting';
import { CheckmarkOutline, WarningAlt } from '../../icons/status';
import { Recycle } from '../../icons/commerce';
import { CheckmarkToggle, CheckmarkOutlineToggle } from '../../icons/toggle';
import {
  filletPath,
  polyPath,
  ringPath,
  scalePts,
} from '@carbon-labs/motion-icons-core/geometry';
import { TOGGLE_ALIASES } from '../../icons/toggleAliases';
import {
  ArrowsVertical as CArrowsVertical,
  CircleDash as CCircleDash,
  VolumeMute as CVolumeMute,
  VolumeMuteFilled as CVolumeMuteFilled,
} from '@carbon/icons-react';

// The frame engine's tween (the core's since refactor stage 1): watched, and run for real.
vi.mock('@carbon-labs/motion-icons-core/engine/animate', async (original) => {
  const actual =
    await original<
      typeof import('@carbon-labs/motion-icons-core/engine/animate')
    >();
  return { ...actual, animate: vi.fn(actual.animate) };
});

beforeEach(() => {
  vi.mocked(engineAnimate).mockClear();
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

const PILOT: Array<[string, React.ComponentType<AnimatedIconProps>]> = [
  ['Settings', Settings],
  ['Play', Play],
  ['DoubleChevronRight', DoubleChevronRight],
  ['DoubleChevronLeft', DoubleChevronLeft],
  ['SidePanelOpen', SidePanelOpen],
  ['ChartColumn', ChartColumn],
  ['ChartLine', ChartLine],
  ['Edit', Edit],
  ['Link', Link],
  ['TrashCan', TrashCan],
  ['WarningAlt', WarningAlt],
  ['CheckmarkOutline', CheckmarkOutline],
  ['Recycle', Recycle],
];

// Multi-state icons (makeStateIcon) take a value, not a boolean `toggled`; their own suites cover them.
const STATE_TOGGLES = new Set(['VolumeLevelToggle']);
const TOGGLE_NAMES = new Set(
  Object.keys(Controls).filter(
    (n) => n.endsWith('Toggle') && !STATE_TOGGLES.has(n)
  )
);
const LIB = Controls as unknown as Record<
  string,
  React.ComponentType<AnimatedIconProps>
>;
// Each toggle's other drawings (`filled`, `variant`), which the deprecated names also cover.
const VARIANT_CASES = Object.values(
  TOGGLE_ALIASES as Record<
    string,
    { use: string; props?: Record<string, unknown> }
  >
)
  .filter((a) => a.props && TOGGLE_NAMES.has(a.use))
  .map((a) => {
    const T = LIB[a.use] as React.ComponentType<Record<string, unknown>>;
    const V = (p: Record<string, unknown>) => <T {...p} {...a.props} />;
    return [`${a.use} ${JSON.stringify(a.props)}`, V] as const;
  });
PILOT.push(
  ...Object.keys(Controls)
    .filter((n) => !TOGGLE_NAMES.has(n) && !PILOT.some(([p]) => p === n))
    .map((n): [string, React.ComponentType<AnimatedIconProps>] => [n, LIB[n]]),
  // The multi-state toggles' other drawings.
  ...Object.values(
    TOGGLE_ALIASES as Record<
      string,
      { use: string; props?: Record<string, unknown> }
    >
  )
    .filter((a) => a.props && STATE_TOGGLES.has(a.use))
    .map((a): [string, React.ComponentType<AnimatedIconProps>] => {
      const T = LIB[a.use];
      return [
        `${a.use} ${JSON.stringify(a.props)}`,
        (p: AnimatedIconProps) => <T {...p} {...a.props} />,
      ];
    })
);

// The volume levels start at mute, whose still is Carbon's volume--mute (and --filled) art (decision 5).
// ProgressStep starts incomplete, whose still is Carbon's circle--dash; SortDirection starts at none, arrows--vertical.
const STATE_STILLS: Record<string, unknown> = {
  VolumeLevelToggle: CVolumeMute,
  'VolumeLevelToggle {"filled":true}': CVolumeMuteFilled,
  ProgressStep: CCircleDash,
  SortDirection: CArrowsVertical,
};
for (const entry of PILOT) {
  const C = STATE_STILLS[entry[0]];
  if (!C) continue;
  const T = entry[1];
  entry[1] = Object.assign((p: AnimatedIconProps) => <T {...p} />, {
    static: C,
  });
}

const GEOMETRY = [
  'd',
  'x',
  'y',
  'width',
  'height',
  'cx',
  'cy',
  'r',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
];

/** Every painted shape with its geometry, ignoring the wrapper groups the animated branch adds. */
function paint(container: HTMLElement) {
  return [...container.querySelectorAll('path, rect, circle')].map((el) => [
    el.tagName,
    ...GEOMETRY.map((a) => el.getAttribute(a)),
  ]);
}

describe.each(PILOT)('%s', (_, Icon) => {
  it('paints the same shapes at rest whether animated or still (reduced motion; animated={false} without Carbon art)', () => {
    const Carbon = (Icon as { static?: React.ComponentType<AnimatedIconProps> })
      .static;
    for (const size of [16, 20, 24, 32] as const) {
      // Reduced motion: the rest geometry.
      const media = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: true,
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }),
      });
      const still = render(<Icon size={size} />);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: media,
      });
      const live = render(<Icon size={size} animated />);
      expect(paint(live.container)).toEqual(paint(still.container));
      expect(live.container.querySelector('svg')!.getAttribute('viewBox')).toBe(
        still.container.querySelector('svg')!.getAttribute('viewBox')
      );
      // animated={false}: Carbon's own art where the icon has it, else the rest geometry.
      const off = render(<Icon size={size} animated={false} />);
      if (Carbon)
        expect(off.container.innerHTML).toBe(
          render(<Carbon size={size} />).container.innerHTML
        );
      else expect(paint(off.container)).toEqual(paint(live.container));
      still.unmount();
      live.unmount();
      off.unmount();
    }
  });

  it('keeps paint off the root svg (ink rule)', () => {
    const { container } = render(<Icon animated />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('stroke')).toBeNull();
    expect(svg.querySelector('[data-mc-ink]')).not.toBeNull();
  });

  it('animates on hover and back on leave', () => {
    const { container } = render(<Icon animated />);
    const svg = container.querySelector('svg')!;
    fireEvent.mouseEnter(svg);
    const entered = vi.mocked(engineAnimate).mock.calls.length;
    expect(entered).toBeGreaterThan(0);
    fireEvent.mouseLeave(svg);
    const left = vi.mocked(engineAnimate).mock.calls.length;
    expect(left).toBe(entered * 2);
  });
});

describe('size-specific artwork', () => {
  // Frame icons keep the 32 grid and draw Carbon's 16px artwork in its own 16 grid, scaled 2× into it.
  it.each([
    ['Play', Play],
    ['WarningAlt', WarningAlt],
  ] as const)(
    "%s draws Carbon's 16px drawing at size 16 only (frame geometry)",
    (_, Icon) => {
      for (const animated of [true]) {
        const at = (size: 16 | 20 | 24 | 32) =>
          render(
            <Icon size={size} animated={animated} />
          ).container.querySelector('svg')!;
        for (const size of [16, 20, 24, 32] as const) {
          const svg = at(size);
          expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
          const scaled = [...svg.querySelectorAll('[data-k]')].map((el) =>
            el.getAttribute('transform')
          );
          expect(scaled.length).toBeGreaterThan(0);
          expect(
            scaled.every((t) => (size === 16 ? t === 'scale(2)' : t === null))
          ).toBe(true);
        }
      }
      expect(Icon.geo({ h: 0 }, 16)).not.toEqual(Icon.geo({ h: 0 }, 32));
    }
  );

  // Settings' gear turns about its own pivot, so every shape carries a transform: at 16 it leads with scale(2).
  it("Settings draws Carbon's 16px drawing at size 16 only (frame geometry)", () => {
    for (const animated of [true]) {
      for (const size of [16, 20, 24, 32] as const) {
        const svg = render(
          <Settings size={size} animated={animated} />
        ).container.querySelector('svg')!;
        expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
        const ts = [...svg.querySelectorAll('[data-k]')].map(
          (el) => el.getAttribute('transform') ?? ''
        );
        expect(ts).toHaveLength(2);
        expect(
          ts.every((t) =>
            size === 16 ? t.startsWith('scale(2)') : !t.includes('scale(2)')
          )
        ).toBe(true);
      }
    }
    expect(Settings.geo({ h: 0 }, 16)).not.toEqual(Settings.geo({ h: 0 }, 32));
  });

  // animated={false}: Carbon's own art, its 16px drawing in its 16 grid at 16.
  it.each([
    ['Play', Play],
    ['WarningAlt', WarningAlt],
    ['Settings', Settings],
  ] as const)(
    "%s with animated={false} draws Carbon's own art (16px drawing at 16)",
    (_, Icon) => {
      const at = (size: 16 | 20 | 24 | 32) =>
        render(<Icon size={size} animated={false} />)
          .container.querySelector('svg')!
          .getAttribute('viewBox');
      expect(at(16)).toBe('0 0 16 16');
      expect(at(20)).toBe('0 0 32 32');
      expect(at(32)).toBe('0 0 32 32');
    }
  );
});

describe('geometry', () => {
  it('polyPath and scalePts', () => {
    expect(
      polyPath(
        [
          [0, 0],
          [2, 0],
          [2, 2],
        ],
        true
      )
    ).toBe('M0 0L2 0L2 2Z');
    expect(scalePts([[2, 0]], [0, 0], 1.5)).toEqual([[3, 0]]);
  });

  it("ringPath draws Carbon's ring", () => {
    // Carbon: M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z
    expect(ringPath([16, 16], 13, 2)).toBe(
      'M16 2A14 14 0 1 0 30 16A14 14 0 0 0 16 2ZM16 28A12 12 0 1 1 28 16A12 12 0 0 1 16 28Z'
    );
  });

  it('filletPath rounds each bend and flags its turn direction', () => {
    // Right turn (clockwise on screen) then left turn.
    const d = filletPath(
      [
        [0, 10],
        [5, 0],
        [10, 10],
        [15, 0],
      ],
      1
    );
    const flags = [...d.matchAll(/A1 1 0 0 (\d)/g)].map((m) => m[1]);
    expect(flags).toEqual(['1', '0']);
  });
});

describe.each([
  ['CheckmarkOutlineToggle', CheckmarkOutlineToggle],
  ['CheckmarkToggle', CheckmarkToggle],
  ...[...TOGGLE_NAMES].map((n) => [n, LIB[n]] as const),
  ...VARIANT_CASES,
] as const)('%s', (_, Toggle: React.ComponentType<Record<string, unknown>>) => {
  it('reports the boolean on click and animates the change', () => {
    const onToggle = vi.fn();
    const { container } = render(<Toggle animated onToggle={onToggle} />);
    vi.mocked(engineAnimate).mockClear();
    fireEvent.click(container.querySelector('svg')!);
    expect(onToggle).toHaveBeenCalledWith(expect.any(String), true);
    expect(vi.mocked(engineAnimate).mock.calls.length).toBeGreaterThan(0);
  });

  it('follows the controlled prop without a click', () => {
    const { container, rerender } = render(<Toggle animated toggled={false} />);
    vi.mocked(engineAnimate).mockClear();
    rerender(<Toggle animated toggled />);
    expect(vi.mocked(engineAnimate).mock.calls.length).toBeGreaterThan(0);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it("renders Carbon's own icons when static", () => {
    const off = render(<Toggle animated={false} toggled={false} size={16} />);
    expect(
      off.container.querySelector('svg')!.getAttribute('viewBox')
    ).toBeTruthy();
    const on = render(<Toggle animated={false} toggled size={16} />);
    expect(on.container.querySelector('path')).not.toBeNull();
  });

  it('shows the resting check state from the first render', () => {
    const { container } = render(<Toggle animated toggled />);
    const svg = container.querySelector('svg')!;
    if (Toggle === CheckmarkOutlineToggle) {
      // Check fully drawn.
      expect(
        svg
          .querySelector('[stroke-dashoffset]')!
          .getAttribute('stroke-dashoffset')
      ).toBe('0');
    } else if (Toggle === CheckmarkToggle) {
      // Fill at full radius (one even-odd path), no erase hole.
      expect(svg.querySelector('[data-k="fill"]')!.getAttribute('d')).toMatch(
        /^M2 16A14 14 /
      );
    } else {
      // Frame toggles: every shape paints from the first render.
      expect(svg.querySelectorAll('[data-k]').length).toBeGreaterThan(0);
    }
  });
});
