/**
 * Copyright IBM Corp. 2025
 *
 * Processing — in-progress state indicator with status transitions.
 */

import cx from 'clsx';
import styles from './Processing.module.css';
import type { ProcessingProps, ProcessingStatus, ProcessingSize } from './Processing.types';

export type { ProcessingProps, ProcessingStatus, ProcessingSize };

const STATUS_LABEL: Record<ProcessingStatus, string> = {
  active: 'Processing',
  complete: 'Complete',
  error: 'Error',
};

/** Checkmark icon (16×16) */
function IconCheck({ size }: { size: number }) {
  return (
    <svg
      className={styles.icon}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.5 12 2 7.5l1.4-1.4L6.5 9.2l6.1-6.1L14 4.5z" />
    </svg>
  );
}

/** Error cross icon (16×16) */
function IconError({ size }: { size: number }) {
  return (
    <svg
      className={styles.icon}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 4.7 11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" />
    </svg>
  );
}

const ICON_SIZE: Record<ProcessingSize, number> = { sm: 8, md: 12, lg: 16 };
const SIZE_CLASS: Record<ProcessingSize, string> = { sm: styles.sm, md: styles.md, lg: styles.lg };
const STATUS_CLASS: Record<ProcessingStatus, string> = {
  active: styles.statusActive,
  complete: styles.statusComplete,
  error: styles.statusError,
};

/**
 * Processing renders an animated indicator that communicates an in-progress
 * operation and its current status (active / complete / error).
 */
export function Processing({
  status = 'active',
  label,
  size = 'md',
  hideLabel = false,
  className,
}: ProcessingProps) {
  const displayLabel = label ?? STATUS_LABEL[status];
  const iconSize = ICON_SIZE[size];

  return (
    <div
      className={cx(
        styles.root,
        SIZE_CLASS[size],
        STATUS_CLASS[status],
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={displayLabel}
    >
      <div className={styles.indicator}>
        {status === 'active' && <span className={styles.ring} aria-hidden="true" />}
        {status === 'complete' && <IconCheck size={iconSize} />}
        {status === 'error' && <IconError size={iconSize} />}
      </div>
      <span className={hideLabel ? styles.srOnly : styles.label}>
        {displayLabel}
      </span>
    </div>
  );
}

export default Processing;
