/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Opening one story in its own frame, and what went wrong while it did.

/**
 * The address of a story's frame.
 *
 * @param {string} id The story id.
 * @param {Record<string, string>} [globals] Storybook globals, such as the theme.
 * @returns {string} A path relative to the Storybook's root.
 */
export function storyPath(id, globals = {}) {
  const g = Object.entries(globals)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story${
    g ? `&globals=${encodeURIComponent(g)}` : ''
  }`;
}

/**
 * Records console errors and uncaught page errors from the moment it is
 * called.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @returns {string[]} The list, filled as they happen.
 */
export function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(`console: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
  return errors;
}

/**
 * Opens a story and waits until Storybook has rendered it, or shown its error
 * or empty screen.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @param {string} id The story id.
 * @param {{ globals?: Record<string, string>, settle?: number }} [options]
 *   Globals, and how long to wait afterwards for late errors (ms).
 * @returns {Promise<'main' | 'errordisplay' | 'nopreview'>} What Storybook shows.
 */
export async function openStory(page, id, { globals, settle = 500 } = {}) {
  await page.goto(storyPath(id, globals), { waitUntil: 'load' });
  const shown = await page.waitForFunction(
    () => {
      const m = document.body.className.match(
        /sb-show-(main|errordisplay|nopreview)/
      );
      return m ? m[1] : null;
    },
    null,
    { timeout: 30000 }
  );
  const state = await shown.jsonValue();
  if (settle) {
    await page.waitForTimeout(settle);
  }
  return state;
}
