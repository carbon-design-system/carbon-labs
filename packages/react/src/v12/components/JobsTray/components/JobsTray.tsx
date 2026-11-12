/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  SNAP,
  SNAP_FRAME,
  playContentSwap,
  usePrefersReducedMotion,
  useSnapSurface,
  type SnapProfile,
} from '@carbon-labs/v12-motion';
import {
  placeOnAnchor,
  themeOf,
  type SurfaceAlignment,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { Close, Restart } from '@carbon-labs/react-motion-icons';
import { openPlace, shutPlace } from '@carbon-labs/react-disclosure';
import { Button } from '@carbon-labs/react-button';
import {
  useKitDefaults,
  useSurfaceShadow,
} from '@carbon-labs/react-kit-defaults';
import { useOptionalToasts } from '@carbon-labs/react-notification';
import {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from '@carbon-labs/react-popover';
import {
  ProgressBar,
  type ProgressBarStatus,
} from '@carbon-labs/react-progress-bar';
import { Scroller } from '@carbon-labs/react-scroller';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { floatingOrSurface } from '@carbon-labs/react-snap';
import {
  StatusIndicator,
  type StatusIndicatorKind,
} from '@carbon-labs/react-status-indicator';
import { IconButton } from '@carbon-labs/react-tooltip';
import './jobs-tray.scss';
import { cx } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * JobsTray: background jobs in a panel from the header.
 *
 *   open      the floating snap from its trigger, timed by size (over 320px, the
 *             surface rule); the presence fade; the far edge folds back on close
 *   jobs      each a title, a ProgressBar retargeting as progress comes in, a
 *             StatusIndicator, and Cancel or Retry
 *   arrive    a job added while open opens its place; Clear finished shuts theirs
 *   toast     a job that ends while the tray is closed shows one quiet toast
 *             (the page's ToastStack), grouped, never again for that run
 *   reduced   the panel fades in place; places open and shut at once
 *
 * API: no Carbon counterpart. The trigger's look is `JobsTrayIndicator`.
 * ========================================================================== */

export type JobStatus =
  | 'queued'
  | 'running'
  | 'finished'
  | 'failed'
  | 'cancelled';

export interface Job {
  id: string;
  /** What it is: "Upload quarterly-report.pdf". */
  title: string;
  /** A line under it: a size, a target, a step. */
  description?: string;
  /** 0–100. Unset while running: indeterminate. */
  progress?: number;
  status: JobStatus;
  /** Why it failed. */
  error?: string;
  /** It can be cancelled while queued or running. Default true. */
  cancelable?: boolean;
  /** It can be retried once failed or cancelled. Default true. */
  retryable?: boolean;
}

export interface JobsTrayProps {
  jobs: readonly Job[];
  open: boolean;
  /** The header button that opens it: it opens from here and focus goes back to it. */
  triggerButtonRef?: RefObject<HTMLElement | null>;
  /** A press outside it, or Escape: close it. */
  onClickOutside?: () => void;
  onCancel?: (job: Job) => void;
  onRetry?: (job: Job) => void;
  /** Clears the finished, failed and cancelled jobs. */
  onClearFinished?: () => void;
  /** A job that ends while closed shows a quiet toast, when a ToastStack is above. Default true. */
  toast?: boolean;
  title?: string;
  emptyText?: string;
  clearFinishedLabel?: string;
  cancelLabel?: string;
  retryLabel?: string;
  statusLabels?: Partial<Record<JobStatus, string>>;
  /** Where it sits on its trigger. Default `bottom-end`. */
  align?: SurfaceAlignment;
  /** The cast shadow. Default: the kit's. */
  shadow?: SurfaceShadowOption;
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
}

/** Each status as the kit's status words and marks. */
export const JOB_STATUS: Record<
  JobStatus,
  { kind: StatusIndicatorKind; label: string; bar: ProgressBarStatus }
> = {
  queued: { kind: 'not-started', label: 'Queued', bar: 'active' },
  running: { kind: 'pending', label: 'In progress', bar: 'active' },
  finished: { kind: 'success', label: 'Done', bar: 'finished' },
  failed: { kind: 'error', label: 'Failed', bar: 'error' },
  cancelled: { kind: 'not-started', label: 'Cancelled', bar: 'error' },
};
const LABELS = Object.values(JOB_STATUS).map((s) => s.label);

/** Still working: queued or running. */
export const jobActive = (j: Job) =>
  j.status === 'queued' || j.status === 'running';

/** The floating surface, timed by size (`floatingOrSurface`); reduced motion fades in place. */
const PROFILE: SnapProfile = {
  ...SNAP.floating,
  timing: 'axial',
  blinkOff: false,
};

/** Mounted while open and while it leaves; the toasts are watched always. */
export function JobsTray(props: JobsTrayProps) {
  const { present, exited } = useFloatingMount(props.open);
  const themeClass = useKeptTheme(
    props.open ? themeOf(props.triggerButtonRef?.current) : undefined
  );
  const { brand } = useKitDefaults();
  useEndToasts(props.jobs, props.open, props.toast ?? true, props.statusLabels);
  if (!present || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={cx(
        'cds-jobs-portal',
        themeClass,
        themeClass && 'cds--layer-one'
      )}
      data-cds-brand={brand}>
      <TrayBody {...props} onExited={exited} />
    </div>,
    document.body
  );
}
JobsTray.displayName = 'JobsTray';

/** A job that ends while the tray is closed: one quiet toast for that run, grouped with the others. */
function useEndToasts(
  jobs: readonly Job[],
  open: boolean,
  on: boolean,
  labels?: Partial<Record<JobStatus, string>>
) {
  const toasts = useOptionalToasts();
  const last = useRef(new Map<string, JobStatus>());
  const toasted = useRef(new Set<string>());
  useEffect(() => {
    const prev = last.current;
    const next = new Map<string, JobStatus>();
    for (const j of jobs) {
      next.set(j.id, j.status);
      const was = prev.get(j.id);
      // Running again (a retry): its next end may toast.
      if (jobActive(j)) toasted.current.delete(j.id);
      const ended =
        was &&
        (was === 'queued' || was === 'running') &&
        (j.status === 'finished' || j.status === 'failed');
      if (!ended || open || !on || !toasts || toasted.current.has(j.id))
        continue;
      toasted.current.add(j.id);
      const failed = j.status === 'failed';
      toasts.show({
        group: 'cds-jobs',
        kind: failed ? 'error' : 'success',
        lowContrast: true,
        title: j.title,
        subtitle: failed
          ? (j.error ?? labels?.failed ?? JOB_STATUS.failed.label)
          : (labels?.finished ?? JOB_STATUS.finished.label),
        timeout: failed ? 0 : 5000,
      });
    }
    last.current = next;
  }, [jobs, open, on, toasts, labels]);
}

interface Entry {
  job: Job;
  leaving: boolean;
}

function TrayBody({
  open,
  jobs,
  triggerButtonRef,
  onClickOutside,
  onCancel,
  onRetry,
  onClearFinished,
  title = 'Background jobs',
  emptyText = 'No background jobs',
  clearFinishedLabel = 'Clear finished',
  cancelLabel = 'Cancel',
  retryLabel = 'Retry',
  statusLabels,
  align = 'bottom-end',
  shadow,
  timeScale = 1,
  className,
  onExited,
}: JobsTrayProps & { onExited: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const id = `cds-jobs-${useId().replace(/:/g, '')}`;
  const latest = useLatest({
    triggerButtonRef,
    align,
    onClickOutside,
    onExited,
    reduced,
    timeScale,
  });

  /* ── the list: the jobs, the ones leaving kept until their place shuts ── */

  const [entries, setEntries] = useState<Entry[]>(() =>
    jobs.map((job) => ({ job, leaving: false }))
  );
  const [seen, setSeen] = useState(jobs);
  if (seen !== jobs) {
    setSeen(jobs);
    setEntries((prev) => {
      const ids = new Set(jobs.map((j) => j.id));
      const out: Entry[] = jobs.map((job) => ({ job, leaving: false }));
      prev.forEach((e, i) => {
        if (ids.has(e.job.id)) return;
        const after = prev
          .slice(0, i)
          .reverse()
          .find((p) => ids.has(p.job.id));
        const at = after
          ? out.findIndex((o) => o.job.id === after.job.id) + 1
          : 0;
        out.splice(at, 0, { job: e.job, leaving: true });
      });
      return out;
    });
  }

  const played = useRef(new Set<string>());
  // The jobs shown at the last commit: one not among them has arrived.
  const known = useRef<Set<string> | null>(null);
  useLayoutEffect(() => {
    const before = known.current;
    known.current = new Set(entries.map((e) => e.job.id));
    const list = listRef.current;
    if (!list) return;
    const rowOf = (jid: string) =>
      list.querySelector<HTMLElement>(`[data-job="${CSS.escape(jid)}"]`);
    for (const e of entries) {
      if (!before || e.leaving || before.has(e.job.id)) continue;
      const el = rowOf(e.job.id);
      if (el)
        void openPlace(list, el, {
          timeScale,
          reduced,
          reason: 'jobs-tray-arrive',
        });
    }
    const leaving = entries.filter(
      (e) => e.leaving && !played.current.has(e.job.id)
    );
    if (!leaving.length) return;
    leaving.forEach((e) => played.current.add(e.job.id));
    const gone = new Set(leaving.map((e) => e.job.id));
    void Promise.all(
      leaving.map((e) => {
        const el = rowOf(e.job.id);
        return el
          ? shutPlace(list, el, {
              timeScale,
              reduced,
              reason: 'jobs-tray-clear',
            })
          : undefined;
      })
    ).then(() => {
      gone.forEach((g) => played.current.delete(g));
      setEntries((es) => es.filter((x) => !(x.leaving && gone.has(x.job.id))));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as the list changes
  }, [entries]);

  // Empty after a clear: the empty text comes in once the places have shut.
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const hadRows = useRef(entries.length > 0);
  useLayoutEffect(() => {
    const empty = emptyRef.current;
    if (entries.length === 0 && hadRows.current && empty) {
      playContentSwap({
        out: null,
        in: empty,
        axis: 'y',
        direction: 1,
        timeScale,
        reduced,
      });
    }
    hadRows.current = entries.length > 0;
  }, [entries.length, timeScale, reduced]);

  /* ── the surface: the snap from its trigger ──────────────────────────── */

  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(ref, {
    profile: () => floatingOrSurface(ref.current, PROFILE),
    reduced,
    timeScale,
    shadow: elevation,
  });
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const a = latest.current.triggerButtonRef?.current;
    el.style.left = '0px';
    el.style.top = '0px';
    const r = el.getBoundingClientRect();
    const anchor =
      a?.getBoundingClientRect() ??
      new DOMRect(window.innerWidth - 8, 0, 0, 48);
    const at = placeOnAnchor(
      anchor,
      { w: Math.ceil(r.width), h: Math.ceil(r.height) },
      latest.current.align
    );
    const dpr = window.devicePixelRatio || 1;
    el.style.left = `${Math.round(at.left * dpr) / dpr}px`;
    el.style.top = `${Math.round(at.top * dpr) / dpr}px`;
  };
  useFloatingPresence(surface, {
    open,
    enter: () => {
      const a =
        latest.current.triggerButtonRef?.current?.getBoundingClientRect();
      surface.open({
        cause: a ? { x: a.left + a.width / 2, y: a.top + a.height / 2 } : null,
        place,
      });
      ref.current?.focus({ preventScroll: true });
    },
    leave: () => (ref.current ? undefined : false),
    onExited: () => latest.current.onExited(),
  });

  /* ── closing: a press outside, Escape ────────────────────────────────── */

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (
        ref.current?.contains(t) ||
        latest.current.triggerButtonRef?.current?.contains(t)
      )
        return;
      if (t instanceof Element && t.closest('[data-cds-menu], .sel__tip'))
        return;
      latest.current.onClickOutside?.();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || isComposing(e)) return;
      const t = e.target as Node | null;
      if (
        t &&
        t !== document.body &&
        !ref.current?.contains(t) &&
        !latest.current.triggerButtonRef?.current?.contains(t)
      )
        return;
      e.preventDefault();
      latest.current.onClickOutside?.();
      latest.current.triggerButtonRef?.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, latest]);

  /* ── render ──────────────────────────────────────────────────────────── */

  // A button that goes with what it does (Clear finished, a job's Cancel) hands its focus to the
  // tray first.
  const holdFocus = () => ref.current?.focus({ preventScroll: true });
  const finished = entries.some((e) => !e.leaving && !jobActive(e.job));
  const label = (s: JobStatus) => statusLabels?.[s] ?? JOB_STATUS[s].label;
  const labels = statusLabels
    ? (Object.keys(JOB_STATUS) as JobStatus[]).map(label)
    : LABELS;

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={cx('cds-jobs', className)}>
      <span className="cds-jobs__frame" {...SNAP_FRAME} />
      <div className="cds-jobs__content">
        <header className="cds-jobs__header">
          <h2 className="cds-jobs__title">{title}</h2>
          {finished && onClearFinished && (
            <Button
              frame="ghost"
              size="sm"
              onClick={() => {
                holdFocus();
                onClearFinished();
              }}
              timeScale={timeScale}>
              {clearFinishedLabel}
            </Button>
          )}
        </header>
        <Scroller
          className="cds-jobs__scroller"
          viewportClassName="cds-jobs__body"
          focusable={false}
          timeScale={timeScale}>
          {entries.length === 0 ? (
            <p ref={emptyRef} className="cds-jobs__empty">
              {emptyText}
            </p>
          ) : (
            <div ref={listRef} className="cds-jobs__list" role="list">
              {entries.map(({ job, leaving }) => (
                <JobRow
                  key={job.id}
                  job={job}
                  leaving={leaving}
                  statusLabel={label(job.status)}
                  labels={labels}
                  cancelLabel={cancelLabel}
                  retryLabel={retryLabel}
                  onCancel={
                    onCancel &&
                    ((j) => {
                      holdFocus();
                      onCancel(j);
                    })
                  }
                  onRetry={onRetry}
                  timeScale={timeScale}
                />
              ))}
            </div>
          )}
        </Scroller>
      </div>
    </div>
  );
}

function JobRow({
  job,
  leaving,
  statusLabel,
  labels,
  cancelLabel,
  retryLabel,
  onCancel,
  onRetry,
  timeScale,
}: {
  job: Job;
  leaving: boolean;
  statusLabel: string;
  labels: string[];
  cancelLabel: string;
  retryLabel: string;
  onCancel?: (job: Job) => void;
  onRetry?: (job: Job) => void;
  timeScale: number;
}) {
  const s = JOB_STATUS[job.status];
  const active = jobActive(job);
  const canCancel = active && (job.cancelable ?? true) && !!onCancel;
  const canRetry =
    (job.status === 'failed' || job.status === 'cancelled') &&
    (job.retryable ?? true) &&
    !!onRetry;
  // Done, the bar sits full; queued, empty; running, its value (none: indeterminate).
  const value =
    job.status === 'finished'
      ? 100
      : job.status === 'queued'
        ? 0
        : job.progress;
  return (
    <div
      className="cds-jobs__job"
      role="listitem"
      data-job={job.id}
      data-status={job.status}
      data-leaving={leaving || undefined}
      {...inertProps(leaving)}>
      <div className="cds-jobs__job-content">
        <div className="cds-jobs__job-head">
          <div className="cds-jobs__job-text">
            <p className="cds-jobs__job-title">{job.title}</p>
            {(job.status === 'failed' && job.error) || job.description ? (
              <p className="cds-jobs__job-desc">
                {job.status === 'failed' && job.error
                  ? job.error
                  : job.description}
              </p>
            ) : null}
          </div>
          {canCancel && (
            <IconButton
              frame="ghost"
              size="sm"
              corners="full"
              align="left"
              label={`${cancelLabel} ${job.title}`}
              timeScale={timeScale}
              onClick={() => onCancel!(job)}>
              <Close size={16} aria-hidden="true" />
            </IconButton>
          )}
          {canRetry && (
            <IconButton
              frame="ghost"
              size="sm"
              corners="full"
              align="left"
              label={`${retryLabel} ${job.title}`}
              timeScale={timeScale}
              onClick={() => onRetry!(job)}>
              <Restart size={16} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        <ProgressBar
          className="cds-jobs__bar"
          label={job.title}
          hideLabel
          mark={false}
          size="small"
          value={value}
          status={s.bar}
        />
        <div className="cds-jobs__job-meta">
          <StatusIndicator
            size="sm"
            kind={s.kind}
            label={statusLabel}
            labels={labels}
          />
          {job.status === 'running' && job.progress != null && (
            <span className="cds-jobs__pct">{Math.round(job.progress)}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
