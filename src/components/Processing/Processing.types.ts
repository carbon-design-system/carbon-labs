/**
 * Copyright IBM Corp. 2025
 *
 * Processing — in-progress state indicator with status transitions.
 */

export type ProcessingStatus = 'active' | 'complete' | 'error';
export type ProcessingSize = 'sm' | 'md' | 'lg';

export interface ProcessingProps {
  /** Current processing status */
  status?: ProcessingStatus;
  /** Accessible label describing what is being processed */
  label?: string;
  /** Visual size */
  size?: ProcessingSize;
  /** Hide the label visually (still read by screen readers) */
  hideLabel?: boolean;
  /** Additional class name applied to the root element */
  className?: string;
}
