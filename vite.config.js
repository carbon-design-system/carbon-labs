/**
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig, loadEnv } from 'vite';

import fs from 'fs';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import terser from '@rollup/plugin-terser';

/**
 * Gets all of the folders and returns out
 *
 * @param {string} dir Directory to check
 * @returns {string[]} List of folders
 * @private
 */
function _getFolders(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => fs.statSync(path.join(dir, file)).isDirectory());
}

/**
 * Fetches the inputs for dist
 *
 * @returns {{}} Associative array of inputs
 * @private
 */
function _getDistInputs() {
  const folders = _getFolders('src/components');
  for (let i = folders.length - 1; i >= 0; i--) {
    if (!fs.existsSync(`src/components/${folders[i]}/index.js`)) {
      folders.splice(i, 1);
    }
  }

  const inputs = {};

  folders.forEach((folder) => {
    inputs[`${folder}`] = `src/components/${folder}/index.js`;
  });

  return inputs;
}

const distInputs = _getDistInputs();

/**
 * Stores the suffix to append depending on build mode
 *
 * @type {{development: string, production: string}}
 */
const modeSuffixes = {
  development: '',
  production: '.min',
};

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    build: {
      outDir: 'dist',
      lib: {
        entry: distInputs,
        /**
         * Sets the filename
         *
         * @param {object} _ obj
         * @param {string} entryName entryname
         * @returns {string}
         */
        fileName: (_, entryName) => {
          return `${entryName}${modeSuffixes[mode]}.js`;
        },
        formats: ['es'],
      },
      rollupOptions: {
        plugins: [
          resolve({
            browser: true,
          }),
          postcss({
            extensions: ['.scss'],
            minimize: true,
            use: [['sass']],
          }),
          postcssLit({
            include: ['./node_modules', 'src/**/*.scss', 'src/**/*.scss?*'],
          }),
          ...(mode === 'production' ? [terser()] : []),
        ],
      },
    },
  };
});
