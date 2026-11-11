#!/usr/bin/env node

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Size check for the v12 component packages.
 *
 * Each component's entry is bundled from source with esbuild, minified and
 * gzipped. Only the component's own code counts: React, Carbon, the other
 * workspace packages and stylesheets are left out, so a number moves only when
 * the component's own files change. The result is compared with
 * `tools/size-baseline.json`; a component fails when it grows by more than
 * 10% or by more than 1 KB gzipped, whichever is hit first.
 *
 *   node tools/check-size.js            compare with the baseline
 *   node tools/check-size.js --write    measure and rewrite the baseline
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = path.join(root, 'packages/react/src/v12/components');
const baselineFile = path.join(root, 'tools/size-baseline.json');

/** A component fails when it passes either limit. */
const MAX_GROWTH_RATIO = 0.1;
const MAX_GROWTH_BYTES = 1024;

/** Left out of every measurement: the component's own code is what counts. */
const external = [
  'react',
  'react-dom',
  'react/*',
  'react-dom/*',
  '@carbon/*',
  '@carbon-labs/*',
  'classnames',
  'prop-types',
  '@ibm/telemetry-js',
];

/** Stylesheets are not code; they are left out of the count. */
const stubStyles = {
  name: 'stub-styles',
  setup(build) {
    build.onResolve({ filter: /\.s?css$/ }, (args) => ({
      path: args.path,
      namespace: 'stub-styles',
    }));
    build.onLoad({ filter: /.*/, namespace: 'stub-styles' }, () => ({
      contents: '',
      loader: 'js',
    }));
  },
};

function components() {
  return fs
    .readdirSync(componentsDir)
    .filter((folder) =>
      fs.existsSync(path.join(componentsDir, folder, 'package.json'))
    )
    .sort()
    .map((folder) => {
      const dir = path.join(componentsDir, folder);
      const entry = ['index.ts', 'index.tsx'].find((f) =>
        fs.existsSync(path.join(dir, f))
      );
      return { folder, entry: entry && path.join(dir, entry) };
    })
    .filter((c) => c.entry);
}

async function measure(entry) {
  const result = await esbuild.build({
    absWorkingDir: root,
    stdin: {
      contents: `export * from ${JSON.stringify(entry)};`,
      resolveDir: root,
      sourcefile: 'entry.ts',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    treeShaking: true,
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.svg': 'dataurl', '.json': 'json' },
    logLevel: 'silent',
    outfile: 'out.js',
    external,
    plugins: [stubStyles],
  });
  const js = Buffer.from(result.outputFiles[0].contents);
  return { raw: js.length, gzip: zlib.gzipSync(js, { level: 9 }).length };
}

async function measureAll() {
  const sizes = {};
  for (const { folder, entry } of components()) {
    sizes[folder] = await measure(entry);
  }
  return sizes;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

async function main() {
  const sizes = await measureAll();

  if (process.argv.includes('--write')) {
    fs.writeFileSync(baselineFile, `${JSON.stringify(sizes, null, 2)}\n`);
    console.log(
      `Wrote ${path.relative(root, baselineFile)} (${Object.keys(sizes).length} components).`
    );
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  const failures = [];
  const notes = [];

  for (const [folder, now] of Object.entries(sizes)) {
    const before = baseline[folder];
    if (!before) {
      notes.push(
        `${folder}: not in the baseline (${kb(now.gzip)} gzip); run \`yarn size:update\` to add it.`
      );
      continue;
    }
    const grew = now.gzip - before.gzip;
    if (grew > MAX_GROWTH_BYTES || grew > before.gzip * MAX_GROWTH_RATIO) {
      failures.push(
        `${folder}: ${kb(before.gzip)} -> ${kb(now.gzip)} gzip ` +
          `(+${kb(grew)}, +${((grew / before.gzip) * 100).toFixed(1)}%)`
      );
    }
  }
  for (const folder of Object.keys(baseline)) {
    if (!sizes[folder]) {
      notes.push(`${folder}: in the baseline but no longer a package.`);
    }
  }

  notes.forEach((note) => console.log(`note: ${note}`));

  if (failures.length > 0) {
    console.error(
      `\nThese components grew by more than ${MAX_GROWTH_RATIO * 100}% or ` +
        `${MAX_GROWTH_BYTES / 1024} KB gzipped:\n`
    );
    failures.forEach((line) => console.error(`  ${line}`));
    console.error(
      '\nIf the growth is intended, run `yarn size:update` and commit ' +
        'tools/size-baseline.json with the change.'
    );
    process.exit(1);
  }
  console.log(`Size check passed for ${Object.keys(sizes).length} components.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
