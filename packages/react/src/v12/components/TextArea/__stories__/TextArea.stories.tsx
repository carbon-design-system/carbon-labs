/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { TextArea, TextAreaSkeleton } from '../index';
import type { TextAreaProps, TextAreaSize } from '../index';
import mdx from './TextArea.mdx';

const SIZES: TextAreaSize[] = ['xs', 'sm', 'md', 'lg'];

type AiState = NonNullable<TextAreaProps['aiState']>;

export default {
  title: 'V12/TextArea',
  component: TextArea,
  subcomponents: { TextAreaSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'outline-ladder',
        'error-border',
        'message-line',
        'status-mark',
        'late-status',
        'scroller',
        'ai-fill',
      ],
      reduced: {
        'outline-ladder': 'shorter-clock',
        'error-border': 'shorter-clock',
        'message-line': 'at-once',
        'status-mark': 'at-once',
        'late-status': 'full',
        'ai-fill': 'at-once',
      },
      states: ['rest', 'invalid', 'warn', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    frame: { control: 'inline-radio', options: ['inset', 'ghost'] },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
    messagePlacement: { control: 'inline-radio', options: ['gap', 'flow'] },
    counterMode: { control: 'inline-radio', options: ['character', 'word'] },
    aiState: {
      control: 'select',
      options: ['suggested', 'filled', 'edited'],
    },
    labelText: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    decorator: { control: false },
    slug: { control: false },
    aiText: { control: false },
  },
};

/** A column of fields, 32px apart: the gap the message line sits in. */
const form = {
  display: 'grid',
  gap: 32,
  maxInlineSize: 400,
  paddingBlockEnd: 32,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const NOTES =
  'The build runs on every change to the main branch. It installs the dependencies, runs the linter and the tests, and then builds each package.\n\nA failed step stops the build. The log for each step is kept for thirty days.\n\nTo run the same steps locally, install the dependencies, then run the build script from the root of the project.';

/** One text area: its label, the field, its helper text and the resize marker. Drag the marker to make it taller. */
export const Default = {
  args: {
    id: 'text-area-default',
    labelText: 'Description',
    helperText: 'A few sentences about the project',
    placeholder: 'What is it for?',
    rows: 4,
    frame: 'inset',
    variant: 'neutral',
    disabled: false,
    readOnly: false,
    invalid: false,
    invalidText: 'Write at least 10 characters',
    warn: false,
    warnText: 'Other people can see this',
    enableCounter: false,
    maxCount: 200,
    counterMode: 'character',
    lateErrors: true,
    typingPauseMs: 1000,
    messagePlacement: 'gap',
    statusBeat: false,
  },
  render: (args: TextAreaProps) => (
    <div style={form}>
      <TextArea {...args} />
    </div>
  ),
};

/** The four sizes, two rows each. One row is the size's field height: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <TextArea
          key={size}
          id={`text-area-size-${size}`}
          labelText={`Size ${size}`}
          placeholder="Placeholder"
          size={size}
          rows={2}
        />
      ))}
    </div>
  ),
};

/** Warning, error, disabled, read-only and the counter. Disabled and read-only fields don't resize. */
export const States = {
  render: () => (
    <div style={form}>
      <TextArea
        id="text-area-warn"
        labelText="Warning"
        defaultValue="Shared with the whole team"
        warn
        warnText="Other people can see this"
        lateErrors={false}
        rows={2}
      />
      <TextArea
        id="text-area-invalid"
        labelText="Error"
        defaultValue="Too short"
        invalid
        invalidText="Write at least 10 characters"
        lateErrors={false}
        rows={2}
      />
      <TextArea
        id="text-area-disabled"
        labelText="Disabled"
        defaultValue="Set by your administrator"
        helperText="You can't change this"
        disabled
        rows={2}
      />
      <TextArea
        id="text-area-readonly"
        labelText="Read-only"
        defaultValue="Created with the project"
        readOnly
        rows={2}
      />
      <TextArea
        id="text-area-counter"
        labelText="Summary"
        defaultValue="A short note"
        enableCounter
        maxCount={100}
        rows={2}
      />
    </div>
  ),
};

/** The counter in each mode. Characters: `maxCount` is the limit on length. Words: at the limit a space or Enter does nothing, and a paste keeps the words up to it. */
export const Counter = {
  render: () => (
    <div style={form}>
      <TextArea
        id="text-area-count-characters"
        labelText="Summary"
        helperText="Up to 80 characters"
        enableCounter
        maxCount={80}
        rows={2}
      />
      <TextArea
        id="text-area-count-words"
        labelText="Abstract"
        helperText="Up to 12 words"
        enableCounter
        counterMode="word"
        maxCount={12}
        rows={2}
      />
    </div>
  ),
};

type Status = 'none' | 'warn' | 'error';

/** Change the status: the message line swaps out then in, the mark at the top of the trailing edge swaps, and an error's border settles in. */
export const StatusChange = {
  render: function StatusChangeStory() {
    const [status, setStatus] = useState<Status>('none');
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('none')}>
            Helper
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('warn')}>
            Warning
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('error')}>
            Error
          </Button>
        </div>
        <div style={form}>
          <TextArea
            id="text-area-status-change"
            labelText="Description"
            defaultValue="Too short"
            helperText="A few sentences about the project"
            warn={status === 'warn'}
            warnText="Other people can see this"
            invalid={status === 'error'}
            invalidText="Write at least 10 characters"
            lateErrors={false}
            rows={3}
          />
        </div>
      </div>
    );
  },
};

/** Type fewer than 10 characters: the error waits for a pause in typing or for blur. Type more: it leaves on that keystroke. */
export const Validation = {
  render: function ValidationStory() {
    const [value, setValue] = useState('');
    const invalid = value.length > 0 && value.trim().length < 10;
    return (
      <div style={form}>
        <TextArea
          id="text-area-validation"
          labelText="Description"
          helperText="At least 10 characters"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={invalid}
          invalidText="Write at least 10 characters"
          enableCounter
          maxCount={200}
          rows={3}
        />
      </div>
    );
  },
};

/** Text past its rows: the kit's pill in place of the native bar, and a soft edge the text leaves into. Scroll it, or point near its end. */
export const Scrolling = {
  render: () => (
    <div style={form}>
      <TextArea
        id="text-area-scrolling"
        labelText="Build notes"
        defaultValue={NOTES}
        rows={3}
      />
    </div>
  ),
};

const SUGGESTION =
  'A dashboard for the support team that shows open tickets by region.';

/** The AI fill state: suggest a value, fill it, then undo the fill. A fill comes up; a revert plays back down. */
export const AiFill = {
  render: function AiFillStory() {
    const [value, setValue] = useState('A dashboard for support.');
    const [aiState, setAiState] = useState<AiState | undefined>();
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue('A dashboard for support.');
              setAiState('suggested');
            }}>
            Suggest
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(SUGGESTION);
              setAiState('filled');
            }}>
            Fill
          </Button>
        </div>
        <div style={form}>
          <TextArea
            id="text-area-ai"
            labelText="Description"
            helperText="Shown on the project page"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (aiState === 'filled') {
                setAiState('edited');
              }
            }}
            aiState={aiState}
            aiSuggestion={SUGGESTION}
            onRevert={() => {
              setValue('A dashboard for support.');
              setAiState(undefined);
            }}
            rows={3}
          />
        </div>
      </div>
    );
  },
};

/** TextAreaSkeleton: the label, helper text and frame are drawn; the text is bars on the field's own lines. */
export const Skeleton = {
  render: () => (
    <div style={form}>
      <TextAreaSkeleton
        labelText="Description"
        helperText="A few sentences about the project"
      />
      <TextAreaSkeleton
        labelText="Notes"
        rows={2}
        skeletonLines={1}
        size="sm"
      />
    </div>
  ),
};
