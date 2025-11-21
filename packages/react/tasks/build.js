/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import svg from 'rollup-plugin-svg';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import stripBanner from 'rollup-plugin-strip-banner';
import copy from 'rollup-plugin-copy';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';
import url from '@rollup/plugin-url';

import {
  loadBaseTsCompilerOpts,
  loadTsCompilerOpts,
} from 'typescript-config-carbon';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJSON = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'))
);

// Read component-level package.json if it exists
let componentPackageJSON = {};
try {
  componentPackageJSON = JSON.parse(
    readFileSync(path.resolve(process.cwd(), 'package.json'))
  );
} catch (e) {
  // No component package.json, use empty object
}

/**
 * build function
 */
async function build() {
  const reactEntrypoint = {
    filepath: path.resolve(process.cwd(), 'index.ts'),
    rootDir: path.resolve(process.cwd()),
    outputDirectory: path.resolve(process.cwd()),
  };

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

  // Build @carbon/react formats
  for (const format of formats) {
    const outputDirectory = path.join(
      reactEntrypoint.outputDirectory,
      format.directory
    );

    const reactInputConfig = getRollupConfig(
      reactEntrypoint.filepath,
      reactEntrypoint.rootDir,
      outputDirectory
    );
    const reactBundle = await rollup(reactInputConfig);

    await reactBundle.write({
      dir: outputDirectory,
      format: format.type,
      preserveModules: true,
      preserveModulesRoot: path.dirname(reactEntrypoint.filepath),
      banner,
      exports: 'named',
    });
  }
}

const banner = `/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

// Base babel config for js and ts
const babelConfig = {
  babelrc: false,
  exclude: ['node_modules/**'],
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['extends browserslist-config-carbon'],
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    'dev-expression',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-export-namespace-from',
    '@babel/plugin-transform-react-constant-elements',
  ],
  babelHelpers: 'bundled',
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
};

/**
 * Gets tsconfig options
 * @returns tsconfig options object
 */
function getTsCompilerOptions() {
  const baseOpts = loadBaseTsCompilerOpts();
  const projectTsConfigPath = path.resolve(__dirname, '../tsconfig.json');
  const overrideOpts = loadTsCompilerOpts(projectTsConfigPath);
  return { ...baseOpts, ...overrideOpts };
}

/**
 *
 * Rollup config
 * @param {*} input input path of file
 * @param {*} rootDir root directory of package
 * @param {*} outDir output directory
 * @returns
 */
function getRollupConfig(input, rootDir, outDir) {
  // Merge dependencies from both main package.json and component package.json
  const allDependencies = {
    ...packageJSON.peerDependencies,
    ...packageJSON.dependencies,
    ...packageJSON.devDependencies,
    ...componentPackageJSON.peerDependencies,
    ...componentPackageJSON.dependencies,
    ...componentPackageJSON.devDependencies,
  };

  return {
    input,
    // Mark dependencies listed in `package.json` as external so that they are
    // not included in the output bundle.
    external: Object.keys(allDependencies).map((name) => {
      // Transform the name of each dependency into a regex so that imports from
      // nested paths are correctly marked as external.
      //
      // Example:
      // import 'module-name';
      // import 'module-name/path/to/nested/module';
      return new RegExp(`^${name}(/.*)?`);
    }),
    plugins: [
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
      }),
      commonjs({
        include: /node_modules/,
      }),
      copy({
        targets: [
          {
            src: 'components/**/*.scss',
            dest: 'scss',
          },
        ],
        flatten: false,
      }),
      json({
        compact: true,
      }),
      svg(),
      typescript({
        noEmitOnError: true,
        noForceEmit: true,
        outputToFilesystem: false,
        compilerOptions: {
          ...getTsCompilerOptions(),
          rootDir,
          outDir,
        },
      }),
      babel(babelConfig),
      stripBanner(),
      url({
        include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif'],
        limit: 8192, // Optional: files < 8kb will be inlined as base64
        emitFiles: true, // Optional: copy files to output dir
      }),
    ],
  };
}

build().catch((error) => {
  console.log(error);
  process.exit(1);
});
