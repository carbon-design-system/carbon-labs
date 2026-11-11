/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A box a script places in px from the left, or that a physical translate or
// a mirrored parent positions, is anchored with `left` (and `right`). A
// logical start inset is the right edge in a right-to-left page: there the
// numbers and the translate still run left to right, so the box lands
// mirrored or off its mark.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const components = path.resolve(here, '../../../react/src/v12/components');

// Each stylesheet, the rule, and the physical sides that place it.
const PLACED: [file: string, selector: string, sides: string[]][] = [
  // The icon's cut for the pip is drawn at the right in either direction.
  ['Tabs/components/tabs.scss', '.tabs__badge', ['left']],
  // The track is mirrored whole in right to left; its shares stay physical.
  [
    'ProgressBar/components/progress-bar.scss',
    '.cds-progress-bar__base--start',
    ['left', 'right'],
  ],
  [
    'ProgressBar/components/progress-bar.scss',
    '.cds-progress-bar__base--end',
    ['left', 'right'],
  ],
  [
    'ProgressBar/components/progress-bar.scss',
    '.cds-progress-bar__bar',
    ['left', 'right'],
  ],
  [
    'ProgressBar/components/progress-bar.scss',
    '.cds-progress-bar__pulse-band',
    ['left'],
  ],
  // The engine's offset runs from the rail's left.
  [
    'Scroller/components/scroller.scss',
    '.cds-scroller__rail--x > .cds-scroller__pill',
    ['left', 'right'],
  ],
  // Centered by a physical translate.
  ['JumpTo/components/jump-to.scss', '.cds-jump-to', ['left']],
  [
    'JumpTo/components/jump-to.scss',
    '.cast-floating:has(+ .cds-jump-to)',
    ['left'],
  ],
  // The workspace's middle, measured in client px.
  [
    'AppShell/components/app-shell.scss',
    '.cast-floating:has(+ .cds-app-shell__top)',
    ['left'],
  ],
  // The deck's shadows are written in px from the deck's left.
  [
    'Notification/components/notification.scss',
    '.fb-deck > .fb-deck__shadow',
    ['left'],
  ],
];

/**
 * The stylesheet of a component.
 *
 * @param {string} file - Its path under the components folder.
 * @returns {string} The source.
 */
const read = (file: string) =>
  fs.readFileSync(path.join(components, file), 'utf8');

/**
 * The declarations of a selector's top-level rules, without their nested rules.
 *
 * @param {string} scss - The stylesheet.
 * @param {string} selector - The rule's selector (the last of its list), exactly.
 * @returns {string} Their own declarations.
 */
function ruleOf(scss: string, selector: string): string {
  const head = `\n${selector} {`;
  let own = '';
  for (let at = scss.indexOf(head); at > -1; at = scss.indexOf(head, at + 1)) {
    let depth = 0;
    for (let i = at + head.length - 1; i < scss.length; i++) {
      const c = scss[i];
      if (c === '{') {
        depth++;
      } else if (c === '}') {
        if (--depth === 0) {
          break;
        }
      } else if (depth === 1) {
        own += c;
      }
    }
  }
  if (!own) {
    throw new Error(`no rule ${selector}`);
  }
  return own.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('boxes placed in physical px', () => {
  it.each(PLACED)('%s %s is placed with %s', (file, selector, sides) => {
    const rule = ruleOf(read(file), selector);
    for (const side of sides) {
      expect(rule).toMatch(new RegExp(`(^|[\\s;])${side}\\s*:`));
    }
    expect(rule).not.toMatch(/inset-inline(-start|-end)?\s*:/);
  });

  it('the tabs’ soft edges run from the inline start in both directions', () => {
    const scss = read('Tabs/components/tabs.scss');
    expect(ruleOf(scss, '.tabs__scroller')).toMatch(
      /mask-image:\s*linear-gradient\(to right, \$fade\)/
    );
    expect(scss).toMatch(
      /&:dir\(rtl\) \{\s*mask-image:\s*linear-gradient\(to left, \$fade\)/
    );
  });
});
