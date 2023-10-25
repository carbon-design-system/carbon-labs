import { defineConfig, loadEnv } from 'vite';

import fs from 'fs';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';

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

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

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
      lib: {
        entry: inputs,
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
            use: [
              [
                'sass',
                {
                  includePaths: ['./node_modules'],
                },
              ],
            ],
          }),
          postcssLit({
            include: ['/node_modules', '**/*.scss', '**/*.scss?inline*'],
          }),
        ],
      },
    },
  };
});
