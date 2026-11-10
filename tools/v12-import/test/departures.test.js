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
import {
  departureFindings,
  markOn,
  planDepartures,
  REGISTRY,
  registryMarkText,
  writeDepartures,
} from '../src/ledger.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-departures-'));
const WIDGET = 'packages/react/src/v12/components/Widget';
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
/**
 * A fixture file's lines.
 *
 * @param {string} rel Its path in the fixture.
 * @returns {string[]} The lines.
 */
const lines = (rel) =>
  fs.readFileSync(path.join(root, rel), 'utf8').split('\n');

const frame = {
  id: 'frame-prop',
  axis: 'api',
  status: 'proposal',
  what: 'One frame prop.',
  replaces: 'Booleans',
  appliesTo: [{ in: 'Widget', props: ['frame'] }],
};
const quiet = {
  id: 'surface-quiet',
  axis: 'color',
  status: 'proposal',
  what: 'One quiet fill.',
  replaces: '`$layer-01`',
  appliesTo: [{ in: 'Widget', uses: ['var(--cds-surface)'] }],
};
const names = {
  id: 'theme-names',
  axis: 'api',
  status: 'explore',
  what: 'Two names.',
  replaces: 'Other names',
  appliesTo: [{ in: 'Widget', uses: ['export type WidgetTheme'] }],
};
const lost = {
  id: 'lost-one',
  axis: 'shape',
  status: 'explore',
  what: 'Nowhere.',
  replaces: 'Something',
  appliesTo: [{ in: 'Widget', uses: ['no such text'] }],
};
write(
  REGISTRY,
  JSON.stringify({ departures: [frame, quiet, names, lost, { id: 'Bad' }] })
);
write(`${WIDGET}/package.json`, JSON.stringify({ name: '@x/react-widget' }));
write(`${WIDGET}/index.ts`, "export * from './components/Widget';\n");
write(
  `${WIDGET}/components/Widget.tsx`,
  [
    'export interface WidgetProps {',
    '  /** What it stands on. */',
    "  frame?: 'ghost' | 'inset';",
    '}',
    '/**',
    ' * The two themes.',
    ' */',
    "export type WidgetTheme = 'light' | 'dark';",
    'export function Widget(props: WidgetProps) {',
    '  return null;',
    '}',
    '',
  ].join('\n')
);
write(
  `${WIDGET}/components/widget.scss`,
  [
    '.w {',
    '  /* var(--cds-surface) in a comment is not a use */',
    '  background: var(--cds-surface);',
    '  // @carbon-explore stray — no entry has it. TBD',
    '  // @carbon-proposal api: local-one — its folder records it. TBD',
    '  color: red;',
    '}',
    '',
  ].join('\n')
);
write(`${WIDGET}/proposals/README.md`, '- api: local-one — recorded. TBD\n');
write('packages/v12-styles/src/index.ts', 'export {};\n');

afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe('the departures registry', () => {
  it('writes each mark in the form the lane uses', () => {
    expect(registryMarkText(frame)).toBe(
      '@carbon-proposal api: frame-prop — One frame prop. TBD'
    );
    expect(registryMarkText(quiet)).toBe(
      '@carbon-proposal token: surface-quiet — One quiet fill. replaces: `$layer-01`. TBD'
    );
    expect(registryMarkText(lost)).toBe(
      '@carbon-explore lost-one — Nowhere. TBD'
    );
    expect(markOn(`  // ${registryMarkText(quiet)}`)).toEqual({
      kind: 'proposal',
      sub: 'token',
      name: 'surface-quiet',
    });
    expect(markOn('  //   // @carbon-explore example — in prose')).toBe(null);
  });

  it('warns on each missing mark, each unmarkable place and each unknown mark', () => {
    const found = departureFindings(root).map(
      (f) => `${f.kind} ${f.at.replace(`${WIDGET}/`, '')} ${f.match}`
    );
    expect(found).toEqual([
      `departure: bad entry ${REGISTRY} Bad: id, axis, status, what, replaces`,
      'departure: no mark components/Widget.tsx:2 frame-prop',
      'departure: no mark components/widget.scss:3 surface-quiet',
      'departure: no mark components/Widget.tsx:5 theme-names',
      `departure: nothing to mark ${WIDGET} lost-one: no code line holds "no such text"`,
      'departure: mark without an entry components/widget.scss:4 stray',
    ]);
  });

  it('places the marks above the declaration and the use, and their doc, once', () => {
    const { placements } = planDepartures(root);
    writeDepartures(root, placements);
    expect(lines(`${WIDGET}/components/Widget.tsx`).slice(1, 3)).toEqual([
      `  // ${registryMarkText(frame)}`,
      '  /** What it stands on. */',
    ]);
    expect(lines(`${WIDGET}/components/Widget.tsx`).slice(5, 7)).toEqual([
      `// ${registryMarkText(names)}`,
      '/**',
    ]);
    expect(lines(`${WIDGET}/components/widget.scss`)[2]).toBe(
      `  // ${registryMarkText(quiet)}`
    );
    expect(planDepartures(root).placements).toEqual([]);
  });

  it('warns on a mark outside its entry’s places, or of the other kind', () => {
    write(
      'packages/v12-styles/src/_x.scss',
      '// @carbon-explore surface-quiet — elsewhere. TBD\n.x { color: red; }\n'
    );
    const found = departureFindings(root)
      .filter((f) => f.at.startsWith('packages/v12-styles'))
      .map((f) => f.kind);
    expect(found).toEqual([
      'departure: mark off its places',
      'departure: mark of the other kind',
    ]);
  });
});
