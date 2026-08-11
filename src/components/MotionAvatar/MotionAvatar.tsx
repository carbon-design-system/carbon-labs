/**
 * Copyright IBM Corp. 2025
 *
 * MotionAvatar — animated presence indicator for AI states.
 */

import cx from 'clsx';
import styles from './MotionAvatar.module.css';

export type MotionAvatarState = 'idle' | 'thinking' | 'responding';
export type MotionAvatarSize = 'sm' | 'md' | 'lg';

export interface MotionAvatarProps {
  /** Current AI presence state */
  state?: MotionAvatarState;
  /** Visual size */
  size?: MotionAvatarSize;
  /** Accessible label */
  label?: string;
  /** Additional class name applied to the root element */
  className?: string;
}

const ICON_SIZE: Record<MotionAvatarSize, number> = { sm: 10, md: 16, lg: 24 };

const STATE_LABEL: Record<MotionAvatarState, string> = {
  idle: 'Ready',
  thinking: 'Thinking',
  responding: 'Responding',
};

/** Spark / AI glyph icon */
function SparkIcon({ size }: { size: number }) {
  return (
    <svg
      className={styles.glyph}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {/* IBM Watson spark mark */}
      <path d="M8 1 9.5 6.5 15 8 9.5 9.5 8 15 6.5 9.5 1 8 6.5 6.5z" />
    </svg>
  );
}

/**
 * MotionAvatar renders a circular avatar that animates differently depending
 * on the current AI interaction state (idle / thinking / responding).
 */
export function MotionAvatar({
  state = 'idle',
  size = 'md',
  label,
  className,
}: MotionAvatarProps) {
  const displayLabel = label ?? STATE_LABEL[state];
  const iconSize = ICON_SIZE[size];

  return (
    <div
      className={cx(
        styles.root,
        styles[size],
        styles[state],
        className,
      )}
      role="img"
      aria-label={displayLabel}
    >
      {state === 'idle' && (
        <span className={styles.idlePulse} aria-hidden="true" />
      )}
      {state === 'responding' && (
        <span className={styles.wave} aria-hidden="true" />
      )}
      <SparkIcon size={iconSize} />
      <span className={styles.srOnly}>{displayLabel}</span>
    </div>
  );
}

export default MotionAvatar;
