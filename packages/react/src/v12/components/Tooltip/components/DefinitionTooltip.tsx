/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  type TooltipAlign,
  type TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import { chain, mergeRefs, useTooltipTrigger } from '@carbon-labs/v12-motion';
import { useStillTrigger } from './still';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tooltip.scss';

/* ============================================================================
 * DefinitionTooltip — Carbon v11's DefinitionTooltip: a term with a dotted
 * underline whose definition opens on click, Enter / Space and focus (and on
 * hover with `openOnHover`), with the tooltip's motion: the snap in from the
 * pointer (from the term from the keyboard), out toward it.
 *
 * v11's props: `definition` (or the deprecated `tooltipText`), `align`
 * (default `bottom`), `autoAlign`, `defaultOpen`, `openOnHover`, `id`,
 * `triggerClassName`. The term is a button with `aria-expanded`,
 * `aria-controls` and `aria-describedby`, as in v11.
 *
 * Opens on KEYBOARD focus only (v11 opens on any focus; a click
 * toggles it here, so a mouse focus would open it twice); hover waits v11's
 * Tooltip delays (100 in, 300 out) so the pointer can reach the definition
 * (v11 opens and closes at once). Never part of a TooltipGroup.
 * ========================================================================== */

export interface DefinitionTooltipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'id' | 'children' | 'type'
> {
  /** Default `bottom` (v11). */
  align?: TooltipAlign | TooltipAlignDeprecated;
  autoAlign?: boolean;
  /** The term being defined. */
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  /** The definition. */
  definition?: ReactNode;
  /** The definition's id. */
  id?: string;
  /** Open on hover too. Default false (v11). */
  openOnHover?: boolean;
  /** @deprecated in v11 for `definition`. */
  tooltipText?: ReactNode;
  /** Classes on the term. */
  triggerClassName?: string;
  /** The outlined surface: a 1px hairline, the inverse fill mixed 12% toward its text. Default none (or the enclosing `TooltipMotion`'s). */
  outline?: boolean;
}

export function DefinitionTooltip({
  align = 'bottom',
  autoAlign,
  children,
  className,
  defaultOpen = false,
  definition,
  id,
  openOnHover = false,
  tooltipText,
  triggerClassName,
  outline,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  ...rest
}: DefinitionTooltipProps) {
  const {
    props: t,
    tooltip,
    open,
    id: tipId,
  } = useTooltipTrigger({
    description: tooltipText ?? definition,
    align,
    autoAlign,
    enterDelayMs: 100,
    leaveDelayMs: 300,
    defaultOpen,
    openOnHover,
    toggleOnClick: true,
    group: false,
    id,
    role: null,
    wrap: true,
    tooltipClassName: 'cds-definition__tip',
    outline,
  });
  type H = (e: never) => void;
  // A hover that arrives under a pointer that has not moved waits for it to move (tooltip/still.ts).
  const gated = useStillTrigger(t);

  // The underline's dots (tooltip.scss): counted once from the term's width
  // at rest, so when it widens on opening its gaps grow and its dots don't.
  const term = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = term.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const count = () => {
      // 2px dots on a ~4px pitch.
      el.style.setProperty(
        '--_dots',
        String(Math.max(2, Math.round(el.offsetWidth / 4)))
      );
    };
    count();
    const ro = new ResizeObserver(count);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      className={['cds-tooltip', 'cds-definition', className]
        .filter(Boolean)
        .join(' ')}>
      <button
        {...rest}
        ref={mergeRefs<HTMLButtonElement>(t.ref, term)}
        type="button"
        className={['cds-definition__term', triggerClassName]
          .filter(Boolean)
          .join(' ')}
        aria-controls={tipId}
        aria-describedby={tipId}
        aria-expanded={open}
        onPointerEnter={chain(gated.onPointerEnter as H, onPointerEnter as H)}
        onPointerLeave={chain(gated.onPointerLeave as H, onPointerLeave as H)}
        onFocus={chain(t.onFocus as H, onFocus as H)}
        onBlur={chain(t.onBlur as H, onBlur as H)}
        onClick={chain(t.onClick as H, onClick as H)}
        onKeyDown={chain(t.onKeyDown as H, onKeyDown as H)}>
        {children}
      </button>
      {tooltip}
    </span>
  );
}
DefinitionTooltip.displayName = 'DefinitionTooltip';
