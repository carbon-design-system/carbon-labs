/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import type { CSSProperties, ReactNode } from 'react';
// The parts' own style sheets, which the other folders' built entries leave out.
import '@carbon-labs/react-button/scss/button.scss';
import '@carbon-labs/react-button/scss/button-shell.scss';
import '@carbon-labs/react-disclosure/scss/disclosure.scss';
import '@carbon-labs/react-feedback/scss/feedback.scss';
import '@carbon-labs/react-feedback/scss/spinner.scss';
import '@carbon-labs/react-processing-v2/scss/processing.scss';
import '@carbon-labs/react-shimmer-text/scss/shimmer-text.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import { motionTokens } from '@carbon-labs/v12-motion';
import {
  ChatMessage,
  StepList,
  TurnStatus,
  countSteps,
  useTurnRelease,
} from '../index';
import type { Step, TurnStatusProps, TurnStatusValue } from '../index';
import mdx from './TurnStatus.mdx';

export default {
  title: 'V12/TurnStatus',
  component: TurnStatus,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'arrival',
        'stage-words',
        'seconds',
        'mark',
        'summary',
        'error',
        'details',
        'one-working-element',
      ],
      reduced: {
        'stage-words': 'shorter-clock',
        mark: 'at-once',
        summary: 'shorter-clock',
        details: 'at-once',
      },
      // TODO reduced: arrival. The doc names the row's plain words, not how the row comes in.
      // TODO reduced: seconds. Their glide has no travel under reduced motion; the doc does not say whether it lands at once.
      // TODO reduced: error. The mark's hand-off to the error mark; the doc does not say.
      // TODO reduced: one-working-element. The mark shrinks out in its slot; the doc does not say.
      states: [
        'thinking',
        'acting',
        'waiting',
        'streaming',
        'done',
        'stopped',
        'error',
      ],
    },
  },
  argTypes: {
    status: { control: false },
    startedAt: { control: false },
    endedAt: { control: false },
    onRetry: { control: false },
    onCollapse: { control: false },
    formatSummary: { control: false },
    children: { control: false },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

/* ── sample content ───────────────────────────────────────────────────── */

/** The stages of the work, scripted: each one's state and words. */
const STATES: {
  status: TurnStatusValue;
  label?: string;
  ended?: number;
  error?: string;
}[] = [
  { status: 'thinking', label: 'Thinking…' },
  { status: 'acting', label: 'Searching the deployments' },
  { status: 'waiting', label: 'Waiting for your approval' },
  { status: 'done', ended: 6200 },
  { status: 'stopped', ended: 6200 },
  { status: 'error', ended: 6200, error: 'Couldn’t reach the deployments.' },
];

/** The fake machine's time on each stage before its first words, ms. Not motion: the machine's own time. */
const SCRIPT: { status: TurnStatusValue; label: string; ms: number }[] = [
  { status: 'thinking', label: 'Thinking…', ms: 1600 },
  { status: 'acting', label: 'Searching the deployments', ms: 2200 },
];

/** The words the work ends with, a sentence at a time. */
const REPLY = [
  'Three deployments failed this week, all in checkout.',
  'Each one stopped on a missing secret after Tuesday’s config change.',
  'Everything else deployed cleanly.',
];

/** Finished steps, for the row's details. */
const STEPS_DONE: Step[] = [
  {
    id: 'read',
    tool: true,
    label: 'Reading the deployments',
    doneLabel: 'Read the deployments',
    detail: '42 runs',
    status: 'done',
    startedAt: 0,
    endedAt: 900,
  },
  {
    id: 'group',
    label: 'Grouping the failures',
    doneLabel: 'Grouped the failures',
    status: 'done',
    startedAt: 900,
    endedAt: 2400,
  },
  {
    id: 'owners',
    tool: true,
    label: 'Checking the owners',
    doneLabel: 'Checked the owners',
    status: 'done',
    startedAt: 2400,
    endedAt: 4100,
  },
];

/* ── layout ───────────────────────────────────────────────────────────── */

const stack: CSSProperties = {
  display: 'grid',
  gap: 24,
  maxInlineSize: '40rem',
  padding: 24,
};
const list: CSSProperties = { display: 'grid', gap: 16 };
const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
};
const captionText: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'var(--cds-text-secondary)',
};
const replyText: CSSProperties = {
  margin: 0,
  color: 'var(--cds-text-primary)',
};

/** A part with a caption over it. */
function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={captionText}>{label}</p>
      {children}
    </div>
  );
}

/** The time a still example started, ms on the page's clock: far enough back that its words and seconds show. */
function useShownSince(ago = 9000) {
  const [since] = useState(() => performance.now() - ago);
  return since;
}

/** Timers that are all cleared together, and on unmount. */
function useTimers() {
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const all = timers;
    return () => all.current.forEach((t) => window.clearTimeout(t));
  }, []);
  return {
    at: (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    },
    clear: () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    },
  };
}

type RowState = Pick<
  TurnStatusProps,
  'status' | 'label' | 'startedAt' | 'endedAt'
>;

/**
 * One run of the work: the script's stages, then its words a sentence at a
 * time. Stop ends it where it is.
 */
function useScriptedTurn() {
  const timers = useTimers();
  const [status, setStatus] = useState<RowState | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const start = () => {
    timers.clear();
    setChunks([]);
    setDone(false);
    setStatus({
      status: SCRIPT[0].status,
      label: SCRIPT[0].label,
      startedAt: performance.now(),
    });
    let ms = 0;
    SCRIPT.forEach((stage, i) => {
      if (i > 0) {
        timers.at(ms, () =>
          setStatus(
            (s) => s && { ...s, status: stage.status, label: stage.label }
          )
        );
      }
      ms += stage.ms;
    });
    timers.at(ms, () => {
      const endedAt = performance.now();
      setStatus((s) => s && { ...s, status: 'streaming', endedAt });
      const gap = motionTokens.duration['moderate-02'];
      REPLY.forEach((_, i) =>
        timers.at(gap * i, () => {
          const last = i === REPLY.length - 1;
          setChunks(REPLY.slice(0, i + 1));
          if (last) {
            setDone(true);
            setStatus((s) => s && { ...s, status: 'done' });
          }
        })
      );
    });
  };

  const stop = () => {
    timers.clear();
    setDone(true);
    setStatus(
      (s) => s && { ...s, status: 'stopped', endedAt: performance.now() }
    );
  };

  const generating = status != null && !done;
  return { status, chunks, done, start, stop, generating };
}

/* ── stories ──────────────────────────────────────────────────────────── */

/**
 * The line above a reply that says what it's doing and for how long. When
 * the reply ends, it becomes a one-line summary that opens the reply's
 * steps. Start a turn to watch it.
 */
export const ReplyStatus = {
  render: function ReplyStatusStory() {
    const since = useShownSince();
    const turn = useScriptedTurn();
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            disabled={turn.generating}
            onClick={turn.start}>
            Start a turn
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={!turn.generating}
            onClick={turn.stop}>
            Stop
          </Button>
        </div>
        {turn.status ? (
          <ChatMessage
            role="assistant"
            chunks={turn.chunks}
            done={turn.done}
            status={<TurnStatus {...turn.status} />}
          />
        ) : (
          <p style={captionText}>Start a turn to see its status.</p>
        )}
        <Labelled label="Each state">
          <div style={list}>
            {STATES.map((s) => (
              <TurnStatus
                key={s.status}
                status={s.status}
                label={s.label}
                startedAt={since}
                endedAt={s.ended != null ? since + s.ended : undefined}
                error={s.error}
                onRetry={() => {}}
              />
            ))}
          </div>
        </Labelled>
        <Labelled label="With its steps as details">
          <TurnStatus
            status="done"
            startedAt={since}
            endedAt={since + 4100}
            detail={countSteps(STEPS_DONE)}
            defaultExpanded>
            <StepList steps={STEPS_DONE} />
          </TurnStatus>
        </Labelled>
      </div>
    );
  },
};

/**
 * While the work runs: the mark for the stage, its words and the seconds.
 * Thinking pulses, acting turns a triangle, waiting a square. With
 * `working` false another element holds the work's one working indicator,
 * so the mark goes and the words still.
 */
export const Working = {
  render: function WorkingStory() {
    const since = useShownSince();
    return (
      <div style={stack}>
        <Labelled label="Thinking">
          <TurnStatus status="thinking" startedAt={since} />
        </Labelled>
        <Labelled label="Acting: a tool call">
          <TurnStatus
            status="acting"
            label="Searching the deployments"
            startedAt={since}
          />
        </Labelled>
        <Labelled label="Waiting for the person">
          <TurnStatus
            status="waiting"
            label="Waiting for your approval"
            startedAt={since}
          />
        </Labelled>
        <Labelled label="Not the working element: a running step holds it">
          <TurnStatus
            status="acting"
            label="Searching the deployments"
            startedAt={since}
            working={false}
          />
        </Labelled>
        <Labelled label="The 16px mark, for a row under 24px">
          <TurnStatus
            status="thinking"
            label="Reading the logs"
            startedAt={since}
            size={16}
          />
        </Labelled>
      </div>
    );
  },
};

/**
 * Once the work has stopped: a one-line summary of the time it took. With
 * details, the summary opens and shuts them.
 */
export const Done = {
  render: function DoneStory() {
    const since = useShownSince();
    return (
      <div style={stack}>
        <Labelled label="Done">
          <TurnStatus status="done" startedAt={since} endedAt={since + 6200} />
        </Labelled>
        <Labelled label="Stopped by the person">
          <TurnStatus
            status="stopped"
            startedAt={since}
            endedAt={since + 3400}
          />
        </Labelled>
        <Labelled label="With its steps as details, shut">
          <TurnStatus
            status="done"
            startedAt={since}
            endedAt={since + 4100}
            detail={countSteps(STEPS_DONE)}>
            <StepList steps={STEPS_DONE} />
          </TurnStatus>
        </Labelled>
        <Labelled label="Its own summary">
          <TurnStatus
            status="done"
            startedAt={since}
            endedAt={since + 72000}
            summary="Exported 1,240 records"
          />
        </Labelled>
      </div>
    );
  },
};

/**
 * A failure: the error mark, the cause and Retry. Retry starts the work
 * again; this run then finishes.
 */
export const Failed = {
  render: function FailedStory() {
    const since = useShownSince();
    const timers = useTimers();
    const [run, setRun] = useState<RowState>({
      status: 'error',
      startedAt: since,
      endedAt: since + 2600,
    });
    const retry = () => {
      timers.clear();
      setRun({
        status: 'thinking',
        label: 'Reconnecting',
        startedAt: performance.now(),
      });
      timers.at(1800, () =>
        setRun((r) => ({
          ...r,
          status: 'acting',
          label: 'Searching the deployments',
        }))
      );
      timers.at(3600, () =>
        setRun((r) => ({ ...r, status: 'done', endedAt: performance.now() }))
      );
    };
    const fail = () => {
      timers.clear();
      setRun({
        status: 'acting',
        label: 'Searching the deployments',
        startedAt: performance.now(),
      });
      timers.at(2400, () =>
        setRun((r) => ({ ...r, status: 'error', endedAt: performance.now() }))
      );
    };
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={fail}>
            Run and fail
          </Button>
        </div>
        <TurnStatus
          {...run}
          error="Couldn’t reach the deployments."
          onRetry={retry}
        />
      </div>
    );
  },
};

/**
 * The release: a host holds its words until the row has collapsed, with
 * `useTurnRelease`, so the work shows one indicator at a time. Start it:
 * the words arrive only after the summary.
 */
export const Release = {
  render: function ReleaseStory() {
    const turn = useScriptedTurn();
    const release = useTurnRelease(turn.status?.startedAt);
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            disabled={turn.generating}
            onClick={turn.start}>
            Start
          </Button>
        </div>
        {turn.status ? (
          <div style={list}>
            <TurnStatus {...turn.status} onCollapse={release.onCollapse} />
            {release.released &&
              turn.chunks.map((c) => (
                <p key={c} style={replyText}>
                  {c}
                </p>
              ))}
          </div>
        ) : (
          <p style={captionText}>Start to see the words held.</p>
        )}
      </div>
    );
  },
};
