/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// These tests were written against Jest's `jest.fn`, `jest.spyOn` and fake
// timers; `vi` has the same calls.
(globalThis as { jest?: typeof vi }).jest = vi;

afterEach(() => cleanup());
