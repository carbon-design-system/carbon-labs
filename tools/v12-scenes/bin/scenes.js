#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The scene tier, against the built v12 Storybook.
//
//   yarn v12:scenes [--base <ref>] [--all] [--list] [--storybook <dir>]
//                   [-- <playwright test arguments>]
//
// --base       the change is the commits since this ref (default: where the
//              branch left origin/main); every story when git cannot say.
//              Uncommitted edits are not read: commit first
// --all        every story, whatever changed (the nightly run)
// --list       print the plan and stop
// --storybook  the built Storybook (default packages/react/storybook-static/v12)
//
// Build the Storybook first (yarn workspace @carbon-labs/react
// storybook:build:v12) and install the browser once (yarn workspace
// @carbon-labs/v12-scenes playwright install chromium). Results, the report
// and failure traces land in tools/v12-scenes/results.

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickUnits, planOf, readLane } from '../src/pick.js';
import { serve } from '../src/serve.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const tool = path.resolve(here, '..');
const labs = path.resolve(tool, '../..');

const argv = process.argv.slice(2);
const split = argv.indexOf('--');
const own = split < 0 ? argv : argv.slice(0, split);
const passThrough = split < 0 ? [] : argv.slice(split + 1);
const flag = (name) => own.includes(`--${name}`);
const value = (name, fallback) => {
  const i = own.indexOf(`--${name}`);
  return i < 0 ? fallback : own[i + 1];
};

const git = (...args) =>
  execFileSync('git', args, { cwd: labs, encoding: 'utf8' }).trim();

/**
 * The files the change touches, or null when git cannot say.
 *
 * @returns {string[] | null} Paths relative to the checkout.
 */
function changedFiles() {
  try {
    const base = value('base') ?? git('merge-base', 'origin/main', 'HEAD');
    return git('diff', '--name-only', base, 'HEAD').split('\n').filter(Boolean);
  } catch (e) {
    console.warn(`scenes: no diff (${e.message.split('\n')[0]}): every story`);
    return null;
  }
}

const storybook = path.resolve(
  labs,
  value('storybook', 'packages/react/storybook-static/v12')
);
const indexFile = path.join(storybook, 'index.json');
if (!fs.existsSync(indexFile)) {
  console.error(`scenes: no built Storybook at ${storybook}`);
  process.exit(1);
}
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

const files = flag('all') ? null : changedFiles();
const pick = files
  ? pickUnits(files, readLane(labs))
  : { all: true, why: ['everything: --all or no diff'], units: [] };
const rows = planOf(index, pick);
const stories = rows.reduce((n, r) => n + r.stories.length, 0);
const matrix = rows.reduce((n, r) => n + r.matrix.length, 0);

for (const line of pick.why) {
  console.log(`  ${line}`);
}
console.log(
  `scenes: ${rows.length} unit(s), ${stories} stories, ${matrix} matrix ${
    matrix === 1 ? 'story' : 'stories'
  } in two themes`
);

const results = path.join(tool, 'results');
fs.mkdirSync(results, { recursive: true });
const planFile = path.join(results, 'plan.json');
fs.writeFileSync(planFile, JSON.stringify({ pick, rows }, null, 1));

if (flag('list')) {
  for (const r of rows) {
    console.log(`${r.unit}: ${r.stories.map((s) => s.id).join(' ')}`);
  }
  process.exit(0);
}
if (!stories) {
  console.log('scenes: nothing to run');
  process.exit(0);
}

// The server runs in this process, so the browser run is spawned, not run
// synchronously: a blocked event loop would serve nothing.
const server = await serve(storybook);
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const status = await new Promise((resolve) => {
  spawn(
    process.execPath,
    [cli, 'test', '--project', 'scenes', ...passThrough],
    {
      cwd: tool,
      stdio: 'inherit',
      env: { ...process.env, SCENES_URL: server.url, SCENES_PLAN: planFile },
    }
  ).on('exit', (code) => resolve(code ?? 1));
});
await server.close();
process.exit(status);
