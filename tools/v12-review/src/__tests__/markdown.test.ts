/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { blocks } from '../markdown';

describe('the docs text', () => {
  it('reads paragraphs, lists that run on, and headings', () => {
    const text = [
      'One paragraph',
      'on two lines.',
      '',
      '- **Hover:** a glow,',
      '  in on fast-02.',
      '- Press.',
      '',
      '### Keys',
      'Tab moves.',
    ].join('\n');
    expect(blocks(text)).toEqual([
      { kind: 'p', text: 'One paragraph on two lines.' },
      { kind: 'ul', items: ['**Hover:** a glow, in on fast-02.', 'Press.'] },
      { kind: 'h', text: 'Keys' },
      { kind: 'p', text: 'Tab moves.' },
    ]);
  });

  it('reads a quote as its text', () => {
    const text = [
      '> **Problem statement:** a gap',
      '> to fill.',
      '',
      'More.',
    ].join('\n');
    expect(blocks(text)).toEqual([
      { kind: 'p', text: '**Problem statement:** a gap to fill.' },
      { kind: 'p', text: 'More.' },
    ]);
  });

  it('reads a table: its head, and its rows under the rule', () => {
    const text = [
      'Before.',
      '| Class | Nav |',
      '| ----- | --- |',
      '| Compact | `overlay` |',
      '| Medium | rail |',
      'After.',
    ].join('\n');
    expect(blocks(text)).toEqual([
      { kind: 'p', text: 'Before.' },
      {
        kind: 'table',
        head: ['Class', 'Nav'],
        rows: [
          ['Compact', '`overlay`'],
          ['Medium', 'rail'],
        ],
      },
      { kind: 'p', text: 'After.' },
    ]);
  });
});
