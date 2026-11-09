/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Carbon from '@carbon/icons-react';
import {
  carbonIcon,
  iconTree,
  pickDrawing,
  svgAttributes,
  toSVG,
  type IconDescriptor,
} from '../../static';

/**
 * The static renderer (src/static) against `@carbon/icons-react`: for every
 * Carbon icon the package draws statically, `carbonIcon(…descriptors)`
 * renders the same DOM as Carbon's React icon of the same name, attribute
 * for attribute and in the same order, at every size and with every prop a
 * caller passes; and `toSVG(iconTree(…))` is the same markup.
 *
 * The icons are read from the source: every `import X16 from
 * '@carbon/icons/es/<name>/16.js'` under the icon specs (the core's
 * src/icons since refactor stage 2, where Carbon's art is data,
 * `carbonArt(…)`) and this package's src/icons, grouped by the
 * `carbonArt(…)` / `carbonIcon(…)` call that uses them (the identifier
 * minus its size is Carbon's React name).
 */

const ICON_DIRS = [
  path.resolve(__dirname, '../../icons'),
  path.resolve(
    __dirname,
    '../../../../../../../v12-motion-icons-core/src/icons'
  ),
];
const walk = (d: string): string[] =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(d, e.name))
        : /\.tsx?$/.test(e.name)
          ? [path.join(d, e.name)]
          : []
    );

type Use = { name: string; specs: string[] };
const uses = new Map<string, Use>();
for (const file of ICON_DIRS.flatMap(walk)) {
  const src = fs.readFileSync(file, 'utf8');
  const specOf = new Map(
    [
      ...src.matchAll(/^import (\w+) from '(@carbon\/icons\/es\/[^']+)';$/gm),
    ].map((m) => [m[1], m[2]])
  );
  for (const m of src.matchAll(/(?:carbonIcon|carbonArt)\(([^)]*)\)/g)) {
    const ids = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length || !ids.every((id) => specOf.has(id))) continue;
    // The identifier is the React name plus its artboard's size (Cursor_1 at 16 is `Cursor_116`).
    const name = ids[0].slice(
      0,
      -/\/(\d+)\.js$/.exec(specOf.get(ids[0])!)![1].length
    );
    uses.set(name, { name, specs: ids.map((id) => specOf.get(id)!) });
  }
}
/**
 * Icons in @carbon/icons 11.89 that older @carbon/icons-react releases lack:
 * compared only where the installed one has them (marks.edit.test checks Asset edit's art,
 * and marks.warning.test and marks.error.test the content navigator sync
 * badges', against their @carbon/icons descriptors by coverage).
 */
const NEWER_THAN_REACT = new Set([
  'AssetEdit',
  'ContentNavigatorSyncWarning',
  'ContentNavigatorSyncError',
]);
const CarbonIcons = Carbon as unknown as Record<
  string,
  React.ComponentType<Record<string, unknown>>
>;
// Those are compared wherever the installed @carbon/icons-react has them.
const ALL = [...uses.values()]
  .filter((u) => !NEWER_THAN_REACT.has(u.name) || CarbonIcons[u.name])
  .sort((a, b) => a.name.localeCompare(b.name));

const load = async (u: Use) =>
  Promise.all(
    u.specs.map(
      async (s) =>
        (await import(/* @vite-ignore */ s)).default as IconDescriptor
    )
  );

const html = (el: React.ReactElement) => {
  const r = render(el);
  const out = r.container.innerHTML;
  r.unmount();
  return out;
};

const PROPS: Record<string, unknown>[] = [
  {},
  { 'aria-label': 'Label' },
  { 'aria-labelledby': 'someone' },
  { title: 'Title' },
  { className: 'a b', style: { color: 'red' }, id: 'x', 'data-test': 'y' },
  { tabIndex: 0 },
  { tabIndex: 0, 'aria-label': 'Focusable' },
  { tabIndex: '-1', 'aria-label': 'Focusable' },
  { 'aria-hidden': false },
  { fill: 'red', width: 40 },
];
const SIZES: (number | string | undefined)[] = [
  16,
  20,
  24,
  32,
  undefined,
  '16px',
  '20',
  48,
];

describe('carbonIcon renders what @carbon/icons-react renders', () => {
  it('covers the icons the package draws statically', () => {
    expect(ALL.length).toBeGreaterThan(200);
    for (const u of ALL) expect(CarbonIcons[u.name], u.name).toBeDefined();
  });

  it.each(ALL.map((u) => [u.name, u] as const))('%s', async (name, u) => {
    const drawings = await load(u);
    const Static = carbonIcon(...drawings);
    const Ref = CarbonIcons[name];
    for (const size of SIZES) {
      for (const p of PROPS) {
        const props = size === undefined ? p : { ...p, size };
        expect(
          html(<Static {...props} />),
          `${name} ${JSON.stringify(props)}`
        ).toBe(html(<Ref {...props} />));
      }
      // Children (e.g. a <title>) follow the drawing, as Carbon's.
      expect(
        html(
          <Static size={size}>
            <title>t</title>
          </Static>
        )
      ).toBe(
        html(
          <Ref size={size}>
            <title>t</title>
          </Ref>
        )
      );
      // The same markup as data.
      const attrs = { 'aria-label': 'L', class: 'c', title: 'T & "q"' };
      const host = document.createElement('div');
      host.innerHTML = toSVG(iconTree(drawings, size, attrs));
      expect(host.innerHTML).toBe(
        html(<Ref size={size} aria-label="L" className="c" title={'T & "q"'} />)
      );
    }
  });
});

describe("the icons' static states are Carbon's own icons", () => {
  // Toggle state → the Carbon icon it shows when still, at every size, labelled or not.
  const CASES: [string, Record<string, unknown>, string][] = [
    ['CloudOfflineToggle', { toggled: false }, 'Cloud'],
    ['CloudOfflineToggle', { toggled: true }, 'CloudOffline'],
    ['ViewOffToggle', { toggled: false }, 'View'],
    ['ViewOffToggle', { toggled: true }, 'ViewOff'],
    ['ViewOffToggle', { toggled: true, filled: true }, 'ViewOffFilled'],
    ['CheckboxToggle', { toggled: true }, 'CheckboxCheckedFilled'],
    ['Locked', {}, 'Locked'],
    ['Unlocked', {}, 'Unlocked'],
  ];
  it.each(CASES)('%s %j is Carbon %s', async (name, props, carbon) => {
    const LIB = (await import('../../index')) as unknown as Record<
      string,
      React.ComponentType<Record<string, unknown>>
    >;
    const [Icon, Ref] = [LIB[name], CarbonIcons[carbon]];
    for (const size of [16, 20, 24, 32]) {
      for (const label of [{}, { 'aria-label': 'L', className: 'c' }]) {
        expect(
          html(<Icon {...props} {...label} size={size} animated={false} />)
        ).toBe(html(<Ref {...label} size={size} />));
      }
    }
  });
});

describe('the renderer', () => {
  it('forwards a ref to the svg', () => {
    const Static = carbonIcon({
      elem: 'svg',
      attrs: { viewBox: '0 0 32 32' },
      content: [],
      name: 'x',
      size: 32,
    });
    const ref = createRef<SVGSVGElement>();
    render(<Static ref={ref} />);
    expect(ref.current?.tagName).toBe('svg');
  });

  it("draws Carbon's own artboard when there is one, the 32 drawing otherwise", () => {
    const d = (size: number) => ({
      elem: 'svg',
      attrs: { viewBox: `0 0 ${size} ${size}` },
      content: [],
      name: 'x',
      size,
    });
    const [d16, d32] = [d(16), d(32)];
    expect(pickDrawing([d16, d32], 16)).toBe(d16);
    expect(pickDrawing([d16, d32], '16px')).toBe(d16);
    expect(pickDrawing([d16, d32], 20)).toBe(d32);
    expect(pickDrawing([d32], 16)).toBe(d32);
    expect(svgAttributes(d32, 16)).toEqual({
      focusable: 'false',
      preserveAspectRatio: 'xMidYMid meet',
      fill: 'currentColor',
      width: 16,
      height: 16,
      viewBox: '0 0 32 32',
      'aria-hidden': true,
      xmlns: 'http://www.w3.org/2000/svg',
    });
  });
});
