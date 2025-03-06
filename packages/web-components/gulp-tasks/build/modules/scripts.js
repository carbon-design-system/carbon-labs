/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import gulp from 'gulp';
import babel from 'gulp-babel'
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';
import stripComments from 'strip-comments';
import filter from 'gulp-filter';
import babelPluginResourceJSPaths from '../../../tools/babel-plugin-resource-js-paths.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Builds the module script files
 *
 * @returns {*} Gulp stream
 */
function scripts() {
  const tsProject = ts.createProject(path.resolve(__dirname, '../../../tsconfig.json'));
  const { js } =  gulp.src([
      `src/components/**/*.ts`,
      `!src/components/**/*-story*.ts*`,
      `!src/components/**/__stories__/*.ts`,
      `!src/components/**/__tests__/*.ts`,
      `!src/components/**/**/*.d.ts`,
    ])
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return js
    .pipe(
      babel({
        plugins: [
          babelPluginResourceJSPaths,
        ],
      })
    )
    // Avoids generating `.js` from interface-only `.ts` files
    .pipe(filter((file) => stripComments(file.contents.toString(), { sourceType: 'module' }).replace(/\s/g, '')))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(function(file) {
      // console.log('SCRIPT FILE:', file.path);
      // output type files within the package folders itself, e.g. packages/web-components/{component}/es/..)
      const destPath = file.path.match(/(?<=src\/components\/)(.*?)(?=\/)/gm)[0];
      // console.log('SCRIPT DEST:', `src/components/${destPath}/es`);
      //remove the component name from file path
      file.path = file.path.replace(`${destPath}/`, '');
      return `src/components/${destPath}/es`;
    }));
}

gulp.task('build:modules:scripts', scripts);
