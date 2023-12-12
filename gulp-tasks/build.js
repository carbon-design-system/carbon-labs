/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import gulp from 'gulp';
import './build/modules.js';

gulp.task('build', gulp.task('build:modules'));
