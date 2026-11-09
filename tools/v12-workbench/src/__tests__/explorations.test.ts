/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  MAP_PATH,
  buildMap,
  marksIn,
  proposalsIn,
  serialize,
} from '../../scripts/explorations.js';
import { explorationsFor, markPlace } from '../explorations';

describe('the explorations map', () => {
  it('is up to date with the components (run `yarn explorations` in tools/v12-workbench)', () => {
    expect(readFileSync(MAP_PATH, 'utf8')).toBe(serialize(buildMap()));
  });

  it('reads a mark from a Sass or a block comment', () => {
    const text = [
      '.a {',
      '  // @carbon-explore radius-x — A corner. TBD',
      '  /* @carbon-proposal token: fill-x — A fill. TBD */',
      '}',
    ].join('\n');
    expect(marksIn(text, 'a.scss')).toEqual([
      {
        kind: 'explore',
        file: 'a.scss',
        line: 2,
        text: 'radius-x — A corner. TBD',
      },
      {
        kind: 'proposal',
        file: 'a.scss',
        line: 3,
        text: 'token: fill-x — A fill. TBD',
      },
    ]);
  });

  it('reads a proposals README, one proposal per item, wrapped lines joined', () => {
    const text =
      '# X proposals\n\n- api: a — One.\n- api: b — Two\n  lines. TBD\n';
    expect(proposalsIn(text, 'README.md')).toEqual([
      { kind: 'proposal', file: 'README.md', line: 3, text: 'api: a — One.' },
      {
        kind: 'proposal',
        file: 'README.md',
        line: 4,
        text: 'api: b — Two lines. TBD',
      },
    ]);
  });
});

describe('the explorations panel data', () => {
  it("groups a story's marks by kind, explorations first", () => {
    const file =
      'packages/react/src/v12/components/Widget/components/widget.scss';
    const source = {
      'V12/Widget': [
        {
          kind: 'proposal' as const,
          file,
          line: 9,
          text: 'token: fill-x — A fill.',
        },
        {
          kind: 'explore' as const,
          file,
          line: 4,
          text: 'radius-x — A corner.',
        },
      ],
    };
    const groups = explorationsFor('V12/Widget', source);
    expect(groups.map((g) => g.heading)).toEqual(['Explorations', 'Proposals']);
    expect(groups[0].marks.map((m) => m.text)).toEqual([
      'radius-x — A corner.',
    ]);
    expect(markPlace(groups[0].marks[0])).toBe(
      'Widget/components/widget.scss:4'
    );
  });

  it('gives no groups to a story with no marks', () => {
    expect(explorationsFor('V12/Workbench')).toEqual([]);
    expect(explorationsFor(undefined)).toEqual([]);
  });
});
