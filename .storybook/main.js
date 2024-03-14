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
import { dirname, join } from "path";
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import sass from 'sass';

const config = {
  stories: [
    '../packages/**/__stories__/*.mdx',
    '../packages/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-essentials")],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            implementation: sass,
          },
        },
      },
      plugins: [
        postcss(),
        postcssLit({
          include: [
            './node_modules',
            'packages/**/*.scss',
            'packages/**/*.scss?*',
          ],
        }),
      ],
    });
  },
};
export default config;

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
