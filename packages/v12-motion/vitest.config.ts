/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // carbon-motion's packages run inline, so their imports resolve as the
  // seam's do.
  resolve: { preserveSymlinks: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    server: { deps: { inline: [/@carbon-labs\/motion-/] } },
  },
});
