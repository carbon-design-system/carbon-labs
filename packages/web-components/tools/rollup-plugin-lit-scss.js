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

const renderSass = promisify(sass.render);

/**
 * Default noop function
 * @param {object} s generic parameter
 * @returns
 */
const noop = (s) => s;

/**
 * @param {string} css A CSS.
 * @returns {string} A `lit-html` template of the given CSS.
 */
function transformToTemplate(css) {
  return `import { css } from 'lit';export default css([${JSON.stringify(
    css
  )}])`;
}

/**
 * @param {object} [options] The options.
 * @param {RegExp} [options.include=/\.scss/] The files to include.
 * @param {RegExp} [options.exclude] The files to exclude.
 * @param {Function} [options.preprocessor] The CSS preprocessor to use.
 * @returns {object} The rollup plugin to transform an `.scss` file to a `lit-html` template.
 */
function rollupPluginLitSCSS({
  include = /\.scss$/i,
  exclude,
  preprocessor = noop,
  ...options
} = {}) {
  const filter = createFilter(include, exclude);
  return {
    name: 'lit-scss',

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

      const finalContent = `
       ${contents}`;

      const { css } = await renderSass({
        ...options,
        file: id,
        data: finalContent,
         // suppress mixed-declarations warnings until resolved in
        // https://github.com/carbon-design-system/carbon/issues/16962
        logger: {
          /**
           * warning message
           * @param {string} message warning message
           */
          warn: (message) =>
            message.includes('mixed-decls')
              ? undefined
              : { type: 'warn', message },
        },
      });

      return {
        code: transformToTemplate(await preprocessor(css.toString(), id)),
        map: {
          mappings: '',
        },
      };
    },
  };
}

export default rollupPluginLitSCSS;
