/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The overlay panel is anchored with a logical inset and slides with a
// physical translate: right to left its shut place has to be the mirror, as
// the surface's exit and as its starting style, or it crosses the screen.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scss = fs.readFileSync(
  path.resolve(here, '../components/chats-panel.scss'),
  'utf8'
);

describe('the overlay chats panel’s slide, by direction', () => {
  it('is anchored to the inline start and shut toward it, left to right', () => {
    expect(scss).toMatch(/inset-inline-start: 0;/);
    expect(scss).toMatch(
      /exit: \(\s*opacity: 0,\s*transform: translateX\(-100%\),/
    );
  });

  it('mirrors the exit', () => {
    expect(scss).toMatch(
      /&\[data-carbon-surface-state='exit'\]:dir\(rtl\) \{\s*transform: translateX\(100%\);\s*\}/
    );
  });

  it('mirrors where it enters from, in either state', () => {
    const starting = scss.slice(scss.indexOf('@starting-style {'));
    expect(starting).toMatch(
      /__panel:dir\(rtl\),\s*\S+\s+\S+__panel\[data-carbon-surface-state='enter'\]:dir\(rtl\) \{\s*transform: translateX\(100%\);\s*\}/
    );
  });
});
