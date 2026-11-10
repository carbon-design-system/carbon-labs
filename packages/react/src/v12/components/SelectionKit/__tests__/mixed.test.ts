/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { mixedCheckbox, mixedState, mixedToggleTo } from '../components/mixed';

describe('the mixed rule', () => {
  it('all on: checked; some: mixed; none: unchecked', () => {
    expect(mixedState(3, 3)).toBe('checked');
    expect(mixedState(1, 3)).toBe('mixed');
    expect(mixedState(0, 3)).toBe('unchecked');
  });

  it('a mixed child makes the parent mixed', () => {
    expect(mixedState(0, 3, 1)).toBe('mixed');
    expect(mixedState(2, 3, 1)).toBe('mixed');
  });

  it('nothing to count: unchecked', () => {
    expect(mixedState(0, 0)).toBe('unchecked');
  });

  it('the Checkbox’s props', () => {
    expect(mixedCheckbox('mixed')).toEqual({
      checked: false,
      indeterminate: true,
    });
    expect(mixedCheckbox('checked')).toEqual({
      checked: true,
      indeterminate: false,
    });
    expect(mixedCheckbox('unchecked')).toEqual({
      checked: false,
      indeterminate: false,
    });
  });

  it('a click: mixed or unchecked selects all, checked clears (Carbon’s checkbox)', () => {
    expect(mixedToggleTo('mixed')).toBe(true);
    expect(mixedToggleTo('unchecked')).toBe(true);
    expect(mixedToggleTo('checked')).toBe(false);
  });
});
