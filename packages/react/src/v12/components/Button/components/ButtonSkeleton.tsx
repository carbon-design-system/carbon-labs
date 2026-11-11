/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useRef, type HTMLAttributes } from 'react';
import { useSkeletonBlocks } from '@carbon-labs/react-feedback';
import type { ButtonCorners, ButtonKind, ButtonSize } from './Button';
import {
  resolveButtonLook,
  type ButtonFrame,
  type ButtonVariant,
} from '@carbon-labs/react-props';
import './button.scss';

/* ============================================================================
 * ButtonSkeleton — v11's ButtonSkeleton, on the loading standard
 * ============================================================================
 *
 * v11's props: `size` (default lg), `small` (= sm), `href` (an `<a
 * role="button">`), `className`; v11's 150px width.
 *
 * The kit's: the block is the
 * button's own box (the same size class, so the same height, and its
 * corner), and a skeleton-wave block (`data-skeleton`, `aria-hidden`): it
 * pulses on the page's one wave, with no shimmer of its own.
 * ========================================================================== */

export interface ButtonSkeletonProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** The button's corner. Default 'full', as the Button's. */
  corners?: ButtonCorners;
  href?: string;
  /** Default lg (v11). */
  size?: ButtonSize;
  /** v11's old name for sm. */
  small?: boolean;
  /**
   * The button's label, so the skeleton is exactly that button's
   * box (its padding round the label, hidden). Without it, v11's 150px.
   */
  label?: string;
  // @carbon-proposal api: button-axes — Button splits the old kinds into `kind` (the role), `variant` (outlined, tonal) and `frame` (ghost, none), so each prop says one thing. TBD
  /** With `label`: the button's role. */
  kind?: ButtonKind;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** With `label`: the button's treatment. */
  variant?: ButtonVariant;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** With `label`: the button's frame (a ghost's or text button's end padding). */
  frame?: ButtonFrame;
  /** With `label`: the button's expressive type. */
  isExpressive?: boolean;
  /**
   * With `label`, the button has an icon (`renderIcon`), so a
   * pill keeps the icon's room at its end. Default false: a label-only pill
   * has the pill's inset at both ends, as the Button without an icon.
   */
  hasIcon?: boolean;
}

export function ButtonSkeleton({
  className,
  corners = 'full',
  href,
  size = 'lg',
  small = false,
  label,
  kind,
  variant,
  frame,
  isExpressive = false,
  hasIcon = false,
  ...rest
}: ButtonSkeletonProps) {
  const ref = useRef<HTMLElement | null>(null);
  useSkeletonBlocks(ref);
  const props = {
    ...rest,
    ref: (el: HTMLElement | null) => void (ref.current = el),
    className: [
      'fb-skeleton',
      'cds-btn-skeleton',
      `cds-btn--${small ? 'sm' : size}`,
      corners !== 'rounded' && `cds-btn--${corners}`,
      label != null && 'cds-btn-skeleton--sized',
      label != null &&
        (kind ?? variant ?? frame) &&
        `cds-btn--${resolveButtonLook({ kind, variant, frame })}`,
      label != null && isExpressive && 'cds-btn--expressive',
      label != null && !hasIcon && 'cds-btn--no-icon',
      className,
    ]
      .filter(Boolean)
      .join(' '),
    'data-skeleton': '',
    'aria-hidden': true,
  };
  const sized =
    label != null ? (
      <span className="cds-btn-skeleton__label">{label}</span>
    ) : null;
  return href ? (
    <a {...props} href={href} role="button">
      {sized}
    </a>
  ) : (
    <div {...props}>{sized}</div>
  );
}
