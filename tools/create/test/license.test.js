/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import {
  hasCopyrightHeader,
  isSourceFile,
  withCopyrightHeader,
} from '../src/utils/license.js';

describe('isSourceFile', () => {
  it('matches source file extensions that use block comments', () => {
    expect(isSourceFile('src/index.js')).toBe(true);
    expect(isSourceFile('src/index.ts')).toBe(true);
    expect(isSourceFile('src/index.tsx')).toBe(true);
    expect(isSourceFile('src/styles.scss')).toBe(true);
  });

  it('skips non-source files', () => {
    expect(isSourceFile('README.md')).toBe(false);
    expect(isSourceFile('package.json')).toBe(false);
    expect(isSourceFile('yarn.lock')).toBe(false);
  });
});

describe('withCopyrightHeader', () => {
  it('adds the IBM copyright header', () => {
    const content = withCopyrightHeader('export const value = true;\n');
    expect(hasCopyrightHeader(content)).toBe(true);
    expect(content).toContain('export const value = true;');
  });

  it('keeps a shebang on the first line', () => {
    const content = withCopyrightHeader(
      '#!/usr/bin/env node\nimport "../src/index.js";\n'
    );
    expect(content.startsWith('#!/usr/bin/env node\n/**')).toBe(true);
  });

  it('does not duplicate an existing copyright header', () => {
    const content = withCopyrightHeader(
      withCopyrightHeader('export const value = true;\n')
    );
    const count = content.match(/Copyright IBM Corp\./g) ?? [];
    expect(count).toHaveLength(1);
  });
});
