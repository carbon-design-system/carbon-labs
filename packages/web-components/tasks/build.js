
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';
import path from 'path';
import alias from '@rollup/plugin-alias';
import autoprefixer from 'autoprefixer';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cssnano from 'cssnano';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import postcss from 'postcss';
import litSCSS from '../tools/rollup-plugin-lit-scss.js';

const componentDir = process.cwd();
const input = path.join(componentDir, 'index.ts');
const esOutputDir = path.join(componentDir, 'es');
const cjsOutputDir = path.join(componentDir, 'lib');

import * as packageJson from '../package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build process
 */
async function build() {
  const bundle = await rollup({
    input,
    external: [
      ...Object.keys(packageJson.default.dependencies),
      ...Object.keys(packageJson.default.devDependencies),
    ].map((name) => {
      // Transform the name of each dependency into a regex so that imports from
      // nested paths are correctly marked as external.
      //
      // Example:
      // import 'module-name';
      // import 'module-name/path/to/nested/module';
      return new RegExp(`^${name}(/.*)?`);
    }),
    plugins: [
      nodeResolve({ extensions: ['.js', '.ts'] }),
      commonjs(),
      json(),
      alias({
        entries: [{ find: /^(.*)\.scss\?inline$/, replacement: '$1.scss' }],
      }),
      typescript({
        tsconfig: path.join(componentDir, '../../../tsconfig.json'),
        declaration: false,
      }),
      litSCSS({
        includePaths: [
          path.resolve(__dirname, '../node_modules'),
          path.resolve(__dirname, '../../../node_modules'),
        ],
        async preprocessor(contents, id) {
          return (
            await postcss([autoprefixer(), cssnano()]).process(contents, {
              from: id,
            })
          ).css;
        },
      }),
    ],
  });

  // ES module output
  await bundle.write({
    dir: esOutputDir,
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: componentDir,
    exports: 'named',
  });

  // CommonJS output
  await bundle.write({
    dir: cjsOutputDir,
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: componentDir,
    exports: 'named',
  });

  console.log(`Built ${componentDir} to ${esOutputDir} (ESM) and ${cjsOutputDir} (CJS)`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
