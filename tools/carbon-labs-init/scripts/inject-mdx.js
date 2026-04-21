#!/usr/bin/env node
/**
 * CLI shim used by the GitHub Action to inject MDX metadata.
 *
 * Usage:
 *   node tools/carbon-labs-init/scripts/inject-mdx.js \
 *     <componentDir> <componentName> <owners> [storybookGroup] [problemStatement]
 *
 * Arguments:
 *   componentDir       Absolute path to the component folder
 *   componentName      Cased component name (e.g. MyButton)
 *   owners             Comma-separated @handle list (pass "" to omit)
 *   storybookGroup     Storybook sidebar group (default: "Components")
 *   problemStatement   Optional — real text from the issue form
 */
import { injectMdxMetadata } from '../src/lib/mdx.js';
import { parseOwners } from '../src/lib/owners.js';

const [, , componentDir, componentName, ownersArg, storybookGroupArg, ...rest] = process.argv;

if (!componentDir || !componentName) {
  console.error('Usage: inject-mdx.js <componentDir> <componentName> [owners] [storybookGroup] [problemStatement]');
  process.exit(1);
}

const owners = parseOwners(ownersArg ?? '');
const storybookGroup = storybookGroupArg || 'Components';
const problemStatement = rest.join(' ').trim() || undefined;

await injectMdxMetadata({ componentDir, componentName, owners, storybookGroup, problemStatement });
console.log(`MDX metadata injected for ${componentName}`);
