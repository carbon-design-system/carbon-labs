/** @type { import('@storybook/web-components-vite').StorybookConfig } */
/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mergeConfig } from 'vite';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import sass from 'sass';
import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config = {
  stories: [
    '../src/**/__stories__/*.mdx',
    '../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },

  features: {
    storyStoreV7: true,
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            implementation: sass,
            api: 'modern',
            silenceDeprecations: ['mixed-decls'],
          },
        },
      },
      plugins: [
        postcss(),
        postcssLit({
          include: [
            '../../../node_modules',
            'src/**/*.scss',
            'src/**/*.scss?*',
          ],
          exclude: ['**/*.js', '**/*.scss.js'],
        }),
      ],
    });
  }
};
export default config;
