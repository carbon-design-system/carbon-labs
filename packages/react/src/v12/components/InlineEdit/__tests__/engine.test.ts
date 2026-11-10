/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { motionTokens } from '@carbon-labs/v12-motion';
import {
  boxTravel,
  failureText,
  resizeMs,
  rowsFor,
} from '../components/engine';

describe('boxTravel', () => {
  it('is the farther edge’s travel', () => {
    expect(boxTravel({ w: 120, h: 32 }, { w: 236, h: 32 })).toBe(116);
    expect(boxTravel({ w: 200, h: 40 }, { w: 200, h: 98 })).toBe(58);
    expect(boxTravel({ w: 200, h: 40 }, { w: 200, h: 40 })).toBe(0);
  });
});

describe('resizeMs', () => {
  it('takes its clock from the travel, times the slow motion', () => {
    expect(resizeMs(16)).toBe(motionTokens.duration['fast-02']);
    expect(resizeMs(116)).toBe(motionTokens.duration['moderate-01']);
    expect(resizeMs(116, 10)).toBe(motionTokens.duration['moderate-01'] * 10);
  });
});

describe('rowsFor', () => {
  it('counts the lines the text takes, at least one', () => {
    expect(rowsFor(18, 18)).toBe(1);
    expect(rowsFor(54, 18)).toBe(3);
    expect(rowsFor(0, 18)).toBe(1);
    expect(rowsFor(54, 0)).toBe(1);
  });
});

describe('failureText', () => {
  it('shows the error’s message, a string, or the fallback', () => {
    expect(failureText(new Error('Name taken'), 'Try again')).toBe(
      'Name taken'
    );
    expect(failureText('Offline', 'Try again')).toBe('Offline');
    expect(failureText(undefined, 'Try again')).toBe('Try again');
  });
});
