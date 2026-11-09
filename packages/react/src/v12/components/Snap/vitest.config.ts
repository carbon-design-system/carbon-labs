/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Lane packages are workspace links; they, and the motion packages
  // behind the seam, run inline.
  resolve: { preserveSymlinks: true },
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    server: {
      deps: { inline: [/@carbon-labs\/motion-/, /@carbon-labs\/v12-motion/] },
    },
  },
});
