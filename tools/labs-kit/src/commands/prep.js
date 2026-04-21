/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { execa } from 'execa';
import { log, runStep } from '../utils/logger.js';
import { addCopyrightHeader, isSourceFile } from '../utils/license.js';

async function gitList(repoRoot, args) {
  const result = await execa('git', args, { cwd: repoRoot, stdio: 'pipe' });
  return result.stdout.split('\n').filter(Boolean);
}

async function getRepoRoot(path) {
  const result = await execa('git', ['rev-parse', '--show-toplevel'], {
    cwd: path,
    stdio: 'pipe',
  });
  return result.stdout.trim();
}

function unique(items) {
  return [...new Set(items)];
}

async function getAddedFiles(repoRoot, baseRef) {
  const commands = [
    ['diff', '--name-only', '--diff-filter=A', `${baseRef}...HEAD`],
    ['diff', '--cached', '--name-only', '--diff-filter=A'],
    ['diff', '--name-only', '--diff-filter=A'],
    ['ls-files', '--others', '--exclude-standard'],
  ];

  const fileLists = await Promise.all(
    commands.map((args) => gitList(repoRoot, args).catch(() => []))
  );

  return unique(fileLists.flat()).filter((filePath) =>
    existsSync(resolve(repoRoot, filePath))
  );
}

async function addCopyrightHeaders(repoRoot, baseRef, { dryRun = false } = {}) {
  const files = (await getAddedFiles(repoRoot, baseRef)).filter(isSourceFile);

  if (files.length === 0) {
    log.info('No added source files need copyright headers.');
    return [];
  }

  if (dryRun) {
    for (const filePath of files) {
      log.info(`[dry-run] Would ensure copyright header: ${filePath}`);
    }
    return files;
  }

  const changed = [];
  for (const filePath of files) {
    const didChange = await addCopyrightHeader(resolve(repoRoot, filePath));
    if (didChange) {
      changed.push(filePath);
    }
  }

  if (changed.length > 0) {
    log.info(`Added copyright headers to ${changed.length} file(s).`);
  } else {
    log.info('Added source files already have copyright headers.');
  }

  return changed;
}

export async function prepCommand(options) {
  const repoRoot = await getRepoRoot(resolve(options.path ?? process.cwd()));
  const baseRef = options.base ?? 'upstream/main';
  const isDryRun = Boolean(options.dryRun);

  log.info(`Repo path: ${repoRoot}`);
  log.info(`Base ref: ${baseRef}`);

  await runStep(
    'Adding copyright headers to added source files',
    () => addCopyrightHeaders(repoRoot, baseRef, { dryRun: isDryRun }),
    { dryRun: false }
  );

  await runStep(
    'yarn format',
    () => execa('yarn', ['format'], { cwd: repoRoot, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  await runStep(
    'yarn dedupe',
    () => execa('yarn', ['dedupe'], { cwd: repoRoot, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  log.success('Contribution prep complete.');
}
