/**
 * Copyright IBM Corp. 2025
 *
 * MotionAvatar stories — DEX (Db2 Genius Hub) avatar.
 */

import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MotionAvatar, type DexHandle, type MotionAvatarSize } from '../components/MotionAvatar/MotionAvatar';

type AvatarMode = 'load' | 'idle' | 'thinking' | 'out';

const meta = {
  title: 'Components/MotionAvatar',
  component: MotionAvatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DEX — the Db2 Genius Hub avatar. Three gradient-stroked rings that animate through Load, Idle, Thinking, and Unload states via an imperative `DexHandle` ref.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'] satisfies MotionAvatarSize[],
      description: 'Visual size of the avatar',
    },
    // Custom story-level controls — not component props.
    // @ts-expect-error — intentional extra arg not on MotionAvatarProps
    mode: {
      control: 'select',
      options: ['load', 'idle', 'thinking', 'out'] satisfies AvatarMode[],
      description: 'Animation mode — fires the corresponding imperative method',
    },
    label: {
      control: 'text',
      description: 'Accessible label override',
    },
    // Hide props that aren't meaningful in the interactive demo.
    state:     { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof MotionAvatar>;

export default meta;

// Extend the story args with the custom `mode` field.
type Story = StoryObj<typeof meta> & { args?: { mode?: AvatarMode } };

// ── Button styles ─────────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  background: 'transparent',
  border: '1px solid var(--cds-text-primary, #f4f4f4)',
  color: 'var(--cds-text-primary, #f4f4f4)',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  border: '1px solid var(--cds-support-error, #da1e28)',
  color: 'var(--cds-support-error, #da1e28)',
};

// ── Interactive demo component ────────────────────────────────────────────────

interface DemoProps {
  size:  MotionAvatarSize;
  mode:  AvatarMode;
  label: string | undefined;
}

function DexInteractiveDemo({ size, mode: modeProp, label }: DemoProps) {
  const handle  = useRef<DexHandle>(null);
  const [key, setKey] = useState(0);

  // Fire the imperative method whenever the mode arg changes (including initial render).
  // The key-based remount resets the component, then the effect fires the new mode.
  useEffect(() => {
    switch (modeProp) {
      case 'load':     handle.current?.load();     break;
      case 'idle':     handle.current?.idle();     break;
      case 'thinking': handle.current?.thinking(); break;
      case 'out':      handle.current?.out();      break;
    }
  }, [modeProp, key]);

  const fire = (m: AvatarMode) => {
    switch (m) {
      case 'load':     handle.current?.load();     break;
      case 'idle':     handle.current?.idle();     break;
      case 'thinking': handle.current?.thinking(); break;
      case 'out':      handle.current?.out();      break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <MotionAvatar key={key} ref={handle} size={size} state="idle" label={label} />

      {/* Primary mode buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={btnBase}   onClick={() => fire('load')}>     Load ↓     </button>
        <button style={btnBase}   onClick={() => fire('idle')}>     Idle ◎     </button>
        <button style={btnBase}   onClick={() => fire('thinking')}> Thinking ≈ </button>
        <button style={btnDanger} onClick={() => fire('out')}>      Out ↑      </button>
      </div>

      {/* Remount */}
      <button
        style={{ ...btnBase, fontSize: '0.75rem', opacity: 0.6 }}
        onClick={() => setKey(k => k + 1)}
      >
        Remount ⟳
      </button>
    </div>
  );
}

// ── Story ─────────────────────────────────────────────────────────────────────

export const InteractiveControls: Story = {
  name: 'DEX - Interactive Controls',
  args: { size: 'lg', mode: 'load' } as never,
  parameters: {
    docs: {
      description: {
        story: [
          '**Load ↓** — three-ring entrance with gradient flare and 3D foreshortening.',
          '**Idle ◎** — rings orbit at different speeds (infinite loop).',
          '**Thinking ≈** — rings spin 360° with a y-axis squish and gradient arc.',
          '**Out ↑** — rings shrink to nothing, staggered small → medium → outer.',
          '**Remount ⟳** — tears down and re-mounts the component; Load auto-plays on mount.',
          'Use the **size** and **mode** controls in the panel below, or click the buttons.',
        ].join(' · '),
      },
    },
  },
  render: (args) => (
    <DexInteractiveDemo
      size={(args.size ?? 'lg') as MotionAvatarSize}
      mode={((args as never as { mode?: AvatarMode }).mode ?? 'load')}
      label={args.label}
    />
  ),
};
