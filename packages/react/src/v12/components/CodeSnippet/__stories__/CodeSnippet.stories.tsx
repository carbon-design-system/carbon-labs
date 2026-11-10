/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { TooltipMotion } from '@carbon-labs/v12-motion';
import type { TooltipAlign } from '@carbon-labs/react-tooltip';
import { CodeSnippet, CodeSnippetSkeleton, CodeSnippetTypes } from '../index';
import type { CodeSnippetProps } from '../index';
import mdx from './CodeSnippet.mdx';

const ALIGNMENTS: TooltipAlign[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

export default {
  title: 'V12/CodeSnippet',
  component: CodeSnippet,
  subcomponents: { CodeSnippetSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'show-more',
        'soft-edge-collapsed',
        'label-roll',
        'copy',
        'rollover',
        'scrollbar',
        'loading',
        'slow-motion',
      ],
      reduced: {
        'show-more': 'at-once',
        'label-roll': 'at-once',
        copy: 'at-once',
        rollover: 'at-once',
      },
      states: [
        'rest',
        'hover',
        'focus',
        'copied',
        'expanded',
        'disabled',
        'loading',
      ],
    },
  },
  argTypes: {
    type: { control: 'inline-radio', options: CodeSnippetTypes },
    align: { control: 'select', options: ALIGNMENTS },
    children: { control: 'text' },
    light: { control: false },
    ariaLabel: { control: false },
  },
};

/** Room round the snippets, so their tooltips are never clipped. */
const stage = {
  display: 'grid',
  gap: 24,
  maxInlineSize: 640,
  paddingBlock: '16px 64px',
};

const SINGLE = 'npm install --save-dev typescript';

const LONG_LINE =
  'npx create-project my-app --template typescript --package-manager npm --skip-git --install --verbose';

const SHORT_MULTI = `npm install
npm run build
npm test`;

const LONG_MULTI = `// Counts the items in each group.
export function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

// Splits a list into pages of a given size.
export function paginate<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

// Waits a number of milliseconds.
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns the first item that matches, or undefined.
export function find<T>(items: T[], test: (item: T) => boolean) {
  for (const item of items) {
    if (test(item)) return item;
  }
  return undefined;
}`;

/** A single-line command. Press its copy button: the Copy icon plays its action and the tooltip rolls to the feedback, then back. */
export const Default = {
  args: {
    type: 'single',
    children: SINGLE,
    feedback: 'Copied',
    feedbackTimeout: 2000,
    align: 'bottom',
    disabled: false,
    hideCopyButton: false,
    wrapText: false,
  },
  render: (args: CodeSnippetProps) => (
    <div style={stage}>
      <CodeSnippet {...args} />
    </div>
  ),
};

/** Inline code in a sentence. The whole snippet is the copy button: hover it for the rollover, press it for the feedback. */
export const Inline = {
  render: () => (
    <div style={stage}>
      <p>
        Run <CodeSnippet type="inline">npm run build</CodeSnippet> before you
        publish, then{' '}
        <CodeSnippet type="inline" feedback="Command copied">
          npm publish
        </CodeSnippet>
        .
      </p>
      <p>
        Without a copy button:{' '}
        <CodeSnippet type="inline" hideCopyButton>
          node --version
        </CodeSnippet>
      </p>
    </div>
  ),
};

/** Multi: a short block, and a long one past `maxCollapsedNumberOfRows`. Press Show more: the rest of the code opens, the soft edge closes as it lands, and the label rolls to Show less. */
export const Multi = {
  render: () => (
    <div style={stage}>
      <CodeSnippet type="multi">{SHORT_MULTI}</CodeSnippet>
      <CodeSnippet type="multi">{LONG_MULTI}</CodeSnippet>
    </div>
  ),
};

/** Code past the end: a soft edge where it runs out, gone while the code has focus. Scroll it to see the scroller's pill. The last one wraps instead. */
export const Overflow = {
  render: () => (
    <div style={stage}>
      <CodeSnippet>{LONG_LINE}</CodeSnippet>
      <CodeSnippet type="multi">{`${LONG_LINE}\n${SINGLE}`}</CodeSnippet>
      <CodeSnippet type="multi" wrapText>
        {`${LONG_LINE}\n${SINGLE}`}
      </CodeSnippet>
    </div>
  ),
};

/** Disabled, without a copy button, and a multi with row limits: expanded, it scrolls past `maxExpandedNumberOfRows`. */
export const States = {
  render: () => (
    <div style={stage}>
      <CodeSnippet disabled>{SINGLE}</CodeSnippet>
      <CodeSnippet hideCopyButton>{SINGLE}</CodeSnippet>
      <CodeSnippet
        type="multi"
        maxCollapsedNumberOfRows={6}
        maxExpandedNumberOfRows={12}
        minExpandedNumberOfRows={8}>
        {LONG_MULTI}
      </CodeSnippet>
    </div>
  ),
};

/** Toggle loading: the code's lines are blocks and the copy button is disabled. Loaded, the blocks dissolve in place as the code fades up. Loading again reverses it. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={stage}>
        <Checkbox
          id="code-snippet-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <CodeSnippet loading={loading}>{SINGLE}</CodeSnippet>
        <CodeSnippet type="multi" loading={loading}>
          {SHORT_MULTI}
        </CodeSnippet>
        <CodeSnippetSkeleton />
        <CodeSnippetSkeleton type="multi" />
      </div>
    );
  },
};

/** Slow motion: `TooltipMotion`'s `timeScale` reaches the tooltip, the rollovers, the label roll, the scroller and Show more. Here they run at a quarter speed. */
export const SlowMotion = {
  render: () => (
    <TooltipMotion timeScale={4}>
      <div style={stage}>
        <CodeSnippet>{SINGLE}</CodeSnippet>
        <CodeSnippet type="multi">{LONG_MULTI}</CodeSnippet>
      </div>
    </TooltipMotion>
  ),
};
