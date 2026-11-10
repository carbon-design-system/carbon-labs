/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { CANCEL_WINDOW, isCancelAbort } from '../animation-wait';

const abort = () => new DOMException('aborted', 'AbortError');

describe('the cancelled animation guard', () => {
  it('takes an AbortError right after a cancel', () => {
    expect(isCancelAbort(abort(), 1000, 1000 - CANCEL_WINDOW)).toBe(true);
  });

  it('leaves an AbortError with no cancel near it', () => {
    expect(isCancelAbort(abort(), 1000, 1000 - CANCEL_WINDOW - 1)).toBe(false);
    expect(isCancelAbort(abort(), 1000, -Infinity)).toBe(false);
  });

  it('leaves every other rejection', () => {
    expect(isCancelAbort(new Error('aborted'), 1000, 1000)).toBe(false);
    expect(
      isCancelAbort(new DOMException('x', 'NotAllowedError'), 1000, 1000)
    ).toBe(false);
    expect(isCancelAbort(undefined, 1000, 1000)).toBe(false);
  });
});
