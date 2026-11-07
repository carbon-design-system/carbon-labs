/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The Sass module gives Carbon's motion names at carbon-motion's values.

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const styles = path.resolve(here, '../styles');
const nodeModules = path.resolve(here, '../../../../node_modules');
const prefix = '@carbon-labs/v12-motion/scss';

// Maps the published URL to the source, so the test runs without a build.
const seamImporter = {
  findFileUrl(url: string) {
    if (!url.startsWith(prefix)) {
      return null;
    }
    const rest = url.slice(prefix.length).replace(/^\//, '') || 'index';
    return pathToFileURL(path.join(styles, rest));
  },
};

/**
 * Compiles a Sass string with the seam on its load path.
 *
 * @param {string} source - The Sass source.
 * @returns {string} The compiled CSS.
 */
const compile = (source: string) =>
  compileString(source, {
    importers: [seamImporter],
    loadPaths: [nodeModules],
  }).css;

describe('@carbon-labs/v12-motion/scss', () => {
  it('compiles $duration-* and motion() to carbon-motion values', () => {
    const css = compile(`
      @use '${prefix}' as *;
      .x {
        transition: opacity $duration-fast-02 motion(standard, productive);
      }
    `);
    expect(css).toContain(
      'transition: opacity 120ms cubic-bezier(0.4, 0, 0.2, 1);'
    );
  });

  it('keeps the default mode and the other names', () => {
    const css = compile(`
      @use '${prefix}' as *;
      .x {
        a: motion(entrance);
        b: $duration-slow-02;
        c: $duration-moderate-03;
      }
    `);
    expect(css).toContain('a: cubic-bezier(0, 0, 0.2, 1);');
    expect(css).toContain('b: 520ms;');
    expect(css).toContain('c: 300ms;');
  });

  it('lands a surface at once under reduced motion', () => {
    const css = compile(`
      @use '${prefix}' as *;
      .x {
        @include surface((
          kind: reveal,
          duration: moderate-01,
          enter: (opacity: 1),
          exit: (opacity: 0),
          enter-easing: (name: entrance, mode: productive),
          exit-easing: (name: exit, mode: productive),
        ));
      }
    `);
    const guard = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(guard).toBeGreaterThan(-1);
    expect(css.indexOf('transition-duration: 160ms')).toBeGreaterThan(guard);
  });
});
