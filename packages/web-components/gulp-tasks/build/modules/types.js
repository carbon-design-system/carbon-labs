/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import gulp from 'gulp';
import path from 'path';
import through2 from 'through2';
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Builds the types modules (d.ts files)
 *
 * @returns {*} gulp stream
 */
function types() {
  const tsProject = ts.createProject(path.resolve(__dirname, '../../../tsconfig.json'));
  const { dts } = gulp
  .src([
    `${process.argv[4]}/**/*.ts`,
    `!src/components/**/__tests__/*.ts`,
    `!src/components/**/*-story*.ts*`,
    `!src/components/**/__stories__/*.ts`
  ])
  .pipe(sourcemaps.init())
  .pipe(tsProject());

return dts
  .pipe(
    through2.obj((file, enc, done) => {
      file.contents = Buffer.from(`${file.contents.toString()}\n//# sourceMappingURL=${path.basename(file.path)}.map\n`);
      done(null, file);
    })
  )
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(function(file){
    // output type files within the package folders itself, e.g. packages/web-components/{component}/es/..)
      const destPath = file.path.match(/(?<=src\/components\/)(.*?)(?=\/)/gm)[0];
      return `src/components/${destPath}/es`;
  }));
}

gulp.task('build:modules:types', types);
