/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vite';
import litcss from 'vite-plugin-lit-css';

export default defineConfig({
  plugins: [litcss()],
});
