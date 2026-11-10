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
import { buildCatalog } from '../src/catalog.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-catalog-'));
/**
 * Writes a fixture file.
 *
 * @param {string} rel Its path in the fixture.
 * @param {string} text Its contents.
 */
const write = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
const lane = 'packages/react/src/v12/components';
write(
  'v12.manifest.json',
  JSON.stringify({
    items: [
      {
        id: 'widget',
        kind: 'component',
        path: `${lane}/Widget`,
        labsStatus: 'draft',
        motion: ['attachRollover'],
      },
    ],
  })
);
write(`${lane}/Widget/package.json`, JSON.stringify({ name: '@x/widget' }));
write(
  `${lane}/Widget/index.ts`,
  [
    'export interface WidgetProps {',
    '  /** What the widget says. */',
    '  label: string;',
    "  size?: 'sm' | 'md';",
    '  open?: boolean;',
    '  className?: string;',
    '  onPick?: (id: string) => void;',
    '}',
    'export function Widget(props: WidgetProps) {',
    '  return null;',
    '}',
    'export function OtherWidget(props: WidgetProps) {',
    '  return null;',
    '}',
    'export const WIDGET_SIZES = 2;',
    '',
  ].join('\n')
);
write(`${lane}/Empty/package.json`, JSON.stringify({ name: '@x/empty' }));
write(`${lane}/Empty/index.ts`, 'export const value = 1;\n');

afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe('the component catalog', () => {
  it('lists every package, its components and their props', () => {
    const { packages } = buildCatalog(root);
    expect(packages.map((p) => p.name)).toEqual(['@x/empty', '@x/widget']);
    const widget = packages[1];
    expect(widget).toMatchObject({
      folder: 'Widget',
      labsStatus: 'draft',
      motion: ['attachRollover'],
    });
    expect(widget.components[1]).toEqual({
      name: 'Widget',
      sameAs: 'OtherWidget',
    });
    expect(widget.components[0]).toEqual({
      name: 'OtherWidget',
      required: ['label'],
      props: {
        label: { type: 'string', description: 'What the widget says.' },
        onPick: { $ref: '#/$defs/event' },
        open: { type: 'boolean' },
        size: { enum: ['md', 'sm'] },
      },
    });
  });
});
