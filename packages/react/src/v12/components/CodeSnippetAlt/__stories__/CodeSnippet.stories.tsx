/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-webpack5';
import { CodeSnippet, type CodeSnippetProps } from '../components/CodeSnippet';
import { InlineCode } from '../components/InlineCode';
import '../components/code-snippet.scss';
import '../../MegaButton/components/mega-button.scss';
import './CodeSnippet.stories.scss';
import proposals from '../proposals/tokens.json';
import mdx from './CodeSnippet.mdx';

type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';
type Theme = CarbonTheme | 'v12-light' | 'v12-dark';
type TokenFile = Record<string, Record<string, unknown>>;

const proposalTheme: Record<Theme, CarbonTheme> = {
  white: 'white',
  g10: 'g10',
  g90: 'g90',
  g100: 'g100',
  'v12-light': 'white',
  'v12-dark': 'g100',
};

/**
 * One theme's proposed values, as the custom properties the stylesheet reads
 * through get-var. A DTCG alias, `{tag-color-blue}`, is Carbon's own token.
 *
 * @param {TokenFile} file A proposals/tokens.json.
 * @param {CarbonTheme} theme The Carbon theme.
 * @returns {string} The declarations.
 */
function declarations(file: TokenFile, theme: CarbonTheme): string {
  return Object.entries(file)
    .filter(([group]) => !group.startsWith('$'))
    .flatMap(([group, tokens]) =>
      Object.entries(tokens).map(([role, token]) => {
        const themes = (
          token as {
            $extensions: { 'carbon.themes': Record<CarbonTheme, string> };
          }
        ).$extensions['carbon.themes'];
        const value = themes[theme].replace(/^\{(.+)\}$/, 'var(--cds-$1)');
        return `--cds-${group}-${role}: ${value};`;
      })
    )
    .join(' ');
}

const withProposals: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'white') as Theme;
  const on = context.args.proposals !== false;
  const scope = 'code-snippet-story-proposals';
  return (
    <div
      className={
        on ? `code-snippet-story__page ${scope}` : 'code-snippet-story__page'
      }>
      {on && (
        <style>{`.${scope} { ${declarations(
          proposals as unknown as TokenFile,
          proposalTheme[theme]
        )} }`}</style>
      )}
      <Story />
    </div>
  );
};

const sample = `'use strict';
// Increase max listeners for event emitters
require('events').EventEmitter.defaultMaxListeners = 100;

const gulp = require('gulp');
const util = require('./build/lib/util');
const path = require('path');
const compilation = require('./build/lib/compilation');

// Fast compile for development time
gulp.task('clean-client', util.rimraf('out'));
gulp.task('compile-client', ['clean-client'], compilation.compileTask('out', false));
gulp.task('watch-client', ['clean-client'], compilation.watchTask('out', false));

gulp.task('default', ['compile']);`;

const python = `def summarize(thread, limit=3):
    # Keep the newest turns, newest last
    turns = [t for t in thread if t.role != "system"]
    return turns[-limit:]`;

type StoryArgs = CodeSnippetProps & { proposals?: boolean };

const meta: Meta<StoryArgs> = {
  title: 'V12/CodeSnippetAlt',
  tags: ['squad', 'incubating'],
  component: CodeSnippet,
  decorators: [withProposals],
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    code: sample,
    language: 'JavaScript',
    collapsedLines: 9,
    showLineNumbers: true,
    proposals: true,
  },
  argTypes: {
    className: { control: false },
    highlight: { control: false },
    translations: { control: false },
    onCopy: { action: 'copied' },
    onExpandedChange: { action: 'expanded' },
    proposals: {
      control: 'boolean',
      description:
        'Read the proposed syntax colours. Off shows the Carbon fallbacks.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

/**
 * Fifteen lines, nine shown, Show more for the rest.
 */
export const Default: Story = {};

/**
 * Open: every line, and Show less to close it.
 */
export const Expanded: Story = {
  args: { defaultExpanded: true },
};

/**
 * Short enough to show whole: no toggle.
 */
export const Short: Story = {
  args: { code: python, language: 'Python' },
};

/**
 * Highlighting off: the code in Carbon's primary text.
 */
export const Plain: Story = {
  args: { highlight: false },
};

/**
 * InlineCode names a file, command or tool in running text.
 */
export const Inline: Story = {
  render: () => (
    <p className="code-snippet-story__prose">
      I’ve mapped the activity states and saved them in{' '}
      <InlineCode>activity-model.md</InlineCode>, using{' '}
      <InlineCode>carbon-mcp</InlineCode>.
    </p>
  ),
};
