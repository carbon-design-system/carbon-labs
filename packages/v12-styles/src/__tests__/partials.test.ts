/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The kit's shared styles compile against the seam, write no duration or
// easing of their own, and read only motion tokens the token layer has.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const styles = path.resolve(here, '../styles');
const packages = path.resolve(here, '../../..');
const nodeModules = path.resolve(packages, '../node_modules');

const PARTIALS = [
  'anchor-inset',
  'brand',
  'corners',
  'field-fill',
  'ghost',
  'rollover',
  'skeleton',
  'surface',
  'tertiary',
  'text-pairs',
  'tile-art',
];

// Maps each published Sass URL to its source, so the test runs without a
// build.
const sources: Record<string, string> = {
  '@carbon-labs/v12-styles/scss': styles,
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
 * Compiles a Sass string with the packages and Carbon on its load path.
 *
 * @param {string} source - The Sass source.
 * @returns {string} The compiled CSS.
 */
const compile = (source: string) =>
  compileString(source, {
    importers: [sourceImporter],
    loadPaths: [nodeModules],
    quietDeps: true,
  }).css;

/**
 * A partial's source without its comments.
 *
 * @param {string} name - The partial's name.
 * @returns {string} The code.
 */
const code = (name: string) =>
  fs
    .readFileSync(path.join(styles, `_${name}.scss`), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

/**
 * carbon-motion's token layer, the CSS every v12 page loads.
 *
 * @returns {string} The file's contents.
 */
const tokensCss = () => {
  const require = createRequire(path.join(packages, 'v12-motion/package.json'));
  return fs.readFileSync(
    require.resolve('@carbon-labs/motion-core/tokens.css'),
    'utf8'
  );
};

describe('@carbon-labs/v12-styles/scss partials', () => {
  it.each(PARTIALS)('%s compiles against the seam', (name) => {
    expect(() =>
      compile(`@use '@carbon-labs/v12-styles/scss/${name}' as *;`)
    ).not.toThrow();
  });

  it('writes no duration or easing of its own', () => {
    for (const name of PARTIALS) {
      // A zero (`0s`) is not a timing.
      expect(code(name)).not.toMatch(
        /(?<![\w.$-])(?!0*\.?0+m?s\b)\d*\.?\d+m?s\b/
      );
      expect(code(name)).not.toMatch(/cubic-bezier\(/);
    }
  });

  it('reads only durations and easings the token layer defines', () => {
    const defined = new Set(
      [...tokensCss().matchAll(/(--cds-motion-[\w-]+)\s*:/g)].map((m) => m[1])
    );
    const read = new Set(
      PARTIALS.flatMap((name) =>
        [
          ...code(name).matchAll(
            /var\((--cds-motion-(?:duration|easing)-[\w-]+)/g
          ),
        ].map((m) => m[1])
      )
    );
    expect(read.size).toBeGreaterThan(0);
    expect([...read].filter((p) => !defined.has(p))).toEqual([]);
  });

  it('keeps the kit values: the surfaces, by theme', () => {
    const css = compile(`@use '@carbon-labs/v12-styles/scss/surface';`);
    expect(css).toContain('--cds-surface: #f4f4f4;');
    expect(css).toContain('--cds-surface-rule: #dddddd;');
  });

  it('ghost brings the rollover with it', () => {
    expect(code('ghost')).toMatch(/@use 'rollover' as \*;/);
  });
});

describe('the token layer', () => {
  /** Every lane stylesheet and script under a folder. */
  const sourcesIn = (dir: string): string[] =>
    fs
      .readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter(
        (e) =>
          e.isFile() &&
          /\.(scss|tsx?)$/.test(e.name) &&
          !/\.(test|stories)\.tsx?$/.test(e.name)
      )
      .map((e) => path.join(e.parentPath, e.name));

  it('sets every --cds-motion-* a v12 component reads without a fallback', () => {
    const layer = tokensCss();
    const set = new Set(
      [
        ...layer.matchAll(
          /(--cds-motion-[\w-]+)\s*:|@property\s+(--cds-motion-[\w-]+)/g
        ),
      ].map((m) => m[1] ?? m[2])
    );
    const read = new Map<string, string>();
    const files = [
      path.join(packages, 'react/src/v12/components'),
      path.join(packages, 'v12-styles/src'),
    ].flatMap(sourcesIn);
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      // A component that sets one itself (in its styles or from script) sets it.
      for (const m of text.matchAll(/(--cds-motion-[\w-]+)['"]?\s*[:,]/g)) {
        set.add(m[1]);
      }
      for (const m of text.matchAll(/var\(\s*(--cds-motion-[\w-]+)\s*\)/g)) {
        if (!read.has(m[1])) {
          read.set(m[1], path.relative(packages, file));
        }
      }
    }
    const unset = [...read].filter(([prop]) => !set.has(prop));
    expect(unset).toEqual([]);
  });
});
