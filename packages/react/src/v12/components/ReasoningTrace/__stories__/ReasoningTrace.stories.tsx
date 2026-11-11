/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-webpack5';
import {
  ReasoningTrace,
  type ReasoningTraceProps,
} from '../components/ReasoningTrace';
import { ReasoningStep } from '../components/ReasoningStep';
import { ThinkingIndicator } from '../components/ThinkingIndicator';
import { CodeSnippet, InlineCode } from '@carbon-labs/react-code-snippet-alt';
import '../components/reasoning-trace.scss';
import '../../CodeSnippetAlt/components/code-snippet.scss';
import '../../MegaButton/components/mega-button.scss';
import './ReasoningTrace.stories.scss';
import codeProposals from '../../CodeSnippetAlt/proposals/tokens.json';
import mdx from './ReasoningTrace.mdx';

// The proposals keep a value per Carbon theme; the page is on a v12 one.
type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';
type Theme = 'v12-light' | 'v12-dark';
type TokenFile = Record<string, Record<string, unknown>>;

// Each v12 theme reads the proposals' values for the Carbon theme it is
// built on.
const proposalTheme: Record<Theme, CarbonTheme> = {
  'v12-light': 'white',
  'v12-dark': 'g100',
};

/**
 * One theme's proposed values (CodeSnippet's syntax colours, for the code a
 * trace holds), as the custom properties the stylesheets read through get-var.
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

const withPage: Decorator = (Story, context) => {
  const theme: Theme =
    context.globals.theme === 'v12-dark' ? 'v12-dark' : 'v12-light';
  const scope = 'reasoning-trace-story-proposals';
  return (
    <div className={`reasoning-trace-story__page ${scope}`}>
      <style>{`.${scope} { ${declarations(
        codeProposals as unknown as TokenFile,
        proposalTheme[theme]
      )} }`}</style>
      <Story />
    </div>
  );
};

const code = `'use strict';
// Increase max listeners for event emitters
require('events').EventEmitter.defaultMaxListeners = 100;

const gulp = require('gulp');
const util = require('./build/lib/util');
const path = require('path');
const compilation = require('./build/lib/compilation');

// Fast compile for development time
gulp.task('clean-client', util.rimraf('out'));
gulp.task('default', ['compile']);`;

const meta: Meta<ReasoningTraceProps> = {
  title: 'V12/ReasoningTrace',
  tags: ['squad', 'incubating'],
  component: ReasoningTrace,
  subcomponents: { ReasoningStep, ThinkingIndicator } as Record<
    string,
    React.ComponentType<unknown>
  >,
  decorators: [withPage],
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    label: 'Thinking',
    duration: '22s',
    status: 'running',
    defaultOpen: true,
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    subject: { control: false },
    status: { control: 'inline-radio', options: ['running', 'complete'] },
    onOpenChange: { action: 'open' },
    onViewDetails: { action: 'view details' },
  },
};

export default meta;
type Story = StoryObj<ReasoningTraceProps>;

/**
 * While the agent thinks: the animation leads, the live step is primary text
 * with Carbon's Loading, and the footer opens the plan as it forms.
 */
export const Thinking: Story = {
  render: (args) => (
    <ReasoningTrace {...args}>
      <ReasoningStep label="Ran a command on your computer" />
      <ReasoningStep label="Deciding where the spec should live in the repo" />
      <ReasoningStep
        status="running"
        label="Running a command on your computer"
      />
    </ReasoningTrace>
  ),
};

/**
 * Resolved: the header sits flush, with no icon, and the steps open to their
 * detail.
 */
export const Complete: Story = {
  args: { label: 'Complete', duration: '1m 48s', status: 'complete' },
  render: (args) => (
    <ReasoningTrace {...args}>
      <ReasoningStep
        label="Deciding where the spec should live in the repo"
        defaultExpanded>
        docs/components/ holds the PRDs; specs/ is unused since March. Chose
        docs/components/Activity/.
      </ReasoningStep>
      <ReasoningStep label="Ran a command on your computer">
        ls docs/ specs/ — 14 files, two candidate folders.
      </ReasoningStep>
      <ReasoningStep label="Read files" />
      <ReasoningStep label="Weighed latency trade-offs" />
    </ReasoningTrace>
  ),
};

/**
 * Closed: only the header.
 */
export const Closed: Story = {
  args: {
    label: 'Complete',
    duration: '1m 48s',
    status: 'complete',
    defaultOpen: false,
  },
  render: Complete.render,
};

/**
 * A tool call: the subject is named as InlineCode, and there is no icon.
 */
export const UsedTool: Story = {
  args: {
    label: 'Used tool',
    duration: '2m 50s',
    status: 'complete',
    subject: <InlineCode>carbon-mcp</InlineCode>,
  },
  render: Complete.render,
};

/**
 * Running code: no thinking animation, and the trace holds a CodeSnippet,
 * which brings its own card.
 */
export const RunningCode: Story = {
  args: {
    label: 'Running',
    duration: '2m 19s',
    thinking: false,
    subject: <InlineCode>page.py</InlineCode>,
  },
  render: (args) => (
    <ReasoningTrace {...args}>
      <CodeSnippet language="JavaScript" code={code} />
    </ReasoningTrace>
  ),
};

/**
 * A step that failed says so in words as well as with ErrorFilled.
 */
export const WithFailure: Story = {
  args: { label: 'Complete', duration: '41s', status: 'complete' },
  render: (args) => (
    <ReasoningTrace {...args}>
      <ReasoningStep label="Searched the web" />
      <ReasoningStep status="failed" label="Could not reach the issue tracker">
        The request timed out after 30s.
      </ReasoningStep>
      <ReasoningStep label="Read files" />
    </ReasoningTrace>
  ),
};

/**
 * Live: steps arrive while it thinks, then it resolves to Complete and the
 * animation leaves. The change is announced.
 *
 * @returns {React.ReactElement} A trace that plays itself.
 */
function LiveTrace() {
  const labels = [
    'Ran a command on your computer',
    'Deciding where the spec should live in the repo',
    'Read files',
    'Weighed latency trade-offs',
  ];
  const [count, setCount] = useState(1);
  const done = count > labels.length;
  useEffect(() => {
    if (done) {
      return undefined;
    }
    const timer = setTimeout(() => setCount((value) => value + 1), 1800);
    return () => clearTimeout(timer);
  }, [count, done]);
  return (
    <ReasoningTrace
      label={done ? 'Complete' : 'Thinking'}
      duration={`${count * 2}s`}
      status={done ? 'complete' : 'running'}
      defaultOpen
      onViewDetails={() => undefined}>
      {labels.slice(0, count).map((label, index) => (
        <ReasoningStep
          key={label}
          label={label}
          status={!done && index === count - 1 ? 'running' : 'done'}
        />
      ))}
    </ReasoningTrace>
  );
}

export const Live: Story = {
  render: () => <LiveTrace />,
};

/**
 * One agent turn, as the Figma preview composes it.
 */
export const Turn: Story = {
  render: () => (
    <div className="reasoning-trace-story__turn">
      <ReasoningTrace
        label="Thinking"
        duration="22s"
        status="running"
        defaultOpen
        onViewDetails={() => undefined}>
        <ReasoningStep label="Ran a command on your computer" />
        <ReasoningStep label="Deciding where the spec should live in the repo" />
        <ReasoningStep
          status="running"
          label="Running a command on your computer"
        />
      </ReasoningTrace>
      <ReasoningTrace
        label="Running"
        duration="2m 19s"
        status="running"
        thinking={false}
        subject={<InlineCode>page.py</InlineCode>}
        defaultOpen>
        <CodeSnippet language="JavaScript" code={code} />
      </ReasoningTrace>
      <ReasoningTrace
        label="Used tool"
        duration="2m 50s"
        subject={<InlineCode>carbon-mcp</InlineCode>}
        defaultOpen
        onViewDetails={() => undefined}>
        <ReasoningStep
          label="Deciding where the spec should live in the repo"
          defaultExpanded>
          This is a secondary expanded line to show more of the full reasoning
          trace.
        </ReasoningStep>
        <ReasoningStep label="Ran a command on your computer" />
        <ReasoningStep label="Read files" />
        <ReasoningStep label="Weighed latency trade-offs" />
      </ReasoningTrace>
      <p className="reasoning-trace-story__reply">
        I’ve mapped the activity states and saved them in{' '}
        <InlineCode>activity-model.md</InlineCode>
      </p>
      <ReasoningTrace label="Complete" duration="1m 48s" />
    </div>
  ),
};
