/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { OpenPanelLeft, RecentlyViewed } from '@carbon/icons-react';
import { MegaButton } from '@carbon-labs/react-mega-button';
import { inertProps } from '@carbon-labs/react-util';

export interface ChatsPanelChat {
  /** Where the chat lives, when the product routes to it. */
  href?: string;

  /** Identifies the chat to the product. Returned by `onSelect`. */
  id: string;

  /** What the chat is called — the words a person recognises it by. */
  label: string;
}

export interface ChatsPanelSection {
  /** The chats in this section, newest first. */
  items: ChatsPanelChat[];

  /** What the group is called — "Pinned", "Today". */
  label: string;
}

export interface ChatsPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  /**
   * What sits beside the trigger in the bar it opens from — the session
   * switcher, usually. The trigger is the panel's; whatever else the bar
   * carries belongs to whoever composed the shell.
   */
  bar?: ReactNode;

  /**
   * What sits at the far end of the bar — the side panels' toggles, when the
   * bar is a card's own header.
   */
  barEnd?: ReactNode;

  /**
   * The content the panel sits beside, or over, depending on `presentation`.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The chat the person is in. It is marked `aria-current` in the list.
   */
  currentId?: string;

  /**
   * Whether the panel starts open. It is uncontrolled: the trigger is the
   * only thing that opens it, so the state belongs here.
   */
  defaultOpen?: boolean;

  /**
   * Names the panel for assistive technology — "Chats".
   */
  label?: string;

  /**
   * Called with the chosen chat's id.
   */
  onSelect?: (id: string) => void;

  /**
   * How the panel occupies the screen.
   *
   * `push` moves the content aside and takes a column of its own, which is
   * what a standalone chat application does: the panel is part of the
   * layout, the conversation is never covered, and nothing has to be
   * dismissed to get back to it.
   *
   * `overlay` lays the panel over the content, which is what a chat embedded
   * in a product does: the product owns the layout, so the panel borrows the
   * space and gives it straight back.
   *
   * Below Carbon's `md` breakpoint a `push` panel presents as an overlay:
   * there is no column to give it, and pushing would crush the conversation
   * to a sliver.
   */
  presentation?: 'push' | 'overlay';

  /**
   * The chats, grouped. A section with no chats is not rendered.
   */
  sections: ChatsPanelSection[];
}

// Below `md` a pushed column would leave the conversation a sliver, so the
// panel lies over it instead. Carbon's own breakpoint, never a number of ours.
const narrowQuery = `(max-width: calc(${breakpoints.md.width} - 0.02px))`;

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(narrowQuery).matches
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia(narrowQuery);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

/**
 * The list of conversations, and the control that reveals it.
 *
 * It owns both because a trigger that cannot reach the panel's state is a
 * button that does nothing — and in a recipe, which is static JSON, there is
 * nowhere else for that state to live. It is also why the two presentations
 * are one component: `push` and `overlay` differ in where the panel sits, not
 * in what it is or in what opening it means.
 */
export const ChatsPanel = forwardRef<HTMLDivElement, ChatsPanelProps>(
  function ChatsPanel(
    {
      bar,
      barEnd,
      children,
      className,
      currentId,
      defaultOpen = false,
      label = 'Chats',
      onSelect,
      presentation = 'push',
      sections,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--chats-panel`;
    const panelId = useId();
    const [open, setOpen] = useState(defaultOpen);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const narrow = useNarrow();
    // What the panel does, which is not always what it was asked for: a push
    // with no room for a column floats instead.
    const presented =
      presentation === 'push' && narrow ? 'overlay' : presentation;
    const isOverlay = presented === 'overlay';

    // The panel-expand square for the shell's own bar, and the history glyph
    // for a chat that lives inside a product — the same list, named by where
    // you reached it from. It follows the declared presentation, not the
    // presented one: the control is the same control at every width.
    const Icon = presentation === 'overlay' ? RecentlyViewed : OpenPanelLeft;

    // An overlay that closes from the keyboard hands focus back to the control
    // that opened it. Without this, the panel goes inert under the focused row
    // and focus falls to <body>. A pointer press outside leaves focus where the
    // pointer put it, so it closes without one.
    const close = (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) {
        triggerRef.current?.focus();
      }
    };

    // `inert` is what takes the closed panel out of the tab order and the
    // accessibility tree, now that `hidden` cannot: display:none does not
    // transition, so the panel has to stay in the box while it moves.
    const closed = inertProps(!open);

    return (
      // The root is not a control: it catches the Escape that bubbles from the
      // panel's own rows and the bar's buttons, as Carbon's HeaderPanel does.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        ref={ref}
        className={cx(
          block,
          `${block}--${presented}`,
          {
            [`${block}--open`]: open,
            // Declared, not presented: an overlay panel lives in a card, so
            // its bar is the card's header and takes the card's inset. A push
            // that floats at narrow widths is still the shell's bar.
            [`${block}--in-card`]: presentation === 'overlay',
          },
          className
        )}
        {...rest}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          // Escape closes an overlay, as Carbon's HeaderPanel does. A pushed
          // column is part of the layout and has nothing to dismiss. Only from
          // inside this element's own DOM: a menu in the bar (the session
          // switcher) bubbles here through React's portal, and its Escape is
          // its own.
          const fromHere = event.currentTarget.contains(event.target as Node);
          if (event.key === 'Escape' && isOverlay && open && fromHere) {
            event.stopPropagation();
            close(true);
          }
        }}>
        <div className={`${block}__bar`}>
          {/* MegaButton, not Carbon's IconButton: the shell's other control
              is one, so the two sit at the same size and weight — and it
              already rings on :focus-visible rather than Carbon's :focus, so
              a pointer press leaves nothing behind. Carbon's own button
              paints that ring as a box-shadow on :focus, which is why an
              IconButton here kept a circle round the glyph after a click.

              No `isSelected`: that is MegaButton's toggle state and sets
              aria-pressed, so the control would announce as both pressed and
              expanded for the one thing. A disclosure says aria-expanded, and
              what it discloses is on the screen to be seen. */}
          <MegaButton
            ref={triggerRef}
            className={`${block}__trigger`}
            kind="ghost"
            size="md"
            hasIconOnly
            renderIcon={Icon}
            tooltipAlignment="bottom"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((was) => !was)}>
            {/* An icon-only MegaButton takes its label as children: that one
                string is the accessible name and the tooltip both. */}
            {label}
          </MegaButton>
          {bar}
          {barEnd ? <div className={`${block}__bar-end`}>{barEnd}</div> : null}
        </div>
        <div className={`${block}__body`}>
          {/* The surface state, not `hidden`: display:none cannot transition,
              so Carbon's motion surfaces read this attribute instead and the
              panel stays in the box while it moves. `inert` is what takes a
              closed panel out of the tab order and the accessibility tree in
              its place. */}
          <nav
            className={`${block}__panel`}
            id={panelId}
            aria-label={label}
            data-carbon-surface-state={open ? 'enter' : 'exit'}
            {...closed}>
            {/* The padding is on this inner box, not the panel: a border-box
                width cannot go below its own padding, so a panel padded
                directly floored at 32px and the push never gave that back.
                A fixed width here also keeps the list from reflowing line by
                line while the column opens. */}
            <div className={`${block}__panel-inner`}>
              {sections
                .filter((section) => section.items.length > 0)
                .map((section) => (
                  <div key={section.label} className={`${block}__section`}>
                    <h2 className={`${block}__section-title`}>
                      {section.label}
                    </h2>
                    <ul className={`${block}__list`}>
                      {section.items.map((chat) => (
                        <li key={chat.id}>
                          {/* An anchor, because this is navigation and a chat
                            has a place to be. With no route it still acts
                            through onSelect and the default is prevented. */}
                          <a
                            className={cx(`${block}__chat`, {
                              [`${block}__chat--current`]:
                                chat.id === currentId,
                            })}
                            href={chat.href ?? '#'}
                            aria-current={
                              chat.id === currentId ? 'page' : undefined
                            }
                            onClick={(event) => {
                              if (!chat.href) {
                                event.preventDefault();
                              }
                              onSelect?.(chat.id);
                              if (isOverlay) {
                                close(true);
                              }
                            }}>
                            {chat.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </nav>
          {/* An outside press still closes the overlay. It used to be a scrim
              that dimmed the card, which dimmed only part of the surface and
              is not how this system separates a floating panel: a border and a
              shadow carry it (themes-regions.md). */}
          <div
            className={`${block}__content`}
            onPointerDownCapture={
              isOverlay && open ? () => close(false) : undefined
            }>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

ChatsPanel.displayName = 'ChatsPanel';

ChatsPanel.propTypes = {
  /**
   * What sits beside the trigger in the bar it opens from.
   */
  bar: PropTypes.node,

  /**
   * What sits at the far end of the bar.
   */
  barEnd: PropTypes.node,

  /**
   * The content the panel sits beside, or over.
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * The chat the person is in.
   */
  currentId: PropTypes.string,

  /**
   * Whether the panel starts open.
   */
  defaultOpen: PropTypes.bool,

  /**
   * Names the panel for assistive technology.
   */
  label: PropTypes.string,

  /**
   * Called with the chosen chat's id.
   */
  onSelect: PropTypes.func,

  /**
   * How the panel occupies the screen: beside the content, or over it. A
   * push presents as an overlay below Carbon's `md` breakpoint.
   */
  presentation: PropTypes.oneOf(['push', 'overlay'] as const),

  /**
   * The chats, grouped.
   */
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      items: PropTypes.arrayOf(
        PropTypes.shape({
          href: PropTypes.string,
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired as unknown as React.Validator<ChatsPanelProps['sections']>,
} as React.WeakValidationMap<ChatsPanelProps>;
