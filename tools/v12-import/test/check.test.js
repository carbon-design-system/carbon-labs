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
import { checkLane, scriptMotion, styleMotion } from '../src/check.js';
import { vocabFindings } from '../src/vocab.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-check-'));
/**
 * Writes a fixture file.
 *
 * @param {string} rel Its path in the fixture.
 * @param {string} text Its contents.
 */
const write = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
  fs.writeFileSync(path.join(tmp, rel), text);
};

write(
  'v12.manifest.json',
  JSON.stringify([
    {
      id: 'widget',
      kind: 'component',
      path: 'packages/react/src/v12/components/Widget',
    },
    { id: 'package/thing', kind: 'package', path: 'packages/v12-thing' },
    {
      id: 'labs/published',
      kind: 'component',
      path: 'packages/react/src/v12/components/Published',
      publishable: true,
    },
  ])
);
write(
  'packages/react/src/v12/components/Widget/components/widget.scss',
  '.w { transition: opacity 120ms; }\n'
);
write(
  'packages/react/src/v12/components/Widget/components/Widget.tsx',
  "// See TASK-123.\nimport { motionTokens } from '@carbon-labs/motion-core';\nexport const W = motionTokens;\n"
);
write(
  'packages/react/src/v12/components/Widget/__stories__/Widget.stories.tsx',
  'export const Notes = () => <p>It runs over 120ms.</p>;\n'
);
write('packages/v12-thing/package.json', JSON.stringify({ name: 'thing' }));
// A folder the manifest doesn't record is reported, and a draft among them
// must be private too.
write(
  'packages/react/src/v12/components/Loose/package.json',
  JSON.stringify({ name: 'loose', labs: { status: 'draft' } })
);
write(
  'packages/react/src/v12/components/Own/package.json',
  JSON.stringify({ name: 'own' })
);
// A row marked publishable is a package carbon-labs already publishes.
write(
  'packages/react/src/v12/components/Published/package.json',
  JSON.stringify({ name: 'published' })
);
// Motion from outside the seam: an error, or a warning where it is recorded.
write(
  'packages/react/src/v12/components/Widget/components/old.scss',
  "@use '@carbon/styles/scss/motion' as *;\n"
);
// The release's changelog carries dates; the check leaves it alone.
write('packages/v12-thing/CHANGELOG.md', '## 0.1.0 (2026-11-09)\n');
write(
  'packages/react/src/v12/components/Widget/package.json',
  JSON.stringify({ name: 'widget', private: true })
);
write(
  'packages/v12-thing/src/index.ts',
  "export { motionTokens } from '@carbon-labs/motion-core';\n"
);
write(
  'packages/v12-motion/src/index.ts',
  "export { motionTokens } from '@carbon-labs/motion-core';\nexport const clock = '120ms';\n"
);

// The design sync's files: a node id and a file key are leaks there, a
// contrast ratio and a long camelCase name are not.
write(
  'figma-sync/tokens.code.json',
  JSON.stringify(
    {
      ratio: 'solved to 4.5:1 on every surface',
      name: 'aiPopoverShadowOuter01Large',
      node: '2818:72562',
      key: 'hQ3fkHFmh8a8n0F9bOZ2lP',
    },
    null,
    2
  )
);
write(
  'tools/v12-figma/src/ids.js',
  "// Reads the map's fileKey.\nexport const at = 'I12:34;56:78';\n"
);
write(
  'tools/v12-figma/package.json',
  JSON.stringify({ name: 'sync', private: true })
);

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const dir = 'packages/react/src/v12/components';

describe('the lane check', () => {
  it('finds a leak, a literal, motion not through the seam, a public package, a folder with no row and design ids in the sync files, and nothing else', () => {
    const found = checkLane(tmp, { directMotion: [] }).map(
      (f) => `${f.level} ${f.kind} ${f.match}`
    );
    expect(found.sort()).toEqual([
      'error leak (design file key) hQ3fkHFmh8a8n0F9bOZ2lP',
      'error leak (design id field) fileKey',
      'error leak (design node id) 2818:72562',
      'error leak (design node id) I12:34;56:78',
      'error leak (id) TASK-123',
      'error motion literal 120ms',
      'error motion not through the seam @carbon-labs/motion-core',
      'error motion not through the seam @carbon/styles/scss/motion',
      'error not private loose',
      'error not private thing',
      'error unlisted folder Loose',
      'error unlisted folder Own',
    ]);
  });

  it('reports a recorded import as a warning, and a recorded one that is gone as an error', () => {
    const found = checkLane(tmp, {
      directMotion: [
        {
          file: `${dir}/Widget/components/old.scss`,
          spec: '@carbon/styles/scss/motion',
        },
        {
          file: `${dir}/Widget/components/gone.scss`,
          spec: '@carbon/styles/scss/motion',
        },
      ],
    })
      .filter((f) => /seam|stale/.test(f.kind))
      .map((f) => `${f.level} ${f.kind} ${f.at}`);
    expect(found.sort()).toEqual([
      'error motion not through the seam packages/react/src/v12/components/Widget/components/Widget.tsx:2',
      'error stale allowance packages/react/src/v12/components/Widget/components/gone.scss',
      'warning motion not through the seam packages/react/src/v12/components/Widget/components/old.scss:1',
    ]);
  });
});

describe('the motion rules', () => {
  it('finds reduced motion past the seam, hand-built curves, timers, token arithmetic and shadowing helpers', () => {
    const text = [
      'const HOLD = 400;',
      'const DECK = { closeDelay: 300 };',
      "const reduce = matchMedia('(prefers-reduced-motion: reduce)');",
      "const ease = `cubic-bezier(${curve.join(', ')})`;",
      '// v12-allow easing: a curve the bar solves from its live velocity',
      'const solved = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;',
      'setTimeout(done, HOLD);',
      'setTimeout(done, DECK.closeDelay);',
      'setTimeout(done, ms + 50);',
      "setTimeout(done, motionTokens.duration['fast-01'] * 2);",
      'setTimeout(done, ms * timeScale);',
      '// v12-allow timer: a11y a screen reader reads the field first',
      'setTimeout(announce, 1000);',
      'const clamp = (v) => Math.min(1, v);',
      '',
    ].join('\n');
    const found = scriptMotion(text, 'Widget.ts').map(
      (f) => `${f.line} ${f.level} ${f.kind}`
    );
    expect(found).toEqual([
      '3 warning reduced: direct media query',
      '4 warning easing: hand-built',
      '6 allowed easing: hand-built',
      '7 warning timer: literal delay',
      '8 warning timer: literal delay',
      '9 warning timer: padded fallback',
      '9 warning timer: literal delay',
      '10 warning duration: token arithmetic',
      '13 allowed timer: literal delay',
      '14 warning helper: shadows seam',
    ]);
  });

  it('finds spatial stylesheet motion without the clock function, and token arithmetic', () => {
    const text = [
      '.a { transition: opacity $fast-01 $standard; }',
      '.b { transition: opacity $fast-01, transform $fast-02 $standard; }',
      '.c { transition: transform motion.clock(fast-02) $standard; }',
      '.d { animation: slide $fast-02 $standard; }',
      '.e { animation: fade $fast-02 $standard; }',
      '.f { transition: opacity calc(var(--cds-motion-duration-fast-01) / 2); }',
      '@media (prefers-reduced-motion: reduce) {',
      '  .b { transition: transform $fast-01; }',
      '}',
      '@keyframes slide { from { translate: 0 4px; } }',
      '@keyframes fade { from { opacity: 0; } }',
      '',
    ].join('\n');
    expect(styleMotion(text).map((f) => `${f.line} ${f.kind}`)).toEqual([
      '6 duration: token arithmetic',
      '2 stylesheet: unreduced motion',
      '4 stylesheet: unreduced motion',
    ]);
  });
});

describe('the vocabulary rule', () => {
  it('finds a value off an axis, a banned name and a v11-deprecated prop', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-vocab-'));
    const folder = path.join(root, 'packages/react/src/v12/components/Widget');
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(
      path.join(folder, 'package.json'),
      JSON.stringify({ name: '@x/react-widget' })
    );
    fs.writeFileSync(
      path.join(folder, 'index.ts'),
      [
        'export interface WidgetProps {',
        "  frame?: 'ghost' | 'boxed';",
        "  size?: 'sm' | 'md';",
        "  density?: 'compact';",
        '  light?: boolean;',
        '}',
        'export function Widget(props: WidgetProps) {',
        '  return null;',
        '}',
        '',
      ].join('\n')
    );
    fs.mkdirSync(path.join(root, 'packages'), { recursive: true });
    const found = vocabFindings(root).map((f) => `${f.kind}: ${f.match}`);
    fs.rmSync(root, { recursive: true, force: true });
    expect(found.sort()).toEqual([
      'vocabulary: banned name: density on Widget: density is a context value: KitDefaults carries it, a component takes it from there',
      "vocabulary: frame: frame on Widget: 'boxed'",
      'vocabulary: v11 deprecated: light on Widget',
    ]);
  });
});
