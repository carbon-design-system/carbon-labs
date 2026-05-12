/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'es',
    lib: {
      entry: [],
      name: 'wc-global-header',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        'wc-global-header': 'index.ts',
        'wc-global-header-react': 'index-react.ts',
        styles: 'components/global-header/src/index.scss',
      },
      external: ['react', 'react-dom'],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
