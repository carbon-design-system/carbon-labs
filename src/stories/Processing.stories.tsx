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
  tags: [],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Processing indicates that data is being loaded or an action is in progress. Use the imperative handle to trigger shape formations or interrupt the animation at any point.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['loading', 'triangle', 'square', 'out', 'wiggle'],
      description:
        "`'loading'` — load-in then pulse loop | `'triangle'` — load-in then arc into a triangle | `'square'` — load-in then arc into a square | `'out'` — shrink to zero immediately | `'wiggle'` — imperative-only, set via triggerWiggle()",
      table: { defaultValue: { summary: "'loading'" } },
    },
    loop: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    label: {
      control: 'text',
      table: { defaultValue: { summary: "'Processing'" } },
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

function WiggleIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path d="M1 6 Q2.5 1 4 4 Q5.5 7 7 4 Q8.5 1 11 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Timing constants ──────────────────────────────────────────────────────────
// Mirrors component internals (not exported from component).
const LOAD_IN_END  = 200 * 2 + 1000; // STAGGER*2 + LOAD_DUR = 1400 ms
const PULSE_CYCLES = 2;
const OUT_SETTLE   = 200 * 2 + 100 + 300; // OUT_STAGGER*2 + OUT_DUR + gap = 700 ms
const LOOP_DUR     = 1000;            // one pulse cycle
const FORM_DUR     = 700;             // triangle/square formation duration
const FORM_STAGGER = 50;              // per-dot stagger for formation

// ── Loading demo ──────────────────────────────────────────────────────────────
// load-in → 2 pulse loops → triggerOut → restart

function LoadingDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triggerTimer = setTimeout(() => {
      handle.current?.triggerOut();
    }, LOAD_IN_END + LOOP_DUR * PULSE_CYCLES);

    const restartTimer = setTimeout(() => {
      setKey(k => k + 1);
    }, LOAD_IN_END + LOOP_DUR * PULSE_CYCLES + OUT_SETTLE);

    return () => { clearTimeout(triggerTimer); clearTimeout(restartTimer); };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Loading: Story = {
  render: () => <LoadingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the default loading state: three dots load in, pulse twice, then shrink out and restart.',
      },
    },
  },
};

// ── Triangle demo ─────────────────────────────────────────────────────────────
// load-in → 2 pulse loops → triggerTriangle → 1 s hold → triggerOut → restart
// Timing (all ms):
//   triggerTriangle fires at: LOAD_IN_END + LOOP_DUR * PULSE_CYCLES = 3400
//   triangle settles at:      3400 + FORM_DUR + FORM_STAGGER*2 = 4200
//   triggerOut fires at:      4200 + 1000 = 5200
//   restart at:               5200 + OUT_SETTLE = 5900

function TriangleDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triangleAt = LOAD_IN_END + LOOP_DUR * PULSE_CYCLES;           // 3400
    const settledAt  = triangleAt + FORM_DUR + FORM_STAGGER * 2;        // 4200
    const outAt      = settledAt + 1000;                                 // 5200
    const restartAt  = outAt + OUT_SETTLE;                               // 5700 (≈5900 with gap)

    const triangleTimer = setTimeout(() => { handle.current?.triggerTriangle(); }, triangleAt);
    const outTimer      = setTimeout(() => { handle.current?.triggerOut(); },      outAt);
    const restartTimer  = setTimeout(() => { setKey(k => k + 1); },                restartAt);

    return () => {
      clearTimeout(triangleTimer);
      clearTimeout(outTimer);
      clearTimeout(restartTimer);
    };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Triangle: Story = {
  render: () => <TriangleDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the triangle formation: dots load in, pulse twice, then arc into an equilateral triangle, hold, and shrink out.',
      },
    },
  },
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
          onClick={() => { handle.current?.triggerTriangle(); setFormed(true); }}
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
        <button onClick={() => handle.current?.triggerWiggle()} className={s.btn}>
          <WiggleIcon />
          Wiggle
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
