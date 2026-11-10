/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ReactNode } from 'react';
import type {
  FieldStatus,
  NormalizedFieldProps,
} from '@carbon-labs/v12-motion';
import type { FieldFrame as FieldFrameKind } from '@carbon-labs/react-props';
import { FieldMessage } from '@carbon-labs/react-text-input';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import './dropdown.scss';

/* ============================================================================
 * What a Dropdown and a ComboBox share with the text input: its label row,
 * its field (TextInput's classes: the fill, the hairline's ladder, focus,
 * the error's border, sizes, corners), the status mark's slot and the one
 * message line. The control inside —
 * a button or an input — is the caller's.
 * ========================================================================== */

export type ListboxSize = 'xs' | 'sm' | 'md' | 'lg';

/** v11's `defaultItemToString`: a string, a number, or an object's `label`. */
export function defaultItemToString(item: unknown): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return `${item}`;
  if (
    item &&
    typeof item === 'object' &&
    'label' in item &&
    typeof item.label === 'string'
  )
    return item.label;
  return '';
}

/** v11's `isItemDisabled`: an object item with `disabled: true`. */
export const isItemDisabled = (item: unknown): boolean =>
  !!item &&
  typeof item === 'object' &&
  'disabled' in item &&
  item.disabled === true;

/** Where `item` is in `items`: by identity, else by its string (an item made afresh each render). */
export function indexOfItem<Item>(
  items: Item[],
  item: Item | null | undefined,
  toString: (item: Item | null) => string
): number {
  if (item === null || item === undefined) return -1;
  const i = items.indexOf(item);
  if (i >= 0) return i;
  const s = toString(item);
  return s ? items.findIndex((x) => toString(x) === s) : -1;
}

export interface FieldFrameProps {
  /** The control's id (the label's `htmlFor` when `labelFor`). */
  id: string;
  labelId: string;
  titleText?: ReactNode;
  hideLabel?: boolean;
  /** The label names the control by `htmlFor` (an input); a button takes `aria-labelledby` instead. */
  labelFor?: boolean;
  /** A press on the label (a button can't be a label's control without the label clicking it). */
  onLabelClick?: () => void;
  helperText?: ReactNode;
  warnText?: ReactNode;
  invalidText?: ReactNode;
  shown: FieldStatus;
  norm: NormalizedFieldProps;
  size: ListboxSize;
  inline?: boolean;
  readOnly?: boolean;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  corners?: 'full' | 'rounded' | 'square';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  frame?: FieldFrameKind;
  className?: string;
  variantClass: string;
  /** The field: the caller renders it (it holds the control, the mark and the trailing controls). */
  children: ReactNode;
  /** The wrapper's other attributes (v11 spreads the rest on it). */
  rest?: Record<string, unknown>;
}

export function FieldFrame(p: FieldFrameProps) {
  const hasLabel =
    p.titleText !== undefined && p.titleText !== null && p.titleText !== '';
  const labelRow = hasLabel ? (
    <div
      className={[
        'cds-field-label-row',
        p.hideLabel && 'cds-field-label-row--hidden',
      ]
        .filter(Boolean)
        .join(' ')}>
      <label
        id={p.labelId}
        htmlFor={p.labelFor ? p.id : undefined}
        onClick={p.onLabelClick}
        className={[
          'cds-field-label',
          p.hideLabel && 'cds-field-visually-hidden',
          p.norm.disabled && 'cds-field-label--disabled',
        ]
          .filter(Boolean)
          .join(' ')}>
        {p.titleText}
      </label>
    </div>
  ) : null;
  const classes = [
    'cds-text-input',
    `cds-text-input--${p.size}`,
    p.variantClass,
    p.inline && `${p.variantClass}--inline`,
    p.readOnly && 'cds-text-input--readonly',
    p.norm.disabled && 'cds-text-input--disabled',
    p.corners === 'square' && 'cds-text-input--square',
    p.corners === 'full' && 'cds-text-input--full',
    p.frame === 'ghost' && 'cds-text-input--ghost',
    p.className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div {...p.rest} className={classes} data-status={p.shown}>
      {labelRow}
      <div className="cds-text-input__outer">
        {p.children}
        <FieldMessage
          status={p.shown}
          // v11: an inline dropdown shows no helper text.
          helperText={p.inline ? undefined : p.helperText}
          warnText={p.warnText}
          invalidText={p.invalidText}
          helperId={p.norm.helperId}
          warnId={p.norm.warnId}
          invalidId={p.norm.invalidId}
          disabled={p.norm.disabled}
        />
      </div>
    </div>
  );
}
