import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path, { join, dirname } from 'path';
import remarkGfm from 'remark-gfm';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

// Check if v12 stories should be included
const includeV12 = process.env.STORYBOOK_INCLUDE_V12 === 'true';

// The v12 Storybook compiles Carbon's Sass with `enable-v12-release` on, as
// core's `.storybook-v12` does. Configuring `$feature-flags` replaces the map
// @carbon/styles sets by default, so its enabled defaults are repeated here.
const v12FeatureFlags = `@use '@carbon/styles/scss/feature-flags' with ($feature-flags: ('enable-css-custom-properties': true, 'enable-css-grid': true, 'enable-v12-release': true));\n`;

// Build stories array based on environment variable
const storiesGlobs = includeV12
  ? ['../src/v12/**/*.mdx', '../src/v12/**/*.stories.@(js|jsx|mjs|ts|tsx)']
  : [
      '../src/components/**/*.mdx',
      '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ];

const config = {
  stories: storiesGlobs,
  staticDirs: ['../../../public'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-accessibility-checker'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
    {
      name: getAbsolutePath('@storybook/addon-docs'),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  babel: async (config) => {
    return {
      ...config,
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    };
  },
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  webpack(config) {
    // Add webpack alias to resolve @carbon-labs/utilities to built files
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // Map clean imports to the built es directory
    config.resolve.alias['@carbon-labs/utilities'] = path.resolve(
      __dirname,
      '../../utilities/es'
    );

    config.module.rules.push({
      test: /\.svg$/,
      type: 'asset/resource',
    });

    config.module.rules.push({
      test: /\.s?css$/,
      sideEffects: true,
      use: [
        {
          loader:
            process.env.NODE_ENV === 'production'
              ? MiniCssExtractPlugin.loader
              : 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2,
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('autoprefixer')({
                  overrideBrowserslist: ['last 1 version'],
                }),
              ],
            },
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass'),
            sassOptions: {
              includePaths: [
                path.resolve(__dirname, '..', 'node_modules'),
                path.resolve(__dirname, '..', '..', '..', 'node_modules'),
              ],
            },
            warnRuleAsWarning: true,
            sourceMap: true,
            ...(includeV12 && {
              // Plain .css files cannot take a Sass `@use`.
              additionalData: (content, loaderContext) =>
                loaderContext.resourcePath.endsWith('.scss')
                  ? v12FeatureFlags + content
                  : content,
            }),
          },
        },
      ],
    });
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        })
      );
    }
    return config;
  },
  docs: {
    defaultName: 'Overview',
  },
};
export default config;
