/** @type { import('@storybook/web-components-vite').StorybookConfig } */

import { mergeConfig } from "vite";
import postcss from "rollup-plugin-postcss";
import postcssLit from "rollup-plugin-postcss-lit";
import sass from "sass";

const config = {
  stories: [
    "../src/components/**/*.mdx",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
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
      plugins: [postcss(), postcssLit()],
    });
  },
};
export default config;
