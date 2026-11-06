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

const includeV12 = process.env.STORYBOOK_INCLUDE_V12 === 'true';

// The v12 Storybook compiles Carbon's Sass with `enable-v12-release` on, as
// core's `.storybook-v12` does. Configuring `$feature-flags` replaces the map
// @carbon/styles sets by default, so its enabled defaults are repeated here.
const v12FeatureFlags = `@use '@carbon/styles/scss/feature-flags' with ($feature-flags: ('enable-css-custom-properties': true, 'enable-css-grid': true, 'enable-v12-release': true));\n`;

// Build stories array based on environment variable
const storiesGlobs = includeV12
  ? [
      '../src/v12/**/__stories__/*.mdx',
      '../src/v12/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)',
    ]
  : [
      '../src/components/**/__stories__/*.mdx',
      '../src/components/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)',
    ];

const config = {
  stories: storiesGlobs,

  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-accessibility-checker'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },

  features: {
    storyStoreV7: true,
  },

  staticDirs: ['../public'],

  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        cssMinify: 'esbuild',
      },
      ...(includeV12 && {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: v12FeatureFlags,
            },
          },
        },
      }),
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
  },
};
export default config;
