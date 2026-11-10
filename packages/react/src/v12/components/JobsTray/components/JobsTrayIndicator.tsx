/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { Activity } from '@carbon-labs/react-motion-icons';
import { CountPill } from '@carbon-labs/react-feedback';
import { useIconAnimated } from '@carbon-labs/react-icon-motion';
import { JOB_STATUS, jobActive, type Job, type JobStatus } from './JobsTray';
import './jobs-tray.scss';

/* ============================================================================
 * JobsTrayIndicator: the jobs tray's trigger face.
 *
 *   mark      the activity icon with the motion-icons status mark in its
 *             corner: pending while any job is at work, then failed if any
 *             job ended failed, else done; the mark stays while ended jobs
 *             are in the tray; cleared, the plain icon. The mark's own
 *             motion: in, change and out on the motion tokens
 *   count     the jobs still working, on the kit's CountPill (it rolls)
 *   reduced   the mark at once (pending as still dots); the pill's own
 *
 * Put it in the header's IconButton; name the button with the count and
 * the status (`jobsStatus`).
 * ========================================================================== */

/** The trigger's status: pending while any job is at work, then error or success. */
export type JobsStatus = 'pending' | 'success' | 'error';

/** The job status whose words name each trigger status. */
const WORDS: Record<JobsStatus, JobStatus> = {
  pending: 'running',
  success: 'finished',
  error: 'failed',
};

export interface JobsTrayIndicatorProps {
  jobs: readonly Job[];
  /** The icon's size. Default 20 (a header button's). The count clears the mark at every size; below 20 it covers most of the pulse. */
  size?: 16 | 20 | 24 | 32;
  /** The icon's name, before its status. Default "Jobs progress". */
  progressLabel?: string;
  /** The count's words. Default "1 job running", "n jobs running". */
  countLabel?: (n: number) => string;
  /** The status words, as the tray's: running, finished, failed. */
  statusLabels?: Partial<Record<JobStatus, string>>;
}

/** Pending while any job is at work; then error if any ended failed, success if any finished; else none. */
export function jobsStatus(jobs: readonly Job[]): JobsStatus | undefined {
  if (jobs.some(jobActive)) return 'pending';
  if (jobs.some((j) => j.status === 'failed')) return 'error';
  if (jobs.some((j) => j.status === 'finished')) return 'success';
  return undefined;
}

/** A trigger status's words: the tray's label for its job status. */
export function jobsStatusLabel(
  status: JobsStatus,
  statusLabels?: Partial<Record<JobStatus, string>>
): string {
  const s = WORDS[status];
  return statusLabels?.[s] ?? JOB_STATUS[s].label;
}

const jobsRunning = (n: number) => `${n} ${n === 1 ? 'job' : 'jobs'} running`;

export function JobsTrayIndicator({
  jobs,
  size = 20,
  progressLabel = 'Jobs progress',
  countLabel = jobsRunning,
  statusLabels,
}: JobsTrayIndicatorProps) {
  const active = jobs.filter(jobActive).length;
  const status = jobsStatus(jobs);
  const animated = useIconAnimated();
  const name = status
    ? `${progressLabel}: ${jobsStatusLabel(status, statusLabels)}`
    : progressLabel;
  return (
    <span className="cds-jobs-indicator" data-status={status}>
      <Activity
        className="cds-jobs-indicator__icon"
        size={size}
        status={status}
        tone
        animated={animated}
        aria-label={name}
      />
      {active > 0 && (
        <CountPill
          className="cds-jobs-indicator__count"
          value={active}
          label={countLabel(active)}
        />
      )}
    </span>
  );
}
JobsTrayIndicator.displayName = 'JobsTrayIndicator';
