/**
 * Copyright IBM Corp. 2025
 *
 * LoadingSpinner — indeterminate circular spinner.
 */

import cx from 'clsx';
import styles from './LoadingSpinner.module.css';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  /** Visual size */
  size?: LoadingSpinnerSize;
  /** Accessible description (screen reader only) */
  description?: string;
  /** Additional class name applied to the root element */
  className?: string;
}

const DIMS: Record<LoadingSpinnerSize, { r: number; cx: number; cy: number; sw: number }> = {
  sm: { r: 6,  cx: 8,  cy: 8,  sw: 2 },
  md: { r: 9,  cx: 12, cy: 12, sw: 2 },
  lg: { r: 15, cx: 20, cy: 20, sw: 3 },
};

const VIEWBOX: Record<LoadingSpinnerSize, string> = {
  sm: '0 0 16 16',
  md: '0 0 24 24',
  lg: '0 0 40 40',
};

/**
 * LoadingSpinner renders an animated SVG circle that communicates an
 * indeterminate loading state.
 */
export function LoadingSpinner({
  size = 'md',
  description = 'Loading',
  className,
}: LoadingSpinnerProps) {
  const { r, cx: svgCx, cy: svgCy, sw } = DIMS[size];
  const circumference = 2 * Math.PI * r;
  // Show ~¼ of the circle as the fill arc
  const dashArray = `${circumference * 0.25} ${circumference * 0.75}`;

  return (
    <div
      className={cx(styles.root, styles[size], className)}
      role="status"
      aria-label={description}
    >
      <svg
        className={styles.svg}
        viewBox={VIEWBOX[size]}
        aria-hidden="true"
        focusable="false"
      >
        {/* Track (full circle) */}
        <circle
          className={styles.track}
          cx={svgCx}
          cy={svgCy}
          r={r}
          strokeWidth={sw}
        />
        {/* Animated fill arc */}
        <circle
          className={styles.fill}
          cx={svgCx}
          cy={svgCy}
          r={r}
          strokeWidth={sw}
          strokeDasharray={dashArray}
          strokeDashoffset={0}
        />
      </svg>
      <span className={styles.srOnly}>{description}</span>
    </div>
  );
}

export default LoadingSpinner;
