/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The shared styles forward the seam's motion names and emit carbon-motion's
// custom properties exactly as its generated tokens CSS does.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(here, '../../..');
const nodeModules = path.resolve(packages, '../node_modules');

// Maps each published Sass URL to its source, so the test runs without a
// build.
const sources: Record<string, string> = {
  '@carbon-labs/v12-styles/scss': path.join(packages, 'v12-styles/src/styles'),
  '@carbon-labs/v12-motion/scss': path.join(packages, 'v12-motion/src/styles'),
};
const sourceImporter = {
  findFileUrl(url: string) {
    for (const [prefix, dir] of Object.entries(sources)) {
      if (url.startsWith(prefix)) {
        const rest = url.slice(prefix.length).replace(/^\//, '') || 'index';
        return pathToFileURL(path.join(dir, rest));
      }
    }
    return null;
  },
};

/**
 * Compiles a Sass string with both packages on its load path.
 *
 * @param {string} source - The Sass source.
 * @returns {string} The compiled CSS.
 */
const compile = (source: string) =>
  compileString(source, {
    importers: [sourceImporter],
    loadPaths: [nodeModules],
  }).css;

/**
 * The custom properties in a CSS string, as name to value.
 *
 * @param {string} css - The CSS.
 * @returns {Record<string, string>} The custom properties.
 */
const customProperties = (css: string) =>
  Object.fromEntries(
    [...css.matchAll(/(--cds-motion-[\w-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ])
  );

/**
 * carbon-motion's generated tokens CSS.
 *
 * @returns {string} The file's contents.
 */
const generatedCss = () => {
  const require = createRequire(path.join(packages, 'v12-motion/package.json'));
  const file = require.resolve('@carbon-labs/motion-core/tokens.generated.css');
  return fs.readFileSync(file, 'utf8');
};

describe('@carbon-labs/v12-styles/scss', () => {
  it('forwards the seam motion names', () => {
    const css = compile(`
      @use '@carbon-labs/v12-styles/scss' as *;
      .x {
        transition: opacity $duration-fast-02 motion(standard, productive);
      }
    `);
    expect(css).toContain(
      'transition: opacity 120ms cubic-bezier(0.4, 0, 0.2, 1);'
    );
  });

  it('emits the custom properties of the generated tokens CSS', () => {
    const css = compile(`
      @use '@carbon-labs/v12-styles/scss' as *;
      :root {
        @include motion-properties;
      }
    `);
    const emitted = customProperties(css);
    const expected = customProperties(generatedCss());
    expect(Object.keys(expected).length).toBeGreaterThan(0);
    expect(emitted).toEqual(expected);
    expect(emitted['--cds-motion-duration-fast-02']).toBe('120ms');
  });
});
