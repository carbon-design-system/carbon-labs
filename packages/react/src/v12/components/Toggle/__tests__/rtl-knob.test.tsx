/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

// Right to left the toggle mirrors: off is the right-hand stop. The stops and
// the marks follow by their inline insets. The engine's edges stay px from
// the track's left, so the knob is placed with `left`, the fill measures its
// travel from the right, and the drag is handed its stops left to right.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { Toggle } from '../index';

setReducedMotion(true);

const here = path.dirname(fileURLToPath(import.meta.url));
const scss = fs.readFileSync(
  path.resolve(here, '../components/toggle.scss'),
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

describe('the toggle stylesheet, right to left', () => {
  it('places the knob from the left, where the engine counts from', () => {
    const knob = own('.cds-toggle__knob');
    expect(knob).toMatch(/\bleft: 0;/);
    expect(knob).not.toMatch(/inset-inline/);
    expect(knob).toMatch(/translate:[^;]*--cds-motion-selection-l/);
  });

  it('keeps the stops and the marks on the inline start', () => {
    for (const selector of [
      '.cds-toggle__stop--off',
      '.cds-toggle__stop--on',
      '.cds-toggle__mark--off',
      '.cds-toggle__mark--on',
    ]) {
      const rule = own(selector);
      expect(rule, selector).toMatch(/inset-inline-start:/);
      expect(rule, selector).not.toMatch(/\bleft:/);
    }
  });

  it('measures the travel from the right and fills leftward', () => {
    const rtl = own('.cds-toggle__track:dir(rtl)');
    expect(rtl).toMatch(/--_fill-to: to left;/);
    // Off, from the knob's right edge; on, from its left.
    expect(rtl).toMatch(/--_p:[^;]*--cds-motion-selection-r/);
    expect(rtl).toMatch(/--_k:/);
    const on = rules.filter(
      (r) => r.selector === '&[data-on]' && /--_p:/.test(r.own)
    );
    expect(on).toHaveLength(2);
    expect(on[1].own).toMatch(/--cds-motion-selection-l/);
    expect(own('.cds-toggle__fill')).toMatch(
      /mask-image: linear-gradient\(\s*var\(--_fill-to, to right\),/
    );
  });
});

/* ── the drag ── */

// A 48px track with an 18px knob inset 3px: its stops at 3 and 27.
const TRACK = 48;
const KNOB = 18;
const NEAR = 3;
const FAR = TRACK - NEAR - KNOB;

const box = (left: number, width: number, height: number, top = 0) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

// jsdom has no layout: the track and its stops report the boxes a browser
// would give them in each direction.
beforeAll(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      if (this.classList.contains('cds-toggle__track')) {
        return box(0, TRACK, 24);
      }
      if (this.classList.contains('cds-toggle__stop')) {
        const rtl = this.closest('[dir]')?.getAttribute('dir') === 'rtl';
        const on = this.classList.contains('cds-toggle__stop--on');
        return box(on !== rtl ? FAR : NEAR, KNOB, KNOB, NEAR);
      }
      return box(0, 0, 0);
    }
  );
  for (const [name, px] of [
    ['offsetWidth', TRACK],
    ['offsetHeight', 24],
  ] as const) {
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('cds-toggle__track') ? px : 0;
      },
    });
  }
});

function toggle(dir: 'ltr' | 'rtl') {
  render(
    <div dir={dir}>
      <Toggle id="t" labelText="Wi-Fi" />
    </div>
  );
  const track = screen.getByRole('switch');
  const knobLeft = () =>
    parseFloat(track.style.getPropertyValue('--cds-motion-selection-l'));
  return { track, knobLeft };
}

const pointer = (type: string, target: Element | Window, clientX: number) =>
  fireEvent(
    target,
    new PointerEvent(type, { bubbles: true, button: 0, clientX, pointerId: 1 })
  );

describe('the toggle drag, by direction', () => {
  it('rests off at the left, left to right, and follows a drag to on', () => {
    const { track, knobLeft } = toggle('ltr');
    expect(knobLeft()).toBeCloseTo(NEAR);
    pointer('pointerdown', track, NEAR + KNOB / 2);
    pointer('pointermove', window, 30);
    expect(knobLeft()).toBeCloseTo(30 - KNOB / 2);
    pointer('pointerup', window, 30);
    expect(track).toHaveAttribute('aria-checked', 'true');
  });

  it('rests off at the right, right to left, and follows a drag to on', () => {
    const { track, knobLeft } = toggle('rtl');
    expect(knobLeft()).toBeCloseTo(FAR);
    pointer('pointerdown', track, FAR + KNOB / 2);
    pointer('pointermove', window, 20);
    // Under the pointer, not held at the stop it left.
    expect(knobLeft()).toBeCloseTo(20 - KNOB / 2);
    pointer('pointerup', window, 20);
    expect(track).toHaveAttribute('aria-checked', 'true');
  });

  it('comes back off when the drag returns, right to left', () => {
    const { track } = toggle('rtl');
    pointer('pointerdown', track, FAR + KNOB / 2);
    pointer('pointermove', window, 10);
    pointer('pointermove', window, 34);
    pointer('pointerup', window, 34);
    expect(track).toHaveAttribute('aria-checked', 'false');
  });
});
