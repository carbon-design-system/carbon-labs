/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import gulp from 'gulp';
import path from 'path';
import { rollup } from 'rollup';
import getRollupConfig from '../../tools/get-rollup-config.js';

/**
 * Gets all of the folders and returns out
 *
 * @param {string} dir Directory to check
 * @returns {string[]} List of folders
 * @private
 */
function _getFolders(dir) {
  return fs.readdirSync(dir).filter((file) => fs.statSync(path.join(dir, file)).isDirectory());
}

/**
 * Builds all of the rollup bundles for all components
 *
 * @param {object} [options] The build options.
 * @param {string} [options.mode=development] The build mode.
 */
async function _buildComponents({ mode = 'development' } = {}) {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  const folders = _getFolders(`packages`);

  for (let i = folders.length - 1; i >= 0; i--) {
    if (!fs.existsSync(`packages/${folders[i]}/index.ts`)) {
      folders.splice(i, 1);
    }
  }

  return rollup(getRollupConfig({ mode, folders }))
    .then((bundle) => {
      bundle.write({
        format: 'es',
        dir: 'dist',
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
}

/**
 * Defined scripts to return as gulp tasks
 *
 * @type {object}
 * @private
 */
const _scripts = {
    dev() {
      return _buildComponents();
    },
    prod() {
      return _buildComponents({ mode: 'production' });
    },
};

// Gulp tasks (LTR)
gulp.task('build:dist:dev', _scripts.dev);
gulp.task('build:dist:prod', _scripts.prod);
gulp.task('build:dist', gulp.series(gulp.task('build:dist:dev'), gulp.task('build:dist:prod')));

