/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Button } from '@carbon-labs/react-button';
import {
  FieldMessage,
  FieldStatusMark,
  MultiFieldInput,
  PasswordInput,
  TextInput,
  TextInputSkeleton,
} from '../index';
import type { FieldAiState, TextInputProps, TextInputSize } from '../index';
import mdx from './TextInput.mdx';

const SIZES: TextInputSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/TextInput',
  component: TextInput,
  subcomponents: {
    PasswordInput,
    MultiFieldInput,
    TextInputSkeleton,
    FieldMessage,
    FieldStatusMark,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'outline-ladder',
        'placeholder',
        'error-border',
        'message-line',
        'status-mark',
        'late-status',
        'loading',
        'ai-fill',
        'stillness',
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
  maxInlineSize: 320,
  paddingBlockEnd: 32,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One field: its label, the field and its helper text. */
export const Default = {
  args: {
    id: 'text-input-default',
    labelText: 'Project name',
    helperText: 'Letters, numbers and dashes',
    placeholder: 'my-project',
    frame: 'inset',
    variant: 'neutral',
    disabled: false,
    readOnly: false,
    invalid: false,
    invalidText: 'Use letters, numbers and dashes only',
    warn: false,
    warnText: 'This name is already in use',
    lateErrors: true,
    typingPauseMs: 1000,
    messagePlacement: 'gap',
    statusBeat: false,
  },
  render: (args: TextInputProps) => (
    <div style={form}>
      <TextInput {...args} />
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <TextInput
          key={size}
          id={`text-input-size-${size}`}
          labelText={`Size ${size}`}
          placeholder="Placeholder"
          size={size}
        />
      ))}
    </div>
  ),
};

/** Warning, error, disabled, read-only and the counter. */
export const States = {
  render: () => (
    <div style={form}>
      <TextInput
        id="text-input-warn"
        labelText="Warning"
        defaultValue="staging"
        warn
        warnText="Changes here reach every user"
        lateErrors={false}
      />
      <TextInput
        id="text-input-invalid"
        labelText="Error"
        defaultValue="my project"
        invalid
        invalidText="Use letters, numbers and dashes only"
        lateErrors={false}
      />
      <TextInput
        id="text-input-disabled"
        labelText="Disabled"
        defaultValue="my-project"
        helperText="Set by your administrator"
        disabled
      />
      <TextInput
        id="text-input-readonly"
        labelText="Read-only"
        defaultValue="my-project"
        readOnly
      />
      <TextInput
        id="text-input-counter"
        labelText="Description"
        defaultValue="A short note"
        enableCounter
        maxCount={40}
      />
    </div>
  ),
};

type Status = 'none' | 'warn' | 'error';

/** Change the status: the message line swaps out then in, the mark swaps, and an error's border settles in. */
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
          <TextInput
            id="text-input-status-change"
            labelText="Project name"
            defaultValue="my project"
            helperText="Letters, numbers and dashes"
            warn={status === 'warn'}
            warnText="This name is already in use"
            invalid={status === 'error'}
            invalidText="Use letters, numbers and dashes only"
            lateErrors={false}
          />
        </div>
      </div>
    );
  },
};

const NAME = /^[a-z0-9-]*$/i;

/** Type a space: the error waits for a pause in typing or for blur. Delete it: the error leaves on that keystroke. */
export const Validation = {
  render: function ValidationStory() {
    const [value, setValue] = useState('');
    const invalid = !NAME.test(value);
    return (
      <div style={form}>
        <TextInput
          id="text-input-validation"
          labelText="Project name"
          helperText="Letters, numbers and dashes"
          placeholder="my-project"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={invalid}
          invalidText="Use letters, numbers and dashes only"
          enableCounter
          maxCount={24}
        />
      </div>
    );
  },
};

/** PasswordInput: the toggle shows and hides the password; its icon's slash draws on the press. */
export const Password = {
  render: () => (
    <div style={form}>
      <PasswordInput
        id="text-input-password"
        labelText="Password"
        helperText="At least 12 characters"
        defaultValue="correct-horse"
      />
      <PasswordInput
        id="text-input-password-invalid"
        labelText="Confirm password"
        defaultValue="correct-hose"
        invalid
        invalidText="The passwords don't match"
        lateErrors={false}
      />
    </div>
  ),
};

/** MultiFieldInput: one field in segments, each with its own value and validation. */
export const MultiField = {
  render: function MultiFieldStory() {
    const [width, setWidth] = useState('1280');
    const [height, setHeight] = useState('720');
    const isNumber = (v: string) => /^\d+$/.test(v);
    return (
      <div style={form}>
        <MultiFieldInput
          id="text-input-multi"
          labelText="Size"
          helperText="In pixels"
          segments={[
            {
              label: 'W',
              value: width,
              onChange: setWidth,
              invalid: !isNumber(width),
              invalidText: 'Enter a whole number',
              inputProps: { inputMode: 'numeric' },
            },
            {
              label: 'H',
              value: height,
              onChange: setHeight,
              invalid: !isNumber(height),
              invalidText: 'Enter a whole number',
              inputProps: { inputMode: 'numeric' },
            },
          ]}
        />
      </div>
    );
  },
};

/** Loading: a bar where the value will be; the rest is drawn. Toggle it off: the bar dissolves in place as the value fades up. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <Checkbox
          id="textinput-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <div style={form}>
          <TextInput
            id="text-input-loading"
            labelText="Project name"
            helperText="Letters, numbers and dashes"
            defaultValue="quarterly-report"
            loading={loading}
          />
          <TextInputSkeleton skeletonValue="quarterly-report" />
        </div>
      </div>
    );
  },
};

/** The AI fill state: suggest a value, fill it, then undo the fill. A fill comes up; a revert plays back down. */
export const AiFill = {
  render: function AiFillStory() {
    const [value, setValue] = useState('north-team');
    const [aiState, setAiState] = useState<FieldAiState | undefined>();
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue('north-team');
              setAiState('suggested');
            }}>
            Suggest
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue('north-region-sales');
              setAiState('filled');
            }}>
            Fill
          </Button>
        </div>
        <div style={form}>
          <TextInput
            id="text-input-ai"
            labelText="Team name"
            helperText="Shown on every report"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (aiState === 'filled') {
                setAiState('edited');
              }
            }}
            aiState={aiState}
            aiSuggestion="north-region-sales"
            onRevert={() => {
              setValue('north-team');
              setAiState(undefined);
            }}
          />
        </div>
      </div>
    );
  },
};
