/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Run through `bin/scenes.js`, which picks the stories, serves the built
// Storybook and sets SCENES_URL and SCENES_PLAN. Playwright's bundled
// Chromium, the full browser in its headless mode (`channel: 'chromium'`),
// not the separate headless shell.

import { defineConfig } from '@playwright/test';

const ci = !!process.env.CI;

export default defineConfig({
  testDir: './src',
  outputDir: './results/test-results',
  fullyParallel: true,
  forbidOnly: ci,
  // One retry on CI: a story that fails twice is reported failed, one that
  // passes on its retry is reported flaky.
  retries: ci ? 1 : 0,
  workers: process.env.SCENES_WORKERS
    ? Number(process.env.SCENES_WORKERS)
    : undefined,
  timeout: 60000,
  reporter: [
    [ci ? 'line' : 'list'],
    ['json', { outputFile: './results/results.json' }],
    ['html', { outputFolder: './results/report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.SCENES_URL,
    browserName: 'chromium',
    channel: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'scenes', testMatch: 'scenes.spec.js' }],
});
