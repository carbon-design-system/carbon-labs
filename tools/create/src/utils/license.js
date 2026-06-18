/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, writeFile } from 'fs/promises';
import { extname } from 'path';

export const COPYRIGHT_HEADER = `/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

`;

const SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
  '.scss',
  '.ts',
  '.tsx',
]);

export function isSourceFile(filePath) {
  return SOURCE_EXTENSIONS.has(extname(filePath));
}

export function hasCopyrightHeader(content) {
  return /Copyright IBM Corp\./.test(content);
}

export function withCopyrightHeader(content) {
  if (hasCopyrightHeader(content)) {
    return content;
  }

  if (content.startsWith('#!')) {
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex === -1) {
      return `${content}\n${COPYRIGHT_HEADER}`;
    }
    return `${content.slice(
      0,
      newlineIndex + 1
    )}${COPYRIGHT_HEADER}${content.slice(newlineIndex + 1)}`;
  }

  return `${COPYRIGHT_HEADER}${content}`;
}

export async function addCopyrightHeader(filePath) {
  const content = await readFile(filePath, 'utf8');
  const nextContent = withCopyrightHeader(content);

  if (nextContent === content) {
    return false;
  }

  await writeFile(filePath, nextContent, 'utf8');
  return true;
}
