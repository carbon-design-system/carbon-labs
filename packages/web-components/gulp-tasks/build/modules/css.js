/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import asyncDone from 'async-done';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import gulp from 'gulp';
import header from 'gulp-header';
import path from 'path';
import postcss from 'gulp-postcss';
import prettier from 'gulp-prettier';
import replaceExtension from 'replace-ext';
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import through2 from 'through2';
import {promisify} from 'util';
import {readFile} from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const readFileAsync = promisify(readFile);
const promisifyStream = promisify(asyncDone);

/**
 * Builds the CSS module file
 *
 * @param {object} [options] The build options.
 * @param {string} [options.banner] License banner
 * @returns {*} Gulp stream
 * @private
 */
const buildModulesCSS = ({ banner }) =>
 gulp
  .src([`${process.argv[4]}/**/*.scss`])
  .pipe(
    sass({
      includePaths: ['node_modules', '../../node_modules'],
    })
  )
  .pipe(
    postcss([
      autoprefixer(),
    ])
  )
  .pipe(cleanCSS())
  .pipe(
    through2.obj((file, enc, done) => {
      file.contents = Buffer.from(`
        import { css } from 'lit';
        export default css([${JSON.stringify(String(file.contents))}]);
      `);
      file.path = replaceExtension(
        file.path,
      '.css.js'
      );
      done(null, file);
    })
  )
  .pipe(prettier())
  .pipe(header(banner))
  .pipe(gulp.dest(function(file) {
    // output type files within the package folders itself, e.g. packages/web-components/{component}/es/..)
      const destPath = file.path.match(/(?<=src\/components\/)(.*?)(?=\/)/gm)[0];
      return `src/components/${destPath}/es`;
 }));

/**
 * Builds the CSS
 *
 * @returns {Promise<void>} Stream
 */
async function css() {
  const banner = await readFileAsync(
    path.resolve(__dirname, '../../../../../tools/license.js'),
    'utf8'
  );
  await Promise.all([
    promisifyStream(() => buildModulesCSS({ banner })),
  ]);
}

gulp.task('build:modules:css', css);
