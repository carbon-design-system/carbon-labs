/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import {
  getComponentsDir,
  getStorybookScript,
  getV12StorybookGroup,
  validateLane,
} from '../src/utils/lane.js';

describe('getComponentsDir', () => {
  it('uses src/components by default', () =>
    expect(getComponentsDir()).toBe(join('src', 'components')));
  it('uses src/v12/components for the v12 lane', () =>
    expect(getComponentsDir({ v12: true })).toBe(
      join('src', 'v12', 'components')
    ));
});

describe('getStorybookScript', () => {
  it('uses storybook by default', () =>
    expect(getStorybookScript()).toBe('storybook'));
  it('uses storybook:v12 for the v12 lane', () =>
    expect(getStorybookScript({ v12: true })).toBe('storybook:v12'));
});

describe('getV12StorybookGroup', () => {
  it('passes the group through outside the v12 lane', () => {
    expect(getV12StorybookGroup({ group: 'Labs' })).toBe('Labs');
    expect(getV12StorybookGroup({})).toBeUndefined();
  });
  it('defaults to V12', () =>
    expect(getV12StorybookGroup({ v12: true })).toBe('V12'));
  it('nests a group under V12', () =>
    expect(getV12StorybookGroup({ v12: true, group: 'Patterns' })).toBe(
      'V12/Patterns'
    ));
  it('does not prefix a group that is already under V12', () => {
    expect(getV12StorybookGroup({ v12: true, group: 'V12' })).toBe('V12');
    expect(getV12StorybookGroup({ v12: true, group: 'V12/Patterns' })).toBe(
      'V12/Patterns'
    );
  });
});

describe('validateLane', () => {
  it('accepts any type outside the v12 lane', () => {
    expect(() => validateLane({ type: 'react' })).not.toThrow();
    expect(() => validateLane({ type: 'web-component' })).not.toThrow();
  });
  it('accepts React in the v12 lane', () =>
    expect(() => validateLane({ v12: true, type: 'react' })).not.toThrow());
  it('refuses web components in the v12 lane', () =>
    expect(() => validateLane({ v12: true, type: 'web-component' })).toThrow(
      /React components only/
    ));
});
