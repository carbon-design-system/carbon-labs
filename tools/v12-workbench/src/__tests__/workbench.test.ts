/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { motionTokens } from '@carbon-labs/v12-motion';
import { applyClock, clockDraft } from '../clock';
import { describeMotion, motionReport } from '../motion';
import { readGlobals, timeScaleOf } from '../constants';
import { storyFrameUrl } from '../compare';

describe('the toolbar globals', () => {
  it('fall back to the defaults when a value is not on the list', () => {
    const picks = readGlobals({ theme: 'g90', clock: '2', dir: 'rtl' });
    expect(picks.theme).toBe('white');
    expect(picks.clock).toBe('1');
    expect(picks.dir).toBe('rtl');
  });

  it('turn the clock into a time scale', () => {
    expect(timeScaleOf('1')).toBe(1);
    expect(timeScaleOf('0.25')).toBe(4);
    expect(timeScaleOf('0.1')).toBe(10);
  });
});

describe('the clock', () => {
  it('drafts every duration and stagger step, and leaves instant alone', () => {
    const draft = clockDraft(4);
    expect(draft['duration-fast-01']).toEqual({ value: 320 });
    expect(draft['stagger-step-04']).toEqual({ value: '160ms' });
    expect(draft['duration-instant']).toBeUndefined();
  });

  it('scales the live tokens and undoes it', () => {
    const undo = applyClock(4);
    expect(motionTokens.duration['fast-01']).toBe(320);
    // CSS reads 1x: the slowing of CSS motion is by playback rate.
    expect(
      document.documentElement.style.getPropertyValue(
        '--cds-motion-duration-fast-01'
      )
    ).toBe('80ms');
    undo();
    expect(motionTokens.duration['fast-01']).toBe(80);
    expect(
      document.documentElement.style.getPropertyValue(
        '--cds-motion-duration-fast-01'
      )
    ).toBe('');
  });
});

describe('the motion panel data', () => {
  it('describes a seam constant with its token values', () => {
    const entry = describeMotion('content-swap', 'at-once');
    const names = entry.rows.map((r) => r.name);
    expect(names).toContain('out.duration');
    expect(entry.rows.find((r) => r.name === 'out.duration')?.value).toBe(
      'fast-01 (80ms)'
    );
    expect(entry.reduced).toBe('at-once');
  });

  it('describes a registry family from the pattern tokens', () => {
    const entry = describeMotion('rollover');
    expect(entry.rows.some((r) => r.name.startsWith('pattern-rollover'))).toBe(
      true
    );
    expect(entry.reduced).toBeNull();
  });

  it('reports a story', () => {
    const report = motionReport('v12-x--y', {
      motion: ['duration-fast-02'],
      states: ['rest'],
    });
    expect(report.declared).toBe(true);
    expect(report.entries[0].rows[0]).toMatchObject({
      name: 'duration-fast-02',
      value: '120ms',
    });
    expect(report.reducedClock).toBe(0.5);
    expect(report.floorMs).toBe(1);
  });
});

describe('the compare frame', () => {
  it('carries the current globals to the other story', () => {
    const url = new URL(
      storyFrameUrl('v12-x--y', { theme: 'g100', clock: '0.25', skip: {} })
    );
    expect(url.pathname.endsWith('/iframe.html')).toBe(true);
    expect(url.searchParams.get('id')).toBe('v12-x--y');
    expect(url.searchParams.get('globals')).toBe('theme:g100;clock:0.25');
  });

  it("writes a boolean in Storybook's URL form", () => {
    const url = new URL(
      storyFrameUrl('v12-x--y', { outline: false, measureEnabled: true })
    );
    expect(url.searchParams.get('globals')).toBe(
      'outline:!false;measureEnabled:!true'
    );
  });
});
