#!/usr/bin/env node

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';
import {
  addCopyrightHeader,
  isSourceFile,
} from './create/src/utils/license.js';

const DEFAULT_BASE_REFS = ['upstream/main', 'origin/main', 'main'];

function parseOptions(argv) {
  const options = {
    baseRefs: DEFAULT_BASE_REFS,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--base') {
      options.baseRefs = [next];
      index++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

function run(command, args, { cwd, dryRun = false, pipe = false } = {}) {
  if (dryRun) {
    console.log(`[dry-run] Would run: ${command} ${args.join(' ')}`);
    return Promise.resolve('');
  }

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: pipe ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let stdout = '';
    let stderr = '';

    if (pipe) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(stdout);
      } else {
        reject(
          new Error(
            stderr.trim() ||
              `${command} ${args.join(' ')} exited with status ${code}`
          )
        );
      }
    });
  });
}

async function getRepoRoot() {
  const stdout = await run('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(),
    pipe: true,
  });
  return stdout.trim();
}

async function gitList(repoRoot, args) {
  const stdout = await run('git', args, { cwd: repoRoot, pipe: true });
  return stdout.split('\n').filter(Boolean);
}

function unique(items) {
  return [...new Set(items)];
}

async function findBaseRef(repoRoot, baseRefs) {
  for (const baseRef of baseRefs) {
    try {
      await run('git', ['rev-parse', '--verify', baseRef], {
        cwd: repoRoot,
        pipe: true,
      });
      return baseRef;
    } catch {
      // Try the next common base ref.
    }
  }

  return null;
}

async function getAddedFiles(repoRoot, baseRef) {
  const commands = [
    ['diff', '--cached', '--name-only', '--diff-filter=A'],
    ['diff', '--name-only', '--diff-filter=A'],
    ['ls-files', '--others', '--exclude-standard'],
  ];

  if (baseRef) {
    commands.unshift([
      'diff',
      '--name-only',
      '--diff-filter=A',
      `${baseRef}...HEAD`,
    ]);
  }

  const fileLists = await Promise.all(
    commands.map((args) => gitList(repoRoot, args).catch(() => []))
  );

  return unique(fileLists.flat()).filter((filePath) =>
    existsSync(resolve(repoRoot, filePath))
  );
}

async function addCopyrightHeaders(repoRoot, baseRef, { dryRun }) {
  const files = (await getAddedFiles(repoRoot, baseRef)).filter(isSourceFile);

  if (files.length === 0) {
    console.log('No added source files need copyright headers.');
    return;
  }

  const changed = [];

  for (const filePath of files) {
    if (dryRun) {
      console.log(`[dry-run] Would ensure copyright header: ${filePath}`);
      continue;
    }

    const didChange = await addCopyrightHeader(resolve(repoRoot, filePath));
    if (didChange) {
      changed.push(filePath);
    }
  }

  if (dryRun) {
    return;
  }

  if (changed.length > 0) {
    console.log(`Added copyright headers to ${changed.length} file(s).`);
  } else {
    console.log('Added source files already have copyright headers.');
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const repoRoot = await getRepoRoot();
  const baseRef = await findBaseRef(repoRoot, options.baseRefs);

  console.log(`Repo path: ${repoRoot}`);
  console.log(`Base ref: ${baseRef ?? 'none found'}`);

  await addCopyrightHeaders(repoRoot, baseRef, { dryRun: options.dryRun });
  await run('yarn', ['format'], { cwd: repoRoot, dryRun: options.dryRun });
  await run('yarn', ['dedupe'], { cwd: repoRoot, dryRun: options.dryRun });
  await run('yarn', ['lint:license'], {
    cwd: repoRoot,
    dryRun: options.dryRun,
  });

  console.log('Contribution prep complete.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
