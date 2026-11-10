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
import { checkLane } from '../src/check.js';

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

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const dir = 'packages/react/src/v12/components';

describe('the lane check', () => {
  it('finds a leak, a literal, motion not through the seam, a public package and a folder with no row, and nothing else', () => {
    const found = checkLane(tmp, { directMotion: [] }).map(
      (f) => `${f.level} ${f.kind} ${f.match}`
    );
    expect(found.sort()).toEqual([
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
