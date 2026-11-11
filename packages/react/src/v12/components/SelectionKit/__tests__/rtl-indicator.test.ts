/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom

// The selector sits over the selected item in right to left. The engine's
// edges are px from the root's left, in either direction, so the markers
// are placed with `left`; `inset-inline-start` counts from the right in
// right to left and mirrors them.

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { attachSelection } from '@carbon-labs/v12-motion';
import { compile } from 'sass';
import { afterEach, describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../../../..');
const kit = path.resolve(here, '../components/selection-kit.scss');

// Maps the published Sass URLs to their sources, so no build is needed.
const sources: Record<string, string> = {
  '@carbon-labs/v12-styles/scss': 'packages/v12-styles/src/styles',
  '@carbon-labs/v12-motion/scss': 'packages/v12-motion/src/styles',
};
const sourceImporter = {
  findFileUrl(url: string) {
    for (const [prefix, dir] of Object.entries(sources)) {
      if (url.startsWith(prefix)) {
        const rest = url.slice(prefix.length).replace(/^\//, '') || 'index';
        return pathToFileURL(path.join(repo, dir, rest));
      }
    }
    return null;
  },
};

/**
 * Returns the declarations of a selector's first rule of its own.
 *
 * @param {string} css - The compiled CSS.
 * @param {string} selector - The rule's exact selector.
 * @returns {Map<string, string>} Each property and its value.
 */
const declarations = (css: string, selector: string) => {
  // Its own rule, not a selector list that ends with it.
  let start = css.indexOf(`\n${selector} {`);
  while (start > -1 && css[start - 1] === ',') {
    start = css.indexOf(`\n${selector} {`, start + 1);
  }
  expect(start, `${selector} is in the CSS`).toBeGreaterThan(-1);
  const body = css
    .slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const out = new Map<string, string>();
  for (const line of body.split(';')) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      out.set(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
    }
  }
  return out;
};

const box = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

/**
 * A three-item track laid out right to left: the first item on the right.
 * jsdom has no layout, so each box is stubbed.
 */
const rtlTrack = () => {
  document.documentElement.setAttribute('dir', 'rtl');
  const root = document.createElement('div');
  root.className = 'sel';
  const indicator = document.createElement('span');
  indicator.className = 'sel__indicator';
  indicator.setAttribute('data-selection-indicator', '');
  root.append(indicator);
  // The root at x 100, 300 wide; items 96 wide with a 2px inset and gap.
  root.getBoundingClientRect = () => box(100, 50, 300, 40);
  Object.defineProperty(root, 'offsetWidth', { value: 300 });
  Object.defineProperty(root, 'offsetHeight', { value: 40 });
  const lefts = [302, 204, 106];
  const items = lefts.map((left) => {
    const item = document.createElement('button');
    item.className = 'sel__item';
    item.setAttribute('data-selection-item', '');
    item.getBoundingClientRect = () => box(left, 52, 96, 36);
    root.append(item);
    return item;
  });
  document.body.append(root);
  return { root, indicator, items };
};

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('dir');
});

describe('the selector in right to left', () => {
  const css = compile(kit, {
    importers: [sourceImporter],
    loadPaths: [path.join(repo, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['import'],
  }).css;

  it('places the markers from the left, never the inline start', () => {
    for (const [selector, edge] of [
      ['.sel__indicator', 'l'],
      ['.sel__ghost', 'gl'],
    ]) {
      const rule = declarations(css, selector);
      expect(rule.get('left')).toContain(`var(--cds-motion-selection-${edge},`);
      for (const inline of [
        'inset-inline-start',
        'inset-inline-end',
        'inset-inline',
        'right',
      ]) {
        expect(rule.has(inline), `${selector} ${inline}`).toBe(false);
      }
    }
  });

  it('puts the indicator over the selected item', () => {
    const { root, indicator, items } = rtlTrack();
    const selection = attachSelection(root, { reduced: () => true });
    const rootBox = root.getBoundingClientRect();
    // `left: calc(var(-l) + var(--sel-press))`, with no press.
    const placedLeft = () =>
      rootBox.left +
      parseFloat(indicator.style.getPropertyValue('--cds-motion-selection-l'));
    const placedWidth = () =>
      parseFloat(indicator.style.getPropertyValue('--cds-motion-selection-r')) -
      parseFloat(indicator.style.getPropertyValue('--cds-motion-selection-l'));

    for (const item of [items[1], items[2], items[0]]) {
      selection.moveTo(item, { instant: true });
      const itemBox = item.getBoundingClientRect();
      expect(placedLeft()).toBeCloseTo(itemBox.left);
      expect(placedWidth()).toBeCloseTo(itemBox.width);
    }
    selection.destroy();
  });
});
