/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Shared jsdom config for the v12 component packages whose tests render
 * React. A package points its `test` script at this file
 * (`vitest run --config ../../vitest.shared.ts`) and runs from its own
 * folder, so `include` is relative to that package.
 */
export default defineConfig({
  // Lane packages are workspace links; they run inline.
  resolve: { preserveSymlinks: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    server: {
      deps: {
        inline: [/@carbon-labs\/react-/, /@carbon-labs\/v12-/],
      },
    },
  },
});
