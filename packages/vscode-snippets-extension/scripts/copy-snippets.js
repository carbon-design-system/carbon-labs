/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source: relative path to sibling package in monorepo
// This works both in development (monorepo) and when published (via workspace dependency)
const srcDir = path.join(__dirname, '../../vscode-snippets/src');
// Destination: ./snippets
const destDir = path.join(__dirname, '../snippets');

console.log('Copying snippet files from npm package to extension...');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('Created snippets directory');
}

// Read all files from source directory
const files = fs.readdirSync(srcDir);

// Copy each .code-snippets file
let copiedCount = 0;
files.forEach((file) => {
  if (file.endsWith('.code-snippets')) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    fs.copyFileSync(srcFile, destFile);
    console.log(`  ✓ ${file}`);
    copiedCount++;
  }
});

console.log(`\nCopied ${copiedCount} snippet files successfully!`);
