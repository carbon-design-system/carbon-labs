/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { program } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { newCommand } from './commands/new.js';
import { prepCommand } from './commands/prep.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('labs-kit')
  .version(pkg.version)
  .description(
    'Carbon Labs squad incubation tooling.\n' +
      'Collapse the Labs contribution ceremony into a single command.'
  );

program
  .command('new <component-name>')
  .description('Scaffold a new squad-draft component in your carbon-labs fork')
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
  .option('--path <path>', 'Local path to clone the fork into', '~/carbon-labs')
  .option('--no-storybook', 'Skip spawning Storybook after scaffolding')
  .option('--no-editor', 'Skip opening your editor after scaffolding')
  .option(
    '--dry-run',
    'Print every step that would be taken without making changes'
  )
  .action(newCommand);

program
  .command('prep')
  .description('Prepare a contribution branch for PR review')
  .option('--path <path>', 'Repo root to prepare', process.cwd())
  .option(
    '--base <ref>',
    'Base ref used to find newly added files',
    'upstream/main'
  )
  .option(
    '--dry-run',
    'Print every step that would be taken without making changes'
  )
  .action(prepCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
