/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The toggle API (2026-10 consolidation): one toggle per family, named after
 * its base icon; drawings as `filled` / `variant`; `value` / `onChange` on
 * every toggle; deprecated aliases for every old name.
 */
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Carbon from '@carbon/icons-react';
import * as Lib from '../../index';
import { TOGGLE_ALIASES } from '../../icons/toggleAliases';
import { TOGGLES } from '../../icons/gallery.registry';
import {
  notificationRingShapes,
  notificationShapes,
} from '../../icons/toggle/stateToggles';

// Each toggle types its own props; a mixed list erases them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyToggle = React.ComponentType<any> & {
  geo?: unknown;
  states?: readonly string[];
  rest?: unknown;
  pick?: (p: object) => AnyToggle;
};
const LIB = Lib as unknown as Record<string, AnyToggle>;
const ALIASES = TOGGLE_ALIASES as Record<
  string,
  { use: string; props?: Record<string, unknown> }
>;
const CARBON = new Set(Object.keys(Carbon));

const SIZES = [16, 20, 24, 32] as const;
const isToggleName = (n: string) => /Toggled?$/.test(n);
const PUBLIC_TOGGLES = Object.keys(LIB).filter(isToggleName).sort();
const CURRENT = PUBLIC_TOGGLES.filter((n) => !(n in ALIASES));
/** State icons (more than two states) have rest numbers; two-state toggles don't. */
const isStateIcon = (T: AnyToggle) => typeof T.rest === 'function';

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
afterEach(cleanup);

/** The painted SVG, with React's generated ids blanked. */
function painted(el: React.ReactElement) {
  const { container, unmount } = render(el);
  const html = container.innerHTML.replace(/«[^»]*»|:r[0-9a-z]+:/g, '#id');
  unmount();
  return html;
}

describe('deprecated toggle aliases', () => {
  it('lists every old name once, each exported and pointing at a current toggle', () => {
    for (const [old, { use }] of Object.entries(ALIASES)) {
      expect(LIB[old], old).toBeDefined();
      expect(CURRENT, `${old} → ${use}`).toContain(use);
    }
  });

  it('keeps the names the prototypes app imports', () => {
    for (const n of [
      'ChevronDownUpToggle',
      'ViewOffToggle',
      'AsleepAwakeToggle',
    ])
      expect(LIB[n], n).toBeDefined();
  });

  describe.each(Object.entries(ALIASES))('%s', (old, { use, props = {} }) => {
    const Old = LIB[old];
    const New = LIB[use];
    const states = New.states!;

    it("carries its replacement's geometry (the same function)", () => {
      const drawing = New.pick ? New.pick(props) : New;
      expect(Old.geo).toBe(drawing.geo);
      if (isStateIcon(New)) expect(Old.rest).toBe(drawing.rest);
    });

    it('paints exactly what its replacement does: at rest, in each state, filled, animated and static', () => {
      for (const size of SIZES) {
        for (const animated of [true, false]) {
          // The caller's own `filled` too: an alias that fixes a drawing keeps it.
          for (const caller of [{}, { filled: true }]) {
            if (isStateIcon(New)) {
              for (const value of states) {
                const p = { size, animated, value, ...caller };
                expect(
                  painted(<Old {...p} />),
                  `${value} @${size} ${animated}`
                ).toBe(painted(<New {...p} {...props} />));
              }
            } else {
              for (const toggled of [false, true]) {
                const p = { size, animated, toggled, ...caller };
                expect(
                  painted(<Old {...p} />),
                  `${toggled} @${size} ${animated}`
                ).toBe(painted(<New {...p} {...props} />));
              }
            }
          }
        }
      }
    });
  });

  it('NotificationToggle variant="ring" is the ringing toggle, and the default is not', () => {
    expect(LIB.NotificationToggle.pick!({ variant: 'ring' }).geo).toBe(
      notificationRingShapes
    );
    expect(LIB.NotificationToggle.geo).toBe(notificationShapes);
    expect(LIB.NotificationRingToggle.geo).toBe(notificationRingShapes);
  });
});

// ── The naming rule ──────────────────────────────────────────────────────────
//
// A toggle is named after its family's base icon, a Carbon icon:
// - `<Base>Toggle`: outline ⇄ filled, swaps and direction toggles. The base is
//   the icon it starts on (ChevronDown ⇄ ChevronUp is ChevronDownToggle), or
//   for an outline ⇄ filled pair the family name Carbon's `…Outline` icon
//   carries (CircleOutline ⇄ CircleFilled is CircleToggle).
// - `<Base>OffToggle`: on ⇄ off (or `<OffIcon>Toggle` where Carbon's off icon
//   is its own word, e.g. CloudOffline).
// - `<Base>LevelToggle` / `<Base>StateToggle`: more than two states, the base
//   a Carbon icon or the family prefix of several (Volume: VolumeDown, VolumeUp).
// - A swap whose start icon's name is held by that icon's own outline ⇄ filled
//   toggle names both ends (TWO_ENDED).
// - A swap to a drawing of its own, with no Carbon icon, names its start icon
//   and the state it draws (OWN_END: Microphone ⇄ listening).
// Drawings are props, so no name says Filled or Solid.

/** Swaps named for both ends, with those ends' Carbon icons. */
const TWO_ENDED: Record<string, [string, string]> = {
  PlayPause: ['Play', 'Pause'],
  RecordStop: ['Recording', 'StopOutline'],
  AsleepAwake: ['Asleep', 'Sun'],
  LockedUnlocked: ['Locked', 'Unlocked'],
  MicrophoneVoiceMode: ['Microphone', 'VoiceMode'],
};
/** Swaps to a drawing of their own: the start's Carbon icon, then the state. */
const OWN_END: Record<string, string> = {
  MicrophoneListening: 'Microphone',
};
const startsAFamily = (stem: string) =>
  [...CARBON].some(
    (c) =>
      c !== stem && c.startsWith(stem) && /^[A-Z]/.test(c.slice(stem.length))
  );

function followsRule(name: string): string | null {
  const m = /^([A-Z][A-Za-z]*?)Toggle$/.exec(name);
  if (!m) return 'is not <Base>Toggle';
  const stem = m[1];
  if (/Filled|Solid/.test(stem))
    return 'names a drawing (use filled / variant)';
  if (CARBON.has(stem) || CARBON.has(`${stem}Outline`)) return null;
  const off = /^(\w+)Off$/.exec(stem);
  if (off && CARBON.has(off[1])) return null;
  const level = /^(\w+)(Level|State)$/.exec(stem);
  if (level && (CARBON.has(level[1]) || startsAFamily(level[1]))) return null;
  const ends = TWO_ENDED[stem];
  if (ends) {
    if (!ends.every((e) => CARBON.has(e)))
      return 'two-ended, but an end is not a Carbon icon';
    if (!CURRENT.includes(`${ends[0]}Toggle`))
      return `two-ended, but ${ends[0]}Toggle is free: use it`;
    return null;
  }
  const start = OWN_END[stem];
  if (start) {
    return CARBON.has(start) ? null : 'its start is not a Carbon icon';
  }
  return 'its base is not a Carbon icon';
}

describe('the naming rule', () => {
  it.each(CURRENT)('%s', (name) => {
    expect(followsRule(name)).toBeNull();
  });

  it('every public *Toggle is current or a listed alias', () => {
    expect(
      PUBLIC_TOGGLES.filter((n) => followsRule(n) !== null && !(n in ALIASES))
    ).toEqual([]);
    expect(CURRENT.length).toBe(123);
  });
});

// ── One state API ────────────────────────────────────────────────────────────

describe.each(CURRENT)('%s: value / onChange', (name) => {
  const T = LIB[name];
  it('names its states, follows `value` and reports the next state to `onChange`', () => {
    const states = T.states!;
    expect(states.length).toBeGreaterThanOrEqual(2);
    for (const animated of [true, false]) {
      const onChange = vi.fn();
      const { container, rerender, unmount } = render(
        <T animated={animated} value={states[0]} onChange={onChange} />
      );
      fireEvent.click(container.querySelector('svg')!);
      expect(onChange).toHaveBeenCalledWith(states[1]);
      // Controlled: the click alone changes nothing (the next click asks for the same state); the new value does.
      fireEvent.click(container.querySelector('svg')!);
      expect(onChange).toHaveBeenLastCalledWith(states[1]);
      rerender(<T animated={animated} value={states[1]} onChange={onChange} />);
      fireEvent.click(container.querySelector('svg')!);
      expect(onChange).toHaveBeenLastCalledWith(states[2 % states.length]);
      unmount();
    }
  });

  if (!isStateIcon(T) && name !== 'SkillLevelToggle') {
    it('keeps `toggled` / `onToggle` as the boolean shorthand', () => {
      const onToggle = vi.fn();
      const onChange = vi.fn();
      const { container } = render(
        <T animated toggled={false} onToggle={onToggle} onChange={onChange} />
      );
      fireEvent.click(container.querySelector('svg')!);
      expect(onToggle).toHaveBeenCalledWith(T.states![1], true);
      expect(onChange).toHaveBeenCalledWith(T.states![1]);
      // `value` wins over `toggled`.
      const a = painted(<T animated value={T.states![1]} toggled={false} />);
      expect(a).toBe(painted(<T animated toggled />));
    });
  }
});

// ── The gallery ──────────────────────────────────────────────────────────────

/** State icons in the gallery that aren't toggles: indicators, which follow `value` and never step on a click. */
const INDICATORS = ['ProgressStep', 'SortDirection'];

describe('gallery registry', () => {
  it.each(TOGGLES.map((t) => [t.name, t] as const))(
    '%s: a current toggle, starting in one of its states',
    (_, row) => {
      expect([...CURRENT, ...INDICATORS]).toContain(row.toggle);
      expect(LIB[row.toggle].states).toContain(row.start);
      if (row.variant)
        expect(
          LIB[row.toggle].pick,
          `${row.toggle} takes variant`
        ).toBeDefined();
    }
  );
});
