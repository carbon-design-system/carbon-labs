/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  MODAL_BACKDROP,
  backdropBlur,
  backdropBlurStyle,
} from '@carbon-labs/react-modal';

/** The v12 components' folder. */
const COMPONENTS = fileURLToPath(new URL('../../', import.meta.url));

/** Every source file (not a build, a story or a test) under `dir`. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return /^(node_modules|es|lib|scss|__stories__|__tests__)$/.test(name)
        ? []
        : sources(path);
    }
    return /\.(ts|tsx|scss)$/.test(name) ? [path] : [];
  });
}

describe("the overlays' backdrop blur", () => {
  it('is one radius, 1.125px', () => {
    expect(MODAL_BACKDROP.even).toBe(1.125);
    expect(backdropBlur()).toBe('blur(1.125px)');
    expect(backdropBlurStyle()).toEqual({
      backdropFilter: 'blur(1.125px)',
      WebkitBackdropFilter: 'blur(1.125px)',
    });
  });

  it('is set only in the backdrop module: no overlay writes a blur of its own', () => {
    const own = sources(COMPONENTS).filter(
      (path) =>
        !path.endsWith(join('Modal', 'components', 'backdrop.ts')) &&
        /backdrop-?filter[^\n]*blur\(|blur\(\$\{[^}]*\}px\)/i.test(
          readFileSync(path, 'utf8')
        )
    );
    expect(own).toEqual([]);
  });
});
