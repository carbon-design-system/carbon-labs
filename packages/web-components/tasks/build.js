/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from 'fs';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')
);

const componentPackageJson = JSON.parse(
  readFileSync(path.resolve(input, '../package.json'), 'utf8')
);

/**
 * Build
 */
async function build() {
  const formats = [
    {
      type: 'esm',
      directory: 'es',
    },
    {
      type: 'commonjs',
      directory: 'lib',
    },
  ];

  for (const format of formats) {
    const rollupConfig = getRollupConfig(
      format.type === 'esm' ? esOutputDir : cjsOutputDir
    );

    const bundle = await rollup(rollupConfig);

    await bundle.write({
      dir: format.type === 'esm' ? esOutputDir : cjsOutputDir,
      format: format.type,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: componentDir,
      exports: 'named',
    });
  }

  console.log(
    `Built ${componentDir} to ${esOutputDir} (ESM) and ${cjsOutputDir} (CJS)`
  );
}

/**
 * Build process
 *
 * @param {string} outDir output directory
 */
function getRollupConfig(outDir) {
  return {
    input,
    external: [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
      ...Object.keys(componentPackageJson.dependencies),
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
        compilerOptions: {
          rootDir: componentDir,
          outDir,
        },
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
  };
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
