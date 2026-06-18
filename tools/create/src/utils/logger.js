/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import ora from 'ora';

export const log = {
  info: (msg) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✔'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.error(chalk.red('✖'), msg),
  step: (n, total, msg) => console.log(chalk.dim(`[${n}/${total}]`), msg),
  blank: () => console.log(),
};

/**
 * Wraps an async action with an ora spinner.
 * In dry-run mode, prints what would happen and skips execution.
 *
 * @param {string} label - human-readable description of the action
 * @param {() => Promise<any>} action - async work to perform
 * @param {object} opts
 * @param {boolean} [opts.dryRun=false]
 * @returns {Promise<any>} whatever action() resolves to, or undefined in dry-run
 */
export async function runStep(label, action, { dryRun = false } = {}) {
  if (dryRun) {
    console.log(chalk.dim(`[dry-run] Would: ${label}`));
    return undefined;
  }

  const spinner = ora(label).start();
  try {
    const result = await action();
    spinner.succeed(label);
    return result;
  } catch (err) {
    spinner.fail(label);
    throw err;
  }
}

export function printBanner(text) {
  log.blank();
  console.log(chalk.bold.bgBlue(` ${text} `));
  log.blank();
}

export function printExperimentalWarning() {
  log.blank();
  console.log(
    chalk.yellow('┌─────────────────────────────────────────────────────┐\n') +
      chalk.yellow('│  @carbon-labs/create is experimental.              │\n') +
      chalk.yellow(
        '│  File issues at: github.com/carbon-design-system/    │\n'
      ) +
      chalk.yellow(
        '│  carbon-labs                                         │\n'
      ) +
      chalk.yellow('└─────────────────────────────────────────────────────┘')
  );
  log.blank();
}
