/**
 * Copyright IBM Corp. 2025
 *
 * Processing stories.
 */

import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Processing } from '../components/Processing/Processing';
import type { ProcessingHandle, ProcessingMode } from '../components/Processing/Processing';

const meta = {
  title: 'Components/Processing',
  component: Processing,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Animated three-dot loading indicator. Visually identical to the
[Carbon Labs Processing component](https://labs.carbondesignsystem.com/?path=/docs/react_components-processing--overview).

**Modes:**
- \`loading\` — three-dot load-in then loop (default)
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
} satisfies Meta<typeof Processing>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Loading stories with trigger-out button ───────────────────────────────────

const triggerBtnStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  padding: '0.375rem 0.875rem',
  fontSize: '0.75rem',
  border: '1px solid #da1e28',
  background: 'transparent',
  color: '#da1e28',
  cursor: 'pointer',
  fontFamily: 'inherit',
  borderRadius: '2px',
};

function LoadingDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Processing key={key} ref={handle} mode="loading" loop label="Processing" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => handle.current?.triggerOut()}
          style={triggerBtnStyle}
        >
          Trigger out ↓
        </button>
        <button
          onClick={() => setKey(k => k + 1)}
          style={{ ...triggerBtnStyle, border: '1px solid currentColor', color: 'var(--cds-text-primary, #161616)' }}
        >
          Restart ↺
        </button>
      </div>
    </div>
  );
}

export const LoadingLoop: Story = {
  name: 'Loading',
  render: () => <LoadingDemo />,
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

// ── All modes interactive ─────────────────────────────────────────────────────

function AllModesDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [mode, setMode] = useState<ProcessingMode>('loading');
  const [key, setKey] = useState(0);

  const restart = (m: ProcessingMode) => {
    setMode(m);
    setKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <Processing key={key} ref={handle} mode={mode} loop label="Processing" />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {(['loading', 'triangle', 'square'] as ProcessingMode[]).map(m => (
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
              borderRadius: '2px',
            }}
          >
            {m}
          </button>
        ))}
        <button
          onClick={() => handle.current?.triggerOut()}
          style={triggerBtnStyle}
        >
          Trigger out ↓
        </button>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary, #525252)', margin: 0, maxWidth: '22rem', textAlign: 'center' }}>
        Switch modes at any time, then hit <strong>Trigger out ↓</strong> to interrupt
        mid-animation and play the smooth unload from wherever the dots currently are.
      </p>
    </div>
  );
}

export const AllModes: Story = {
  name: 'All modes — interactive',
  render: () => <AllModesDemo />,
};
