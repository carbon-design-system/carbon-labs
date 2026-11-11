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
    // The seam too, so its import of carbon-motion goes through the same
    // resolver and not Node's. The kit's packages (the matrix's KitDefaults)
    // too, so their stylesheet imports go through the bundler.
    server: {
      deps: {
        inline: [
          /@carbon-labs\/motion-/,
          /@carbon-labs\/v12-motion/,
          /@carbon-labs\/react-/,
        ],
      },
    },
  },
});
