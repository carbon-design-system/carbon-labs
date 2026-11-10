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
// A draft the manifest doesn't record must be private too; a published
// component of carbon-labs' own (no draft status) is left alone.
write(
  'packages/react/src/v12/components/Loose/package.json',
  JSON.stringify({ name: 'loose', labs: { status: 'draft' } })
);
write(
  'packages/react/src/v12/components/Own/package.json',
  JSON.stringify({ name: 'own' })
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

describe('the lane check', () => {
  it('finds a leak, a literal, motion not through the seam and a public package, and nothing else', () => {
    const found = checkLane(tmp).map((f) => `${f.kind} ${f.match}`);
    expect(found.sort()).toEqual([
      'leak (id) TASK-123',
      'motion literal 120ms',
      'motion not through the seam @carbon-labs/motion-core',
      'not private loose',
      'not private thing',
    ]);
  });
});
