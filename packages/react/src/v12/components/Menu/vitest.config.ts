/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Lane packages are workspace links; they, and the motion packages
  // behind the seam, run inline.
  resolve: { preserveSymlinks: true },
  test: {
    // The triggers' tests render React (the lane's shared jsdom setup).
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    setupFiles: [
      fileURLToPath(new URL('../../vitest.setup.ts', import.meta.url)),
    ],
    server: {
      deps: {
        inline: [
          /@carbon-labs\/motion-/,
          /@carbon-labs\/v12-motion/,
          /@carbon-labs\/react-/,
          /@carbon-labs\/motion-icons-core/,
          /@carbon-labs\/wc-motion-icons/,
        ],
      },
    },
  },
});
