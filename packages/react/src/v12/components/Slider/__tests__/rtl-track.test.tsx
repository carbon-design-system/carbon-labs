/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

// Right to left the slider mirrors: `min` is the right-hand end. The spots,
// ticks and labels follow by their inline insets. The engine's edges and the
// pointer's x stay px from the track's left, so what reads them is placed
// with `left`, and only the maps between a value and its x turn round.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Slider } from '../components/Slider';

const here = path.dirname(fileURLToPath(import.meta.url));
const scss = fs.readFileSync(
  path.resolve(here, '../components/slider.scss'),
  'utf8'
);

/**
 * Every rule of a stylesheet with its own declarations (not its nested
 * rules'), comments removed.
 *
 * @param {string} source - The stylesheet.
 * @returns {{ selector: string; own: string }[]} The rules, in source order.
 */
function rulesOf(source: string): { selector: string; own: string }[] {
  const text = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const done: { selector: string; own: string }[] = [];
  const open: { selector: string; own: string }[] = [];
  let run = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '#' && text[i + 1] === '{') {
      // An interpolation is part of the text round it.
      const end = text.indexOf('}', i);
      run += text.slice(i, end + 1);
      i = end;
    } else if (c === '{') {
      // What is left since the last `;` is the selector.
      const cut = run.lastIndexOf(';') + 1;
      if (open.length) {
        open[open.length - 1].own += run.slice(0, cut);
      }
      open.push({
        selector: run.slice(cut).trim().replace(/\s+/g, ' '),
        own: '',
      });
      run = '';
    } else if (c === '}') {
      const rule = open.pop();
      if (rule) {
        rule.own += run;
        done.push(rule);
      }
      run = '';
    } else {
      run += c;
    }
  }
  return done;
}

const rules = rulesOf(scss);
const own = (selector: string) => {
  const rule = rules.find((r) => r.selector === selector);
  expect(rule, `${selector} has a rule`).toBeDefined();
  return rule!.own;
};

describe('the slider stylesheet, right to left', () => {
  it('places what reads the engine from the left', () => {
    for (const selector of [
      '.cds-slider__knob',
      '.cds-slider__blob',
      '.cds-slider__seam',
      '.cds-slider__lens',
      '.cds-slider__lens-in',
    ]) {
      const rule = own(selector);
      expect(rule, selector).toMatch(/\bleft: 0;/);
      expect(rule, selector).not.toMatch(/inset-inline/);
    }
  });

  it('never pairs an engine edge in a translate with an inline inset', () => {
    const moved = rules.filter((r) =>
      /translate:[^;]*--cds-(motion-selection|lo)-l\b/.test(r.own)
    );
    expect(moved.length).toBeGreaterThan(5);
    for (const rule of moved) {
      expect(rule.own, rule.selector).not.toMatch(/inset-inline/);
    }
  });

  it('keeps what is placed at a value on the inline start, centered by direction', () => {
    for (const selector of [
      '.cds-slider__spot',
      '.cds-slider__tick',
      '.cds-slider__reference',
      '.cds-slider__meter-dot',
      '.cds-slider__meter-reference',
      '.cds-slider__step-label',
    ]) {
      const rule = own(selector);
      expect(rule, selector).toMatch(/inset-inline-start:/);
      expect(rule, selector).not.toMatch(/\bleft:/);
    }
    // No centering translate is spelled as a fixed side.
    expect(scss).not.toMatch(/translate:\s*-?50%/);
    expect(own('.cds-slider')).toMatch(/--_center: -50%;/);
    expect(own('.cds-slider:dir(rtl)')).toMatch(/--_center: 50%;/);
  });

  it('places a press aim from the left, where the script writes it', () => {
    const rule = own(':is(.cds-slider__aim--lower, .cds-slider__aim--upper)');
    expect(rule).toMatch(/\bleft: 0;/);
    expect(rule).toMatch(/inset-inline-start: auto;/);
  });

  it('turns the fill and the ramp round', () => {
    expect(own('.cds-slider:dir(rtl)')).toMatch(/--_ramp-to: to left;/);
    expect(scss).toMatch(/linear-gradient\(\s*var\(--_ramp-to\) in oklch/);
    // The line's fill ends at the right-hand end of the line.
    expect(own('.cds-slider--single:dir(rtl) .cds-slider__fill')).toMatch(
      /--_b: calc\(100% - var\(--sl-knob-w\) \/ 2\);/
    );
    expect(
      own('.cds-slider--track.cds-slider--single:dir(rtl) .cds-slider__fill')
    ).toMatch(/--_b: 100%;/);
  });
});

/* ── the pointer ── */

// A 300px track at x 100 with a 14px knob: its center travels 107 to 393.
const TRACK = { left: 100, width: 300, height: 24 };
const KNOB = 14;
const travel = TRACK.width - KNOB;
/** The client x a share of the way along, from the left. */
const at = (share: number) => TRACK.left + KNOB / 2 + share * travel;

const box = (left: number, width: number, height: number) =>
  ({
    left,
    top: 0,
    width,
    height,
    right: left + width,
    bottom: height,
    x: left,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

const isTrack = (el: Element) =>
  el.classList.contains('cds-slider__track') ||
  el.classList.contains('cds-slider__upper');
const isSpot = (el: Element) => el.classList.contains('cds-slider__spot');

// jsdom has no layout: the track, its spots and a press aim report the boxes
// a browser would give them in each direction.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      if (isTrack(this)) {
        return box(TRACK.left, TRACK.width, TRACK.height);
      }
      if (isSpot(this)) {
        const el = this as HTMLElement;
        if (el.style.left) {
          return box(TRACK.left + parseFloat(el.style.left), KNOB, KNOB);
        }
        const p = Number(el.style.getPropertyValue('--cds-slider-p') || 0);
        const rtl = el.closest('[dir]')?.getAttribute('dir') === 'rtl';
        return box(TRACK.left + (rtl ? 1 - p : p) * travel, KNOB, KNOB);
      }
      return box(0, 0, 0);
    }
  );
  const size = (wide: number, tall: number) =>
    function (this: HTMLElement) {
      return isTrack(this) ? wide : isSpot(this) ? KNOB : tall;
    };
  for (const [name, get] of [
    ['offsetWidth', size(TRACK.width, 0)],
    ['clientWidth', size(TRACK.width, 0)],
    ['offsetHeight', size(TRACK.height, 0)],
  ] as const) {
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get,
    });
  }
});
afterEach(cleanup);

/** A slider at 50 in a page running `dir`: its track and its onChange. */
function slider(dir: 'ltr' | 'rtl') {
  const onChange = vi.fn();
  const { container } = render(
    <div dir={dir}>
      <Slider
        id="volume"
        labelText="Volume"
        min={0}
        max={100}
        value={50}
        hideTextInput
        onChange={onChange}
      />
    </div>
  );
  const track = container.querySelector<HTMLElement>('.cds-slider__track')!;
  return { track, onChange };
}

/** jsdom has no PointerEvent: a mouse event of the pointer's type. */
const pointer = (type: string, target: Element | Window, clientX: number) =>
  fireEvent(
    target,
    new MouseEvent(type, { bubbles: true, button: 0, clientX })
  );

const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.lastCall?.[0]?.value;

describe('the slider pointer, by direction', () => {
  it('reads a press from the left end, left to right', () => {
    const { track, onChange } = slider('ltr');
    pointer('pointerdown', track, at(0.25));
    pointer('pointerup', window, at(0.25));
    expect(last(onChange)).toBe(25);
  });

  it('reads a press from the right end, right to left', () => {
    const { track, onChange } = slider('rtl');
    pointer('pointerdown', track, at(0.25));
    pointer('pointerup', window, at(0.25));
    expect(last(onChange)).toBe(75);
  });

  it('aims the press in px from the left in both directions', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const { track } = slider(dir);
      pointer('pointerdown', track, at(0.25));
      const aim = track.querySelector<HTMLElement>('.cds-slider__aim--lower')!;
      expect(parseFloat(aim.style.left), dir).toBeCloseTo(0.25 * travel);
      expect(aim.style.insetInlineStart, dir).toBe('');
      pointer('pointerup', window, at(0.25));
      cleanup();
    }
  });

  it('follows a drag toward the left up the scale, right to left', () => {
    const { track, onChange } = slider('rtl');
    pointer('pointerdown', track, at(0.25));
    pointer('pointermove', window, at(0.1));
    pointer('pointerup', window, at(0.1));
    expect(last(onChange)).toBe(90);
  });

  it('follows a drag toward the right up the scale, left to right', () => {
    const { track, onChange } = slider('ltr');
    pointer('pointerdown', track, at(0.25));
    pointer('pointermove', window, at(0.9));
    pointer('pointerup', window, at(0.9));
    expect(last(onChange)).toBe(90);
  });
});
