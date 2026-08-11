/**
 * Copyright IBM Corp. 2025
 *
 * ProcessingDots stories.
 */

import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProcessingDots } from '../components/ProcessingDots/ProcessingDots';
import type { ProcessingDotsHandle, ProcessingDotsMode } from '../components/ProcessingDots/ProcessingDots';

const meta = {
  title: 'Components/ProcessingDots',
  component: ProcessingDots,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Animated three-dot loading indicator. Faithfully reproduces the Carbon Labs
Processing component baseline, then extends it with two additional formation modes.

**Modes:**
- \`loading\` — three-dot loop (matches Carbon Labs exactly)
- \`triangle\` — dots arc clockwise into a rotating equilateral triangle
- \`square\` — dots arc into a rotating square (a 4th dot spawns at the SVG centre)
- \`out\` — plays the unload sequence immediately from whatever state

All animation is Web Animations API — the \`out\` animation is fully interruptible
at any point in the loop.
        `.trim(),
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['loading', 'triangle', 'square', 'out'],
      description: 'Animation state',
    },
    loop: {
      control: 'boolean',
      description: 'Whether the loading loop repeats (loading mode only)',
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
    },
  },
} satisfies Meta<typeof ProcessingDots>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Baseline — matches Carbon Labs ───────────────────────────────────────────

export const LoadingLoop: Story = {
  name: 'Loading — loop',
  args: { mode: 'loading', loop: true, label: 'Processing' },
};

export const LoadingNoLoop: Story = {
  name: 'Loading — no loop',
  args: { mode: 'loading', loop: false, label: 'Processing' },
};

// ── Formation modes ───────────────────────────────────────────────────────────

export const TriangleFormation: Story = {
  name: 'Triangle formation',
  args: { mode: 'triangle', label: 'Processing' },
};

export const SquareFormation: Story = {
  name: 'Square formation',
  args: { mode: 'square', label: 'Processing' },
};

// ── Interruptible out ─────────────────────────────────────────────────────────

function InterruptibleDemo() {
  const handle = useRef<ProcessingDotsHandle>(null);
  const [mode, setMode] = useState<ProcessingDotsMode>('loading');
  const [key, setKey] = useState(0);

  const restart = (m: ProcessingDotsMode) => {
    setMode(m);
    setKey(k => k + 1); // remount to restart animation
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <ProcessingDots key={key} ref={handle} mode={mode} loop label="Processing" />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {(['loading', 'triangle', 'square'] as ProcessingDotsMode[]).map(m => (
          <button
            key={m}
            onClick={() => restart(m)}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              border: '1px solid currentColor',
              background: mode === m ? 'currentColor' : 'transparent',
              color: 'var(--cds-text-primary, #161616)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {m}
          </button>
        ))}
        <button
          onClick={() => handle.current?.triggerOut()}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            border: '1px solid #da1e28',
            background: 'transparent',
            color: '#da1e28',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          trigger out ↓
        </button>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary, #525252)', margin: 0, maxWidth: '20rem', textAlign: 'center' }}>
        Switch modes to see the formation animations. Hit <strong>trigger out ↓</strong>
        at any point — mid-loop, mid-triangle, mid-square — to play the smooth unload.
      </p>
    </div>
  );
}

export const InterruptibleOut: Story = {
  name: 'Interruptible out — interactive',
  render: () => <InterruptibleDemo />,
};

// ── All modes side-by-side ────────────────────────────────────────────────────

export const AllModes: Story = {
  name: 'All modes — side by side',
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
      {(['loading', 'triangle', 'square'] as ProcessingDotsMode[]).map(m => (
        <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <ProcessingDots mode={m} loop label={m} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--cds-text-secondary, #525252)' }}>{m}</span>
        </div>
      ))}
    </div>
  ),
};
