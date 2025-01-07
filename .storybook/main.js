import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: [
    './welcome/**/*.mdx',
    './welcome/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [getAbsolutePath('@storybook/addon-essentials')],
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },
  refs: {
    'web-components': {
      title: 'Web Components',
      // url: 'https://labs.carbondesignsystem.com/web-components/index.html',
      url: 'http://localhost:6007',
    },
    react: {
      title: 'React components',
      // url: 'https://labs.carbondesignsystem.com/react/index.html',
      url: 'http://localhost:6008',
    },
  },
};
export default config;
