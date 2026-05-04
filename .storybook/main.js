import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

// Check if v12 stories should be included
const includeV12 = process.env.STORYBOOK_INCLUDE_V12 === 'true';

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: [
    './welcome/**/*.mdx',
    './welcome/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },
  refs: (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      // In development mode:
      // - Standard root (port 6006) points to standard packages (6007, 6008)
      // - V12 root (port 6016) points to v12 packages (6017, 6018)
      const webComponentsPort = includeV12 ? 6017 : 6007;
      const reactPort = includeV12 ? 6018 : 6008;
      
      return {
        'web-components': {
          title: 'Web Components',
          url: `http://localhost:${webComponentsPort}`,
        },
        react: {
          title: 'React components',
          url: `http://localhost:${reactPort}`,
        },
      };
    }
    // In production/build mode, use relative paths so it works both locally and when deployed
    // Both standard and v12 builds use the same relative paths because:
    // - Standard build at root points to ./web-components and ./react
    // - V12 build at /v12/ points to ./web-components and ./react (which resolve to /v12/web-components and /v12/react)
    return {
      'web-components': {
        title: 'Web Components',
        url: './web-components',
      },
      react: {
        title: 'React components',
        url: './react',
      },
    };
  },
};
export default config;
