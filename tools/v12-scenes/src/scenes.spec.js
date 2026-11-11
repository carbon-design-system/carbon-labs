/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The scene tier: every picked story loads with no console error and no page
// error; each picked `Matrix` story renders in white and in g100.

import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { collectErrors, openStory } from './story.js';

const plan = JSON.parse(fs.readFileSync(process.env.SCENES_PLAN, 'utf8'));

/**
 * Each theme, and the background token it may set: Carbon's, or the v12 page
 * base that `@carbon-labs/v12-styles` puts over it where a story loads them.
 */
const THEMES = {
  white: ['#ffffff', '#fafafa'],
  g100: ['#161616', '#0b0b0b'],
};

for (const row of plan.rows) {
  test.describe(row.unit, () => {
    for (const story of row.stories) {
      test(`${story.id} loads clean`, async ({ page }) => {
        const errors = collectErrors(page);
        const shown = await openStory(page, story.id);
        expect(shown, 'Storybook shows the story').toBe('main');
        expect(errors, 'console and page errors').toEqual([]);
      });
    }
    for (const id of row.matrix) {
      for (const [theme, backgrounds] of Object.entries(THEMES)) {
        test(`${id} renders in ${theme}`, async ({ page }, testInfo) => {
          const errors = collectErrors(page);
          const shown = await openStory(page, id, { globals: { theme } });
          expect(shown, 'Storybook shows the story').toBe('main');
          const applied = await page.evaluate(() => ({
            theme: document.documentElement.getAttribute('data-carbon-theme'),
            background: getComputedStyle(document.documentElement)
              .getPropertyValue('--cds-background')
              .trim()
              .toLowerCase(),
            children:
              document.querySelector('#storybook-root')?.children.length,
          }));
          expect(applied.theme, 'the theme on <html>').toBe(theme);
          expect(backgrounds, 'the theme background token').toContain(
            applied.background
          );
          expect(applied.children, 'something rendered').toBeGreaterThan(0);
          await testInfo.attach(`${id}-${theme}.png`, {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
          expect(errors, 'console and page errors').toEqual([]);
        });
      }
    }
  });
}
