/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  dayLabel,
  dayStart,
  relativeTimeText,
} from '../components/relativeTime';

const at = (h: number, m = 0) => new Date(2026, 9, 29, h, m).getTime();

describe('relativeTimeText', () => {
  it('is just now under a minute, minutes under an hour, hours today', () => {
    expect(relativeTimeText(at(12), at(12, 0) + 30_000)).toBe('Just now');
    expect(relativeTimeText(at(12), at(12, 5))).toBe('5 min ago');
    expect(relativeTimeText(at(9), at(12, 30))).toBe('3 h ago');
  });
  it('is the clock time on an earlier day', () => {
    expect(relativeTimeText(at(23) - 86_400_000, at(1))).toMatch(/11:00/);
  });
  it('never reads ahead of now', () => {
    expect(relativeTimeText(at(12, 1), at(12))).toBe('Just now');
  });
});

describe('dayLabel', () => {
  it('names today and yesterday, then the date', () => {
    const now = at(12);
    expect(dayLabel(dayStart(now), now)).toBe('Today');
    expect(dayLabel(dayStart(now - 86_400_000), now)).toBe('Yesterday');
    expect(dayLabel(dayStart(now - 3 * 86_400_000), now)).toMatch(/October 26/);
  });
});
