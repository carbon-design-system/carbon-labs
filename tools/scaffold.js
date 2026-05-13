#!/usr/bin/env node

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readdir } from 'fs/promises';
import { join, resolve } from 'path';
import { injectMdxMetadata } from './create/src/utils/mdx.js';
import {
  addCopyrightHeader,
  isSourceFile,
} from './create/src/utils/license.js';
import { parseOwners } from './create/src/utils/owners.js';

const PACKAGE_DIR = {
  react: 'packages/react',
  'web-component': 'packages/web-components',
};

function readOptions(argv) {
  const options = {
    type: 'react',
    owners: [],
    storybookGroup: 'Components',
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--name') {
      options.name = next;
      index++;
    } else if (arg === '--type') {
      options.type = next;
      index++;
    } else if (arg === '--owners') {
      options.owners = parseOwners(next ?? '');
      index++;
    } else if (arg === '--group') {
      options.storybookGroup = next;
      index++;
    }
  }

  return options;
}

async function walkSourceFiles(dir, callback) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkSourceFiles(filePath, callback);
    } else if (isSourceFile(filePath)) {
      await callback(filePath);
    }
  }
}

async function run() {
  const options = readOptions(process.argv.slice(2));
  if (!options.name) {
    throw new Error('Missing required --name <ComponentName> option.');
  }

  const packageDir = PACKAGE_DIR[options.type];
  if (!packageDir) {
    throw new Error('Unknown --type. Use "react" or "web-component".');
  }

  const repoRoot = process.cwd();
  const componentDir = resolve(
    repoRoot,
    packageDir,
    'src',
    'components',
    options.name
  );

  await injectMdxMetadata({
    componentDir,
    componentName: options.name,
    owners: options.owners,
    storybookGroup: options.storybookGroup,
  });

  await walkSourceFiles(componentDir, addCopyrightHeader);

  console.log(`Scaffolded ${options.name} metadata and source headers.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
