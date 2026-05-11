/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { newCommand } from './commands/new.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('@carbon-labs/create')
  .version(pkg.version)
  .description(
    'Create a Carbon Labs component contribution from the command line.'
  );

program
  .argument('<component-name>', 'Component name to generate')
  .option(
    '--type <type>',
    'Component type: "react" or "web-component" (default: react or config.defaultType)'
  )
  .option(
    '--owners <handles>',
    'Comma-separated GitHub handles to list as maintainers, e.g. @user1,@user2'
  )
  .option(
    '--group <name>',
    'Storybook sidebar group for the component (default: "Components" or config.storybookGroup)'
  )
  .option('--path <path>', 'Carbon Labs repo path (default: current directory)')
  .option(
    '--with-git',
    'Opt in to fork detection, clone/update, branch creation, and initial commit'
  )
  .option('--no-storybook', 'Skip spawning Storybook after scaffolding')
  .option('--no-editor', 'Skip opening your editor after scaffolding')
  .option(
    '--dry-run',
    'Print every step that would be taken without making changes'
  )
  .action(newCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
