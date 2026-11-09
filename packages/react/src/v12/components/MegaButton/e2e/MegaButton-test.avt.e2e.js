/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Drafted in labs in core's shape; it runs only in core, where it moves to
// e2e/components/MegaButton/MegaButton-test.avt.e2e.js. The story ids assume
// core's preview title, `Preview/preview__MegaButton`, which Storybook turns
// into `preview-preview-megabutton--<story>`. Labs has no AVT runner.

import { expect, test } from '@playwright/test';
import { visitStory } from '../../test-utils/storybook';

/**
 * @param {string} story The story's export name, kebab-cased.
 * @returns {string} Its id in core's Storybook.
 */
const id = (story) => `preview-preview-megabutton--${story}`;

test.describe('@avt MegaButton', () => {
  test('@avt-default-state MegaButton', async ({ page }) => {
    await visitStory(page, {
      component: 'MegaButton',
      id: id('default'),
      globals: { theme: 'white' },
    });
    await expect(page).toHaveNoACViolations('MegaButton');
  });

  test('@avt-advanced-states MegaButton every kind and size', async ({
    page,
  }) => {
    for (const theme of ['white', 'g10', 'g90', 'g100']) {
      await visitStory(page, {
        component: 'MegaButton',
        id: id('matrix'),
        globals: { theme },
      });
      await expect(page).toHaveNoACViolations(`MegaButton-matrix-${theme}`);
    }
  });

  test('@avt-keyboard-nav MegaButton', async ({ page }) => {
    await visitStory(page, {
      component: 'MegaButton',
      id: id('default'),
      globals: { theme: 'white' },
    });
    const button = page.getByRole('button', { name: 'Button' });
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    // The key command is announced by aria-keyshortcuts, not read as part of
    // the name.
    await expect(button).toHaveAttribute(
      'aria-keyshortcuts',
      'Meta+S Control+S'
    );
  });

  test('@avt-advanced-states MegaButton icon-only names itself by its tooltip', async ({
    page,
  }) => {
    await visitStory(page, {
      component: 'MegaButton',
      id: id('icon-only'),
      globals: { theme: 'white' },
    });
    await expect(page.getByRole('button', { name: /^Copy/ })).toBeVisible();
    await expect(page).toHaveNoACViolations('MegaButton-icon-only');
  });
});
