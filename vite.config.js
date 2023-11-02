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
import fg from 'fast-glob';

// Defines an array of entry points to be used to search for files.
const entryPoints = [
  'src/index.js',
  'src/components/**/*.js',
  '!src/components/**/__stories__/*.js',
  'src/components/index.js',
  'src/services/**/*.js',
];

// Searches for files that match the patterns defined in the array of input points.
// Returns an array of relative file paths.
const files = fg.sync(entryPoints);

// Maps the file paths in the "files" array to an array of key-value pair.
const entities = files.map((file) => {
  // Extract the part of the file path after the "src" folder and before the file extension.
  const [key] = file.match(/(?<=src\/).*$/) || [];

  // Remove the file extension from the key.
  const keyWithoutExt = key.replace(/\.[^.]*$/, '');

  return [keyWithoutExt, file];
});

const entries = Object.fromEntries(entities);

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

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  let destDir = 'dist';
  let inputs = distInputs;

  if (mode === 'production') {
    destDir = 'es';
    inputs = entries;
  }

  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    build: {
      outDir: destDir,
      lib: {
        entry: inputs,
        /**
         * Sets the filename
         *
         * @param {object} _ obj
         * @param {string} entryName entryname
         * @returns {string}
         */
        fileName: (_, entryName) => {
          return `${entryName}.js`;
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
        ],
      },
    },
  };
});
