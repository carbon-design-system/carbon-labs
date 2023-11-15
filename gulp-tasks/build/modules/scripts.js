/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// import filter from 'gulp-filter';
import path from 'path';
// import ts from 'gulp-typescript';
import gulp from 'gulp';
import babel from 'gulp-babel'
import globby from 'globby';
import { rollup } from 'rollup';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import ignoreImport from 'rollup-plugin-ignore-import';
import typescript from '@rollup/plugin-typescript';
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';
import stripComments from 'strip-comments';
import filter from 'gulp-filter';
import babelPluginResourceJSPaths from '../../../tools/babel-plugin-resource-js-paths.js';
import rollupPluginLitSCSS from '../../../tools/rollup-plugin-lit-scss.js';
import rollupPluginCssJsPaths from '../../../tools/rollup-plugin-css-js-paths.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Defines an array of entry points to be used to search for files.
const entryPoints = [
  'packages/**/*.ts',
  '!packages/**/*.scss',
  '!packages/**/__stories__/*.js',
  '!packages/**/__tests__/*',
  '!packages/**/es/*'
];

// Searches for files that match the patterns defined in the array of input points.
// Returns an array of relative file paths.
const files = await globby (entryPoints);

// Maps the file paths in the "files" array to an array of key-value pair.
const entities = files.map((file) => {
  // Extract the part of the file path after the "packages" folder and before the file extension.
  const [key] = file.match(/(?<=packages\/).*$/) || [];

  // Remove the file extension from the key and add 'es' directory in the file path
  const keyWithoutExt = key.replace(/\.[^.]*$/, '').replace('/', '/es/');
  return [keyWithoutExt, file];
});

const entries = Object.fromEntries(entities);

/**
 * Builds the module script files
 *
 * @returns {*} Gulp stream
 */
async function scripts() {
  // return rollup({
  //     input: entries,
  //     plugins: [
  //       nodeResolve({
  //         browser: true,
  //         preferBuiltins: false,
  //         extensions: ['.js', '.ts', '.scss'],
  //       }),
  //       commonjs({
  //         include: [/node_modules/],
  //         sourceMap: true,
  //       }),
  //       ignoreImport({
  //         extensions: ['.scss', '.css'],
  //       }),
  //       getBabelOutputPlugin({
  //         plugins: [
  //           babelPluginResourceJSPaths
  //         ]
  //       }),
  //       // postcss(),
  //       // postcssLit({
  //       //   include: [
  //       //     './node_modules',
  //       //     'packages/**/*.scss',
  //       //     'packages/**/*.scss?*',
  //       //   ],
  //       // }),
  //       esbuild({ tsconfig: '../../../tsconfig.json' }),
  //     ],
  //   }).then((bundle) => {
  //     bundle.write({
  //       format: 'es',
  //       dir: 'packages',
  //     });
  //   })
  //   .catch((err) => {
  //     // eslint-disable-next-line no-console
  //     console.error(err);
  //   });
  const tsProject = ts.createProject(path.resolve(__dirname, '../../../tsconfig.json'));
  const {js} =  gulp.src([
      `packages/**/*.ts`,
      `!packages/**/*-story*.ts*`,
      `!packages/**/__stories__/*.ts`,
      `!packages/**/__tests__/*.ts`,
      `!packages/**/*.d.ts`,
    ]).pipe(sourcemaps.init()).pipe(tsProject());

  return js.pipe(
        babel({
          presets: ['@babel/preset-modules', '@babel/preset-env'],
          // `version` field ensures `@babel/plugin-transform-runtime` is applied to newer helpers like decorator
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              { useESModules: true, version: '7.3.0' },
            ],
            '@babel/plugin-transform-optional-chaining',
            '@babel/plugin-transform-nullish-coalescing-operator',
            '@babel/plugin-syntax-dynamic-import',
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
      }));
}

gulp.task('build:modules:scripts', scripts);
