/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A fixed surface its script places in client px (`left` and `top`) is pinned
// by physical insets. A logical start inset is the right edge in a
// right-to-left page: there the surface is held against the viewport's right
// edge, stretched to its maximum width, and no longer grows from its cause.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(here, '../../..');
const components = path.join(packages, 'react/src/v12/components');

// Each stylesheet, and the rule for the box its script places.
const PLACED: [file: string, selector: string][] = [
  [path.join(components, 'Menu/components/menu.scss'), '.cds-menu'],
  [path.join(components, 'Popover/components/popover.scss'), '.cds-popover'],
  [
    path.join(components, 'Popover/components/popover.scss'),
    '.cds-popover__seam',
  ],
  [path.join(components, 'JobsTray/components/jobs-tray.scss'), '.cds-jobs'],
  [
    path.join(
      components,
      'NotificationsPanel/components/notifications-panel.scss'
    ),
    '.cds-npanel',
  ],
  [
    path.join(components, 'Modal/components/modal.scss'),
    '.cds-modal__container',
  ],
  [
    path.join(packages, 'v12-styles/src/styles/_cast-shadow-floating.scss'),
    '.cast-floating',
  ],
];

/**
 * The declarations of a top-level rule, without its nested rules.
 *
 * @param {string} scss - The stylesheet.
 * @param {string} selector - The rule's selector, exactly.
 * @returns {string} Its own declarations.
 */
function ruleOf(scss: string, selector: string): string {
  const start = scss.indexOf(`\n${selector} {`);
  if (start < 0) {
    throw new Error(`no rule ${selector}`);
  }
  let depth = 0;
  let own = '';
  for (let i = scss.indexOf('{', start); i < scss.length; i++) {
    const c = scss[i];
    if (c === '{') {
      depth++;
      continue;
    }
    if (c === '}') {
      if (--depth === 0) {
        break;
      }
      continue;
    }
    if (depth === 1) {
      own += c;
    }
  }
  return own.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('fixed surfaces placed in client px', () => {
  it.each(PLACED)('%s %s is pinned by its top and left', (file, selector) => {
    const rule = ruleOf(fs.readFileSync(file, 'utf8'), selector);
    expect(rule).toMatch(/position:\s*fixed/);
    expect(rule).toMatch(/\binset:\s*0 auto auto 0;/);
    expect(rule).not.toMatch(/inset-inline-(start|end)\s*:/);
  });
});
