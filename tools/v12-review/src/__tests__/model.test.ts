/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  controlsOf,
  fileOf,
  firstSentence,
  hrefOf,
  namesOf,
  parseRoute,
  propsOf,
  savedPicks,
  slugOf,
  storyTitle,
  tagsOf,
} from '../model';

describe('slugs and routes', () => {
  it('slugs a story title', () => {
    expect(slugOf('Button')).toBe('button');
    expect(slugOf('DatePickerV2')).toBe('date-picker-v2');
    expect(slugOf('NotificationsPanel')).toBe('notifications-panel');
  });

  it('reads and writes a route', () => {
    expect(parseRoute('')).toEqual({ page: 'home' });
    expect(parseRoute('#/')).toEqual({ page: 'home' });
    expect(parseRoute('#/components/button')).toEqual({
      page: 'component',
      slug: 'button',
      story: undefined,
    });
    const route = { page: 'component', slug: 'modal', story: 'sizes' } as const;
    expect(parseRoute(hrefOf(route))).toEqual(route);
  });
});

describe('the components the story files name', () => {
  const keys = [
    './Button/__stories__/Button.stories.tsx',
    './Chat/__stories__/Chat.stories.tsx',
    './Chat/__stories__/TurnStatus.stories.tsx',
    './MotionIcons/__stories__/Gallery.stories.tsx',
    './Util/__stories__/Util.stories.tsx',
  ];

  it('names each folder, and a component with a page of its own in another folder', () => {
    const text = { 'V12/TurnStatus': {} };
    expect([...namesOf(keys, text)].sort()).toEqual([
      'Button',
      'Chat',
      'MotionIcons',
      'TurnStatus',
    ]);
  });

  it('finds each one its story file', () => {
    expect(fileOf(keys, 'Chat')).toBe('./Chat/__stories__/Chat.stories.tsx');
    expect(fileOf(keys, 'MotionIcons')).toBe(
      './MotionIcons/__stories__/Gallery.stories.tsx'
    );
    expect(fileOf(keys, 'TurnStatus')).toBe(
      './Chat/__stories__/TurnStatus.stories.tsx'
    );
    expect(fileOf(keys, 'Missing')).toBeUndefined();
  });
});

describe('the picks kept in this browser', () => {
  it('start on v12 light', () => {
    expect(savedPicks(null).theme).toBe('v12-light');
    expect(savedPicks('not json').theme).toBe('v12-light');
  });

  it('keep a v12 theme', () => {
    const picks = savedPicks(JSON.stringify({ theme: 'v12-dark', dir: 'rtl' }));
    expect(picks).toMatchObject({ theme: 'v12-dark', dir: 'rtl' });
  });

  it('read a v11 theme as the v12 theme of its side', () => {
    const theme = (t: string) => savedPicks(JSON.stringify({ theme: t })).theme;
    expect(theme('white')).toBe('v12-light');
    expect(theme('g10')).toBe('v12-light');
    expect(theme('g90')).toBe('v12-dark');
    expect(theme('g100')).toBe('v12-dark');
  });
});

describe('what the stories carry', () => {
  it('offers a control for each arg and each choice', () => {
    const controls = controlsOf(
      { children: 'Add', disabled: false, count: 2, renderIcon: () => null },
      {
        kind: { control: 'inline-radio', options: ['primary', 'danger'] },
        size: { control: 'select', options: ['sm', 'md'] },
        hidden: { control: false, options: ['a'] },
      }
    );
    expect(controls).toEqual([
      { name: 'children', kind: 'text' },
      { name: 'disabled', kind: 'boolean' },
      { name: 'count', kind: 'number' },
      { name: 'kind', kind: 'choice', options: ['primary', 'danger'] },
      { name: 'size', kind: 'choice', options: ['sm', 'md'] },
    ]);
  });

  it('reads the props from either docs shape, required first', () => {
    const component = {
      __docgenInfo: {
        props: {
          size: {
            tsType: {
              name: 'union',
              elements: [
                { name: 'literal', raw: "'sm'" },
                { name: 'literal', raw: "'md'" },
              ],
            },
            required: false,
            description: 'The size.',
            defaultValue: { value: "'md'" },
          },
          label: { type: { name: 'string' }, required: true, description: '' },
        },
      },
    };
    expect(propsOf(component)).toEqual([
      {
        name: 'label',
        type: 'string',
        required: true,
        defaultValue: undefined,
        description: '',
      },
      {
        name: 'size',
        type: "'sm' | 'md'",
        required: false,
        defaultValue: "'md'",
        description: 'The size.',
      },
    ]);
    expect(propsOf(undefined)).toEqual([]);
  });

  it('names a story and cuts a summary to its first sentence', () => {
    expect(storyTitle('WithForm')).toBe('With form');
    expect(storyTitle('Default', 'Default')).toBe('Default');
    expect(storyTitle('WithAssistant', 'With the assistant')).toBe(
      'With the assistant'
    );
    expect(firstSentence('A [link](https://x.test) here. Then more.')).toBe(
      'A link here.'
    );
    expect(firstSentence('The shared parts:\n- `Spinner`: the loader.')).toBe(
      'The shared parts.'
    );
    expect(firstSentence('> A gap\n> to fill. More.')).toBe('A gap to fill.');
  });
});

describe('the tags on a card', () => {
  it('names what the component has, in order', () => {
    const section = (title: string) => ({ title, text: 'x' });
    expect(
      tagsOf({
        title: 'X',
        summary: '',
        sections: [
          section('Reduced motion'),
          section('Keyboard'),
          section('Motion'),
        ],
        facts: { tests: true, status: 'draft' },
      })
    ).toEqual(['Motion', 'Reduced motion', 'Accessibility', 'Tests']);
    expect(tagsOf({ title: 'X', summary: '', sections: [] })).toEqual([]);
    expect(tagsOf(undefined)).toEqual([]);
  });
});
