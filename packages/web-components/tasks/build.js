/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

import { fileURLToPath } from "url";
import { globby } from "globby";
import { rollup } from "rollup";
import alias from "@rollup/plugin-alias";
import autoprefixer from "autoprefixer";
import commonjs from "@rollup/plugin-commonjs";
import cssnano from "cssnano";
import litSCSS from "../tools/rollup-plugin-lit-scss.js";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "path";
import postcss from "postcss";
import typescript from "@rollup/plugin-typescript";

import * as packageJson from '../package.json' assert { type: 'json' };

// const packageJson = JSON.parse(readFileSync("./package.json"));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  const esInputs = await globby([
    "src/**/*.ts",
    "!src/**/__tests__",
    "!src/**/*.stories.ts",
    "!src/**/*.d.ts",
    "!src/globals/internal/storybook-cdn.ts",
  ]);
console.log('esinputs', esInputs);
  const entryPoint = {
    rootDir: "src",
    outputDirectory: path.resolve(__dirname, ".."),
  };

  const formats = [
    {
      type: "esm",
      directory: "es",
    },
  ];

  for (const format of formats) {
    const outputDirectory = path.join(
      entryPoint.outputDirectory,
      format.directory
    );

    const wcInputConfig = getRollupConfig(
      esInputs,
      entryPoint.rootDir,
      outputDirectory
    );

    const wcBundle = await rollup(wcInputConfig);

    await wcBundle.write({
      dir: outputDirectory,
      format: format.type,
      preserveModules: true,
      preserveModulesRoot: "src",
      banner,
      exports: "named",
      sourcemap: true,
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

function getRollupConfig(input, rootDir, outDir) {
  return {
    input,
    // Mark dependencies listed in `package.json` as external so that they are
    // not included in the output bundle.
    external: [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
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
      alias({
        entries: [{ find: /^(.*)\.scss\?lit$/, replacement: "$1.scss" }],
      }),
      nodeResolve({
        browser: true,
        mainFields: ["jsnext", "module", "main"],
        extensions: [".js", ".ts"],
      }),
      commonjs({
        include: [/node_modules/],
      }),
      litSCSS({
        includePaths: [
          path.resolve(__dirname, "../node_modules"),
          path.resolve(__dirname, "../../../node_modules"),
        ],
        async preprocessor(contents, id) {
          return (
            await postcss([autoprefixer(), cssnano()]).process(contents, {
              from: id,
            })
          ).css;
        },
      }),
      typescript({
        noEmitOnError: true,
        compilerOptions: {
          rootDir,
          outDir,
        },
      }),
    ],
  };
}

build().catch((error) => {
  console.log(error);
  process.exit(1);
});
