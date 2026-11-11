/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useContext,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import type { TagCorners, TagSize, TagType } from './Tag';
import './tag.scss';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * SelectableTag — Carbon v11's SelectableTag: a tag the person turns on and
 * off (a filter, one of a set of choices), on the family's motion.
 *
 *   rest       an outline pill on the quiet hairline, text primary
 *   hover      the rollover: a glow under the cursor, a flat press, a
 *              release from the point of release
 *   selected   the inverse fill, as a selector: its hover and press are
 *              toned steps of that fill, not the gray of the page
 *   motion     the fill changes on the rollover's clocks; it never moves
 *
 *   type       one of v11's tag colors makes it toned,
 *              as the Button's tertiary is. Off, an outline and label in
 *              the color's tag ink, hover and press tints of it; on, the
 *              colored Tag's own fill, its hover v11's tag hover color
 *
 * v11's props: `text` (or children), `selected`, `onChange(selected)`,
 * `size` (`sm` · `md` · `lg`), `disabled`, `id`, `className`. `type` and
 * `corners` are the kit's (v11's SelectableTag is neutral only).
 * ========================================================================== */

export interface SelectableTagProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type'
> {
  text?: ReactNode;
  children?: ReactNode;
  selected?: boolean;
  /** v11: called with the new selected state. */
  onChange?: (selected: boolean) => void;
  size?: TagSize;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `full` (the pill, default), `rounded` (2px) or `square`, as the Tag. */
  corners?: TagCorners;
  /** A tag color: toned off, the colored Tag's fill on. Default neutral. */
  type?: SelectableTagType;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
  /** An icon before the text. */
  renderIcon?: import('react').ElementType;
}

/** The colors a SelectableTag can take: v11's tag hues. */
export type SelectableTagType = Exclude<
  TagType,
  'high-contrast' | 'outline' | 'success' | 'warning'
>;

export function SelectableTag({
  text,
  children,
  selected = false,
  onChange,
  size = 'md',
  corners = 'full',
  type,
  disabled,
  className,
  onClick,
  timeScale,
  renderIcon: Icon,
  ...rest
}: SelectableTagProps) {
  const el = useRef<HTMLButtonElement>(null);
  const rolloverReduced = useReducedGetter(
    useContext(TooltipMotionContext).reduced
  );

  useEffect(() => {
    const node = el.current;
    if (!node || disabled) return;
    return attachRollover(node, {
      selector: '.cds-tag--selectable',
      // Its own toned steps (tag.scss): matched lightness from a transparent
      // rest would be the page's gray.
      colors: 'tokens',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [disabled, timeScale, rolloverReduced]);

  return (
    <button
      ref={el}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={[
        'cds-tag',
        `cds-tag--${size}`,
        Icon && 'cds-tag--icon',
        corners !== 'full' && `cds-tag--${corners}`,
        'cds-tag--selectable',
        type && `cds-tag--toned cds-tag--tone-${type}`,
        selected && 'cds-tag--selected',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onChange?.(!selected);
      }}
      {...rest}>
      {Icon && (
        <span className="cds-tag__icon" aria-hidden="true">
          <Icon
            size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16}
            animated={false}
          />
        </span>
      )}
      {children ?? text}
    </button>
  );
}
