/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { ToastStack } from '@carbon-labs/react-notification';
import { Button } from '@carbon-labs/react-button';
import { IconButton } from '@carbon-labs/react-tooltip';
import {
  JobsTray,
  JobsTrayIndicator,
  jobActive,
  jobsStatus,
  jobsStatusLabel,
} from '../index';
import type { Job, JobsTrayIndicatorProps, JobsTrayProps } from '../index';
import mdx from './JobsTray.mdx';

const ALIGNMENTS: NonNullable<JobsTrayProps['align']>[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
];

const SIZES: NonNullable<JobsTrayIndicatorProps['size']>[] = [16, 20, 24, 32];

export default {
  title: 'V12/JobsTray',
  component: JobsTray,
  subcomponents: { JobsTrayIndicator },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'floating-snap',
        'retarget',
        'status-hand-off',
        'list-arrival',
        'place-shut',
        'status-mark',
        'count-roll',
        'toast',
      ],
      reduced: {
        retarget: 'at-once',
        'list-arrival': 'at-once',
        'place-shut': 'at-once',
        'status-mark': 'at-once',
        'count-roll': 'shorter-clock',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    shadow: { control: 'boolean' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    jobs: { control: false },
    open: { control: false },
    triggerButtonRef: { control: false },
    statusLabels: { control: false },
  },
};

/** A job as the story runs it: how fast it moves, and where it fails. */
interface SimJob extends Job {
  /** Percent per tick; 0 runs with no progress (indeterminate). */
  rate: number;
  /** It fails once its progress reaches this. */
  failAt?: number;
  failError?: string;
  ticks: number;
}

/** Ticks an indeterminate job takes. */
const INDETERMINATE = 12;
/** Jobs that run at once; the rest wait, queued. */
const AT_ONCE = 2;

/** One tick: queued jobs start while there is room, running ones move on and end. */
function step(jobs: SimJob[]): SimJob[] {
  let running = jobs.filter((j) => j.status === 'running').length;
  let changed = false;
  const next = jobs.map((j): SimJob => {
    if (j.status === 'queued' && running < AT_ONCE) {
      running++;
      changed = true;
      return {
        ...j,
        status: 'running',
        progress: j.rate ? 0 : undefined,
        ticks: 0,
      };
    }
    if (j.status !== 'running') {
      return j;
    }
    changed = true;
    const ticks = j.ticks + 1;
    if (!j.rate) {
      return ticks >= INDETERMINATE
        ? { ...j, ticks, status: 'finished' }
        : { ...j, ticks };
    }
    const progress = Math.min(100, (j.progress ?? 0) + j.rate);
    if (j.failAt != null && progress >= j.failAt) {
      return {
        ...j,
        ticks,
        progress: j.failAt,
        status: 'failed',
        error: j.failError,
      };
    }
    return progress >= 100
      ? { ...j, ticks, progress: 100, status: 'finished' }
      : { ...j, ticks, progress };
  });
  return changed ? next : jobs;
}

let nextJob = 0;

function job(
  title: string,
  description: string,
  opts: Partial<SimJob> = {}
): SimJob {
  return {
    id: `story-job-${++nextJob}`,
    title,
    description,
    status: 'queued',
    rate: 8,
    ticks: 0,
    ...opts,
  };
}

const EXTRA = [
  ['Export usage report', 'CSV, 4.2 MB'],
  ['Upload site-photos.zip', '18 MB to the shared folder'],
  ['Rebuild search index', 'Step 1 of 3'],
  ['Deploy preview', 'To the test environment'],
] as const;

/** The jobs, moving on a timer, and the host's handlers for them. */
function useJobs(initial: () => SimJob[]) {
  const [jobs, setJobs] = useState<SimJob[]>(initial);
  useEffect(() => {
    const id = window.setInterval(() => setJobs(step), 400);
    return () => window.clearInterval(id);
  }, []);
  const add = (...more: SimJob[]) => setJobs((js) => [...more, ...js]);
  const cancel = (j: Job) =>
    setJobs((js) =>
      js.map((x) => (x.id === j.id ? { ...x, status: 'cancelled' } : x))
    );
  // A retry starts a new run, and this one succeeds.
  const retry = (j: Job) =>
    setJobs((js) =>
      js.map((x) =>
        x.id === j.id
          ? {
              ...x,
              status: 'queued',
              progress: undefined,
              error: undefined,
              failAt: undefined,
            }
          : x
      )
    );
  const clearFinished = () => setJobs((js) => js.filter(jobActive));
  return { jobs, setJobs, add, cancel, retry, clearFinished };
}

/** Room below the header, so the tray never clips. */
const stage = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  minBlockSize: 560,
};

const header = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 8,
  blockSize: 48,
  paddingInline: 16,
  borderBlockEnd: '1px solid var(--cds-border-subtle-01)',
};

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The header's trigger: named with the count and the status. */
function Trigger({
  jobs,
  open,
  onToggle,
  triggerRef,
}: {
  jobs: readonly Job[];
  open: boolean;
  onToggle: () => void;
  triggerRef: React.Ref<HTMLButtonElement | HTMLAnchorElement>;
}) {
  const running = jobs.filter(jobActive).length;
  const status = jobsStatus(jobs);
  const label = [
    'Background jobs',
    running ? `${running} running` : null,
    status ? jobsStatusLabel(status) : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <IconButton
      ref={triggerRef}
      frame="ghost"
      align="bottom"
      label={label}
      aria-expanded={open}
      onClick={onToggle}>
      <JobsTrayIndicator jobs={jobs} />
    </IconButton>
  );
}

type TrayArgs = Omit<JobsTrayProps, 'jobs' | 'open' | 'triggerButtonRef'>;

/**
 * Open the tray from the header. The jobs run on a timer: queued ones start,
 * the bars travel, and each status hands off to how it ended. Cancel a
 * running job, retry a failed one, or Clear finished. Add a job while it is
 * open to see its place open. Close it while jobs run: each one that ends
 * shows a quiet toast.
 */
export const Default = {
  args: {
    title: 'Background jobs',
    emptyText: 'No background jobs',
    clearFinishedLabel: 'Clear finished',
    cancelLabel: 'Cancel',
    retryLabel: 'Retry',
    align: 'bottom-end',
    toast: true,
    shadow: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: TrayArgs) {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const { jobs, add, cancel, retry, clearFinished } = useJobs(() => [
      job('Upload quarterly-summary.pdf', '12 MB to the shared folder', {
        rate: 6,
      }),
      job('Export audit log', 'CSV, last 30 days', { rate: 0 }),
      job('Convert video-intro.mov', 'To 1080p', {
        rate: 9,
        failAt: 55,
        failError: 'The file could not be read.',
      }),
      job('Sync project files', 'Done earlier', {
        status: 'finished',
        progress: 100,
      }),
    ]);
    const more = () => {
      const [title, description] = EXTRA[nextJob % EXTRA.length] ?? EXTRA[0];
      add(job(title, description, { rate: 5 + (nextJob % 4) * 3 }));
    };
    return (
      <ToastStack>
        <div style={stage}>
          <div style={header}>
            <Trigger
              jobs={jobs}
              open={open}
              onToggle={() => setOpen((o) => !o)}
              triggerRef={trigger}
            />
          </div>
          <div style={row}>
            <Button size="sm" variant="outlined" onClick={more}>
              Add a job
            </Button>
          </div>
          <JobsTray
            {...args}
            jobs={jobs}
            open={open}
            triggerButtonRef={trigger}
            onClickOutside={() => setOpen(false)}
            onCancel={cancel}
            onRetry={retry}
            onClearFinished={clearFinished}
          />
        </div>
      </ToastStack>
    );
  },
};

/**
 * Jobs that end while the tray is closed: each shows one quiet toast,
 * grouped with the others. A success leaves on its own; a failure stays.
 * Retry it from the tray and its next end may toast again.
 */
export const Toasts = {
  render: function ToastsStory() {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const { jobs, add, cancel, retry, clearFinished } = useJobs(() => []);
    return (
      <ToastStack>
        <div style={stage}>
          <div style={header}>
            <Trigger
              jobs={jobs}
              open={open}
              onToggle={() => setOpen((o) => !o)}
              triggerRef={trigger}
            />
          </div>
          <div style={row}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                add(
                  job('Back up workspace', 'To the archive', { rate: 14 }),
                  job('Import contacts.csv', '2,400 rows', {
                    rate: 10,
                    failAt: 70,
                    failError: 'Row 812 has no email address.',
                  })
                )
              }>
              Start two jobs
            </Button>
          </div>
          <JobsTray
            jobs={jobs}
            open={open}
            triggerButtonRef={trigger}
            onClickOutside={() => setOpen(false)}
            onCancel={cancel}
            onRetry={retry}
            onClearFinished={clearFinished}
          />
        </div>
      </ToastStack>
    );
  },
};

/** No jobs: the tray shows its empty text. Clear finished brings it back in once the places have shut. */
export const Empty = {
  render: function EmptyStory() {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const { jobs, setJobs, cancel, retry, clearFinished } = useJobs(() => []);
    return (
      <ToastStack>
        <div style={stage}>
          <div style={header}>
            <Trigger
              jobs={jobs}
              open={open}
              onToggle={() => setOpen((o) => !o)}
              triggerRef={trigger}
            />
          </div>
          <div style={row}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                setJobs([
                  job('Resize images', '48 files', {
                    status: 'finished',
                    progress: 100,
                  }),
                  job('Publish draft', 'To the test environment', {
                    status: 'failed',
                    progress: 40,
                    error: 'The server did not respond.',
                  }),
                ])
              }>
              Add two ended jobs
            </Button>
          </div>
          <JobsTray
            jobs={jobs}
            open={open}
            triggerButtonRef={trigger}
            onClickOutside={() => setOpen(false)}
            onCancel={cancel}
            onRetry={retry}
            onClearFinished={clearFinished}
            toast={false}
          />
        </div>
      </ToastStack>
    );
  },
};

const PENDING: Job[] = [
  { id: 'a', title: 'a', status: 'running', progress: 30 },
  { id: 'b', title: 'b', status: 'running' },
  { id: 'c', title: 'c', status: 'queued' },
];
const SUCCESS: Job[] = [{ id: 'a', title: 'a', status: 'finished' }];
const ERROR: Job[] = [
  { id: 'a', title: 'a', status: 'finished' },
  { id: 'b', title: 'b', status: 'failed' },
];

/** The trigger's face at each size: none, pending with its count, success and error. */
export const Indicator = {
  name: 'JobsTrayIndicator',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {SIZES.map((size) => (
        <div key={size} style={{ ...row, gap: 32 }}>
          <JobsTrayIndicator size={size} jobs={[]} />
          <JobsTrayIndicator size={size} jobs={PENDING} />
          <JobsTrayIndicator size={size} jobs={SUCCESS} />
          <JobsTrayIndicator size={size} jobs={ERROR} />
        </div>
      ))}
    </div>
  ),
};

/** The trigger as jobs change: the count rolls, and the mark goes from pending to how the jobs ended. */
export const IndicatorChanges = {
  name: 'JobsTrayIndicator changes',
  render: function IndicatorStory() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const set = (...statuses: Job['status'][]) =>
      setJobs(statuses.map((status, i) => ({ id: `${i}`, title: '', status })));
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <JobsTrayIndicator size={32} jobs={jobs} />
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => set('running')}>
            One running
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => set('running', 'running', 'queued')}>
            Three running
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => set('finished', 'finished')}>
            All done
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => set('finished', 'failed')}>
            One failed
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setJobs([])}>
            Cleared
          </Button>
        </div>
      </div>
    );
  },
};
