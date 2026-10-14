/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Drafted in labs in core's shape; it runs only in core, where it moves to
// e2e/components/KeyboardShortcut/KeyboardShortcut-test.avt.e2e.js and the
// story ids become components-keyboardshortcut--*. Labs has no AVT runner.

import { expect, test } from '@playwright/test';
import { visitStory } from '../../test-utils/storybook';

test.describe('@avt KeyboardShortcut', () => {
  test('@avt-default-state KeyboardShortcut', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: 'components-keyboardshortcut--default',
      globals: {
        theme: 'white',
      },
    });
    await expect(page).toHaveNoACViolations('KeyboardShortcut');
  });

  test('@avt-advanced-states KeyboardShortcut plain', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: 'components-keyboardshortcut--plain',
      globals: {
        theme: 'white',
      },
    });
    await expect(page).toHaveNoACViolations('KeyboardShortcut-plain');
  });

  test('@avt-advanced-states KeyboardShortcut platforms', async ({ page }) => {
    for (const [id, name] of [
      ['components-keyboardshortcut--platform-mac', 'Command Shift P'],
      ['components-keyboardshortcut--platform-other', 'Control Shift P'],
    ]) {
      await visitStory(page, {
        component: 'KeyboardShortcut',
        id,
        globals: {
          theme: 'white',
        },
      });
      // The words are the accessible text; the glyph keys are hidden.
      await expect(page.locator('kbd.cds--keyboard-shortcut')).toHaveText(
        new RegExp(`^${name}`)
      );
      await expect(page).toHaveNoACViolations(`KeyboardShortcut-${id}`);
    }
  });

  test('@avt-advanced-states KeyboardShortcut inside a menu', async ({
    page,
  }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: 'components-keyboardshortcut--inside-menu',
      globals: {
        theme: 'white',
      },
    });
    await expect(
      page.getByRole('menuitem', { name: 'Copy Command C' })
    ).toBeVisible();
    await expect(page).toHaveNoACViolations('KeyboardShortcut-inside-menu');
  });

  test('@avt-keyboard-nav KeyboardShortcut', async ({ page }) => {
    await visitStory(page, {
      component: 'KeyboardShortcut',
      id: 'components-keyboardshortcut--default',
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
