/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import replace from 'replace-in-file';
import { createFilter } from '@rollup/pluginutils';

/**
 * When running storybook, default and named imports from CSS files
 * are deprecated with Vite - the `?inline` query is required
 * (e.g import styles from './foo.scss?inline)
 *
 * This plugin swaps the `.scss?inline` ext for `.scss` at Rollup's buildStart
 * so it can bundle properly and then swaps back to `.scss?inline` at build end
 *
 * @param {object} [options] The options.
 * @param {RegExp} [options.include=/\.ts/] The files to include.
 * @param {RegExp} [options.exclude=/\.scss/] The files to exclude.
 * @returns {object} The rollup plugin to transform an `.scss` file to a `lit-html` template.
 */
function rollupPluginSCSSPath({
  include = /\.ts$/i,
  exclude = /\.scss$/i,
  ...options
} = {}) {
  const filter = createFilter(include, exclude);
  return {
    name: 'scss-path',

    async buildStart() {
      const replaceOptions = {
        files: 'components/**/src/*.ts',
        from: /\.scss\?inline/g,
        to: '.scss',
      };

      await replace(replaceOptions);
    },

    async buildEnd() {
      const replaceOptions = {
        files: 'components/**/src/*.ts',
        from: /\.scss/g,
        to: '.scss?inline',
      };

      await replace(replaceOptions);
    },

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
  };
}

export default rollupPluginSCSSPath;
