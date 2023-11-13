/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import autoprefixer from 'autoprefixer';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import cssnano from 'cssnano';
import path from 'path';
import postcss from 'postcss';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import rollupPluginLitSCSS from './rollup-plugin-lit-scss.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Stores the suffix to append depending on build mode
 *
 * @type {{development: string, production: string}}
 */
const modeSuffixes = {
  development: '',
  production: '.min',
};

/**
 * Generates the multi-input for the rollup config
 *
 * @param {string} mode The build mode
 * @param {Array} folders Package names as inputs
 * @returns {{}} Object with inputs
 * @private
 */
function _generateInputs(mode, folders) {
  const inputs = {};

  folders.forEach((folder) => {
    inputs[`${folder}${modeSuffixes[mode]}`] = `packages/${folder}/index.ts`;
  });

  return inputs;
}

/**
 * Gets the PostCSS plugin configuration
 *
 * @param {string} mode The build mode
 * @param {string} dir The UI direction
 * @private
 */
function _getPostCSSPlugins(mode) {
  const postCSSPlugins = [autoprefixer()];

  // Add cssnano for production mode
  if (mode !== 'development') {
    postCSSPlugins.push(cssnano());
  }

  return postCSSPlugins;
}

/**
 * Sets the rollup configuration based on various settings
 *
 * @param {object} [options] The build options.
 * @param {string} [options.mode=development] The build mode.
 * @param {string} [options.dir=development] The UI direction.
 * @param {Array} [options.folders] Package names as inputs
 * @returns {object} The Rollup config.
 */
function getRollupConfig({ mode = 'development', folders = [] } = {}) {
  const postCSSPlugins = _getPostCSSPlugins(mode);

  return {
    input: _generateInputs(mode, folders),
    external: [/@babel\/runtime/],
    plugins: [
      nodeResolve({
        browser: true,
        mainFields: ['jsnext', 'module', 'main'],
        extensions: ['.js', '.ts'],
      }),
      commonjs({
        include: [/node_modules/],
        sourceMap: true,
      }),
      babel({
        babelHelpers: 'inline',
        extensions: ['.ts'],
        exclude: ['node_modules/**'], // only transpile our source code
        presets: ['@babel/preset-modules'],
        plugins: [
          '@babel/plugin-transform-typescript',
          '@babel/plugin-transform-class-properties',
          [
            '@babel/plugin-proposal-decorators',
            { decoratorsBeforeExport: true },
          ],
          '@babel/plugin-transform-nullish-coalescing-operator',
          ['@babel/plugin-transform-object-rest-spread', { useBuiltIns: true }],
          '@babel/plugin-transform-optional-chaining',
        ],
      }),
      rollupPluginLitSCSS({
        includePaths: [path.resolve(__dirname, '../node_modules')],
        async preprocessor(contents, id) {
          return (await postcss(postCSSPlugins).process(contents, { from: id }))
            .css;
        },
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        preventAssignment: true,
      }),
      ...(mode === 'development' ? [] : [terser()]),
    ],
  };
}

export default getRollupConfig;
