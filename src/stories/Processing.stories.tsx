/**
 * Copyright IBM Corp. 2025
 *
 * Processing stories.
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@carbon/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Processing } from '../components/Processing/Processing';
import type { ProcessingHandle } from '../components/Processing/Processing';
import s from './Processing.stories.module.css';

const meta = {
  title: 'Components/Processing',
  component: Processing,
  tags: ['!autodocs'],
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
        "`'loading'` — three dots load in then pulse in a loop | `'triangle'` — load in then arc into an equilateral triangle | `'square'` — load in then grow a fourth dot and arc into a square | `'out'` — shrink all dots to zero immediately | `'wiggle'` — bob each dot up and back (trigger via `handle.triggerWiggle()`)",
      table: { defaultValue: { summary: "'loading'" } },
    },
    loop: {
      control: 'boolean',
      description:
        'Legacy compatibility prop. In the proposed v2.0 model, Processing remains in the loading loop until another mode is triggered. Only applies in `loading` mode.',
      table: { defaultValue: { summary: 'true' } },
    },
    label: {
      control: 'text',
      description: 'Accessible label announced by screen readers via `aria-label` on the status region.',
      table: { defaultValue: { summary: "'Processing'" } },
    },
    ai: {
      control: 'boolean',
      description: 'Apply AI colour treatment to the dots: blue-80 on light themes (white, g10), blue-20 on dark themes (g90, g100).',
      table: { defaultValue: { summary: 'false' } },
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

// ── Formation demos ───────────────────────────────────────────────────────────
// Shared timing: load-in → 2 pulse loops → trigger → 2 s hold → triggerOut → restart
const FORMATION_TRIGGER_AT = LOAD_IN_END + LOOP_DUR * PULSE_CYCLES; // 3400 ms
const HOLD                 = 2000;                                    // 2 s hold

// ── Triangle demo ─────────────────────────────────────────────────────────────
// settle = FORM_DUR + FORM_STAGGER*2 = 800 ms after trigger

function TriangleDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triggerAt = FORMATION_TRIGGER_AT;                              // 3400
    const settledAt = triggerAt + FORM_DUR + FORM_STAGGER * 2;          // 4200
    const outAt     = settledAt + HOLD;                                  // 6200
    const restartAt = outAt + OUT_SETTLE;                                // 6900

    const triggerTimer = setTimeout(() => { handle.current?.triggerTriangle(); }, triggerAt);
    const outTimer     = setTimeout(() => { handle.current?.triggerOut(); },      outAt);
    const restartTimer = setTimeout(() => { setKey(k => k + 1); },                restartAt);

    return () => { clearTimeout(triggerTimer); clearTimeout(outTimer); clearTimeout(restartTimer); };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Triangle: Story = {
  render: () => <TriangleDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the triangle formation: dots load in, pulse twice, then arc into an equilateral triangle, hold for 2 s, and shrink out.',
      },
    },
  },
};

// ── Square demo ───────────────────────────────────────────────────────────────
// settle = FORM_DUR + FORM_STAGGER*3 = 850 ms after trigger (4 dots)

function SquareDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triggerAt = FORMATION_TRIGGER_AT;                              // 3400
    const settledAt = triggerAt + FORM_DUR + FORM_STAGGER * 3;          // 4250
    const outAt     = settledAt + HOLD;                                  // 6250
    const restartAt = outAt + OUT_SETTLE;                                // 6950

    const triggerTimer = setTimeout(() => { handle.current?.triggerSquare(); }, triggerAt);
    const outTimer     = setTimeout(() => { handle.current?.triggerOut(); },     outAt);
    const restartTimer = setTimeout(() => { setKey(k => k + 1); },               restartAt);

    return () => { clearTimeout(triggerTimer); clearTimeout(outTimer); clearTimeout(restartTimer); };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Square: Story = {
  render: () => <SquareDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the square formation: dots load in, pulse twice, then a fourth dot grows in and all four arc into a square, hold for 2 s, and shrink out.',
      },
    },
  },
};

// ── Wiggle demo ───────────────────────────────────────────────────────────────
// wiggle completes = 400 ms per dot + FORM_STAGGER*4*2 = 800 ms total
// hold 2 s after wiggle completes

function WiggleDemo() {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const triggerAt  = FORMATION_TRIGGER_AT;                             // 3400
    const wiggleDone = triggerAt + 400 + FORM_STAGGER * 4 * 2;          // 4200
    const outAt      = wiggleDone + HOLD;                                // 6200
    const restartAt  = outAt + OUT_SETTLE;                               // 6900

    const triggerTimer = setTimeout(() => { handle.current?.triggerWiggle(); }, triggerAt);
    const outTimer     = setTimeout(() => { handle.current?.triggerOut(); },     outAt);
    const restartTimer = setTimeout(() => { setKey(k => k + 1); },               restartAt);

    return () => { clearTimeout(triggerTimer); clearTimeout(outTimer); clearTimeout(restartTimer); };
  }, [key]);

  return <Processing key={key} ref={handle} mode="loading" loop label="Processing" />;
}

export const Wiggle: Story = {
  render: () => <WiggleDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the wiggle: dots load in, pulse twice, then each dot bobs up and back with a left-to-right stagger, hold for 2 s, and shrink out.',
      },
    },
  },
};

// ── Processing — interactive controls ────────────────────────────────────────

function InteractiveDemo({
  ai = false,
  label = 'Processing',
}: {
  ai?: boolean;
  label?: string;
}) {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);
  const [activeMode, setActiveMode] = useState<'loading' | 'triangle' | 'square' | 'wiggle' | 'out'>('loading');

  const runTriangle = () => {
    handle.current?.triggerTriangle();
    setActiveMode('triangle');
  };

  const runSquare = () => {
    handle.current?.triggerSquare();
    setActiveMode('square');
  };

  const runWiggle = () => {
    handle.current?.triggerWiggle();
    setActiveMode('wiggle');
  };

  const runOut = () => {
    handle.current?.triggerOut();
    setActiveMode('out');
  };

  const restart = () => {
    setKey(k => k + 1);
    setActiveMode('loading');
  };

  return (
    <div className={s.interactiveDemo}>
      <Processing key={key} ref={handle} mode="loading" loop label={label} ai={ai} />
      <div className={s.controlsRow}>
        <Button kind="ghost" size="sm" onClick={runTriangle} renderIcon={TriIcon}>
          Triangle
        </Button>
        <Button kind="ghost" size="sm" onClick={runSquare} renderIcon={SqrIcon}>
          Square
        </Button>
        <Button kind="ghost" size="sm" onClick={runWiggle} renderIcon={WiggleIcon}>
          Wiggle
        </Button>
        <Button kind="danger--ghost" size="sm" onClick={runOut}>
          Out
        </Button>
        <Button kind="secondary" size="sm" onClick={restart}>
          Restart
        </Button>
      </div>
      <p className={s.helperText}>
        Active mode: <strong>{activeMode}</strong>. Use the buttons to preview proposed v2.0 interaction modes without changing the default loading behavior.
      </p>
    </div>
  );
}

export const Interactive: Story = {
  name: 'Interactive controls v2.0 proposal',
  args: {
    ai: false,
    label: 'Processing',
  },
  argTypes: {
    loop: {
      table: {
        disable: true,
      },
      control: false,
    },
    mode: {
      table: {
        disable: true,
      },
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Proposed v2.0 review surface for Labs: Processing stays in the default loading loop until a new mode is triggered, removing the need for separate loop and no-loop story variants.',
      },
    },
  },
  render: (args) => <InteractiveDemo ai={args.ai} label={args.label} />,
};
