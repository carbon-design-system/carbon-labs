/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import {
  Close,
  Code,
  Folder,
  SettingsAdjust,
  Wikis,
  Workspace,
} from '@carbon/icons-react';
import { MegaButton } from '@carbon-labs/react-mega-button';

/** The panels a chat surface ships with, in the order its header shows them. */
export const chatPanelKinds = [
  'knowledge',
  'code',
  'files',
  'settings',
  'canvas',
] as const;

export type ChatPanelKind = (typeof chatPanelKinds)[number];

export interface ChatPanelDefinition {
  /** Identifies the panel. Returned by `onOpenChange`. */
  id: string;

  /** The glyph on the toggle. */
  icon: ElementType;

  /** What the panel is called: the toggle's tooltip and accessible name, and the panel's title. */
  label: string;
}

// The shell's own five, so a recipe — static JSON, which cannot carry an
// icon — can name a panel by kind. Each icon is a Carbon glyph; Workspace is
// the canvas because it is the one glyph here that reads as a surface things
// are arranged on.
const builtIn: Record<ChatPanelKind, Omit<ChatPanelDefinition, 'id'>> = {
  knowledge: { label: 'Knowledge', icon: Wikis },
  code: { label: 'Code', icon: Code },
  files: { label: 'Files', icon: Folder },
  settings: { label: 'Settings', icon: SettingsAdjust },
  canvas: { label: 'Canvas', icon: Workspace },
};

const resolve = (panel: ChatPanelKind | ChatPanelDefinition) =>
  typeof panel === 'string' ? { id: panel, ...builtIn[panel] } : panel;

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

interface ChatPanelsContextValue {
  close: (returnFocus: boolean) => void;
  openId: string | null;
  panelId: (id: string) => string;
  panels: ChatPanelDefinition[];
  toggle: (id: string) => void;
  toggleRefs: React.MutableRefObject<Map<string, HTMLButtonElement | null>>;
}

const ChatPanelsContext = createContext<ChatPanelsContextValue | null>(null);

function usePanels(part: string) {
  const value = useContext(ChatPanelsContext);
  if (!value) {
    throw new Error(`${part} must be inside ChatPanels`);
  }
  return value;
}

export interface ChatPanelsProps {
  /**
   * Everything that shows a toggle or a panel: the header the toggles sit in
   * and the area the panel opens beside.
   */
  children?: ReactNode;

  /**
   * The panel open at first, if any. One is open at a time.
   */
  defaultOpenId?: string;

  /**
   * Called with the panel that opened, or `null` when the last one closed.
   */
  onOpenChange?: (id: string | null) => void;

  /**
   * The panels, by kind or defined in full. Defaults to the shell's five:
   * knowledge, code, files, settings, canvas.
   */
  panels?: (ChatPanelKind | ChatPanelDefinition)[];
}

/**
 * The side panels of a chat surface, and the state the toggles and the panel
 * share.
 *
 * It renders nothing of its own. The toggles go wherever the surface's header
 * is — a card's own header, or beside the session switcher when the chat is
 * embedded — and the panel opens beside the content in `ChatPanelArea`. The
 * two meet here, as Carbon's Tabs meets its TabList and TabPanels, because a
 * recipe is static JSON and has nowhere else to keep which one is open.
 */
export function ChatPanels({
  children,
  defaultOpenId,
  onOpenChange,
  panels = [...chatPanelKinds],
}: ChatPanelsProps) {
  const base = useId();
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const toggleRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const resolved = useMemo(() => panels.map(resolve), [panels]);

  const value = useMemo<ChatPanelsContextValue>(() => {
    const set = (id: string | null) => {
      setOpenId(id);
      onOpenChange?.(id);
    };
    return {
      panels: resolved,
      openId,
      panelId: (id) => `${base}-${id}`,
      toggleRefs,
      // One panel at a time: a second toggle swaps what the panel shows, and
      // the open one's own toggle closes it.
      toggle: (id) => set(openId === id ? null : id),
      // A panel that closes from the keyboard hands focus back to the toggle
      // that opened it, so focus never falls to <body> under an inert panel.
      close: (returnFocus) => {
        const was = openId;
        set(null);
        if (returnFocus && was) {
          toggleRefs.current.get(was)?.focus();
        }
      },
    };
  }, [base, onOpenChange, openId, resolved]);

  return (
    <ChatPanelsContext.Provider value={value}>
      {children}
    </ChatPanelsContext.Provider>
  );
}

ChatPanels.propTypes = {
  /**
   * The header the toggles sit in and the area the panel opens beside.
   */
  children: PropTypes.node,

  /**
   * The panel open at first, if any.
   */
  defaultOpenId: PropTypes.string,

  /**
   * Called with the panel that opened, or `null` when the last one closed.
   */
  onOpenChange: PropTypes.func,

  /**
   * The panels, by kind or defined in full.
   */
  panels: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.oneOf(chatPanelKinds),
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
};

export interface ChatPanelTogglesProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'content'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Names the group for assistive technology.
   */
  label?: string;
}

/**
 * The row of toggles, one per panel: ghost MegaButtons, icon-only, each
 * naming its panel in a tooltip.
 */
export const ChatPanelToggles = forwardRef<
  HTMLDivElement,
  ChatPanelTogglesProps
>(function ChatPanelToggles({ className, label = 'Panels', ...rest }, ref) {
  const prefix = usePrefix();
  const block = `${prefix}--chat-panel-toggles`;
  const { openId, panelId, panels, toggle, toggleRefs } =
    usePanels('ChatPanelToggles');

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cx(block, className)}
      {...rest}>
      {panels.map((panel) => (
        // @carbon-proposal api: chat-panel-toggle-icon-only — a panel toggle is icon-only with a tooltip; Carbon's icon-only allow-list does not name panel toggles. TBD
        //
        // No `isSelected`: that sets aria-pressed, and a toggle that
        // discloses a panel says aria-expanded. The open look is drawn from
        // aria-expanded with MegaButton's own selected tint, in the SCSS.
        <MegaButton
          key={panel.id}
          ref={(node: HTMLButtonElement | null) => {
            toggleRefs.current.set(panel.id, node);
          }}
          className={`${block}__toggle`}
          kind="ghost"
          size="md"
          hasIconOnly
          renderIcon={panel.icon}
          tooltipAlignment="bottom"
          aria-expanded={openId === panel.id}
          aria-controls={panelId(panel.id)}
          onClick={() => toggle(panel.id)}>
          {panel.label}
        </MegaButton>
      ))}
    </div>
  );
});

ChatPanelToggles.displayName = 'ChatPanelToggles';

ChatPanelToggles.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Names the group for assistive technology.
   */
  label: PropTypes.string,
};

export interface ChatPanelAreaProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'content'
> {
  /**
   * The content the panel opens beside, or over.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * What each panel holds, by id. A panel with nothing here shows its title
   * and a line saying its content is still to come.
   */
  panelContent?: Record<string, ReactNode>;

  /**
   * How the panel occupies the surface: `push` takes a column from the
   * content, `overlay` lies over it. As the chats panel does, and for the
   * same reasons: the standalone shell pushes, the embedded chat overlays.
   * Below Carbon's `md` breakpoint a push presents as an overlay.
   */
  presentation?: 'push' | 'overlay';
}

/**
 * The content, and the panel that opens along its inline end.
 */
export const ChatPanelArea = forwardRef<HTMLDivElement, ChatPanelAreaProps>(
  function ChatPanelArea(
    { children, className, panelContent, presentation = 'push', ...rest },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--chat-panel-area`;
    const { close, openId, panelId, panels } = usePanels('ChatPanelArea');
    const narrow = useNarrow();
    const presented =
      presentation === 'push' && narrow ? 'overlay' : presentation;
    const isOverlay = presented === 'overlay';
    const open = openId !== null;

    // `inert` is a standard attribute the DOM honours, but React 18's JSX
    // types predate it, so it is built here and spread, as ChatsPanel does.
    const inert = { inert: '' } as unknown as React.HTMLAttributes<HTMLElement>;

    return (
      // The root is not a control: it catches the Escape that bubbles from
      // inside the open panel, as Carbon's HeaderPanel does.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        ref={ref}
        className={cx(
          block,
          `${block}--${presented}`,
          { [`${block}--open`]: open },
          className
        )}
        {...rest}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          // Escape closes an overlay and hands focus back to its toggle. A
          // pushed column is part of the layout and has nothing to dismiss.
          const inPanel = (event.target as HTMLElement).closest?.(
            `.${block}__panel`
          );
          if (event.key === 'Escape' && isOverlay && open && inPanel) {
            event.stopPropagation();
            close(true);
          }
        }}>
        {/* A column root with a row inside, as ChatsPanel is shaped: a recipe
            makes every filling node a column, and the row is this element's
            own business. */}
        <div className={`${block}__body`}>
          <div
            className={`${block}__content`}
            onPointerDownCapture={
              isOverlay && open ? () => close(false) : undefined
            }>
            {children}
          </div>
          {/* The surface state, not `hidden`, on the box that moves: display:none
            cannot transition. Each panel inside is its own region so a toggle
            can name the one it controls; only the open one is shown. */}
          <div
            className={`${block}__panel`}
            data-carbon-surface-state={open ? 'enter' : 'exit'}
            {...(open ? {} : inert)}>
            <div className={`${block}__panel-inner`}>
              {panels.map((panel) => {
                const shown = panel.id === openId;
                const titleId = `${panelId(panel.id)}-title`;
                return (
                  <section
                    key={panel.id}
                    id={panelId(panel.id)}
                    className={`${block}__section`}
                    aria-labelledby={titleId}
                    hidden={!shown}>
                    <div className={`${block}__header`}>
                      <h2 id={titleId} className={`${block}__title`}>
                        {panel.label}
                      </h2>
                      <MegaButton
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={Close}
                        tooltipAlignment="left"
                        onClick={() => close(true)}>
                        {`Close ${panel.label.toLowerCase()}`}
                      </MegaButton>
                    </div>
                    {panelContent?.[panel.id] ?? (
                      <p className={`${block}__placeholder`}>
                        {`${panel.label} is not designed yet.`}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatPanelArea.displayName = 'ChatPanelArea';

ChatPanelArea.propTypes = {
  /**
   * The content the panel opens beside, or over.
   */
  children: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * What each panel holds, by id.
   */
  panelContent: PropTypes.objectOf(
    PropTypes.node as unknown as React.Validator<ReactNode>
  ),

  /**
   * How the panel occupies the surface.
   */
  presentation: PropTypes.oneOf(['push', 'overlay']),
};
