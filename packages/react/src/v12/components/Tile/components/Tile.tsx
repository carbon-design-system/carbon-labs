/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { ArrowRight } from '@carbon-labs/react-motion-icons';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { mergeRefs } from '@carbon-labs/v12-motion';
import { quietSteps } from '@carbon-labs/react-util';
import './tile.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Tile, ClickableTile, SelectableTile — Carbon v11's, on the kit's look:
 * the standard for cards and tiles you click or select: one selection look
 * for every card, and a hover that never washes out the content.
 *
 *   shape     8px corners, 16px in
 *   surface   the kit's standard surface, `--cds-surface` (the side nav's)
 *   hover     by content (the rule for controls inside a surface):
 *             a text tile's rollover is painted BEHIND the content, quiet
 *             matched-lightness steps of its fill (`hoverSteps`), growing 1px
 *             and pressing 1px in; a tile holding controls or a checkbox
 *             shows a 1px `$border-strong-01` ring, keeps its fill, no press
 *   selected  a steady 2px ring in the selection color
 *             (`$layer-selected-inverse`, the family's selector) on the
 *             tile's edge, and its checkbox on: on top of the hover
 *   nested    controls inside a tile (a field, a button, a graph's handle)
 *             answer their own presses, and a click on one never toggles or
 *             follows the tile. Over one, the tile is at rest
 *             (styles/_rollover.scss, NESTED CONTROLS); its own checkbox or
 *             radio (`data-rollover-own`) keeps its hover
 *   keyboard  ClickableTile is a link or a button (Enter, Space); a
 *             SelectableTile's checkbox is its tab stop (Space or Enter),
 *             the controls inside follow it. The ring is the kit's: 2px
 *             `$text-primary`, 2px outside the tile
 *   disabled  no hover; the content `$text-disabled`; a disabled link tile
 *             keeps the link role
 *   decorator v11's AI-label slot (`decorator` / `slug`) is accepted and
 *             renders nothing: the kit doesn't use the AI label or AI
 *             styling. The props stay so v11 code compiles and runs
 *
 * v11's props: Tile `children`, `className`; ClickableTile `href`,
 * `clicked`, `disabled`, `renderIcon`, `onClick`, `onKeyDown`, `rel`
 * (`noopener` by default with `target="_blank"`), and the kit's
 * `footer` (content on the icon's row); SelectableTile `id`,
 * `selected`, `disabled`, `onChange(event, selected, id)`, `onClick`,
 * `onKeyDown`, `title`, `name`, `value`, `tabIndex`. On all: `decorator` and
 * `slug` (no AI label, above), `light` (deprecated) and `hasRoundedCorners`
 * are accepted with no effect (corners are always round here). RadioTile and TileGroup: RadioTile.tsx; ExpandableTile:
 * ExpandableTile.tsx. v11's SelectableTile forbids interactive children;
 * this one allows them.
 * ========================================================================== */

/** What answers its own press inside a tile (the rollover's NESTED, plus graphs' marks). */
const NESTED =
  'a[href], button, input, select, textarea, summary, label, [contenteditable], ' +
  '[role="button"], [role="slider"], [role="tab"], [role="menuitem"], [role="option"], ' +
  '[role="checkbox"], [data-rollover-nested]';

/** Whether an event started on a control inside `tile` (not the tile itself). Shared with RadioTile. */
export function fromNested(
  tile: HTMLElement,
  target: EventTarget | null
): boolean {
  const el = target instanceof Element ? target.closest(NESTED) : null;
  return !!el && el !== tile && tile.contains(el);
}

/**
 * How far a tile's hover and press step from its fill: `quiet`
 * (default) is half the house steps — hover 4.5 L* on the light and dark
 * themes alike, press twice that — on top of the rollover's own easing
 * for big surfaces; `standard` is the house steps, as every other control.
 */
export type TileHoverSteps = 'quiet' | 'standard';

/**
 * The rollover on a tile or card, unless disabled. `press: false` for a
 * surface that changes size when clicked (ExpandableTile): the hover only,
 * no pressed colour or release circle over a growing surface.
 */
export function useTileRollover(
  ref: React.RefObject<HTMLElement | null>,
  off: boolean,
  hoverSteps: TileHoverSteps = 'quiet',
  timeScale?: number,
  selector = '.cds-kit-tile, .cds-kit-card',
  press = true
) {
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = ref.current;
    if (!node || off) return;
    return attachRollover(node, {
      selector,
      steps: hoverSteps === 'quiet' ? quietSteps() : undefined,
      timeScale,
      press,
      reduced: rolloverReduced,
    });
  }, [ref, off, hoverSteps, timeScale, rolloverReduced, selector, press]);
}

/**
 * The props v11 has that don't apply here: accepted, so v11 code runs
 * unchanged, and nothing is rendered for them.
 */
export interface TileDecoratorProps {
  /**
   * v11's AI-label slot. Accepted; renders nothing: the kit doesn't use
   * the AI label or AI styling.
   */
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. Accepted; renders nothing. */
  slug?: ReactNode;
  /** @deprecated v11: a `Layer` does this. Accepted; no effect. */
  light?: boolean;
  /** v11: round corners beside a decorator. Accepted; tiles are always round. */
  hasRoundedCorners?: boolean;
}

export interface TileProps
  extends HTMLAttributes<HTMLDivElement>, TileDecoratorProps {
  children?: ReactNode;
}

/** A plain tile: a surface for content. No hover: it isn't a control. */
export const Tile = forwardRef<HTMLDivElement, TileProps>(function Tile(
  {
    className,
    children,
    decorator: _decorator,
    slug: _slug,
    light: _light,
    hasRoundedCorners: _round,
    ...rest
  },
  ref
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('cds-kit-tile', 'cds-kit-tile--static', className)}>
      {children}
    </div>
  );
});

export interface ClickableTileProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, TileDecoratorProps {
  children?: ReactNode;
  /** v11: the tile has been clicked (a lasting state). */
  clicked?: boolean;
  disabled?: boolean;
  /** v11: an icon at the end; default the motion arrow. `null` for none. */
  renderIcon?: ElementType | null;
  /**
   * Content on the icon's row at the bottom, at its start (a
   * status tag, say). The row sits at the tile's foot, so in a grid of
   * stretched tiles the footers line up.
   */
  footer?: ReactNode;
  /** The hover and press steps, `quiet` (default) or `standard`. */
  hoverSteps?: TileHoverSteps;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

/** A tile that goes somewhere or does one thing: a link (`href`) or a button. */
export const ClickableTile = forwardRef<HTMLAnchorElement, ClickableTileProps>(
  function ClickableTile(
    {
      className,
      children,
      clicked = false,
      disabled = false,
      href,
      renderIcon: Icon = ArrowRight,
      footer,
      hoverSteps,
      timeScale,
      onClick,
      onKeyDown,
      decorator: _decorator,
      slug: _slug,
      light: _light,
      hasRoundedCorners: _round,
      target,
      rel = target === '_blank' ? 'noopener' : undefined,
      ...rest
    },
    ref
  ) {
    const el = useRef<HTMLAnchorElement>(null);
    useTileRollover(el, disabled, hoverSteps, timeScale);
    const icon = Icon ? (
      <span className="cds-kit-tile__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
    ) : null;
    return (
      <a
        // A surface: controls in it own their hover, and its hover is by content.
        data-rollover-surface=""
        {...rest}
        ref={mergeRefs(ref, el)}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        // A disabled link keeps its role: an <a> without href has none.
        role={href ? (disabled ? 'link' : undefined) : 'button'}
        tabIndex={disabled ? undefined : href ? undefined : 0}
        aria-disabled={disabled || undefined}
        data-motion-icon-frame=""
        className={cx(
          'cds-kit-tile',
          'cds-kit-tile--clickable',
          clicked && 'cds-kit-tile--clicked',
          disabled && 'cds-kit-tile--disabled',
          className
        )}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          if (disabled || fromNested(e.currentTarget, e.target)) {
            if (disabled) e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLAnchorElement>) => {
          // A button tile: Enter and Space click it (a link has Enter already).
          if (
            !href &&
            !disabled &&
            e.target === e.currentTarget &&
            (e.key === 'Enter' || e.key === ' ')
          ) {
            e.preventDefault();
            e.currentTarget.click();
          }
          onKeyDown?.(e);
        }}>
        <span className="cds-kit-tile__content">{children}</span>
        {footer != null ? (
          <span className="cds-kit-tile__foot">
            {footer}
            {icon}
          </span>
        ) : (
          icon
        )}
      </a>
    );
  }
);

export interface SelectableTileProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onClick' | 'onKeyDown'>,
    TileDecoratorProps {
  children?: ReactNode;
  id?: string;
  selected?: boolean;
  disabled?: boolean;
  /** v11: the event, the new selected state, the tile's id. */
  onChange?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
    selected: boolean,
    id?: string
  ) => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** The checkbox's name, when the tile has no text to name it by. */
  title?: string;
  /** @deprecated v11. */
  name?: string;
  /** @deprecated v11. */
  value?: string | number;
  tabIndex?: number;
  /** The hover and press steps, `quiet` (default) or `standard`. */
  hoverSteps?: TileHoverSteps;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

/** A tile that's chosen or not: one of a set of options, a card in a comparison. */
export const SelectableTile = forwardRef<HTMLDivElement, SelectableTileProps>(
  function SelectableTile(
    {
      className,
      children,
      id,
      selected = false,
      disabled = false,
      onChange,
      onClick,
      onKeyDown,
      title,
      name,
      value,
      tabIndex,
      hoverSteps,
      timeScale,
      decorator: _decorator,
      slug: _slug,
      light: _light,
      hasRoundedCorners: _round,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) {
    const el = useRef<HTMLDivElement>(null);
    const uid = useId();
    const checkId = `${id ?? 'cds-tile'}-check-${uid}`;
    const contentId = `${checkId}-content`;
    // v11: the prop sets it; the tile keeps its own state between.
    const [isSelected, setSelected] = useState(selected);
    const [prev, setPrev] = useState(selected);
    if (selected !== prev) {
      setPrev(selected);
      setSelected(selected);
    }
    useTileRollover(el, disabled, hoverSteps, timeScale);

    const change = (
      e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
      next: boolean
    ) => {
      setSelected(next);
      onChange?.(e, next, id);
    };

    return (
      <div
        // Before the rest: a caller's `ring` or `fill` overrides the content's choice.
        data-rollover-surface=""
        {...rest}
        ref={mergeRefs(ref, el)}
        id={id}
        className={cx(
          'cds-kit-tile',
          'cds-kit-tile--selectable',
          isSelected && 'cds-kit-tile--selected',
          disabled && 'cds-kit-tile--disabled',
          className
        )}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          // The tile's own surface toggles it; its controls answer their own.
          if (disabled || fromNested(e.currentTarget, e.target)) return;
          change(e, !isSelected);
          onClick?.(e);
        }}
        onKeyDown={onKeyDown}>
        {/* The tile's own selection: the tile keeps its hover over it (styles/_rollover.scss). */}
        <span className="cds-kit-tile__check" data-rollover-own="">
          <Checkbox
            id={checkId}
            name={name}
            value={value === undefined ? undefined : String(value)}
            labelText={title ?? 'Select'}
            hideLabel
            // The tile's name: what it's given, else its title, else its content.
            aria-label={ariaLabel}
            aria-labelledby={
              ariaLabelledBy ?? (title || ariaLabel ? undefined : contentId)
            }
            aria-describedby={ariaDescribedBy}
            checked={isSelected}
            disabled={disabled}
            tabIndex={tabIndex}
            timeScale={timeScale}
            onChange={(e) =>
              change(e as unknown as MouseEvent<HTMLElement>, e.target.checked)
            }
            onKeyDown={(e) => {
              // Enter toggles too, as Space does (v11's).
              if (e.key !== 'Enter' || disabled) return;
              e.preventDefault();
              change(e, !isSelected);
            }}
          />
        </span>
        <div id={contentId} className="cds-kit-tile__content">
          {children}
        </div>
      </div>
    );
  }
);
