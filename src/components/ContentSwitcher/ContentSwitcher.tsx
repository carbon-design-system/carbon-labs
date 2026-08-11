/**
 * Copyright IBM Corp. 2025
 *
 * ContentSwitcher — segmented control with a sliding indicator.
 */

import React, { useRef } from 'react';
import cx from 'clsx';
import styles from './ContentSwitcher.module.css';
import type {
  ContentSwitcherProps,
  ContentSwitcherOption,
  ContentSwitcherSize,
} from './ContentSwitcher.types';

export type { ContentSwitcherProps, ContentSwitcherOption, ContentSwitcherSize };

/**
 * ContentSwitcher renders a row of mutually exclusive options styled as a
 * segmented control. The selected item is highlighted; keyboard navigation
 * follows the ARIA tab-like pattern with arrow keys.
 */
export function ContentSwitcher({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel = 'Options',
  className,
}: ContentSwitcherProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const enabledOptions = options.filter((o) => !o.disabled);
    const enabledIndex = enabledOptions.findIndex(
      (o) => o.value === options[currentIndex].value,
    );

    let nextEnabledIndex = enabledIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextEnabledIndex = (enabledIndex + 1) % enabledOptions.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextEnabledIndex =
        (enabledIndex - 1 + enabledOptions.length) % enabledOptions.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextEnabledIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextEnabledIndex = enabledOptions.length - 1;
    } else {
      return;
    }

    const nextOption = enabledOptions[nextEnabledIndex];
    onChange(nextOption.value);

    // Move focus to the newly selected button
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled)',
    );
    buttons?.[nextEnabledIndex]?.focus();
  }

  return (
    <div
      ref={listRef}
      className={cx(styles.root, styles[size], className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={option.disabled}
            className={cx(styles.button, isSelected && styles.buttonSelected)}
            onClick={() => !option.disabled && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={isSelected ? 0 : -1}
          >
            <span className={styles.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ContentSwitcher;
