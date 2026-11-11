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
import '@carbon-labs/react-shimmer-text/scss/shimmer-text.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import { StepList } from '../index';
import type { Step } from '../index';
import mdx from './StepList.mdx';

export default {
  title: 'V12/StepList',
  component: StepList,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'status-hand-off',
        'wind-up',
        'words',
        'arrival',
        'stillness',
        'collapse',
        'one-working-element',
      ],
      reduced: {
        'status-hand-off': 'at-once',
        'wind-up': 'at-once',
        words: 'shorter-clock',
        arrival: 'at-once',
        stillness: 'at-once',
        collapse: 'at-once',
        'one-working-element': 'at-once',
      },
      states: ['queued', 'running', 'waiting', 'done', 'error', 'cancelled'],
    },
  },
  argTypes: {
    steps: { control: false },
    formatAttempts: { control: false },
    formatCount: { control: false },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

/* ── sample content ───────────────────────────────────────────────────── */

/** Finished steps, with their times. */
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

/** The steps of a job, in order: each one's words while it runs and once done, and its time, ms. */
const JOB: { id: string; label: string; doneLabel: string; ms: number }[] = [
  {
    id: 'fetch',
    label: 'Fetching the records',
    doneLabel: 'Fetched the records',
    ms: 1200,
  },
  {
    id: 'check',
    label: 'Checking for duplicates',
    doneLabel: 'Checked for duplicates',
    ms: 1400,
  },
  {
    id: 'write',
    label: 'Writing the export',
    doneLabel: 'Wrote the export',
    ms: 1000,
  },
];

/* ── layout ───────────────────────────────────────────────────────────── */

const stack: CSSProperties = {
  display: 'grid',
  gap: 24,
  maxInlineSize: '40rem',
  padding: 24,
};
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

/** A part with a caption over it. */
function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={captionText}>{label}</p>
      {children}
    </div>
  );
}

/** The time a still example started, ms on the page's clock: far enough back that its times show. */
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

/** The steps a reply takes, scripted: one fails once and waits for Retry; one waits for approval. */
interface Scripted {
  id: string;
  label: string;
  doneLabel: string;
  tool?: boolean;
  detail?: string;
  ms: number;
  failsFirst?: string;
  asks?: string;
}
const RUN: Scripted[] = [
  {
    id: 'read',
    tool: true,
    label: 'Reading the deployments',
    doneLabel: 'Read the deployments',
    detail: '42 runs',
    ms: 1400,
  },
  {
    id: 'logs',
    tool: true,
    label: 'Searching the logs',
    doneLabel: 'Searched the logs',
    ms: 1200,
    failsFirst: 'Couldn’t reach the log service',
  },
  {
    id: 'notify',
    asks: 'Notify the checkout team',
    label: 'Notifying the checkout team',
    doneLabel: 'Notified the checkout team',
    ms: 900,
  },
];

/** A scripted run of steps: each joins as it starts. */
function useRun() {
  const [steps, setSteps] = useState<Step[]>([]);
  const timers = useTimers();
  const put = (id: string, f: (s: Step | undefined) => Step) =>
    setSteps((all) => {
      const i = all.findIndex((s) => s.id === id);
      return i < 0
        ? [...all, f(undefined)]
        : all.map((s, k) => (k === i ? f(s) : s));
    });
  const attempt = (i: number, n: number) => {
    const step = RUN[i];
    put(step.id, (s) => ({
      ...s,
      id: step.id,
      label: step.label,
      doneLabel: step.doneLabel,
      tool: step.tool,
      status: 'running',
      detail: undefined,
      error: undefined,
      startedAt: performance.now(),
      endedAt: undefined,
      attempts: n,
    }));
    timers.at(step.ms, () => {
      const endedAt = performance.now();
      if (step.failsFirst && n === 1) {
        put(step.id, (s) => ({
          ...(s as Step),
          status: 'error',
          error: step.failsFirst,
          endedAt,
        }));
        return;
      }
      put(step.id, (s) => ({
        ...(s as Step),
        status: 'done',
        detail: step.detail,
        endedAt,
      }));
      from(i + 1);
    });
  };
  const from = (i: number) => {
    const step = RUN[i];
    if (!step) {
      return;
    }
    if (step.asks) {
      put(step.id, () => ({
        id: step.id,
        label: step.asks as string,
        status: 'waiting',
        detail: 'Needs your approval',
      }));
      return;
    }
    attempt(i, 1);
  };
  const start = () => {
    timers.clear();
    setSteps([]);
    from(0);
  };
  const decide = (id: string, approve: boolean) => {
    const i = RUN.findIndex((s) => s.id === id);
    if (approve) {
      attempt(i, 1);
    } else {
      put(id, (s) => ({
        ...(s as Step),
        status: 'cancelled',
        detail: 'Skipped',
        endedAt: performance.now(),
      }));
      from(i + 1);
    }
  };
  const shown = steps.map(
    (s): Step => ({
      ...s,
      onRetry:
        s.status === 'error'
          ? () =>
              attempt(
                RUN.findIndex((r) => r.id === s.id),
                (s.attempts ?? 1) + 1
              )
          : undefined,
      actions:
        s.status === 'waiting' ? (
          <>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => decide(s.id, true)}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => decide(s.id, false)}>
              Skip
            </Button>
          </>
        ) : undefined,
    })
  );
  return { steps: shown, start };
}

/* ── stories ──────────────────────────────────────────────────────────── */

/**
 * The steps a reply takes, as they happen. Run them: one fails and waits
 * for Retry, and one waits for your approval. Below, every status.
 */
export const ReplySteps = {
  render: function ReplyStepsStory() {
    const since = useShownSince();
    const run = useRun();
    const all: Step[] = [
      { id: 'q', label: 'Write the summary', status: 'queued' },
      {
        id: 'r',
        label: 'Reading the deployments',
        status: 'running',
        tool: true,
      },
      {
        id: 'w',
        label: 'Notify the checkout team',
        status: 'waiting',
        detail: 'Needs your approval',
      },
      {
        id: 'd',
        label: 'Searching the logs',
        doneLabel: 'Searched the logs',
        status: 'done',
        tool: true,
        detail: '12 matches',
        startedAt: since,
        endedAt: since + 1240,
      },
      {
        id: 'e',
        label: 'Querying the config service',
        status: 'error',
        tool: true,
        error: 'Couldn’t reach the service',
        onRetry: () => {},
      },
      { id: 'c', label: 'Draft the rollback plan', status: 'cancelled' },
    ];
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={run.start}>
            Run the steps
          </Button>
        </div>
        <StepList steps={run.steps} />
        <Labelled label="Every status">
          <StepList label="Every status" steps={all} />
        </Labelled>
        <Labelled label="Collapsible, with its counter line">
          <StepList
            label="Collapsible steps"
            steps={STEPS_DONE}
            collapsible
            autoCollapse={false}
          />
        </Labelled>
      </div>
    );
  },
};

/**
 * Pending: every step queued, each a still dashed circle. Start them: out
 * of queued, the circle winds up into the spinner.
 */
export const Pending = {
  render: function PendingStory() {
    const timers = useTimers();
    // The step running now: -1 before the start, the job's length once all are done.
    const [at, setAt] = useState(-1);
    const [times, setTimes] = useState<number[]>([]);
    const start = () => {
      timers.clear();
      const t0 = performance.now();
      setTimes([t0]);
      setAt(0);
      let ms = 0;
      JOB.forEach((step, i) => {
        ms += step.ms;
        timers.at(ms, () => {
          setTimes((t) => [...t, performance.now()]);
          setAt(i + 1);
        });
      });
    };
    const steps = JOB.map(
      (s, i): Step => ({
        id: s.id,
        label: s.label,
        doneLabel: s.doneLabel,
        status: i < at ? 'done' : i === at ? 'running' : 'queued',
        startedAt: times[i],
        endedAt: i < at ? times[i + 1] : undefined,
      })
    );
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={start}>
            {at < 0 ? 'Start' : 'Start again'}
          </Button>
        </div>
        <StepList label="Export steps" steps={steps} />
      </div>
    );
  },
};

/**
 * Running: the spinner and the shimmer on the step at work. With
 * `workingStep`, only that one shows it's working; another running step
 * keeps the dashed circle, still.
 */
export const Running = {
  render: function RunningStory() {
    const since = useShownSince();
    const done: Step[] = [
      {
        id: 'fetch',
        label: 'Fetching the records',
        doneLabel: 'Fetched the records',
        status: 'done',
        detail: '1,240 records',
        startedAt: since,
        endedAt: since + 1200,
      },
    ];
    return (
      <div style={stack}>
        <Labelled label="One step running">
          <StepList
            label="Export steps"
            steps={[
              ...done,
              {
                id: 'check',
                label: 'Checking for duplicates',
                status: 'running',
              },
              { id: 'write', label: 'Write the export', status: 'queued' },
            ]}
          />
        </Labelled>
        <Labelled label="Two running, one working element">
          <StepList
            label="Parallel steps"
            workingStep="eu"
            steps={[
              ...done,
              {
                id: 'eu',
                label: 'Copying to Frankfurt',
                status: 'running',
                tool: true,
              },
              {
                id: 'us',
                label: 'Copying to Dallas',
                status: 'running',
                tool: true,
              },
            ]}
          />
        </Labelled>
      </div>
    );
  },
};

/**
 * Done: each step's past-tense words, its time and a few trailing words. A
 * retried step counts its attempts; a tool call opens to show its input and
 * output.
 */
export const Done = {
  render: function DoneStory() {
    const since = useShownSince();
    const steps: Step[] = [
      {
        id: 'read',
        tool: true,
        label: 'Reading the deployments',
        doneLabel: 'Read the deployments',
        detail: '42 runs',
        status: 'done',
        startedAt: since,
        endedAt: since + 900,
        input: '{ "service": "checkout", "days": 7 }',
        output: '{ "runs": 42, "failed": 3 }',
      },
      {
        id: 'logs',
        tool: true,
        label: 'Searching the logs',
        doneLabel: 'Searched the logs',
        detail: '12 matches',
        attempts: 2,
        status: 'done',
        startedAt: since + 900,
        endedAt: since + 3100,
      },
      {
        id: 'summary',
        label: 'Writing the summary',
        doneLabel: 'Wrote the summary',
        status: 'done',
        startedAt: since + 3100,
        endedAt: since + 4400,
      },
    ];
    return (
      <div style={stack}>
        <StepList steps={steps} />
      </div>
    );
  },
};

/**
 * Failed: the error mark, the cause and Retry. Retry runs the step again,
 * and it counts its attempts. A step after it that will not run is
 * cancelled.
 */
export const Failed = {
  render: function FailedStory() {
    const since = useShownSince();
    const timers = useTimers();
    const [step, setStep] = useState<Step>({
      id: 'config',
      tool: true,
      label: 'Querying the config service',
      doneLabel: 'Queried the config service',
      status: 'error',
      error: 'Couldn’t reach the service',
      startedAt: since,
      endedAt: since + 2000,
    });
    const retry = () => {
      timers.clear();
      setStep((s) => ({
        ...s,
        status: 'running',
        error: undefined,
        attempts: (s.attempts ?? 1) + 1,
        startedAt: performance.now(),
        endedAt: undefined,
      }));
      timers.at(1400, () =>
        setStep((s) => ({
          ...s,
          status: 'done',
          detail: '3 changes',
          endedAt: performance.now(),
        }))
      );
    };
    const failed = step.status === 'error';
    return (
      <div style={stack}>
        <StepList
          steps={[
            {
              id: 'read',
              tool: true,
              label: 'Reading the deployments',
              doneLabel: 'Read the deployments',
              status: 'done',
              startedAt: since,
              endedAt: since + 900,
            },
            { ...step, onRetry: failed ? retry : undefined },
            {
              id: 'plan',
              label: 'Draft the rollback plan',
              status: failed
                ? 'cancelled'
                : step.status === 'done'
                  ? 'done'
                  : 'queued',
              doneLabel: 'Drafted the rollback plan',
            },
          ]}
        />
      </div>
    );
  },
};

/** Collapsed: the counter line alone. It opens the rows. */
export const Collapsed = {
  render: () => (
    <div style={stack}>
      <StepList
        label="Collapsed steps"
        steps={STEPS_DONE}
        collapsible
        defaultExpanded={false}
      />
    </div>
  ),
};

/** Expanded: the counter line over the rows. It shuts them. */
export const Expanded = {
  render: () => (
    <div style={stack}>
      <StepList
        label="Expanded steps"
        steps={STEPS_DONE}
        collapsible
        autoCollapse={false}
      />
    </div>
  ),
};

/** The long list's words: one wraps to a second line. */
const LONG: [string, string][] = [
  ['Reading the deployments', 'Read the deployments'],
  ['Grouping the failures', 'Grouped the failures'],
  ['Checking the owners', 'Checked the owners'],
  ['Searching the logs', 'Searched the logs'],
  ['Reading the config change', 'Read the config change'],
  [
    'Comparing the secrets in every region against the ones the config change expects',
    'Compared the secrets in every region against the ones the config change expects',
  ],
  ['Finding the renamed secrets', 'Found the renamed secrets'],
  ['Checking the West region', 'Checked the West region'],
  ['Drafting the rollback plan', 'Drafted the rollback plan'],
  ['Estimating the downtime', 'Estimated the downtime'],
  ['Writing the summary', 'Wrote the summary'],
  ['Notifying the checkout team', 'Notified the checkout team'],
];

/**
 * A long list, as an agent's workflow: collapsible, with most steps done,
 * one retried, one running and the rest queued.
 */
export const LongList = {
  render: function LongListStory() {
    const since = useShownSince(30000);
    const steps = LONG.map(([label, doneLabel], i): Step => {
      const status = i < 9 ? 'done' : i === 9 ? 'running' : 'queued';
      return {
        id: `s${i}`,
        label,
        doneLabel,
        status,
        tool: i % 3 === 0,
        attempts: i === 3 ? 2 : undefined,
        startedAt: status === 'queued' ? undefined : since + i * 2400,
        endedAt: status === 'done' ? since + i * 2400 + 1900 : undefined,
      };
    });
    return (
      <div style={stack}>
        <StepList
          label="Workflow steps"
          steps={steps}
          collapsible
          autoCollapse={false}
        />
      </div>
    );
  },
};
