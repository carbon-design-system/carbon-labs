/**
 * Copyright IBM Corp. 2025
 *
 * UniversalPromptBar — AI prompt input bar.
 */

import React, { useId } from 'react';
import cx from 'clsx';
import styles from './UniversalPromptBar.module.css';

export interface UniversalPromptBarProps {
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Controlled input value */
  value?: string;
  /** Called on every input change */
  onChange?: (value: string) => void;
  /** Called when the user submits (Enter key or submit button) */
  onSubmit?: (value: string) => void;
  /** Disable the entire bar */
  disabled?: boolean;
  /** Accessible label for the input */
  label?: string;
  /** Additional class name applied to the root element */
  className?: string;
}

/** Send / submit icon (16×16) */
function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M13.8 7.6 2.2 2l1.1 5.3H9v1.4H3.3L2.2 14z" />
    </svg>
  );
}

/**
 * UniversalPromptBar renders a text input styled as an AI prompt entry field
 * with a submit button. It supports controlled usage and keyboard submission.
 */
export function UniversalPromptBar({
  placeholder = 'Ask anything…',
  value = '',
  onChange,
  onSubmit,
  disabled = false,
  label = 'Prompt',
  className,
}: UniversalPromptBarProps) {
  const inputId = useId();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSubmit?.(value);
    }
  }

  return (
    <div
      className={cx(styles.root, disabled && styles.disabled, className)}
      role="search"
    >
      <label htmlFor={inputId} className="sr-only" style={{ display: 'none' }}>
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className={styles.submitButton}
        disabled={disabled || value.trim().length === 0}
        aria-label="Submit prompt"
        onClick={() => onSubmit?.(value)}
      >
        <SendIcon />
      </button>
    </div>
  );
}

export default UniversalPromptBar;
