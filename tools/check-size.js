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
 * gzipped. Only the component's own code counts: React, Carbon, ECharts and
 * zrender (peers of the chart packages), the other workspace packages and
 * stylesheets are left out, so a number moves only when the component's own
 * files change. The result is compared with `tools/size-baseline.json`; a
 * component fails when it grows by more than 10% or by more than 1 KB gzipped,
 * whichever is hit first.
 *
 * A chart family has a second row, `<Folder>:runtime`: what ECharts costs as
 * that family registers it. The family names the module that registers its
 * ECharts parts, and a limit, in its `package.json`:
 *
 *   "labs": { "size": { "runtime": { "entry": "src/runtime.ts", "limitKb": 190 } } }
 *
 * `entry` is relative to the family's folder; `limitKb` is gzipped. The module
 * is bundled with ECharts and zrender in and everything else left out, as the
 * family's own row leaves them. The limit is hard: a runtime row over it fails,
 * whatever the baseline says. Growth under the limit past the baseline's 10% or
 * 1 KB is a warning. A runtime row that bundles no ECharts, or names no entry
 * or limit, fails. The check counts bytes only; time budgets are the nightly
 * tier's, where times warn.
 *
 *   node tools/check-size.js            compare with the baseline
 *   node tools/check-size.js --write    measure and rewrite the baseline
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = 'packages/react/src/v12/components';
const BASELINE = 'tools/size-baseline.json';

/** A component fails when it passes either limit. */
const MAX_GROWTH_RATIO = 0.1;
const MAX_GROWTH_BYTES = 1024;

/** The chart runtime: peers of the chart packages, measured on its own row. */
export const RUNTIME = ['echarts', 'zrender'];

/** The suffix of a family's runtime row in the baseline. */
export const RUNTIME_ROW = ':runtime';

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

/**
 * The component packages in the lane, each with its entry and, for a chart
 * family, its declared runtime.
 *
 * @param {string} root The carbon-labs checkout.
 * @returns {{ folder: string, entry: string, runtime?: { entry?: string, limitKb?: number } }[]}
 *   The packages, by folder.
 */
export function components(root) {
  const dir = path.join(root, COMPONENTS);
  return fs
    .readdirSync(dir)
    .filter((folder) => fs.existsSync(path.join(dir, folder, 'package.json')))
    .sort()
    .map((folder) => {
      const at = path.join(dir, folder);
      const entry = ['index.ts', 'index.tsx'].find((f) =>
        fs.existsSync(path.join(at, f))
      );
      const pkg = JSON.parse(
        fs.readFileSync(path.join(at, 'package.json'), 'utf8')
      );
      const runtime = pkg.labs?.size?.runtime;
      return {
        folder,
        entry: entry && path.join(at, entry),
        runtime: runtime && {
          ...runtime,
          entry: runtime.entry && path.join(at, runtime.entry),
        },
      };
    })
    .filter((c) => c.entry);
}

/**
 * Bundles an entry, minified, and measures it.
 *
 * @param {string} root The carbon-labs checkout.
 * @param {string} entry The module to bundle.
 * @param {{ runtime?: boolean }} [options] Whether to bundle ECharts and
 *   zrender in (a runtime row) instead of leaving them out.
 * @returns {Promise<{ raw: number, gzip: number, echarts: boolean }>} Its
 *   sizes in bytes, and whether ECharts is in the bundle.
 */
export async function measure(root, entry, { runtime = false } = {}) {
  const peers = RUNTIME.flatMap((name) => [name, `${name}/*`]);
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
    metafile: true,
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
    external: runtime ? external : [...external, ...peers],
    plugins: [stubStyles],
  });
  const js = Buffer.from(result.outputFiles[0].contents);
  return {
    raw: js.length,
    gzip: zlib.gzipSync(js, { level: 9 }).length,
    echarts: Object.keys(result.metafile.inputs).some((input) =>
      /(^|\/)node_modules\/echarts\//.test(input)
    ),
  };
}

/**
 * Measures every row: each component's own code, and each chart family's
 * runtime.
 *
 * @param {string} root The carbon-labs checkout.
 * @returns {Promise<{ sizes: Record<string, { raw: number, gzip: number }>, limits: Record<string, number>, errors: string[] }>}
 *   The sizes by row, each runtime row's limit in bytes gzipped, and the
 *   runtime rows that can't be measured or carry no ECharts.
 */
export async function measureAll(root) {
  const sizes = {};
  const limits = {};
  const errors = [];
  for (const { folder, entry, runtime } of components(root)) {
    const own = await measure(root, entry);
    sizes[folder] = { raw: own.raw, gzip: own.gzip };
    if (!runtime) {
      continue;
    }
    const row = `${folder}${RUNTIME_ROW}`;
    if (!runtime.entry || !fs.existsSync(runtime.entry)) {
      errors.push(
        `${row}: labs.size.runtime.entry names no file in the folder.`
      );
      continue;
    }
    if (!(typeof runtime.limitKb === 'number' && runtime.limitKb > 0)) {
      errors.push(`${row}: labs.size.runtime.limitKb is not a number of KB.`);
      continue;
    }
    const measured = await measure(root, runtime.entry, { runtime: true });
    if (!measured.echarts) {
      errors.push(
        `${row}: ${path.relative(root, runtime.entry)} bundles no ECharts; it should register the family's ECharts parts.`
      );
      continue;
    }
    sizes[row] = { raw: measured.raw, gzip: measured.gzip };
    limits[row] = Math.round(runtime.limitKb * 1024);
  }
  return { sizes, limits, errors };
}

/**
 * Bytes as kilobytes, for a message.
 *
 * @param {number} bytes The size.
 * @returns {string} It in KB, to two places.
 */
const kb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

/**
 * Compares the measured rows with the baseline and the runtime limits.
 *
 * @param {Record<string, { raw: number, gzip: number }>} sizes The measured rows.
 * @param {Record<string, { raw: number, gzip: number }>} baseline The recorded rows.
 * @param {Record<string, number>} [limits] Each runtime row's limit, in bytes gzipped.
 * @returns {{ failures: string[], warnings: string[], notes: string[] }} What
 *   fails the check, what only warns, and what to update.
 */
export function compare(sizes, baseline, limits = {}) {
  const failures = [];
  const warnings = [];
  const notes = [];

  for (const [row, now] of Object.entries(sizes)) {
    const limit = limits[row];
    if (limit !== undefined && now.gzip > limit) {
      failures.push(
        `${row}: ${kb(now.gzip)} gzip, over its limit of ${kb(limit)}`
      );
      continue;
    }
    const before = baseline[row];
    if (!before) {
      notes.push(
        `${row}: not in the baseline (${kb(now.gzip)} gzip); run \`yarn size:update\` to add it.`
      );
      continue;
    }
    const grew = now.gzip - before.gzip;
    if (grew > MAX_GROWTH_BYTES || grew > before.gzip * MAX_GROWTH_RATIO) {
      const line =
        `${row}: ${kb(before.gzip)} -> ${kb(now.gzip)} gzip ` +
        `(+${kb(grew)}, +${((grew / before.gzip) * 100).toFixed(1)}%)`;
      // A runtime row answers to its limit; growth under it only warns.
      (limit === undefined ? failures : warnings).push(line);
    }
  }
  for (const row of Object.keys(baseline)) {
    if (!sizes[row]) {
      notes.push(
        row.endsWith(RUNTIME_ROW)
          ? `${row}: in the baseline but the family declares no runtime.`
          : `${row}: in the baseline but no longer a package.`
      );
    }
  }
  return { failures, warnings, notes };
}

/**
 * Measures, then writes the baseline or checks against it.
 */
async function main() {
  const { sizes, limits, errors } = await measureAll(repo);
  const baselineFile = path.join(repo, BASELINE);

  if (errors.length > 0) {
    console.error('These runtime rows cannot be measured:\n');
    errors.forEach((line) => console.error(`  ${line}`));
    process.exit(1);
  }

  if (process.argv.includes('--write')) {
    fs.writeFileSync(baselineFile, `${JSON.stringify(sizes, null, 2)}\n`);
    console.log(`Wrote ${BASELINE} (${Object.keys(sizes).length} rows).`);
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  const { failures, warnings, notes } = compare(sizes, baseline, limits);

  notes.forEach((note) => console.log(`note: ${note}`));
  warnings.forEach((line) =>
    console.warn(`warning: ${line}; under its limit, so it passes`)
  );

  if (failures.length > 0) {
    console.error(
      `\nThese rows grew by more than ${MAX_GROWTH_RATIO * 100}% or ` +
        `${MAX_GROWTH_BYTES / 1024} KB gzipped, or passed their runtime limit:\n`
    );
    failures.forEach((line) => console.error(`  ${line}`));
    console.error(
      '\nIf the growth is intended, run `yarn size:update` and commit ' +
        `${BASELINE} with the change; a runtime limit moves only in the ` +
        "family's package.json."
    );
    process.exit(1);
  }
  console.log(`Size check passed for ${Object.keys(sizes).length} rows.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
