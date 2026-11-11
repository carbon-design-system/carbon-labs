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
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachCastShadow } from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/v12-motion';
import { OverflowMenuVertical } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { KitDefaults, useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { MenuItem, OverflowMenu } from '@carbon-labs/react-menu';
import {
  fromNested,
  useTileRollover,
  type TileHoverSteps,
} from '@carbon-labs/react-tile';
import './card.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * Card, ProductiveCard, ExpressiveCard — Carbon for IBM Products' cards,
 * prop for prop, on the kit's tile.
 *
 *   surface   the kit's tile: `--cds-surface`, 8px corners, 16px in. Media
 *             (ExpressiveCard) bleeds to the card's edge with the card's
 *             corners on its outer side
 *   clickable a card with `onClick` is a control: the tiles' quiet rollover
 *             behind the content (never over it), growing 1px on hover and
 *             pressing 1px in; with `shadow`, the kit's cast shadow, lit
 *             from the pointer (instant offset, strength fading on
 *             moderate-01; the press draws it in). None by default (the
 *             kit's, `KitDefaults shadow`). A card without `onClick` is a
 *             plain surface; one holding controls hovers with a ring
 *   zones     ProductiveCard's `clickZone`: `one` (default) the whole card,
 *             `two` the header and body, `three` the header. Outside the
 *             zone, a click does nothing and the card shows no hover there;
 *             its actions answer their own presses everywhere
 *   action    a clickable card's own action is one button laid over the
 *             whole card (`__action`), named by the title (else the label,
 *             or the card's `aria-label`) and described by the description;
 *             the actions in the card are its siblings, never inside it. A
 *             pointer passes through it, so text in the card can still be
 *             selected; a press in the zone is the card's click
 *   keyboard  the action is the card's tab stop (Enter and Space, a
 *             button's), the actions the stops after it; while it has the
 *             keyboard's focus the card shows its hover and the kit's ring
 *             2px outside
 *   actions   `actionIcons`: icon-only ghost buttons, each a motion icon
 *             with its tooltip; `overflowActions`: the kit's OverflowMenu
 *             (`isDelete`: a danger row). ProductiveCard has them at the top
 *             (`actionsPlacement`), ExpressiveCard at the bottom. Primary
 *             and secondary buttons in the footer (ProductiveCard's primary
 *             can sit at the top: `primaryButtonPlacement`)
 *   reduced   the rollover at once; the shadow's strength at once
 *
 * IBM Products' props: `actionIcons` ({ id, icon, onClick, iconDescription,
 * href }), `actionsPlacement`, `actionIconsPosition` (its older name),
 * `children`, `className`, `clickZone`, `description`, `label`, `media`,
 * `mediaPosition`, `onClick`, `onKeyDown`, `onPrimaryButtonClick`,
 * `onSecondaryButtonClick`, `overflowActions` ({ id, itemText, onClick,
 * isDelete, disabled }), `overflowAriaLabel`, `pictogram`,
 * `primaryButton*` (`Disabled`, `Href`, `Icon`, `Placement`,
 * `Text`), `secondaryButton*` (`Disabled`, `Href`, `Icon`, `Text`); their `Kind`s are `primaryButtonFrame` and `secondaryButtonFrame` (`inset` · `ghost`),
 * `title`, `titleSize`. Accepted with no effect: `decorator` / `slug` (no
 * AI label). The kit adds `hoverSteps` (the tiles').
 * ========================================================================== */

export interface CardActionIcon {
  id: string;
  /** A motion icon. */
  icon: ElementType;
  /** The button's name and tooltip. */
  iconDescription: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** A link instead of a button. */
  href?: string;
}

export interface CardOverflowAction {
  id: string;
  itemText: string;
  onClick?: () => void;
  /** A destructive action: the menu's danger row. */
  isDelete?: boolean;
  disabled?: boolean;
}

export type CardClickZone = 'one' | 'two' | 'three';
export type CardPlacement = 'top' | 'bottom';

/** Where a card's media sits: `top` (default) or `start`, beside the content (mirrored right to left). */
export type CardMediaPosition = 'top' | 'start';

export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'onClick' | 'onKeyDown'
> {
  actionIcons?: readonly CardActionIcon[];
  /** Where the action icons and the overflow menu sit. */
  actionsPlacement?: CardPlacement;
  /** @deprecated IBM Products: `actionsPlacement`. */
  actionIconsPosition?: CardPlacement;
  children?: ReactNode;
  className?: string;
  /** ProductiveCard: which part of the card a click on it counts on. Default `one` (all of it). */
  clickZone?: CardClickZone;
  description?: ReactNode;
  /** A line above the title. */
  label?: ReactNode;
  /** ExpressiveCard: an image or other media, to the card's edge. */
  media?: ReactNode;
  /** ExpressiveCard: media above (default) or beside the content. */
  mediaPosition?: CardMediaPosition;
  /** Makes the card a control (one tab stop, the hover; the cast shadow with `shadow`). */
  onClick?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPrimaryButtonClick?: (event: MouseEvent<HTMLElement>) => void;
  onSecondaryButtonClick?: (event: MouseEvent<HTMLElement>) => void;
  overflowActions?: readonly CardOverflowAction[];
  /** The overflow menu's name. Default "Options". */
  overflowAriaLabel?: string;
  /** ExpressiveCard: a pictogram above the title (a motion icon here). */
  pictogram?: ElementType;
  primaryButtonDisabled?: boolean;
  primaryButtonHref?: string;
  primaryButtonIcon?: ElementType;
  /** The primary button's frame: `inset` (default; ProductiveCard: `ghost`) or `ghost`. Products' `primaryButtonKind`. */
  primaryButtonFrame?: 'inset' | 'ghost';
  /** ProductiveCard: the primary button in the header or the footer. */
  primaryButtonPlacement?: CardPlacement;
  primaryButtonText?: ReactNode;
  secondaryButtonDisabled?: boolean;
  secondaryButtonHref?: string;
  secondaryButtonIcon?: ElementType;
  /** The secondary button's frame: `inset` (default) or `ghost`. Products' `secondaryButtonKind`. */
  secondaryButtonFrame?: 'inset' | 'ghost';
  secondaryButtonText?: ReactNode;
  title?: ReactNode;
  /** ProductiveCard: `default` or `large`. */
  titleSize?: 'default' | 'large';
  /** IBM Products' AI-label slot. Accepted; renders nothing. */
  decorator?: ReactNode;
  /** @deprecated IBM Products: `decorator`. Accepted; renders nothing. */
  slug?: ReactNode;
  /** The productive look (ProductiveCard sets it). */
  productive?: boolean;
  /** The hover and press steps, `quiet` (default) or `standard`. */
  hoverSteps?: TileHoverSteps;
  /**
   * A clickable card's cast shadow, lit from the pointer. Any
   * truthy value turns it on (the card's shadow has one elevation of its
   * own); `false` none. Default: the kit's (`KitDefaults shadow`, none).
   */
  shadow?: SurfaceShadowOption;
  /** Slow motion: multiplies the durations of its rollover, buttons and overflow menu. Default 1. */
  timeScale?: number;
}

/** A card: a tile with a header, a body, actions and a footer. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    actionIcons = [],
    actionsPlacement: placementProp,
    actionIconsPosition,
    children,
    className,
    clickZone = 'one',
    description,
    label,
    media,
    mediaPosition = 'top',
    onClick,
    onKeyDown,
    onPrimaryButtonClick,
    onSecondaryButtonClick,
    overflowActions = [],
    overflowAriaLabel = 'Options',
    pictogram: Pictogram,
    primaryButtonDisabled,
    primaryButtonHref,
    primaryButtonIcon,
    primaryButtonFrame = 'inset',
    primaryButtonPlacement = 'bottom',
    primaryButtonText,
    secondaryButtonDisabled,
    secondaryButtonHref,
    secondaryButtonIcon,
    secondaryButtonFrame = 'inset',
    secondaryButtonText,
    title,
    titleSize = 'default',
    decorator: _decorator,
    slug: _slug,
    productive = false,
    hoverSteps,
    shadow,
    timeScale,
    'aria-label': ariaLabel,
    ...rest
  },
  ref
) {
  const placement =
    placementProp ?? actionIconsPosition ?? (productive ? 'top' : 'bottom');
  const zone: CardClickZone = productive ? clickZone : 'one';
  const clickable = !!onClick;
  const cast = !!useSurfaceShadow(shadow) && clickable;
  const el = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const uid = useId().replace(/:/g, '');
  const ids = {
    label: `cds-kit-card-label-${uid}`,
    title: `cds-kit-card-title-${uid}`,
    description: `cds-kit-card-description-${uid}`,
  };
  // The action's name: the card's own, else its title, else its label.
  const named =
    ariaLabel != null
      ? undefined
      : title != null
        ? ids.title
        : label != null
          ? ids.label
          : undefined;

  useTileRollover(el, !clickable, hoverSteps, timeScale);
  // The kit's cast shadow, lit from the pointer, on a card that's a control (asked for).
  useEffect(() => {
    const node = el.current;
    if (!node || !cast) return;
    return attachCastShadow(node, { selector: '.cds-kit-card--clickable' });
  }, [cast]);

  /** Whether a click at `target` is in the card's click zone (and not on a control inside it). */
  const inZone = (card: HTMLElement, target: EventTarget | null) => {
    if (fromNested(card, target)) return false;
    if (zone === 'one') return true;
    const node = target instanceof Node ? target : null;
    if (!node) return false;
    if (headerRef.current?.contains(node)) return true;
    return zone === 'two' && !!bodyRef.current?.contains(node);
  };

  const iconButtons = actionIcons.map((a) => (
    <Button
      key={a.id}
      frame="ghost"
      size="sm"
      hasIconOnly
      renderIcon={a.icon}
      iconDescription={a.iconDescription}
      href={a.href}
      onClick={a.onClick}
      tooltipPosition={placement === 'top' ? 'bottom' : 'top'}
      timeScale={timeScale}
    />
  ));
  const overflow = overflowActions.length ? (
    <OverflowMenu
      label={overflowAriaLabel}
      size="sm"
      flipped
      renderIcon={OverflowMenuVertical}
      timeScale={timeScale}>
      {overflowActions.map((a) => (
        <MenuItem
          key={a.id}
          label={a.itemText}
          kind={a.isDelete ? 'danger' : 'default'}
          disabled={a.disabled}
          onClick={() => a.onClick?.()}
        />
      ))}
    </OverflowMenu>
  ) : null;
  const hasActions = iconButtons.length > 0 || overflow;
  const actions = hasActions ? (
    <div
      className={cx(
        'cds-kit-card__actions',
        `cds-kit-card__actions--${placement}`
      )}>
      {iconButtons}
      {overflow}
    </div>
  ) : null;

  const primary = primaryButtonText ? (
    <Button
      kind="primary"
      frame={primaryButtonFrame}
      size="md"
      href={primaryButtonHref}
      renderIcon={primaryButtonIcon}
      disabled={primaryButtonDisabled}
      onClick={onPrimaryButtonClick}
      timeScale={timeScale}>
      {primaryButtonText}
    </Button>
  ) : null;
  const secondary = secondaryButtonText ? (
    <Button
      kind="secondary"
      frame={secondaryButtonFrame}
      size="md"
      href={secondaryButtonHref}
      renderIcon={secondaryButtonIcon}
      disabled={secondaryButtonDisabled}
      onClick={onSecondaryButtonClick}
      timeScale={timeScale}>
      {secondaryButtonText}
    </Button>
  ) : null;
  const primaryTop = productive && primaryButtonPlacement === 'top';
  const footerButtons = secondary || (primary && !primaryTop);
  const hasFooter = footerButtons || (placement === 'bottom' && hasActions);

  return (
    <div
      data-rollover-surface={clickable ? '' : undefined}
      {...rest}
      ref={mergeRefs(ref, el)}
      data-cast-shadow={cast ? '' : undefined}
      aria-label={clickable ? undefined : ariaLabel}
      className={cx(
        'cds-kit-card',
        productive ? 'cds-kit-card--productive' : 'cds-kit-card--expressive',
        clickable ? 'cds-kit-card--clickable' : 'cds-kit-card--static',
        clickable && zone !== 'one' && `cds-kit-card--zone-${zone}`,
        media != null && `cds-kit-card--media-${mediaPosition}`,
        titleSize === 'large' && 'cds-kit-card--title-large',
        className
      )}
      onClick={(e) => {
        if (!clickable) return;
        // The action itself: a key on it, or assistive tech.
        if (e.target === actionRef.current) {
          onClick?.(e);
          return;
        }
        if (!inZone(e.currentTarget, e.target)) return;
        // A drag that selected text in it isn't a click on it.
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && e.currentTarget.contains(sel.anchorNode))
          return;
        onClick?.(e);
      }}
      onKeyDown={onKeyDown}>
      {clickable ? (
        // The card's own action, over the whole card: one button, never
        // round the actions in the card. The surface keeps its hover over it.
        <button
          ref={actionRef}
          type="button"
          className="cds-kit-card__action"
          data-rollover-own=""
          aria-label={ariaLabel}
          aria-labelledby={named}
          aria-describedby={description != null ? ids.description : undefined}
        />
      ) : null}
      {media != null ? (
        <div className="cds-kit-card__media">{media}</div>
      ) : null}
      <div className="cds-kit-card__main">
        <div className="cds-kit-card__header-row">
          <div ref={headerRef} className="cds-kit-card__header">
            {Pictogram ? (
              <span className="cds-kit-card__pictogram" aria-hidden="true">
                <Pictogram size={32} />
              </span>
            ) : null}
            {label != null ? (
              <p id={ids.label} className="cds-kit-card__label">
                {label}
              </p>
            ) : null}
            {title != null ? (
              <h3 id={ids.title} className="cds-kit-card__title">
                {title}
              </h3>
            ) : null}
            {description != null ? (
              <p id={ids.description} className="cds-kit-card__description">
                {description}
              </p>
            ) : null}
          </div>
          {placement === 'top' || primaryTop ? (
            <div
              className="cds-kit-card__header-actions"
              data-rollover-nested={clickable ? '' : undefined}>
              {placement === 'top' ? actions : null}
              {primaryTop ? primary : null}
            </div>
          ) : null}
        </div>
        {children != null ? (
          <div
            ref={bodyRef}
            className="cds-kit-card__body"
            // Outside the click zone: no press, no hover (card.scss).
            data-rollover-nested={
              clickable && zone === 'three' ? '' : undefined
            }>
            {/* A framed surface: what selects and navigates inside it is ghost by default; its containers are rounded, as the card is (a rounded Region's rule). */}
            <KitDefaults frame="ghost" containerCorners="rounded">
              {children}
            </KitDefaults>
          </div>
        ) : null}
        {hasFooter ? (
          <div
            className="cds-kit-card__footer"
            data-rollover-nested={clickable && zone !== 'one' ? '' : undefined}>
            {placement === 'bottom' ? actions : null}
            {footerButtons ? (
              <div
                className="cds-kit-card__buttons"
                data-rollover-nested={clickable ? '' : undefined}>
                {secondary}
                {primaryTop ? null : primary}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
});
Card.displayName = 'Card';

export type ProductiveCardProps = Omit<
  CardProps,
  'productive' | 'media' | 'mediaPosition' | 'pictogram'
>;

/** IBM Products' ProductiveCard: a dense card for product UI (actions at the top, a ghost primary button). */
export const ProductiveCard = forwardRef<HTMLDivElement, ProductiveCardProps>(
  function ProductiveCard({ primaryButtonFrame = 'ghost', ...props }, ref) {
    return (
      <Card
        ref={ref}
        {...props}
        primaryButtonFrame={primaryButtonFrame}
        productive
      />
    );
  }
);

export type ExpressiveCardProps = Omit<
  CardProps,
  'productive' | 'clickZone' | 'titleSize' | 'primaryButtonPlacement'
>;

/** IBM Products' ExpressiveCard: a card with media or a pictogram, actions in the footer. */
export const ExpressiveCard = forwardRef<HTMLDivElement, ExpressiveCardProps>(
  function ExpressiveCard(props, ref) {
    return <Card ref={ref} {...props} productive={false} />;
  }
);
