/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import './storybook.scss';
import mdx from './Processing.mdx';
import Processing from '../components/Processing';
import type { ProcessingHandle } from '../components/Processing';
import '../components/processing.scss';

const meta: Meta<typeof Processing> = {
  title: 'Components/Processing',
  component: Processing,
  parameters: {
    layout: 'centered',
    docs: {
      page: mdx,
      description: {
        component:
          'Processing indicates that data is being loaded or an action is in progress. Set the state with the `mode` prop, or drive it with the imperative handle.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['loading', 'triangle', 'square', 'out'],
      description:
        "The state to be in. Changes animate from the current state: `'loading'` — three dots pulsing in a line | `'triangle'` — arc into a spinning equilateral triangle | `'square'` — grow a fourth dot and arc into a square | `'out'` — shrink to nothing (a later mode loads in again). Triangle ↔ square passes through the loading line.",
      table: { defaultValue: { summary: "'loading'" } },
    },
    loop: {
      control: 'boolean',
      description:
        'Whether the loading loop repeats; `false` runs one cycle, then shrinks out. Changing it restarts the component.',
      table: { defaultValue: { summary: 'true' } },
    },
    label: {
      control: 'text',
      description:
        'Status text for screen readers, rendered as visually hidden text inside the `role="status"` live region; changes are announced.',
      table: { defaultValue: { summary: "'Processing'" } },
    },
    ai: {
      control: 'boolean',
      description:
        'Apply the AI color treatment to the dots: blue-80 on light themes (white, g10), blue-20 on dark themes (g90, g100). Override with `--clabs-processing-dot-color-ai`.',
      table: { defaultValue: { summary: 'false' } },
    },
    onTransitionEnd: {
      description:
        'Called with the mode once the state set by `mode` is reached.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Processing>;

// ── Shape icons ───────────────────────────────────────────────────────────────

function TriIcon() {
  return (
    <svg
      width="10"
      height="9"
      viewBox="0 0 10 9"
      fill="none"
      aria-hidden="true">
      <polygon
        points="5,1 9,8 1,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SqrIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="7.5"
        height="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      width="12"
      height="4"
      viewBox="0 0 12 4"
      fill="none"
      aria-hidden="true">
      <circle cx="2" cy="2" r="1.25" fill="currentColor" />
      <circle cx="6" cy="2" r="1.25" fill="currentColor" />
      <circle cx="10" cy="2" r="1.25" fill="currentColor" />
    </svg>
  );
}

function WiggleIcon() {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden="true">
      <path
        d="M1 6 Q2.5 1 4 4 Q5.5 7 7 4 Q8.5 1 11 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Timing ────────────────────────────────────────────────────────────────────
const LOAD_IN_END = 200 * 2 + 1000; // STAGGER*2 + LOAD_DUR = 1400 ms
const HOLD = 2000; // how long the demos hold each state

/**
 * Resolve after `ms` milliseconds.
 * @param {number} ms - delay
 * @returns {Promise<void>} resolves after the delay
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Remount-and-replay helper for the demo stories: runs `script` against the
 * handle, then remounts and runs it again until the story unmounts.
 * @param {Function} script - the demo sequence
 * @returns {object} `handle` ref and remount `key`
 */
function useDemoLoop(
  script: (h: ProcessingHandle, alive: () => boolean) => Promise<unknown>
) {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    let alive = true;
    const h = handle.current;
    if (h) {
      void script(h, () => alive).then(() => alive && setKey((k) => k + 1));
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { handle, key };
}

/**
 * Demo wrapper: renders Processing and replays `script` forever.
 * @param {object} props - props
 * @param {Function} props.script - the demo sequence
 * @returns {React.ReactElement} the demo
 */
function Demo({
  script,
}: {
  script: (h: ProcessingHandle, alive: () => boolean) => Promise<unknown>;
}) {
  const { handle, key } = useDemoLoop(script);
  return <Processing key={key} ref={handle} label="Processing" />;
}

export const Loading: Story = {
  render: () => (
    <Demo
      script={async (h, alive) => {
        await sleep(LOAD_IN_END + HOLD);
        if (alive()) {
          await h.triggerOut();
        }
        await sleep(400);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The default loading state: three dots load in and pulse, then shrink out and restart.',
      },
    },
  },
};

export const Triangle: Story = {
  render: () => (
    <Demo
      script={async (h, alive) => {
        await h.triggerTriangle(); // queued until load-in lands
        await sleep(HOLD);
        if (alive()) {
          await h.triggerLoading();
        }
        await sleep(HOLD / 2);
        if (alive()) {
          await h.triggerOut();
        }
        await sleep(400);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'After load-in, the dots arc into an equilateral triangle, hold, unwind back into the loading line, then shrink out.',
      },
    },
  },
};

export const Square: Story = {
  render: () => (
    <Demo
      script={async (h, alive) => {
        await h.triggerSquare();
        await sleep(HOLD);
        if (alive()) {
          await h.triggerLoading();
        }
        await sleep(HOLD / 2);
        if (alive()) {
          await h.triggerOut();
        }
        await sleep(400);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'After load-in, a fourth dot grows in and all four arc into a square, hold, unwind back into the loading line, then shrink out.',
      },
    },
  },
};

export const Wiggle: Story = {
  render: () => (
    <Demo
      script={async (h, alive) => {
        await h.triggerWiggle();
        await sleep(HOLD);
        if (alive()) {
          await h.triggerOut();
        }
        await sleep(400);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'After load-in, each dot bobs up and back with a left-to-right stagger, holds, then shrinks out. The wiggle is handle-only (`triggerWiggle()`).',
      },
    },
  },
};

export const ModeProp: Story = {
  name: 'Mode prop',
  args: { mode: 'loading', loop: true, label: 'Processing', ai: false },
  parameters: {
    docs: {
      description: {
        story:
          'Drive the component declaratively: change `mode` in the controls and it animates from its current state, just like the handle. `onTransitionEnd` fires when each state is reached (see the Actions panel).',
      },
    },
  },
};

// ── Processing — interactive controls ────────────────────────────────────────

/**
 * Buttons for every handle method.
 * @param {object} props - props
 * @param {boolean} props.ai - AI color treatment
 * @param {string} props.label - status text
 * @returns {React.ReactElement} the demo
 */
function InteractiveDemo({
  ai = false,
  label = 'Processing',
}: {
  ai?: boolean;
  label?: string;
}) {
  const handle = useRef<ProcessingHandle>(null);
  const [key, setKey] = useState(0);
  // The state last requested. Requests queue inside the component, so the
  // buttons only need to stop repeating the current one.
  const [activeMode, setActiveMode] = useState<
    'loading' | 'triangle' | 'square' | 'out'
  >('loading');

  /**
   * Request a state through the handle.
   * @param {string} next - state to go to
   */
  const go = (next: 'loading' | 'triangle' | 'square' | 'out') => {
    const h = handle.current;
    if (!h) {
      return;
    }
    setActiveMode(next);
    void {
      loading: h.triggerLoading,
      triangle: h.triggerTriangle,
      square: h.triggerSquare,
      out: h.triggerOut,
    }[next]();
  };

  /** Remount the component. */
  const restart = () => {
    setKey((k) => k + 1);
    setActiveMode('loading');
  };

  return (
    <div className="processing-story__layout">
      <Processing key={key} ref={handle} label={label} ai={ai} />
      <div className="processing-story__controls">
        <button
          type="button"
          className="processing-story__btn"
          disabled={activeMode === 'triangle'}
          onClick={() => go('triangle')}>
          <TriIcon /> Triangle
        </button>
        <button
          type="button"
          className="processing-story__btn"
          disabled={activeMode === 'square'}
          onClick={() => go('square')}>
          <SqrIcon /> Square
        </button>
        <button
          type="button"
          className="processing-story__btn"
          disabled={activeMode !== 'loading'}
          onClick={() => void handle.current?.triggerWiggle()}>
          <WiggleIcon /> Wiggle
        </button>
        <button
          type="button"
          className="processing-story__btn"
          disabled={activeMode === 'loading'}
          onClick={() => go('loading')}>
          <LoadingIcon /> Loading
        </button>
        <button
          type="button"
          className="processing-story__btn processing-story__btn--danger"
          disabled={activeMode === 'out'}
          onClick={() => go('out')}>
          Out
        </button>
        <button
          type="button"
          className="processing-story__btn processing-story__btn--restart"
          onClick={restart}>
          Restart ⟳
        </button>
      </div>
      <p className="processing-story__helper">
        Requested state: <strong>{activeMode}</strong>. Requests made during a
        transition queue and run when it lands; triangle ↔ square passes through
        the loading line.
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
          'Every handle method, one button each. Processing stays in the loading loop until a new state is requested.',
      },
    },
  },
  render: (args) => <InteractiveDemo ai={args.ai} label={args.label} />,
};
