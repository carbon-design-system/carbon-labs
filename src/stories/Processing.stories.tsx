/**
 * Copyright IBM Corp. 2025
 *
 * Processing stories.
 */

import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Processing } from '../components/Processing/Processing';
import type { ProcessingHandle } from '../components/Processing/Processing';
import s from './Processing.stories.module.css';

const meta = {
  title: 'Components/Processing',
  component: Processing,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Animated dot loading indicator with shape-formation transforms.

**Modes:**
- \`loading\` — three-dot load-in then infinite loop
- \`triangle\` — load-in then staggered arcs into an equilateral triangle
- \`out\` — immediate shrink-to-zero from resting size

**Imperative handle:**
- \`triggerFormation()\` — moves three dots into a triangle immediately
- \`triggerSquare()\` — grows a fourth dot and moves all four into a square
- \`triggerOut()\` — interrupt and shrink from wherever the dots are
        `.trim(),
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['loading', 'triangle', 'out'],
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

// ── Shape icons ───────────────────────────────────────────────────────────────

function TriIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" aria-hidden="true">
      <polygon points="5,1 9,8 1,8" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function SqrIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="7.5" height="7.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

// ── Processing — auto-play ────────────────────────────────────────────────────
// Plays load-in → 2 pulse loops → out, then repeats indefinitely.
// Timing (all ms):
//   load-in ends (last dot):  STAGGER*2 + LOAD_DUR = 400 + 1000 = 1400
//   2 loop cycles (last dot): LOOP_DUR * 2 = 2000
//   triggerOut fires at:      1400 + 2000 = 3400
//   out finishes (last dot):  OUT_STAGGER*2 + OUT_DUR = 100 + 100 = 200
//   gap before restart:       300
const LOAD_IN_END  = 200 * 2 + 1000; // STAGGER*2 + LOAD_DUR
const PULSE_CYCLES = 2;
const OUT_SETTLE   = 200 * 2 + 100 + 300; // OUT_STAGGER*2 + OUT_DUR + gap

function AutoPlayDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triggerTimer = setTimeout(() => {
      handle.current?.triggerOut();
    }, LOAD_IN_END + 1000 * PULSE_CYCLES);

    const restartTimer = setTimeout(() => {
      setKey(k => k + 1);
    }, LOAD_IN_END + 1000 * PULSE_CYCLES + OUT_SETTLE);

    return () => { clearTimeout(triggerTimer); clearTimeout(restartTimer); };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Default: Story = {
  name: 'Processing',
  render: () => <AutoPlayDemo />,
};

// ── Processing — interactive controls ────────────────────────────────────────

function InteractiveDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);
  const [formed, setFormed] = useState(false);

  const restart = () => { setKey(k => k + 1); setFormed(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Processing key={key} ref={handle} mode="loading" loop label="Processing" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button
          disabled={formed}
          onClick={() => { handle.current?.triggerFormation(); setFormed(true); }}
          className={s.btn}
        >
          <TriIcon />
          Triangle
        </button>
        <button
          disabled={formed}
          onClick={() => { handle.current?.triggerSquare(); setFormed(true); }}
          className={s.btn}
        >
          <SqrIcon />
          Square
        </button>
        <button onClick={() => handle.current?.triggerOut()} className={`${s.btn} ${s.btnDanger}`}>
          Out ↓
        </button>
        <button onClick={restart} className={s.btn}>
          Restart ↺
        </button>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  name: 'Interactive controls',
  render: () => <InteractiveDemo />,
};
