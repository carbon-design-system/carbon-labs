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
async function scripts() {
  const tsProject = ts.createProject(path.resolve(__dirname, '../../../tsconfig.json'));
  const {js} =  gulp.src([
      `packages/${process.argv[4]}/**/*.ts`,
      `!packages/${process.argv[4]}/**/*-story*.ts*`,
      `!packages/${process.argv[4]}/**/__stories__/*.ts`,
      `!packages/${process.argv[4]}/**/__tests__/*.ts`,
      `!packages/${process.argv[4]}/**/*.d.ts`,
    ]).pipe(sourcemaps.init()).pipe(tsProject());

  return js.pipe(
        babel({
          plugins: [
            babelPluginResourceJSPaths,
          ],
        })
      )
      // Avoids generating `.js` from interface-only `.ts` files
      .pipe(filter((file) => stripComments(file.contents.toString(), { sourceType: 'module' }).replace(/\s/g, '')))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(function(file){
        // output type files within the package folders itself (ie. packages/es/{component}/src/..)
        const destPath = file.path.match(/(?<=packages\/)(.*?)(?=\/)/gm)[0];
        return `packages/${destPath}/es`;
      }));
}

gulp.task('build:modules:scripts', scripts);
