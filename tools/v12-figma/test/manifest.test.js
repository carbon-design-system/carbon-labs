/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { defaultBlock, validateFigmaBlocks } from '../src/manifest.js';
import { classifyProp } from '../src/components.js';
import { colorMixesIn, stateOf } from '../src/state-colors.js';
import { gamutOf, parseColor, parseOklch } from '../src/color.js';
import { readContract, tokensOfItem } from '../src/motion.js';

// Built here so this file holds no id-shaped text.
const NODE = ['12', '34'].join(':');

describe('the figma block', () => {
  it('defaults a row with none', () => {
    expect(defaultBlock({ id: 'button', kind: 'component' })).toEqual({
      key: 'v12/button',
      status: 'unmapped',
    });
    expect(defaultBlock({ id: 'props', kind: 'component' })).toEqual({
      key: 'v12/props',
      status: 'code-only',
    });
    expect(defaultBlock({ id: 'styles/surface', kind: 'styles' })).toEqual({
      key: 'v12/styles/surface',
      status: 'code-only',
    });
  });

  it('accepts unmapped and code-only blocks, and lists rows without one', () => {
    const { errors, missing, blocks } = validateFigmaBlocks([
      {
        id: 'button',
        kind: 'component',
        figma: { key: 'v12/button', status: 'unmapped', props: ['kind'] },
      },
      {
        id: 'props',
        kind: 'component',
        figma: { key: 'v12/props', status: 'code-only' },
      },
      { id: 'tag', kind: 'component' },
    ]);
    expect(errors).toEqual([]);
    expect(missing).toEqual(['tag']);
    expect(blocks.get('tag')).toEqual({ key: 'v12/tag', status: 'unmapped' });
  });

  it('refuses ids, unknown fields, statuses not allowed yet and shared keys', () => {
    const { errors } = validateFigmaBlocks([
      {
        id: 'a',
        kind: 'component',
        figma: { key: 'v12/a', status: 'unmapped', set: `Button ${NODE}` },
      },
      { id: 'b', kind: 'component', figma: { key: 'v12/a', status: 'mapped' } },
      {
        id: 'c',
        kind: 'component',
        figma: { key: 'Button', status: 'done', url: 'x' },
      },
      {
        id: 'd',
        kind: 'component',
        figma: { key: 'v12/d', status: 'code-only', page: 'Actions' },
      },
      { id: 'e', kind: 'component', figma: 'v12/e' },
    ]);
    expect(errors).toEqual([
      "a: figma holds a design file's node id; keep ids in the private id map",
      'b: figma.key "v12/a" is also a\'s',
      'b: figma.status "mapped" needs an export to check it against; use unmapped or code-only',
      'c: figma.url is not a field of the block',
      'c: figma.key must be a logical key such as "v12/c"',
      'c: figma.status must be one of unmapped, scaffolded, mapped, code-only, figma-only',
      'd: figma: a code-only row has only a key and a status',
      'e: figma is not an object',
    ]);
  });
});

describe('a prop', () => {
  it('becomes the property its control and value say', () => {
    expect(classifyProp('kind', { options: ['a', 'b'] })).toEqual({
      figma: 'VARIANT',
      values: ['a', 'b'],
    });
    expect(
      classifyProp('size', { options: { $unresolved: 'SIZES.map(f)' } })
    ).toEqual({
      figma: 'VARIANT',
      values: null,
      unresolved: 'SIZES.map(f)',
    });
    expect(classifyProp('open', { options: [true, false] })).toEqual({
      figma: 'BOOLEAN',
    });
    expect(classifyProp('busy', {}, false)).toEqual({ figma: 'BOOLEAN' });
    expect(classifyProp('renderIcon', { control: false })).toEqual({
      figma: 'INSTANCE_SWAP',
    });
    expect(classifyProp('renderItem', {})).toEqual({ figma: 'SLOT' });
    expect(classifyProp('children', {}, 'Save')).toEqual({
      figma: 'TEXT',
      as: 'label',
    });
    expect(classifyProp('label', { control: { type: 'text' } })).toEqual({
      figma: 'TEXT',
    });
    expect(classifyProp('max', { control: 'number' }, 4)).toBeNull();
    expect(classifyProp('onChange', { action: 'x' })).toBeNull();
    expect(classifyProp('tooltipPosition', { options: ['top'] })).toBeNull();
  });
});

describe('a mixed colour', () => {
  it('is found with its selector, through interpolation and comments', () => {
    const found = colorMixesIn(
      `// a color-mix( in a comment\n.#{$b}--x {\n  &:active { --fill: color-mix(in srgb, #{$ink} 8%, transparent); }\n  color: red;\n}\n`
    );
    expect(found).toEqual([
      {
        selectors: ['.#{$b}--x', '&:active'],
        property: '--fill',
        expression: 'color-mix(in srgb, #{$ink} 8%, transparent)',
        line: 3,
      },
    ]);
  });

  it('takes its state from the property, else the selector', () => {
    expect(stateOf('--rollover-hover', ['.a:active'])).toBe('hover');
    expect(stateOf('background', ['.a', '&:active'])).toBe('press');
    expect(stateOf('background', ['.a'])).toBeNull();
  });
});

describe('colour values', () => {
  it('parses OKLCH and static colours', () => {
    expect(parseOklch('oklch(45% 0.27 262deg / 50%)')).toEqual({
      oklch: [0.45, 0.27, 262],
      alpha: 0.5,
    });
    expect(parseColor('#ABC')).toEqual({ hex: '#aabbcc', alpha: 1 });
    expect(parseColor('rgba(22, 22, 22, 0.5)')).toEqual({
      hex: '#161616',
      alpha: 0.5,
    });
    expect(parseColor('var(--x)')).toBeNull();
  });

  it('knows sRGB from outside it', () => {
    expect(gamutOf([0.97, 0.004, 262])).toBe('srgb');
    expect(gamutOf([0.454, 0.2742, 262.72])).toBe('outside-srgb');
  });
});

describe('the motion contract', () => {
  it('gives the version, the statuses and the exports', () => {
    const facts = readContract(
      '`@carbon-labs/motion-react` (0.1.1), item\n\n- `approved` (2): `a`,\n  `b`\n- `exploring` (1): `c`\n\n## The exports\n\n| Export | Kind | From | Used by |\n| --- | --- | --- | --- |\n| `x` | hook | `m` | A |\n'
    );
    expect(facts).toEqual({
      version: '0.1.1',
      statuses: { a: 'approved', b: 'approved', c: 'exploring' },
      exports: [{ name: 'x', kind: 'hook', from: 'm', entry: null }],
    });
  });

  it('gives an item the registry tokens it owns', () => {
    expect(
      tokensOfItem('loading', [
        'loading',
        'pattern-loading',
        'loading-x',
        'skeleton',
      ])
    ).toEqual(['loading', 'loading-x', 'pattern-loading']);
  });
});
