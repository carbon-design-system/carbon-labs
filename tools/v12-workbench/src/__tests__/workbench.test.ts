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
import {
  CORNERS,
  DEFAULT_GLOBALS,
  DENSITIES,
  MOTION_LEVEL,
  REDUCED_MOTION,
  THEMES,
  V11_THEMES,
  ZONE_THEMES,
  levelOf,
  readGlobals,
  timeScaleOf,
} from '../constants';
import { globalTypes } from '../globals';
import { storyFrameUrl } from '../compare';

describe('the toolbar globals', () => {
  it('fall back to the defaults when a value is not on the list', () => {
    const picks = readGlobals({ theme: 'sepia', clock: '2', dir: 'rtl' });
    expect(picks.theme).toBe('v12-light');
    expect(picks.clock).toBe('1');
    expect(picks.dir).toBe('rtl');
  });

  it('offer only v12 light and v12 dark, and start on v12 light', () => {
    expect(THEMES).toEqual(['v12-light', 'v12-dark']);
    expect(globalTypes.theme.toolbar.items).toEqual([
      { value: 'v12-light', title: 'v12 light' },
      { value: 'v12-dark', title: 'v12 dark' },
    ]);
    expect(DEFAULT_GLOBALS.theme).toBe('v12-light');
    expect(readGlobals({ theme: 'v12-dark' }).theme).toBe('v12-dark');
    expect(readGlobals({}).theme).toBe('v12-light');
  });

  it('read a v11 theme as the v12 theme of its side', () => {
    expect(V11_THEMES).toEqual({
      white: 'v12-light',
      g10: 'v12-light',
      g90: 'v12-dark',
      g100: 'v12-dark',
    });
    for (const [v11, v12] of Object.entries(V11_THEMES)) {
      expect(readGlobals({ theme: v11 }).theme).toBe(v12);
    }
    expect(readGlobals({ theme: 'toString' }).theme).toBe('v12-light');
  });

  it('draw the matrix in both v12 themes', () => {
    expect(ZONE_THEMES).toEqual(['v12-light', 'v12-dark']);
  });

  it('turn the clock into a time scale', () => {
    expect(timeScaleOf('1')).toBe(1);
    expect(timeScaleOf('0.25')).toBe(4);
    expect(timeScaleOf('0.1')).toBe(10);
  });
});

describe('the density, corners and motion picks', () => {
  const values = (type: { toolbar: { items: { value: string }[] } }) =>
    type.toolbar.items.map((i) => i.value);

  it('offer the kit three densities and its corners, and the toolbar matches', () => {
    expect(DENSITIES).toEqual(['compact', 'default', 'spacious']);
    expect(CORNERS).toEqual(['default', 'full', 'rounded', 'square']);
    expect(values(globalTypes.density)).toEqual([...DENSITIES]);
    expect(values(globalTypes.corners)).toEqual([...CORNERS]);
    expect(values(globalTypes.reducedMotion)).toEqual([...REDUCED_MOTION]);
  });

  it('start on the kit own density and corners, and the system motion', () => {
    expect(DEFAULT_GLOBALS).toMatchObject({
      density: 'default',
      corners: 'default',
      reducedMotion: 'system',
    });
    expect(
      readGlobals({ density: 'spacious', corners: 'square' })
    ).toMatchObject({ density: 'spacious', corners: 'square' });
    expect(
      readGlobals({ density: 'roomy', reducedMotion: 'off' })
    ).toMatchObject({ density: 'default', reducedMotion: 'system' });
  });

  it('follow the system with no pick, and force a level with one', () => {
    expect(MOTION_LEVEL).toEqual({
      system: 'system',
      full: 'full',
      'shorter-clock': 'reduced',
      'at-once': 'none',
    });
  });
});

describe('the level', () => {
  it('is the system level when nothing is picked', () => {
    expect(levelOf('system', true)).toBe('reduced');
    expect(levelOf('system', false)).toBe('full');
  });

  it('is the pick when one is made, full included, whatever the system asks', () => {
    expect(levelOf('full', true)).toBe('full');
    expect(levelOf('shorter-clock', false)).toBe('reduced');
    expect(levelOf('at-once', false)).toBe('none');
    expect(levelOf('at-once', true)).toBe('none');
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
      storyFrameUrl('v12-x--y', { theme: 'v12-dark', clock: '0.25', skip: {} })
    );
    expect(url.pathname.endsWith('/iframe.html')).toBe(true);
    expect(url.searchParams.get('id')).toBe('v12-x--y');
    expect(url.searchParams.get('globals')).toBe('theme:v12-dark;clock:0.25');
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
