/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fireEvent, render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ChatOffToggle,
  EditOffToggle,
  LinkToggle,
  MagicWandToggle,
} from '../../icons/toggle/editingToggles';
import { Chat } from '../../icons/operations/opsLast';
import { ChatOff } from '../../icons/operations/ChatOff';
import { PENCIL } from '../../icons/formatting/Edit';
import { EditOff, Unlink } from '../../icons/formatting/editing';
import { LINKS, linkPath, linkPathAt } from '../../icons/formatting/Link';
import { MagicWand, MagicWandFilled } from '../../icons/formatting/fmtTools';
import { rectPath } from '@carbon-labs/motion-icons-core/geometry';
import type { Shapes, ToggleFrameIn } from '../../utils/frameIcon';

// The frame engine's tween (the core's since refactor stage 1): runs for real unless a test says otherwise.
vi.mock('@carbon-labs/motion-icons-core/engine/animate', async (original) => {
  const actual =
    await original<
      typeof import('@carbon-labs/motion-icons-core/engine/animate')
    >();
  return { ...actual, animate: vi.fn(actual.animate) };
});

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

const STEPS = [0, 0.05, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.85, 0.9, 0.95, 1];
const SIZES = [16, 20, 24, 32];
const ENDS = [0, 0.5, 1];
const BAD_NUMBER = /NaN|Infinity|undefined/;
// p sweeps (e 0), the kick or clear (p 1, e 0–1) and the recoil (p 0, e 0 to −1),
// with the custom-timed hover number (w) both with and apart from h.
const grid: ToggleFrameIn[] = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
    { h, p: 0, e: -p },
    { h, p, e: 0, w: 1 - h, entering: 0 },
  ])
);

type Geo = (f: ToggleFrameIn, size?: number) => Shapes;
const TOGGLES: [string, Geo][] = [
  ['ChatOffToggle', ChatOffToggle.geo as Geo],
  ['EditOffToggle', EditOffToggle.geo as Geo],
  ['LinkToggle', LinkToggle.geo as Geo],
  ['MagicWandToggle', MagicWandToggle.geo as Geo],
];

describe.each(TOGGLES)('%s geometry', (name, geo) => {
  it('keeps the same shape keys, and the same attributes on each, at every frame and size', () => {
    const rest = geo({ h: 0, p: 0, e: 0 }, 32);
    const shape = (s: Shapes) =>
      Object.fromEntries(
        Object.entries(s).map(([k, a]) => [k, Object.keys(a).sort()])
      );
    for (const size of SIZES) {
      for (const f of grid)
        expect(
          shape(geo(f, size)),
          `${name} ${JSON.stringify(f)} @${size}`
        ).toEqual(shape(rest));
    }
  });

  it('never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      for (const f of grid) {
        for (const [k, attrs] of Object.entries(geo(f, size))) {
          for (const [a, v] of Object.entries(attrs))
            expect(
              BAD_NUMBER.test(String(v)),
              `${k}.${a} at ${JSON.stringify(f)} @${size}: ${v}`
            ).toBe(false);
        }
      }
    }
  });
});

describe('ChatOffToggle', () => {
  it('is Chat (and its hover, on w) when on', () => {
    for (const size of SIZES) {
      for (const w of ENDS) {
        const s = ChatOffToggle.geo({ h: 1 - w, p: 0, e: 0, w }, size);
        const chat = Chat.geo({ h: w }, size);
        expect({
          bubble: s.bubble,
          line1: s.line1,
          line2: s.line2,
          line3: s.line3,
        }).toEqual(chat);
        expect([s.fill.d, s.rings.d, s.slash.d]).toEqual(['', '', '']);
      }
    }
  });

  it('is Chat off (and its hover, on h) when off', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        const s = ChatOffToggle.geo({ h, p: 1, e: 0, w: 1 - h }, size);
        expect({ fill: s.fill, rings: s.rings, slash: s.slash }).toEqual(
          ChatOff.geo({ h }, size)
        );
        expect([s.bubble.d, s.line1.d, s.line2.d, s.line3.d]).toEqual([
          '',
          '',
          '',
          '',
        ]);
      }
    }
  });

  it('holds the lines at rest (l 0) while the bubble keeps its hover (w 1): toggled back on under the pointer', () => {
    for (const p of [0, 0.2, 0.4]) {
      const s = ChatOffToggle.geo({ h: 1, p, e: 0, w: 1, l: 0 });
      const plain = ChatOffToggle.geo({ h: 1, p, e: 0, w: 1, l: 1 });
      // The bubble is the same either way; only the lines differ.
      expect([s.bubble, s.fill, s.rings, s.slash]).toEqual([
        plain.bubble,
        plain.fill,
        plain.rings,
        plain.slash,
      ]);
      if (p === 0) {
        expect({ line1: s.line1, line2: s.line2, line3: s.line3 }).toEqual({
          line1: Chat.geo({ h: 0 }).line1,
          line2: Chat.geo({ h: 0 }).line2,
          line3: Chat.geo({ h: 0 }).line3,
        });
        expect(s.bubble).toEqual(Chat.geo({ h: 1 }).bubble);
      }
    }
  });

  it('meets the ends: no lines left half way, the slash fully drawn at the off end', () => {
    expect(ChatOffToggle.geo({ h: 0, p: 0.5, e: 0 }).line1.d).toBe('');
    expect(ChatOffToggle.geo({ h: 0, p: 0.5, e: 0 }).line2.d).toBe('');
    // The kick's last frames (p 1, e → 0) cut the same slash as Chat off.
    expect(ChatOffToggle.geo({ h: 1, p: 1, e: 1e-12 }).slash).toEqual(
      ChatOff.geo({ h: 1 }).slash
    );
  });
});

describe('EditOffToggle', () => {
  it('is Edit (its hover: the pencil 2px right, the underline 2px longer each end) when on', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        const s = EditOffToggle.geo({ h, p: 0, e: 0 }, size);
        expect(s.underline.d).toBe(rectPath(2 - 2 * h, 26, 30 + 2 * h, 28));
        expect(s.pencil).toEqual({
          d: PENCIL,
          transform: `translate(${+(2 * h).toFixed(3)} 0)`,
        });
        expect([s.lower.d, s.upper.d, s.bar.d, s.slash.d]).toEqual([
          '',
          '',
          '',
          '',
        ]);
      }
    }
  });

  it('is Edit off (and its hover) when off', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        const { lower, upper, bar, slash, underline, pencil } =
          EditOffToggle.geo({ h, p: 1, e: 0 }, size);
        expect({ lower, upper, bar, slash }).toEqual(EditOff.geo({ h }, size));
        expect([underline.d, pencil.d]).toEqual(['', '']);
      }
    }
  });

  it("draws its off end with EditOff's own geometry (so the kick lands on it exactly)", () => {
    for (const h of ENDS) {
      const { lower, upper, bar, slash } = EditOffToggle.geo({
        h,
        p: 1,
        e: 1e-12,
      });
      expect({ lower, upper, bar, slash }).toEqual(EditOff.geo({ h }));
    }
  });
});

describe('LinkToggle', () => {
  it('is Link (and its hover) when linked', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        const s = LinkToggle.geo({ h, p: 0, e: 0 }, size);
        expect([s.lower.d, s.upper.d, s.marks.d]).toEqual([
          linkPath(LINKS[1], h),
          linkPath(LINKS[0], h),
          '',
        ]);
      }
    }
  });

  it('is Unlink (and its hover) when unlinked', () => {
    for (const size of SIZES) {
      for (const h of ENDS)
        expect(LinkToggle.geo({ h, p: 1, e: 0 }, size)).toEqual(
          Unlink.geo({ h }, size)
        );
    }
  });

  /** The outline's corner and arc-end points, and their spread along the link's axis (x − y). */
  const points = (d: string) =>
    [...d.matchAll(/([MLA])([^MLAZ]*)/g)].map(([, c, args]) => {
      const n = args.trim().split(/[ ,]+/).map(Number);
      return c === 'A' ? [n[5], n[6]] : [n[0], n[1]];
    });
  const extent = (...ds: string[]) => {
    const u = ds
      .flatMap((d) => points(d))
      .map(([x, y]) => (x - y) / Math.SQRT2);
    return Math.max(...u) - Math.min(...u);
  };

  it('match-cuts at 6/15: the links squeeze 3.25px per axis, then the hooks start as one loop and split apart', () => {
    const before = LinkToggle.geo({ h: 0, p: 6 / 15, e: 0 });
    // Fully squeezed: Link's drift run 3.25px per axis the other way, its gaps travelling 2.75px of it.
    expect([before.lower.d, before.upper.d, before.marks.d]).toEqual([
      linkPathAt(LINKS[1], -3.25, -2.75),
      linkPathAt(LINKS[0], -3.25, -2.75),
      '',
    ]);
    const after = LinkToggle.geo({ h: 0, p: 6 / 15 + 1e-9, e: 0 });
    expect(after.marks.d).toBe('');
    // One loop's footprint: a capsule with arc centres 8√2 apart, 23.3px long along the axis, as long as the squeezed link.
    const one = 8 * Math.SQRT2 + 12;
    expect(extent(String(after.lower.d), String(after.upper.d))).toBeCloseTo(
      one,
      1
    );
    expect(extent(String(before.lower.d), String(before.upper.d))).toBeCloseTo(
      one,
      1
    );
    // Just before rest (Carbon's unlink is 29px long), drawn from the same hooks.
    const late = LinkToggle.geo({ h: 0, p: 1 - 1e-9, e: 0 });
    expect(extent(String(late.lower.d), String(late.upper.d))).toBeCloseTo(
      29,
      0
    );
    expect(LinkToggle.geo({ h: 0, p: 0.7, e: 0 }).marks.d).not.toBe('');
  });

  it('accelerates into the cut and decelerates out of it', () => {
    const span = (p: number) => {
      const s = LinkToggle.geo({ h: 0, p, e: 0 });
      return extent(String(s.lower.d), String(s.upper.d));
    };
    const a = [0, 0.1, 0.2, 0.3].map(span);
    expect(Math.abs(a[3] - a[2])).toBeGreaterThan(Math.abs(a[1] - a[0]));
    const b = [0.42, 0.5, 0.85, 0.93].map(span);
    expect(Math.abs(b[1] - b[0])).toBeGreaterThan(Math.abs(b[3] - b[2]));
  });
});

describe('MagicWandToggle', () => {
  it('is Magic wand (and its hover) with no fill when off', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        for (const entering of [0, 1]) {
          const { fill, ...rest } = MagicWandToggle.geo(
            { h, p: 0, e: 0, entering },
            size
          );
          expect(rest).toEqual(MagicWand.geo({ h, entering }, size));
          expect(fill.d).toBe('');
        }
      }
    }
  });

  it('is Magic wand filled (and its hover) when on', () => {
    for (const size of SIZES) {
      for (const h of ENDS) {
        const { fill, ...rest } = MagicWandToggle.geo({ h, p: 1, e: 0 }, size);
        expect(rest).toEqual(MagicWandFilled.geo({ h, entering: 1 }, size));
        expect(fill.d).toBe('');
      }
    }
  });

  it('fills the handle with the disc, turning with the wand', () => {
    const half = MagicWandToggle.geo({ h: 1, p: 0.5, e: 0 });
    expect(half.fill.d).not.toBe('');
    expect(half.fill.transform).toBe(half.wand.transform);
    expect(half.fill.fillRule).toBe('evenodd');
    // Emptying: the outline wand, the fill less a growing hole.
    const clearing = MagicWandToggle.geo({ h: 0, p: 1, e: 0.5 });
    expect(clearing.wand.d).toBe(MagicWand.geo({ h: 0 }).wand.d);
    expect(String(clearing.fill.d).split('Z').filter(Boolean)).toHaveLength(2);
  });
});

describe('rendering', () => {
  const cases = [
    ['ChatOffToggle', ChatOffToggle, ['on', 'off'], 'slash'],
    ['EditOffToggle', EditOffToggle, ['on', 'off'], 'slash'],
    ['LinkToggle', LinkToggle, ['link', 'unlink'], 'marks'],
    ['MagicWandToggle', MagicWandToggle, ['outline', 'filled'], 'wand'],
  ] as const;

  it.each(cases)(
    '%s renders each state from `initial`, animated and static',
    (_name, Icon, states, key) => {
      for (const [i, initial] of states.entries()) {
        const C = Icon as React.FC<Record<string, unknown>>;
        const { container, unmount } = render(
          <C initial={initial} animated aria-label="t" />
        );
        const keys = [...container.querySelectorAll('svg [data-k]')].map((el) =>
          el.getAttribute('data-k')
        );
        expect(keys).toContain(key);
        const d = container
          .querySelector(`[data-k="${key}"]`)!
          .getAttribute('d');
        // The off/unlink end shows its slash or marks; the wand is drawn either way.
        if (key !== 'wand') expect(Boolean(d)).toBe(i === 1);
        unmount();
        const still = render(
          <C initial={initial} animated={false} aria-label="t" />
        );
        expect(
          still.container.querySelectorAll('svg path').length
        ).toBeGreaterThan(0);
        expect(still.container.querySelector('[data-k]')).toBeNull();
        still.unmount();
      }
    }
  );

  it.each(cases)(
    '%s toggles on click and as a button',
    (_name, Icon, states) => {
      const C = Icon as React.FC<Record<string, unknown>>;
      const onToggle = vi.fn();
      const { container, unmount } = render(
        <C animated onToggle={onToggle} aria-label="t" />
      );
      fireEvent.click(container.querySelector('svg')!);
      expect(onToggle).toHaveBeenCalledWith(states[1], true);
      unmount();
      const button = render(
        <C animated asButton initial={states[1]} aria-label="t" />
      );
      const el = button.container.querySelector('button')!;
      expect(el.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(el);
      expect(el.getAttribute('aria-pressed')).toBe('false');
      button.unmount();
    }
  );
});

describe('hover hold (makeToggleIcon `hovers` / `holdAfter`)', () => {
  it('Chat off → Chat under the pointer: the lines come back unscrolled, the bubble hovered; a fresh hover scrolls them', async () => {
    const { animate: engineAnimate } =
      await import('@carbon-labs/motion-icons-core/engine/animate');
    // Every tween lands at once.
    const instant = ((
      _from: number,
      to: number,
      o: { onUpdate?: (v: number) => void; onComplete?: () => void }
    ) => {
      o.onUpdate?.(to);
      o.onComplete?.();
      return { stop: () => {} };
    }) as unknown as typeof engineAnimate;
    vi.mocked(engineAnimate).mockImplementation(instant);
    const { container, unmount } = render(
      <ChatOffToggle initial="off" animated aria-label="t" />
    );
    const svg = container.querySelector('svg')!;
    const d = (k: string) =>
      container.querySelector(`[data-k="${k}"]`)!.getAttribute('d');
    fireEvent.mouseEnter(svg);
    fireEvent.click(svg);
    expect(d('line2')).toBe(Chat.geo({ h: 0 }).line2.d);
    expect(d('bubble')).toBe(Chat.geo({ h: 1 }).bubble.d);
    fireEvent.mouseLeave(svg);
    fireEvent.mouseEnter(svg);
    expect(d('line2')).toBe(Chat.geo({ h: 1 }).line2.d);
    unmount();
    vi.mocked(engineAnimate).mockRestore();
  });
});
