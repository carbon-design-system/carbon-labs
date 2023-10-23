import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';

export default {
  input: 'src/components/index.js',
  output: [
    {
      dir: 'lib',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      browser: true,
      extensions: ['.scss'],
    }),
    postcss({
      extensions: ['.scss'],
      minimize: true,
      use: [
        [
          'sass',
          {
            includePaths: ['./node_modules'],
          },
        ],
      ],
    }),
    postcssLit({ include: ['/node_modules', '**/*.scss', '**/*.scss?*'] }),
  ],
};
