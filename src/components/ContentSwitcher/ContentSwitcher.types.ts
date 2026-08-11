/**
 * Copyright IBM Corp. 2025
 *
 * ContentSwitcher — segmented control with a sliding indicator.
 */

export interface ContentSwitcherOption {
  /** Visible label */
  label: string;
  /** Unique value used in onChange */
  value: string;
  /** Disable this option */
  disabled?: boolean;
}

export type ContentSwitcherSize = 'sm' | 'md' | 'lg';

export interface ContentSwitcherProps {
  /** Array of options to render */
  options: ContentSwitcherOption[];
  /** Currently selected value */
  value: string;
  /** Called with the new value when the user changes selection */
  onChange: (value: string) => void;
  /** Visual size */
  size?: ContentSwitcherSize;
  /** Accessible label for the group */
  ariaLabel?: string;
  /** Additional class name applied to the root element */
  className?: string;
}
