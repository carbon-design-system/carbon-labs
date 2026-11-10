/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  describeMarks,
  fromIsoDay,
  isoDay,
  resolveLocale,
  resolveMarks,
} from '../components/dates';

const en = resolveLocale('en');

describe('isoDay', () => {
  it('round-trips a day', () => {
    const d = new Date(2001, 9, 3);
    expect(isoDay(d)).toBe('2001-10-03');
    expect(fromIsoDay('2001-10-03').getTime()).toBe(d.getTime());
  });
});

describe('resolveMarks', () => {
  it('groups by day, most severe first, neutral by default', () => {
    const m = resolveMarks(
      [
        { date: new Date(2001, 9, 21, 15), kind: 'info', label: 'Planning' },
        { date: '10/21/2001', kind: 'error', label: 'Outage' },
        { date: new Date(2001, 9, 21), label: 'Lunch' },
        { date: 'not a date' },
      ],
      'm/d/Y',
      en
    );
    expect([...m.keys()]).toEqual(['2001-10-21']);
    expect(m.get('2001-10-21')!.map((x) => x.kind)).toEqual([
      'error',
      'info',
      'neutral',
    ]);
  });
});

describe('describeMarks', () => {
  it('reads the count, the labels and the kinds', () => {
    expect(
      describeMarks([
        { kind: 'error', label: 'Outage' },
        { kind: 'neutral', label: 'Lunch' },
      ])
    ).toBe('2 events: Outage (error), Lunch');
  });
  it('reads a kind with no label, and a bare neutral as a count', () => {
    expect(describeMarks([{ kind: 'warning' }])).toBe('1 event: warning');
    expect(describeMarks([{ kind: 'neutral' }])).toBe('1 event');
  });
});
