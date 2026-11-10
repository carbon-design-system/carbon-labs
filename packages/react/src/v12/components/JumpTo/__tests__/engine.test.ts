/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { motionTokens } from '@carbon-labs/v12-motion';
import {
  glideMs,
  JUMP_EDGE_PAD,
  jumpPlan,
  landingTop,
} from '../components/engine';

describe('jumpPlan', () => {
  it('glides the whole way within two views', () => {
    expect(jumpPlan(0, 800, 400)).toEqual({ first: null, glide: 800 });
    expect(jumpPlan(800, 0, 400)).toEqual({ first: null, glide: -800 });
  });

  it('jumps to one view short of a far target, then glides one view', () => {
    expect(jumpPlan(0, 5000, 400)).toEqual({ first: 4600, glide: 400 });
    expect(jumpPlan(5000, 0, 400)).toEqual({ first: 400, glide: -400 });
  });
});

describe('glideMs', () => {
  it('takes its clock from the distance steps, times the slow motion', () => {
    expect(glideMs(100)).toBe(motionTokens.duration['moderate-01']);
    expect(glideMs(-400)).toBe(motionTokens.duration['moderate-02']);
    expect(glideMs(400, 10)).toBe(motionTokens.duration['moderate-02'] * 10);
  });
});

describe('landingTop', () => {
  it('lands a target at the start, centre or end of the view', () => {
    expect(landingTop(1000, 1040, 400, 'start')).toBe(1000 - JUMP_EDGE_PAD);
    expect(landingTop(1000, 1040, 400, 'center')).toBe(820);
    expect(landingTop(1000, 1040, 400, 'end')).toBe(640 + JUMP_EDGE_PAD);
  });
});
