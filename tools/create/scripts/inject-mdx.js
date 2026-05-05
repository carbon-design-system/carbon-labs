#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * CLI shim used by the GitHub Action to inject MDX metadata.
 *
 * Usage:
 *   node tools/create/scripts/inject-mdx.js \
 *     <componentDir> <componentName> <owners> [storybookGroup] [problemStatement]
 *
 * Arguments:
 *   componentDir       Absolute path to the component folder
 *   componentName      Cased component name (e.g. MyButton)
 *   owners             Comma-separated @handle list (pass "" to omit)
 *   storybookGroup     Storybook sidebar group (default: "Components")
 *   problemStatement   Optional — real text from the issue form
 */
import { injectMdxMetadata } from '../src/utils/mdx.js';
import { parseOwners } from '../src/utils/owners.js';

const [, , componentDir, componentName, ownersArg, storybookGroupArg, ...rest] =
  process.argv;

if (!componentDir || !componentName) {
  console.error(
    'Usage: inject-mdx.js <componentDir> <componentName> [owners] [storybookGroup] [problemStatement]'
  );
  process.exit(1);
}

const owners = parseOwners(ownersArg ?? '');
const storybookGroup = storybookGroupArg || 'Components';
const problemStatement = rest.join(' ').trim() || undefined;

await injectMdxMetadata({
  componentDir,
  componentName,
  owners,
  storybookGroup,
  problemStatement,
});
console.log(`MDX metadata injected for ${componentName}`);
