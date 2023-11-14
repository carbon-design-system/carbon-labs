/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import babel from 'gulp-babel';
import filter from 'gulp-filter';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import stripComments from 'strip-comments';
import babelPluginResourceJSPaths from '../../../tools/babel-plugin-resource-js-paths.js';


/**
 * Builds the module script files
 *
 * @returns {*} Gulp stream
 */
function scripts() {
  return (
    gulp
      .src([
        `packages/**/*.ts`,
        `!packages/**/*-story*.ts*`,
        `!packages/**/__stories__/*.ts`,
        `!packages/*/__tests__/*.(ts|js)`,
        `!packages/**/*.d.ts`,
      ])
      .pipe(sourcemaps.init())
      .pipe(
        babel({
          presets: ['@babel/preset-modules'],
          // `version` field ensures `@babel/plugin-transform-runtime` is applied to newer helpers like decorator
          plugins: [
            '@babel/plugin-transform-typescript',
            ['@babel/plugin-transform-runtime', { useESModules: true, version: '7.8.0' }],
            ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}],
            '@babel/plugin-transform-class-properties',
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
        file.dirname = file.dirname.replace(`/${destPath}`, '')
        return `packages/${destPath}/es`;
      }))
  );
}

gulp.task('build:modules:scripts', scripts);
