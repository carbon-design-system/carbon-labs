/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { ROOT } from '../src/config.js';
import { proposalsCss } from '../../../packages/react/.storybook/proposals-css.mjs';

// proposals.scss lays out the proposals' modes as the snapshot reads them:
// a v12 theme takes its Carbon theme's value unless it has its own.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-proposals-css-'));

/**
 * Writes a component's proposals/tokens.json.
 *
 * @param {string} folder The component's folder.
 * @param {object} tokens The tokens.
 */
const tokens = (folder, body) => {
  const dir = path.join(tmp, folder, 'proposals');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(body));
};

/**
 * The declarations of one plain rule (outside `@supports`), by its first
 * selector: the one that starts it, after a blank line.
 *
 * @param {string} css The stylesheet.
 * @param {string} first The rule's first selector, as written.
 * @returns {string[] | null} Its declarations, none when there is no rule.
 */
const declarations = (css, first) => {
  const at = css.indexOf(`\n\n${first},`);
  if (at < 0) {
    return null;
  }
  const open = css.indexOf('{', at);
  return css
    .slice(open + 1, css.indexOf('}', open))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
};

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('the proposals preview CSS', () => {
  it('gives a v12 theme its Carbon theme’s value when it has none of its own', () => {
    tokens('Widget', {
      widget: {
        fill: {
          $type: 'color',
          $extensions: {
            'carbon.themes': {
              white: '{layer-02}',
              g100: '{layer-01}',
              'v12-dark': '{layer-01}',
            },
          },
        },
      },
    });
    const css = proposalsCss(tmp);
    expect(declarations(css, ':root')).toEqual([
      '--cds-widget-fill: var(--cds-layer-02);',
    ]);
    expect(declarations(css, "[data-carbon-theme='g100']")).toEqual([
      '--cds-widget-fill: var(--cds-layer-01);',
    ]);
    // The same value as g100's: no rule of v12 dark's own.
    expect(declarations(css, "[data-carbon-theme='v12-dark']")).toBeNull();
    expect(declarations(css, "[data-carbon-theme='v12-light']")).toBeNull();
  });

  it('writes a v12 theme’s own value in its own rule, after the Carbon themes', () => {
    tokens('Widget', {
      widget: {
        shell: {
          $type: 'color',
          $extensions: {
            'carbon.themes': {
              white: '{layer-02}',
              g100: '{layer-01}',
              'v12-light': '{layer-01}',
              'v12-dark': 'oklch(0.18 0.004 262)',
            },
            'com.ibm.harness.fallback': { 'v12-dark': '#0C0D0F' },
          },
        },
      },
    });
    const css = proposalsCss(tmp);
    // g100's rule still covers v12 dark; its own rule comes later and wins.
    expect(declarations(css, "[data-carbon-theme='g100']")).toEqual([
      '--cds-widget-shell: var(--cds-layer-01);',
    ]);
    expect(declarations(css, "[data-carbon-theme='v12-dark']")).toEqual([
      '--cds-widget-shell: #0c0d0f;',
    ]);
    expect(declarations(css, "[data-carbon-theme='v12-light']")).toEqual([
      '--cds-widget-shell: var(--cds-layer-01);',
    ]);
    const plain = css.slice(0, css.indexOf('@supports'));
    expect(
      plain.indexOf("\n\n[data-carbon-theme='v12-dark'],")
    ).toBeGreaterThan(plain.indexOf("\n\n[data-carbon-theme='g100'],"));
    expect(css.slice(css.indexOf('@supports'))).toContain(
      "  [data-carbon-theme='v12-dark'],\n  .cds--v12-dark {\n    --cds-widget-shell: oklch(0.18 0.004 262);\n  }"
    );
  });

  it('writes the committed file', () => {
    const components = path.join(ROOT, 'packages/react/src/v12/components');
    expect(proposalsCss(components)).toBe(
      fs.readFileSync(
        path.join(ROOT, 'packages/react/.storybook/proposals.scss'),
        'utf8'
      )
    );
  });
});
