/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AriaAttributes,
  type ComponentType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type TransitionEventHandler,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { createLeads, type Leads } from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import {
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureMoves,
} from '@carbon-labs/react-disclosure';
import {
  useContainerCorners,
  type ContainerCorners,
} from '@carbon-labs/react-kit-defaults';
import { useLatest } from '@carbon-labs/react-selection-kit';
import './accordion.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Accordion and AccordionItem: headings that open and shut the content under
 * them.
 *
 *   body       the disclosure's (disclosure.ts): duration by travel, shutting
 *              a step faster; bodies moving in one commit are one motion
 *   content    8px back, moving from the opening's first frame (ARRIVAL_AT 0)
 *              over one duration token longer than the body; it settles last
 *   shut       the soft edge closes over the content where it is
 *   exclusive  one item open at a time; the swap is one motion
 *   keyboard   Enter or Space toggles; arrows, Home and End move between headings
 *   reduced    open or shut at once; the content fades in on the reduced clock
 *
 * API: Carbon's Accordion and AccordionItem, plus exclusive, headingLevel, corners.
 * ========================================================================== */

export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionAlign = 'start' | 'end';
/** What it stands on: `flush` (default), the hairlines and hover edge to edge; `ghost`, the text on the page's text, the hairlines and hover inset. */
export type AccordionFrame = 'flush' | 'ghost';

interface AccordionContextValue {
  disabled: boolean;
  exclusive: boolean;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  leads: Leads | null;
  moves: DisclosureMoves;
  timeScale: number | undefined;
}

// Outside an Accordion: no transaction, it lands at once.
const NO_MOVES: DisclosureMoves = { move: (_body, _open, landed) => landed() };
const AccordionContext = createContext<AccordionContextValue>({
  disabled: false,
  exclusive: false,
  headingLevel: 3,
  leads: null,
  moves: NO_MOVES,
  timeScale: undefined,
});

/** The headings an arrow key moves between: this accordion's own, enabled. */
const HEADINGS =
  ':scope > .cds-accordion__item > .cds-accordion__heading-level > .cds-accordion__heading';

/* ── Accordion ─────────────────────────────────────────────────────────── */

export interface AccordionProps extends HTMLAttributes<HTMLUListElement> {
  /** Where the chevron sits: `end` (default, after the title) or `start`. */
  align?: AccordionAlign;
  children?: ReactNode;
  className?: string;
  /** Every item disabled (an item's own `disabled` wins). */
  disabled?: boolean;
  /** `flush` (default): the hairlines and the hover edge to edge. `ghost`: the text 16px in, on the page's text; the hairlines and the hover 8px outside it, inset from the row's edges. Not with `align="start"`. */
  frame?: AccordionFrame;
  /** An `<ol>` rather than a `<ul>`. */
  ordered?: boolean;
  /** Row height: sm 32, md 40 (default), lg 48px. */
  size?: AccordionSize;
  /** One item open at a time; opening one shuts the other, as one motion. */
  exclusive?: boolean;
  /** The level of each item's heading. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** `square` (v11, default) or `rounded` (8px), inside a card or a rounded region. Default: KitDefaults' (a Region's), else `square`. */
  corners?: ContainerCorners;
  /** Slow motion: multiplies the opening, the shutting and the headings' rollover. Default: the page's duration tokens (1). */
  timeScale?: number;
}

export function Accordion({
  align = 'end',
  children,
  className,
  disabled = false,
  frame = 'flush',
  ordered = false,
  size = 'md',
  exclusive = false,
  headingLevel = 3,
  corners: cornersProp,
  timeScale,
  onKeyDown,
  ...rest
}: AccordionProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const corners = useContainerCorners(cornersProp);

  // Every body moving in one commit is one motion on one clock (a swap: the
  // larger travel's step), one layout transaction on the accordion.
  const moves = useDisclosureMoves(rootRef, { reason: 'accordion', timeScale });

  // One open at a time (`exclusive`): the motion seam's leads. A swap (an
  // opening item ousting an open one) flips both in one commit.
  const [leads] = useState(createLeads);
  useLayoutEffect(() => {
    // The first paint is still: items mount open or shut, and the ones
    // ousted on mount (all but the last open) shut at once.
    const root = rootRef.current;
    if (root) root.dataset.still = '';
    const unsettle = leads.settle(() => {});
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => delete root?.dataset.still);
    });
    return () => {
      unsettle();
      cancelAnimationFrame(raf);
    };
  }, [leads]);

  const ctx = useMemo<AccordionContextValue>(
    () => ({ disabled, exclusive, headingLevel, leads, moves, timeScale }),
    [disabled, exclusive, headingLevel, leads, moves, timeScale]
  );

  // ↑ ↓ between headings, Home / End to the ends (Tab and Enter / Space are the buttons').
  const onKeys = (e: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    const root = rootRef.current;
    if (e.defaultPrevented || !root) return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const heads = [...root.querySelectorAll<HTMLElement>(HEADINGS)].filter(
      (h) => !h.matches(':disabled')
    );
    const i = heads.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const n = heads.length;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? n - 1
          : (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    heads[next]?.focus();
  };

  const List = ordered ? 'ol' : 'ul';
  return (
    <AccordionContext.Provider value={ctx}>
      <List
        {...rest}
        ref={rootRef as never}
        className={cx(
          'cds-accordion',
          `cds-accordion--${align}`,
          `cds-accordion--${size}`,
          frame === 'ghost' && align !== 'start' && 'cds-accordion--ghost',
          corners === 'rounded' && 'cds-accordion--rounded',
          className
        )}
        onKeyDown={onKeys}>
        {children}
      </List>
    </AccordionContext.Provider>
  );
}
Accordion.displayName = 'Accordion';

/* ── AccordionItem ─────────────────────────────────────────────────────── */

/** What `renderToggle` is given: spread it on a `<button>`. */
export interface AccordionToggleProps {
  'aria-controls'?: AriaAttributes['aria-controls'];
  'aria-expanded'?: AriaAttributes['aria-expanded'];
  'aria-label'?: AriaAttributes['aria-label'];
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button';
  /** The row plays its motion icon on hover and focus. */
  'data-motion-icon-frame'?: '';
  children?: ReactNode;
}

export interface AccordionItemProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'title'
> {
  children?: ReactNode;
  className?: string;
  /** Overrides the accordion's `disabled`. A disabled item shows shut. */
  disabled?: boolean;
  /** The heading button's name, when it has no visible title. */
  'aria-label'?: AriaAttributes['aria-label'];
  /** A heading click, with the open state it asked for. */
  onHeadingClick?: (args: {
    isOpen: boolean;
    event: MouseEvent<HTMLButtonElement>;
  }) => void;
  /** Open. Its initial state, and followed whenever it changes; a click toggles it in between. */
  open?: boolean;
  /** Renders the heading's button, given its props (spread them on a `<button>`). */
  renderToggle?: ComponentType<AccordionToggleProps>;
  /** @deprecated v11: `renderToggle`. */
  renderExpando?: ComponentType<AccordionToggleProps>;
  /** The heading's title. */
  title?: ReactNode;
  /** The body's transitions ending (its height, the soft edge, the content's arrival). */
  handleAnimationEnd?: TransitionEventHandler<HTMLElement>;
}

function DefaultToggle(props: AccordionToggleProps) {
  return <button type="button" {...props} />;
}

export function AccordionItem({
  children,
  className,
  open: openProp = false,
  onHeadingClick,
  renderToggle,
  renderExpando,
  title = 'title',
  disabled: ownDisabled,
  handleAnimationEnd,
  'aria-label': ariaLabel,
  ...rest
}: AccordionItemProps) {
  const {
    disabled: allDisabled,
    exclusive,
    headingLevel,
    leads,
    moves,
    timeScale,
  } = useContext(AccordionContext);
  const disabled = ownDisabled ?? allDisabled;
  const reduced = usePrefersReducedMotion();
  const id = useId().replace(/:/g, '');
  const headId = `accordion-heading-${id}`;
  const bodyId = `accordion-body-${id}`;

  // v11's: the state starts at `open` and follows it when it changes; a click
  // toggles it in between. Adjusted as it renders, so a change of `open`
  // moves in the same commit.
  const [isOpen, setIsOpen] = useState(openProp);
  const [seenProp, setSeenProp] = useState(openProp);
  if (seenProp !== openProp) {
    setSeenProp(openProp);
    setIsOpen(openProp);
  }
  const open = isOpen && !disabled;

  // One at a time: an item that opens claims the lead and the others shut.
  // From a click, the claim is in the handler, so the one shutting and the
  // one opening flip in one commit (one motion); an item opened by its
  // `open` claims from a layout effect (before the body's move starts).
  const openRef = useLatest(open);
  useLayoutEffect(
    () =>
      leads?.join(id, {
        open: () => openRef.current,
        oust: () => setIsOpen(false),
      }),
    [leads, id, openRef]
  );
  const claimed = useRef(false);
  const exclusiveRef = useLatest(exclusive);
  useLayoutEffect(() => {
    if (!open) return;
    if (claimed.current) claimed.current = false;
    else if (exclusiveRef.current) leads?.claim(id);
  }, [open, exclusiveRef, leads, id]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const body = useDisclosureBody(bodyRef, open, moves, reduced);

  // The rollover on the heading (attached on its wrapper, so a nested
  // accordion's headings are their own).
  const levelRef = useRef<HTMLHeadingElement>(null);
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = levelRef.current;
    if (!node) return;
    return attachRollover(node, {
      selector: '.cds-accordion__heading',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [rolloverReduced, timeScale]);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const next = !isOpen;
    if (next && exclusive && leads) {
      claimed.current = true;
      leads.claim(id);
    }
    setIsOpen(next);
    onHeadingClick?.({ isOpen: next, event });
  };

  const Toggle = renderToggle ?? renderExpando ?? DefaultToggle;
  const Heading = `h${headingLevel}` as const;

  return (
    <li
      {...rest}
      className={cx(
        'cds-accordion__item',
        open && 'cds-accordion__item--active',
        disabled && 'cds-accordion__item--disabled',
        className
      )}>
      <Heading ref={levelRef} className="cds-accordion__heading-level">
        <Toggle
          type="button"
          id={headId}
          className="cds-accordion__heading"
          disabled={disabled}
          aria-controls={bodyId}
          aria-expanded={open}
          aria-label={ariaLabel}
          data-motion-icon-frame=""
          onClick={onClick}>
          <span className="cds-accordion__title">{title}</span>
          <span className="cds-accordion__arrow">
            <ChevronDownUpToggle
              size={16}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </span>
        </Toggle>
      </Heading>
      <div
        ref={bodyRef}
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        className="cds-disclosure__body cds-accordion__body"
        {...body.bodyProps}
        onTransitionEnd={handleAnimationEnd}>
        <div className="cds-disclosure__clip">
          <div className="cds-disclosure__content cds-accordion__content">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}
AccordionItem.displayName = 'AccordionItem';
