/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Where the snapshots' sources are, and the fixed lists they are read with.

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The repository's root. */
export const ROOT = resolve(HERE, '../../..');

/** Where the snapshots are written, from the root. */
export const SYNC_DIR = 'figma-sync';

/** The snapshots, by kind, in the order the command writes them. */
export const KINDS = ['tokens', 'components', 'motion', 'docs'];

/** The sources, from the root. */
export const SOURCES = {
  manifest: 'v12.manifest.json',
  themes: 'packages/react/.storybook/v12-themes/themes.json',
  components: 'packages/react/src/v12/components',
  explorations: 'packages/react/src/v12/explorations/explorations.json',
  marks: 'tools/v12-workbench/src/explorations.json',
  contract: 'docs/v12/motion-contract.md',
  storybookMain: 'packages/react/.storybook/main.js',
  motionTokens: 'node_modules/@carbon-labs/motion-core/generated/tokens.js',
  motionCss: 'node_modules/@carbon-labs/motion-core/generated/tokens.css',
  motionPackage: 'node_modules/@carbon-labs/motion-core/package.json',
  carbonThemes: 'node_modules/@carbon/themes/package.json',
  // Filled by a later step from a browser render; read when present.
  resolvedStateColors: 'figma-sync/state-colors.resolved.json',
};

/**
 * The theme modes, as the v12 Storybook's toolbar and `proposals.scss` name
 * them: Carbon's four v11 themes and the two v12 previews.
 */
export const THEME_MODES = [
  'white',
  'g10',
  'g90',
  'g100',
  'v12-light',
  'v12-dark',
];

/** The v12 themes in `themes.json`, by the mode they are. */
export const V12_THEMES = { light: 'v12-light', dark: 'v12-dark' };

/**
 * A proposal's value per theme serves these modes too, as
 * `proposals.scss` lays them out: white's also v12-light's, g100's also
 * v12-dark's.
 */
export const PROPOSAL_MODES = {
  white: ['white', 'v12-light'],
  g10: ['g10'],
  g90: ['g90'],
  g100: ['g100', 'v12-dark'],
};

/** Subtree defaults in code, variable modes in a design file. */
export const CONTEXT_MODES = {
  density: ['compact', 'default', 'spacious'],
  shape: ['full', 'rounded', 'square'],
  motion: ['full'],
};

/** The variable collections, by what a token's source is. */
export const COLLECTIONS = {
  theme: 'v12 / Theme',
  proposals: 'v12 / Proposals',
  explorations: 'v12 / Explorations',
  motion: 'v12 / Motion',
};

/**
 * The props every component names the same way: the design surface a
 * component property is checked against, with the manifest's own list.
 */
export const VOCABULARY = [
  'kind',
  'variant',
  'frame',
  'size',
  'corners',
  'shape',
  'disabled',
  'readOnly',
  'invalid',
  'warn',
  'selected',
  'checked',
  'open',
  'expanded',
];

/** Props that never become a component property. */
export const NOT_MAPPED =
  /^(?:as|className|style|id|ref|key|timeScale|tooltip[A-Z]\w*|aria[A-Z-]\w*|on[A-Z]\w*)$/;

/** Props whose value is an icon: an instance swap. */
export const INSTANCE_PROP = /^(?:renderIcon|icon|\w+Icon)$/;

/** Props that render nodes of the consumer's: a slot. */
export const SLOT_PROP = /^render[A-Z]\w*$/;

/** Every `figma.status` the design defines. */
export const FIGMA_STATUSES = [
  'unmapped',
  'scaffolded',
  'mapped',
  'code-only',
  'figma-only',
];

/** The statuses a manifest row may carry before anything is exported. */
export const ALLOWED_STATUSES = ['unmapped', 'code-only'];

/**
 * The rows with no design counterpart by decision, until their manifest
 * rows say so themselves: shared kits, providers and helpers. Style rows
 * and the motion icons' core and web-component packages are code-only too.
 */
export const CODE_ONLY = [
  'icon-motion',
  'kit-defaults',
  'list-reflow',
  'props',
  'recipes',
  'selection-kit',
  'snap',
  'theme-zone',
  'util',
  'package/motion-icons-core',
  'package/motion-icons-wc',
];
