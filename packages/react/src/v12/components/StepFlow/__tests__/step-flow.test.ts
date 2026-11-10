/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  completeSteps,
  stepAnnouncement,
  stepDirection,
  stepMove,
} from '../components/steps';

describe('stepMove', () => {
  it('Next passes a valid step', () => {
    expect(stepMove(0, 1, [true, true, true])).toEqual({
      index: 1,
      blockedAt: null,
    });
  });

  it('Next on an invalid step stays and names it', () => {
    expect(stepMove(1, 2, [true, false, true])).toEqual({
      index: 1,
      blockedAt: 1,
    });
  });

  it('a jump forward stops on the first invalid step on the way', () => {
    expect(stepMove(0, 3, [true, false, true, true])).toEqual({
      index: 1,
      blockedAt: 1,
    });
  });

  it('Back always arrives, even from an invalid step', () => {
    expect(stepMove(2, 1, [true, true, false])).toEqual({
      index: 1,
      blockedAt: null,
    });
  });

  it('stays in range', () => {
    expect(stepMove(0, -1, [true, true])).toEqual({
      index: 0,
      blockedAt: null,
    });
    expect(stepMove(1, 5, [true, true])).toEqual({ index: 1, blockedAt: null });
  });
});

describe('completeSteps', () => {
  it('marks the steps before the current one', () => {
    expect(completeSteps(2, 2, [true, true, true])).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('keeps valid steps ahead complete after Back, short of the furthest reached', () => {
    expect(completeSteps(0, 2, [true, true, true])).toEqual([
      false,
      true,
      false,
    ]);
    expect(completeSteps(0, 2, [true, false, true])).toEqual([
      false,
      false,
      false,
    ]);
  });
});

describe('the words and the way', () => {
  it('announces the step by number and title', () => {
    expect(stepAnnouncement(1, 3, 'Access')).toBe('Step 2 of 3: Access');
  });

  it('goes forward from the end side and back from the start', () => {
    expect(stepDirection(0, 1)).toBe(1);
    expect(stepDirection(2, 1)).toBe(-1);
  });
});
