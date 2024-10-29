/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import gulp from 'gulp';
import './modules/css.js'
import './modules/scripts.js';
import './modules/types.js'

gulp.task(
  'build:modules',
  gulp.parallel(
    gulp.task('build:modules:css'),
    gulp.task('build:modules:scripts'),
    gulp.task('build:modules:types')
  )
);
