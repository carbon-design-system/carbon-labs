/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Drafted in labs in core's shape; it runs only in core, where it moves to
// e2e/components/KeyboardShortcut/KeyboardShortcut-test.avt.e2e.js. The story
// ids assume core's preview title, `Preview/preview__KeyboardShortcut`, which
// Storybook turns into `preview-preview-keyboardshortcut--<story>`. Labs has no
// AVT runner.

import { expect, test } from '@playwright/test';
import { visitStory } from '../../test-utils/storybook';

/**
 * @param {string} story The story's export name, kebab-cased.
 * @returns {string} Its id in core's Storybook.
 */
const id = (story) => `preview-preview-keyboardshortcut--${story}`;

test.describe('@avt KeyboardShortcut', () => {
  test('@avt-default-state KeyboardShortcut', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: id('default'),
      globals: {
        theme: 'white',
      },
    });
    await expect(page).toHaveNoACViolations('KeyboardShortcut');
  });

  test('@avt-advanced-states KeyboardShortcut plain', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: id('plain'),
      globals: {
        theme: 'white',
      },
    });
    await expect(page).toHaveNoACViolations('KeyboardShortcut-plain');
  });

  test('@avt-advanced-states KeyboardShortcut platforms', async ({ page }) => {
    for (const [story, name] of [
      ['platform-mac', 'Shift Command P'],
      ['platform-other', 'Control Shift P'],
    ]) {
      await visitStory(page, {
        component: 'KeyboardShortcut',
        id: id(story),
        globals: {
          theme: 'white',
        },
      });
      // Only the words reach the accessibility tree; the glyph keys are hidden.
      await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(
        `- text: ${name}`
      );
      await expect(page).toHaveNoACViolations(`KeyboardShortcut-${story}`);
    }
  });

  test('@avt-advanced-states KeyboardShortcut inside a menu', async ({
    page,
  }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: id('inside-menu'),
      globals: {
        theme: 'white',
      },
    });
    await expect(page.getByRole('menu', { name: 'KeyboardShortcut' }))
      .toMatchAriaSnapshot(`
      - menu "KeyboardShortcut":
        - menuitem "Cut Command X"
        - menuitem "Copy Command C"
        - menuitem "Paste Command V"
        - menuitem "Rename Command R" [disabled]
        - separator
        - menuitem "Delete danger Delete"
    `);
    await expect(page).toHaveNoACViolations('KeyboardShortcut-inside-menu');
  });

  test('@avt-keyboard-nav KeyboardShortcut', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: id('default'),
      globals: {
        theme: 'white',
      },
    });
    // Display only: nothing in it takes focus.
    await page.keyboard.press('Tab');
    await expect(page.locator('kbd.cds--keyboard-shortcut')).not.toBeFocused();
    await expect(page.locator('kbd.cds--keyboard-shortcut :focus')).toHaveCount(
      0
    );
  });
});
