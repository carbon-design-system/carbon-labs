/**
 * Copyright IBM Corp. 2025
 *
 * IndeterminateBarLoader — linear indeterminate progress bar.
 */

import cx from 'clsx';
import styles from './IndeterminateBarLoader.module.css';

export interface IndeterminateBarLoaderProps {
  /** Whether the loader is actively animating */
  active?: boolean;
  /** Accessible label (shown visually below the bar unless hideLabel is set) */
  label?: string;
  /** Hide the label visually (still read by screen readers) */
  hideLabel?: boolean;
  /** Additional class name applied to the root element */
  className?: string;
}

/**
 * IndeterminateBarLoader renders a horizontally sliding bar that communicates
 * an operation of unknown duration.
 */
export function IndeterminateBarLoader({
  active = true,
  label = 'Loading',
  hideLabel = false,
  className,
}: IndeterminateBarLoaderProps) {
  return (
    <div
      className={cx(styles.root, className)}
      role="status"
      aria-busy={active}
      aria-live="polite"
      aria-label={label}
    >
      {label && (
        <span className={hideLabel ? styles.srOnly : styles.label}>
          {label}
        </span>
      )}
      <div className={styles.track} aria-hidden="true">
        {active && <div className={styles.fill} />}
      </div>
    </div>
  );
}

export default IndeterminateBarLoader;
