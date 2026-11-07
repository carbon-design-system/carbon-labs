/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The tests run git, Prettier and the linters on fixtures: seconds each
    // on a busy machine.
    testTimeout: 60000,
  },
});
