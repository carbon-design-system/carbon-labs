/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import { promisify } from 'util';
import * as sass from 'sass';
import { createFilter } from '@rollup/pluginutils';

// const renderSass = promisify(sass.render);

/**
 * Default noop function
 * @param {object} s generic parameter
 * @returns
 */
const noop = (s) => s;

/**
 * @param {string} content file content.
 * @returns {string} Content with the swapped out scss import
 */
function transformContent(content) {
  return content.replace(/.scss/g, '.css.js');
}

/**
 * @param {object} [options] The options.
 * @param {RegExp} [options.include=/\.scss/] The files to include.
 * @param {RegExp} [options.exclude] The files to exclude.
 * @param {Function} [options.preprocessor] The CSS preprocessor to use.
 * @returns {object} The rollup plugin to transform an `.scss` file to a `lit-html` template.
 */
function rollupPluginCssJsPaths({
  include = /\.ts$/i,
  exclude = /\.scss$/i,
  preprocessor = noop,
  ...options
} = {}) {
  const filter = createFilter(include, exclude);
  return {
    name: 'css-js-paths',

    /**
     * Enqueues the module contents for loading.
     *
     * @param {string} id The module ID.
     */
    load(id) {
      if (filter(id)) {
        this.addWatchFile(path.resolve(id));
      }
      return null;
    },

    /**
     * Transforms the module contents.
     *
     * @param {string} contents The module contents.
     * @param {string} id The module ID.
     * @returns {object} The transformed module contents.
     */
    async transform(contents, id) {
      if (!filter(id)) {
        return null;
      }

      return {
        code: transformContent(contents, id),
        map: {
          mappings: '',
        },
      };
    },
  };
}

export default rollupPluginCssJsPaths;
