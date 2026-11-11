/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pickUnits, planOf, readLane, unitOf } from '../src/pick.js';
import { storyPath } from '../src/story.js';

const C = 'packages/react/src/v12/components';

/** A lane of three: Util, Button on Util, Modal on Button (dev only). */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-scenes-'));
  const write = (dir, pkg) => {
    fs.mkdirSync(path.join(root, C, dir), { recursive: true });
    fs.writeFileSync(
      path.join(root, C, dir, 'package.json'),
      JSON.stringify(pkg)
    );
  };
  write('Util', { name: '@carbon-labs/react-util' });
  write('Button', {
    name: '@carbon-labs/react-button',
    dependencies: {
      '@carbon-labs/react-util': 'workspace:*',
      '@carbon-labs/v12-motion': 'workspace:*',
      '@carbon/react': '^1.0.0',
    },
  });
  write('Modal', {
    name: '@carbon-labs/react-modal',
    devDependencies: { '@carbon-labs/react-button': 'workspace:*' },
  });
  fs.mkdirSync(path.join(root, C, 'NoPackage'));
  return root;
}

describe('readLane', () => {
  it('reads each folder with a package and its workspace components', () => {
    expect(readLane(fixture())).toEqual([
      {
        dir: 'Button',
        name: '@carbon-labs/react-button',
        deps: ['@carbon-labs/react-util'],
      },
      {
        dir: 'Modal',
        name: '@carbon-labs/react-modal',
        deps: ['@carbon-labs/react-button'],
      },
      { dir: 'Util', name: '@carbon-labs/react-util', deps: [] },
    ]);
  });
});

describe('pickUnits', () => {
  const lane = readLane(fixture());

  it('picks a changed folder and its direct dependents only', () => {
    const p = pickUnits([`${C}/Util/index.ts`], lane);
    expect(p.all).toBe(false);
    expect(p.units).toEqual(['components/Button', 'components/Util']);
    expect(p.why).toContain('components/Button: imports Util');
  });

  it('follows development dependencies, as stories import them', () => {
    expect(pickUnits([`${C}/Button/x.tsx`], lane).units).toEqual([
      'components/Button',
      'components/Modal',
    ]);
  });

  it('picks the other v12 folders and the review tool by their folder', () => {
    expect(
      pickUnits(
        [
          'packages/react/src/v12/catalog/__stories__/a.tsx',
          'tools/v12-review/src/x.ts',
        ],
        lane
      ).units
    ).toEqual(['catalog', 'review']);
  });

  it('picks everything for a shared input', () => {
    for (const f of [
      'packages/react/.storybook/preview.js',
      'packages/v12-motion/src/index.ts',
      'tools/v12-workbench/src/matrix.tsx',
      'tools/v12-scenes/src/pick.js',
      'yarn.lock',
    ]) {
      expect(pickUnits([f, `${C}/Util/a.ts`], lane).all).toBe(true);
    }
  });

  it('picks nothing for a change outside the lane', () => {
    expect(
      pickUnits(['packages/web-components/src/x.ts', 'README.md'], lane)
    ).toEqual({ all: false, why: [], units: [] });
  });
});

describe('planOf', () => {
  const index = {
    entries: {
      'v12-button--default': {
        type: 'story',
        id: 'v12-button--default',
        name: 'Default',
        importPath: './src/v12/components/Button/__stories__/B.stories.tsx',
      },
      'v12-button--matrix': {
        type: 'story',
        id: 'v12-button--matrix',
        name: 'Matrix',
        importPath: './src/v12/components/Button/__stories__/B.stories.tsx',
      },
      'v12-button--overview': {
        type: 'docs',
        id: 'v12-button--overview',
        name: 'Overview',
        importPath: './src/v12/components/Button/__stories__/B.mdx',
      },
      'v12-catalog--all': {
        type: 'story',
        id: 'v12-catalog--all',
        name: 'All',
        importPath: './src/v12/catalog/__stories__/catalog.stories.tsx',
      },
    },
  };

  it('lists the picked units’ stories and their matrix stories', () => {
    expect(planOf(index, { all: false, units: ['components/Button'] })).toEqual(
      [
        {
          unit: 'components/Button',
          stories: [
            { id: 'v12-button--default', name: 'Default' },
            { id: 'v12-button--matrix', name: 'Matrix' },
          ],
          matrix: ['v12-button--matrix'],
        },
      ]
    );
  });

  it('lists every story for everything', () => {
    expect(planOf(index, { all: true, units: [] }).map((r) => r.unit)).toEqual([
      'catalog',
      'components/Button',
    ]);
  });
});

describe('unitOf and storyPath', () => {
  it('maps import paths to units', () => {
    expect(unitOf('./src/v12/components/Tabs/__stories__/T.stories.tsx')).toBe(
      'components/Tabs'
    );
    expect(unitOf('./src/v12/review/__stories__/r.stories.tsx')).toBe('review');
    expect(unitOf('./src/components/Old/x.stories.tsx')).toBe(null);
  });

  it('puts globals in the frame address', () => {
    expect(storyPath('v12-tabs--matrix', { theme: 'g100' })).toBe(
      '/iframe.html?id=v12-tabs--matrix&viewMode=story&globals=theme%3Ag100'
    );
  });
});

describe('the lane today', () => {
  it('reads every component folder of this checkout', () => {
    const lane = readLane(fileURLToPath(new URL('../../..', import.meta.url)));
    expect(lane.length).toBeGreaterThan(50);
    const button = lane.find((c) => c.dir === 'Button');
    expect(button.name).toBe('@carbon-labs/react-button');
    expect(button.deps).toContain('@carbon-labs/react-util');
  });
});
