/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  BUTTON_DEFAULTS,
  iconSizeFor,
  resolveButtonLook,
  resolveToggleLook,
  withTimeScale,
} from '../components/props';

describe('withTimeScale', () => {
  it('leaves motion as it is without a timeScale', () => {
    const motion = { timeScale: 2, stretch: 6 };
    expect(withTimeScale(motion, undefined)).toBe(motion);
    expect(withTimeScale(undefined, undefined)).toBeUndefined();
  });
  it('wins over motion.timeScale', () => {
    expect(withTimeScale({ timeScale: 2, stretch: 6 }, 4)).toEqual({
      timeScale: 4,
      stretch: 6,
    });
    expect(withTimeScale(undefined, 4)).toEqual({ timeScale: 4 });
  });
});

describe('resolveButtonLook', () => {
  it('is the primary fill by default', () => {
    expect(resolveButtonLook({})).toBe('primary');
  });
  it('fills each role', () => {
    expect(resolveButtonLook({ kind: 'secondary' })).toBe('secondary');
    expect(resolveButtonLook({ kind: 'danger' })).toBe('danger');
  });
  it('maps v11 tertiary and ghost onto variant and frame', () => {
    expect(resolveButtonLook({ variant: 'outlined' })).toBe('tertiary');
    expect(resolveButtonLook({ frame: 'ghost' })).toBe('ghost');
    expect(resolveButtonLook({ kind: 'danger', variant: 'outlined' })).toBe(
      'danger--tertiary'
    );
    expect(resolveButtonLook({ kind: 'danger', frame: 'ghost' })).toBe(
      'danger--ghost'
    );
  });
  it('makes tonal the neutral quiet fill, and frame none the text button', () => {
    expect(resolveButtonLook({ variant: 'tonal' })).toBe('neutral');
    expect(resolveButtonLook({ kind: 'secondary', variant: 'tonal' })).toBe(
      'neutral'
    );
    expect(resolveButtonLook({ frame: 'none' })).toBe('text');
  });
  it('lets the frame win over the variant', () => {
    expect(resolveButtonLook({ variant: 'outlined', frame: 'ghost' })).toBe(
      'ghost'
    );
  });
  it('names each axis’s default: kind primary, variant filled, frame inset', () => {
    expect(BUTTON_DEFAULTS).toEqual({
      kind: 'primary',
      variant: 'filled',
      frame: 'inset',
    });
    expect(
      resolveButtonLook({ kind: 'danger', variant: 'filled', frame: 'inset' })
    ).toBe('danger');
  });
  it('takes a component’s own default on one axis, and setting another axis never resets it', () => {
    expect(resolveButtonLook({}, { frame: 'ghost' })).toBe('ghost');
    expect(resolveButtonLook({ kind: 'danger' }, { frame: 'ghost' })).toBe(
      'danger--ghost'
    );
    expect(
      resolveButtonLook({ kind: 'secondary' }, { variant: 'outlined' })
    ).toBe('tertiary');
    expect(
      resolveButtonLook(
        { kind: 'secondary', variant: 'filled' },
        { variant: 'outlined' }
      )
    ).toBe('secondary');
    expect(resolveButtonLook({ frame: 'inset' }, { frame: 'ghost' })).toBe(
      'primary'
    );
  });
});

describe('resolveToggleLook', () => {
  it('defaults to inverse, the neutral track and a gray dot', () => {
    expect(resolveToggleLook({})).toEqual({
      variant: 'inverse',
      track: 'neutral',
      mark: 'neutral',
    });
  });
  it('colors the track for hero and status, with no dot', () => {
    expect(resolveToggleLook({ variant: 'hero' })).toEqual({
      variant: 'inverse',
      track: 'hero',
      mark: 'none',
    });
    expect(resolveToggleLook({ variant: 'status', mark: 'status' })).toEqual({
      variant: 'inverse',
      track: 'status',
      mark: 'none',
    });
  });
  it('keeps the neutral looks and their dots', () => {
    expect(resolveToggleLook({ variant: 'tonal', mark: 'status' })).toEqual({
      variant: 'tonal',
      track: 'neutral',
      mark: 'status',
    });
    expect(resolveToggleLook({ variant: 'outlined', mark: false })).toEqual({
      variant: 'outlined',
      track: 'neutral',
      mark: 'none',
    });
  });
});

describe('iconSizeFor', () => {
  it('returns 20 at lg', () => {
    expect(iconSizeFor('lg')).toBe(20);
  });
  it('returns 16 for every other size', () => {
    expect(iconSizeFor('xs')).toBe(16);
    expect(iconSizeFor('sm')).toBe(16);
    expect(iconSizeFor('md')).toBe(16);
  });
});
