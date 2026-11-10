/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import type { FieldAiState } from '@carbon-labs/react-text-input';
import { NumberInput, NumberInputSkeleton } from '../index';
import type { NumberInputProps, NumberInputSize } from '../index';
import mdx from './NumberInput.mdx';

const SIZES: NumberInputSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/NumberInput',
  component: NumberInput,
  subcomponents: { NumberInputSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'roll',
        'outline-ladder',
        'error-border',
        'message-line',
        'status-mark',
        'late-status',
        'rollover',
        'tooltip',
        'ai-fill',
      ],
      reduced: {
        roll: 'at-once',
        'outline-ladder': 'shorter-clock',
        'error-border': 'shorter-clock',
        'message-line': 'at-once',
        'status-mark': 'at-once',
        'late-status': 'full',
        rollover: 'at-once',
        tooltip: 'at-once',
        'ai-fill': 'at-once',
      },
      states: ['rest', 'invalid', 'warn', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    type: { control: 'inline-radio', options: ['number', 'text'] },
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
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    label: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    decorator: { control: false },
    slug: { control: false },
    aiText: { control: false },
    formatOptions: { control: false },
    translateWithId: { control: false },
    validate: { control: false },
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

/** One field: press − or +, or ↑ and ↓ in the field, and the number rolls to its next value. */
export const Default = {
  args: {
    id: 'number-input-default',
    label: 'Quantity',
    helperText: 'From 0 to 100',
    defaultValue: 12,
    min: 0,
    max: 100,
    step: 1,
    frame: 'inset',
    variant: 'neutral',
    disabled: false,
    readOnly: false,
    hideSteppers: false,
    invalidText: 'Enter a number from 0 to 100',
    warn: false,
    warnText: 'Stock is low',
    lateErrors: true,
    typingPauseMs: 1000,
    messagePlacement: 'gap',
    statusBeat: false,
    timeScale: 1,
  },
  render: (args: NumberInputProps) => (
    <div style={form}>
      <NumberInput {...args} />
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <NumberInput
          key={size}
          id={`number-input-size-${size}`}
          label={`Size ${size}`}
          defaultValue={4}
          size={size}
        />
      ))}
    </div>
  ),
};

/** Warning, error, disabled, read-only and no steppers. */
export const States = {
  render: () => (
    <div style={form}>
      <NumberInput
        id="number-input-warn"
        label="Warning"
        defaultValue={2}
        warn
        warnText="Stock is low"
        lateErrors={false}
      />
      <NumberInput
        id="number-input-invalid"
        label="Error"
        defaultValue={120}
        min={0}
        max={100}
        invalidText="Enter a number from 0 to 100"
        lateErrors={false}
      />
      <NumberInput
        id="number-input-disabled"
        label="Disabled"
        defaultValue={12}
        helperText="Set by your administrator"
        disabled
      />
      <NumberInput
        id="number-input-readonly"
        label="Read-only"
        defaultValue={12}
        readOnly
      />
      <NumberInput
        id="number-input-nosteppers"
        label="No steppers"
        defaultValue={12}
        hideSteppers
      />
    </div>
  ),
};

/** Step the number from outside: each button sets the value, and the field rolls to it. Typing never rolls. */
export const Stepping = {
  render: function SteppingStory() {
    const [value, setValue] = useState<number | string>(8);
    const n = Number(value) || 0;
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setValue(n - 10)}>
            −10
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setValue(n + 10)}>
            +10
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setValue(0)}>
            Reset
          </Button>
        </div>
        <div style={form}>
          <NumberInput
            id="number-input-stepping"
            label="Replicas"
            helperText="Step with − and +, ↑ and ↓, or the buttons above"
            value={value}
            onChange={(_, { value: next }) => setValue(next)}
          />
        </div>
      </div>
    );
  },
};

/** A range: type 150 and the error waits for a pause in typing or for blur. Fix it and the error leaves on that keystroke. A step stops at the bound. */
export const Range = {
  render: () => (
    <div style={form}>
      <NumberInput
        id="number-input-range"
        label="Discount (%)"
        helperText="From 0 to 100, in steps of 5"
        defaultValue={95}
        min={0}
        max={100}
        step={5}
        invalidText="Enter a number from 0 to 100"
      />
      <NumberInput
        id="number-input-decimal"
        label="Weight (kg)"
        helperText="In steps of 0.25"
        defaultValue={1.5}
        min={0}
        step={0.25}
      />
    </div>
  ),
};

/** `type="text"`: the number is parsed with the locale's separators and formatted on blur. */
export const Locale = {
  render: () => (
    <div style={form}>
      <NumberInput
        id="number-input-locale-us"
        type="text"
        label="Price (en-US)"
        locale="en-US"
        formatOptions={{ style: 'currency', currency: 'USD' }}
        defaultValue={1249.5}
        step={10}
      />
      <NumberInput
        id="number-input-locale-de"
        type="text"
        label="Price (de-DE)"
        locale="de-DE"
        formatOptions={{ style: 'currency', currency: 'EUR' }}
        defaultValue={1249.5}
        step={10}
      />
    </div>
  ),
};

/** Frames and variants: `inset` or `ghost`, `neutral` or `hero`, in each corner style. */
export const Frames = {
  render: () => (
    <div style={form}>
      <NumberInput
        id="number-input-ghost"
        label="Ghost"
        defaultValue={3}
        frame="ghost"
      />
      <NumberInput
        id="number-input-hero"
        label="Hero"
        defaultValue={3}
        variant="hero"
      />
      <NumberInput
        id="number-input-full"
        label="Full corners"
        defaultValue={3}
        corners="full"
      />
      <NumberInput
        id="number-input-square"
        label="Square corners"
        defaultValue={3}
        corners="square"
      />
    </div>
  ),
};

/** The AI fill state: suggest a value, fill it, then undo the fill. A fill and a revert swap the value; they never roll. */
export const AiFill = {
  render: function AiFillStory() {
    const [value, setValue] = useState<number | string>(4);
    const [aiState, setAiState] = useState<FieldAiState | undefined>();
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(4);
              setAiState('suggested');
            }}>
            Suggest
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(12);
              setAiState('filled');
            }}>
            Fill
          </Button>
        </div>
        <div style={form}>
          <NumberInput
            id="number-input-ai"
            label="Seats"
            helperText="One per member"
            value={value}
            onChange={(_, { value: next }) => {
              setValue(next);
              if (aiState === 'filled') {
                setAiState('edited');
              }
            }}
            aiState={aiState}
            aiSuggestion="12"
            onRevert={() => {
              setValue(4);
              setAiState(undefined);
            }}
          />
        </div>
      </div>
    );
  },
};

/** NumberInputSkeleton: a bar at the expected number's width; the label, frame and steppers are drawn. */
export const Skeleton = {
  render: () => (
    <div style={form}>
      <NumberInputSkeleton label="Quantity" helperText="From 0 to 100" />
      <NumberInputSkeleton label="Price" skeletonValue="$1,249.50" />
    </div>
  ),
};
