/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A component that writes `aria-invalid` styles its error from it (the
// `state` mixins), so what assistive tech hears and what shows are one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(here, '../../..');
const components = path.join(packages, 'react/src/v12/components');
const nodeModules = path.resolve(packages, '../node_modules');

/**
 * The writers whose error look is not read from `aria-invalid` yet, and why.
 * A component leaves this list when its stylesheet moves.
 */
const NOT_YET: Record<string, string> = {
  // Its stylesheet is changed on its own.
  Slider: 'the field and knob error look',
  // The segment's look follows the late status (`data-status`), which waits
  // for a pause in typing; `aria-invalid` is set at once.
  TextInput: 'the late status',
  // The bar and the ring hand their status over with motion (a class).
  ProgressBar: 'the status hand-off',
  ProgressRing: 'the status hand-off',
  // The ring also shows the group's status, which the radio does not say.
  RadioButton: 'the group status',
  // Its field takes Carbon's own invalid styles.
  DatePicker: 'Carbon field styles',
};

/** Every file under a folder with one of the extensions, tests and stories left out. */
const filesIn = (dir: string, ext: RegExp): string[] =>
  fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (e) =>
        e.isFile() &&
        ext.test(e.name) &&
        !/\.(test|stories)\.tsx?$/.test(e.name) &&
        !/(^|\/)(es|lib|scss|node_modules)\//.test(
          path.relative(dir, e.parentPath) + '/'
        )
    )
    .map((e) => path.join(e.parentPath, e.name));

// The published Sass URLs, mapped to their sources, so this runs without a build.
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

describe('aria-invalid', () => {
  const writers = fs
    .readdirSync(components)
    .filter((name) =>
      filesIn(path.join(components, name), /\.tsx$/).some((f) =>
        /aria-invalid=\{/.test(fs.readFileSync(f, 'utf8'))
      )
    );

  it('is found in the components that write it', () => {
    expect(writers).toContain('Checkbox');
    // A component on the list that no longer writes it leaves the list.
    expect(Object.keys(NOT_YET).filter((n) => !writers.includes(n))).toEqual(
      []
    );
  });

  it.each(writers.filter((name) => !(name in NOT_YET)))(
    '%s styles its error from it',
    (name) => {
      const scss = filesIn(path.join(components, name), /\.scss$/)
        .map((f) => fs.readFileSync(f, 'utf8'))
        .join('\n');
      expect(scss).toMatch(/aria-invalid|state\.invalid/);
    }
  );

  it('Checkbox draws its error ring from the input’s aria-invalid, not a class', () => {
    const file = path.join(components, 'Checkbox/components/checkbox.scss');
    const css = compileString(fs.readFileSync(file, 'utf8'), {
      url: pathToFileURL(file),
      importers: [sourceImporter],
      loadPaths: [nodeModules],
      quietDeps: true,
      silenceDeprecations: ['import'],
    }).css;
    const errorRules = css
      .split('}')
      .filter((rule) =>
        rule.includes('--rollover-ring: var(--cds-support-error')
      );
    expect(errorRules.length).toBeGreaterThan(0);
    for (const rule of errorRules) {
      expect(rule).toContain('[aria-invalid=true]');
      expect(rule).not.toContain('cds-checkbox--invalid');
    }
  });
});
