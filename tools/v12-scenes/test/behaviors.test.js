/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { argsParam, runName, runsOf, statusOf } from '../src/behaviors.js';
import { frameNear, sampleFor } from '../src/frames.js';
import { readIndex, rotate, touched, writeIndex } from '../src/rotate.js';
import { componentsOf, forComponents, SCENARIOS } from '../src/scenarios.js';
import { check, INVARIANTS, tracked } from '../src/invariants.js';

describe('rotate', () => {
  const all = ['Accordion', 'Modal', 'SidePanel', 'Tabs', 'Toggle'];

  it('takes the next few in turn and wraps around', () => {
    expect(rotate(all, 2, 0)).toEqual({
      picked: ['Accordion', 'Modal'],
      next: 2,
    });
    expect(rotate(all, 3, 4)).toEqual({
      picked: ['Toggle', 'Accordion', 'Modal'],
      next: 2,
    });
    expect(rotate(all, 9, 1).picked).toHaveLength(5);
    expect(rotate([], 2, 0)).toEqual({ picked: [], next: 0 });
  });

  it('adds the components a change touched, not everything', () => {
    expect(
      touched(
        {
          all: false,
          units: ['components/Tabs', 'catalog', 'components/Util'],
        },
        all
      )
    ).toEqual(['Tabs']);
    expect(touched({ all: true, units: [] }, all)).toEqual([]);
    expect(touched(null, all)).toEqual([]);
  });

  it('keeps its place in a file', () => {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'v12-rotate-')),
      'r.json'
    );
    expect(readIndex(file)).toBe(0);
    writeIndex(file, 3, ['Tabs']);
    expect(readIndex(file)).toBe(3);
  });
});

describe('the runs', () => {
  it('writes arguments the way Storybook reads them', () => {
    expect(argsParam({ subject: 'side-panel', size: '2xl', open: true })).toBe(
      'subject:side-panel;size:2xl;open:!true'
    );
  });

  it('runs each scenario in its themes, with and without reduced motion', () => {
    const s = { id: 'a/b', themes: ['v12-light', 'v12-dark'] };
    const runs = runsOf([s, { id: 'c/d', reduced: [false] }]);
    expect(runs.map((r) => [r.scenario.id, r.theme, r.reduced])).toEqual([
      ['a/b', 'v12-light', false],
      ['a/b', 'v12-light', true],
      ['a/b', 'v12-dark', false],
      ['a/b', 'v12-dark', true],
      ['c/d', 'v12-light', false],
    ]);
    expect(runsOf([s], { themes: ['v12-dark'] })).toHaveLength(2);
    expect(runName(runs[1])).toBe('a-b--v12-light--reduced');
  });
});

describe('the scenarios', () => {
  it('have unique ids, known components and known invariants', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const lane = new Set(
      fs.readdirSync(
        new URL('../../../packages/react/src/v12/components', import.meta.url)
      )
    );
    for (const s of SCENARIOS) {
      expect(lane.has(s.component), s.component).toBe(true);
      expect([
        'inset-shell',
        'flush-shell',
        'in-scroller',
        'page-scroll',
      ]).toContain(s.host);
      for (const [name] of [...s.checks, ...(s.reducedChecks ?? [])]) {
        expect(INVARIANTS[name], `${s.id}: ${name}`).toBeTypeOf('function');
      }
      for (const a of s.actions) {
        expect(a.name ?? a.do).toBeTruthy();
      }
    }
  });

  it('include the side panel’s push as known', () => {
    const known = SCENARIOS.filter(
      (s) => s.component === 'SidePanel' && s.known
    ).map((s) => s.id);
    expect(known).toEqual(
      expect.arrayContaining([
        'side-panel/close-mid-open',
        'side-panel/inset-gap-holds-while-opening',
        'side-panel/resize-while-open',
        'side-panel/start-beside-nav',
        'side-panel/xl-in-workspace',
        'side-panel/2xl-in-workspace',
        'side-panel/flush-in-inset-shell',
      ])
    );
  });

  it('filter by component, in any case', () => {
    expect(componentsOf(forComponents(SCENARIOS, ['sidepanel']))).toEqual([
      'SidePanel',
    ]);
    expect(forComponents(SCENARIOS, null)).toBe(SCENARIOS);
  });
});

describe('compositor frames and samples', () => {
  const samples = [
    { wall: 100, scroll: { y: 0 } },
    { wall: 116, scroll: { y: 30 } },
    { wall: 133, scroll: { y: 30 } },
    { wall: 150, scroll: { y: 60 } },
  ];

  it('pairs a frame with the page’s layout at its scroll offset', () => {
    expect(sampleFor(samples, { wall: 120, scrollY: 30 }, true)).toBe(2);
    expect(sampleFor(samples, { wall: 120, scrollY: 45 }, true)).toBe(-1);
  });

  it('pairs a frame with the sample before it, for a scroller', () => {
    expect(sampleFor(samples, { wall: 140, scrollY: 0 }, false)).toBe(2);
    expect(sampleFor(samples, { wall: 90, scrollY: 0 }, false)).toBe(-1);
  });

  it('finds the frame nearest a sample', () => {
    expect(frameNear([{ wall: 90 }, { wall: 131 }], { wall: 133 })).toBe(1);
  });
});

describe('a run’s status', () => {
  const rule = { invariant: 'gapHolds', frame: 3, detail: 'off' };

  it('passes with no violations and fails an open one', () => {
    expect(statusOf([])).toBe('pass');
    expect(statusOf([rule])).toBe('fail');
    expect(statusOf([{ ...rule, known: 'a behavior' }])).toBe('known');
    expect(statusOf([rule], 'a behavior')).toBe('known');
  });

  it('never lets known cover the harness', () => {
    for (const invariant of ['runs', 'loadsClean', 'settles', 'tracked']) {
      const v = { invariant, frame: -1, detail: 'x' };
      expect(statusOf([v], 'a behavior'), invariant).toBe('fail');
      expect(statusOf([rule, v], 'a behavior'), invariant).toBe('fail');
    }
  });

  it('fails a scenario whose selector matches nothing, known or not', () => {
    // Every frame lacks the tracked box: each rule skips it and finds
    // nothing, so only the tracking check can fail the run.
    const run = {
      dir: 'ltr',
      dpr: 2,
      marks: [{ name: 'open', frame: 0, end: 2 }],
      longFrames: [],
      samples: [0, 1, 2].map((i) => ({
        t: i * 16.7,
        at: i * 16.7,
        dt: 16.7,
        scroll: { x: 0, y: 0 },
        el: { marker: null, list: null },
      })),
    };
    const checks = [
      ['staysInside', { el: 'marker', container: 'list' }],
      ['continuous', { el: 'marker', edge: 'start', maxStep: 'auto' }],
      ['wholePixels', { el: 'marker' }],
    ];
    const violations = [
      ...check(run, checks),
      ...tracked(run, ['marker', 'list']),
    ];
    expect(violations.map((v) => v.invariant)).toEqual(['tracked', 'tracked']);
    expect(statusOf(violations)).toBe('fail');
    expect(statusOf(violations, 'a behavior')).toBe('fail');
  });
});
