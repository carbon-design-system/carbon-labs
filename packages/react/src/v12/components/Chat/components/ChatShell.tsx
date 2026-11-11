/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Layer } from '@carbon/react';
import { ChatDock } from './ChatDock';
import {
  ChatShellContext,
  DEFAULT_CHAT_VARIANT,
  type ChatCorners,
  type ChatVariant,
} from './context';
import { ChatTurnsContext, createTurnsStore } from './turns';
import './chat.scss';

/* ============================================================================
 * ChatShell: the chat's container.
 *
 *   corners  concentric: the shell's corner is the prompt's plus its padding
 *   variant  inverse, tonal or outlined, for every part that names none
 *   surface  `$layer`, its contents a layer up
 *   layout   the header on top, the conversation filling, the prompt docked in
 *            a ChatDock with its `above` and `below` slots; `column` caps the
 *            width; `rail`, `nav`, `aside` and `overlay` frame it
 *   turns    links its transcript to a ChatTurnNavigator in the header
 *   reduced  the dock's
 * ========================================================================== */

export interface ChatShellProps {
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (the field's 8px, the shell 16px; default), `full`, `square`. */
  corners?: ChatCorners;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** The chat's look: `inverse` (default), `tonal`, `outlined`. */
  variant?: ChatVariant;
  /** The shell's padding round the prompt and the transcript, px. Default 8. */
  padding?: number;
  /** The header's content: a title, and a ChatTurnNavigator to move between questions. */
  header?: ReactNode;
  /** The prompt (a PromptInput). */
  prompt: ReactNode;
  /** The dock's slot above the prompt (a keyed FollowUpCard): a new key swaps it. */
  above?: ReactElement | null;
  /** The dock's slot below the prompt (keyed Suggestions). */
  below?: ReactElement | null;
  /** The conversation's and the prompt's width, centred (a CSS length). None: the shell's width. */
  column?: string;
  /** The frame's tools: a vertical Toolbar at the inline end. */
  rail?: ReactNode;
  /** A column at the inline start, before the conversation. */
  nav?: ReactNode;
  /** Beside the chat: a SidePanel (`scope="container"`, pushing the chat with `slideIn`) or a ChatPane. */
  aside?: ReactNode;
  /** Floating in the frame, top end. */
  overlay?: ReactNode;
  /** Slow motion for the dock. Default 1. */
  timeScale?: number;
  /** Overrides `prefers-reduced-motion`. */
  reduced?: boolean;
  /** The conversation (a ChatTranscript, or anything). */
  children?: ReactNode;
  /** The shell's accessible name, a region. Default "Chat"; null for none, inside a named region. */
  label?: string | null;
  className?: string;
  style?: CSSProperties;
}

export function ChatShell({
  corners = 'rounded',
  variant = DEFAULT_CHAT_VARIANT,
  padding = 8,
  header,
  prompt,
  above = null,
  below = null,
  column,
  rail,
  nav,
  aside,
  overlay,
  timeScale = 1,
  reduced,
  children,
  label = 'Chat',
  className,
  style,
}: ChatShellProps) {
  // The dock's layout root: the whole column moves as one.
  const columnRef = useRef<HTMLDivElement>(null);
  const [turns] = useState(createTurnsStore);
  return (
    <ChatShellContext.Provider value={{ corners, variant }}>
      <ChatTurnsContext.Provider value={turns}>
        <section
          className={[
            'cds-chat-shell',
            `cds-chat-shell--${corners}`,
            `cds-chat-shell--${variant}`,
            rail != null && 'cds-chat-shell--rail',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--chat-pad': `${padding}px`,
              ...(column ? { '--chat-column': column } : null),
              ...style,
            } as CSSProperties
          }
          aria-label={label ?? undefined}>
          <Layer className="cds-chat-shell__layer">
            <div className="cds-chat-shell__main">
              {header != null && (
                <div className="cds-chat-shell__header">{header}</div>
              )}
              <div ref={columnRef} className="cds-chat-shell__column">
                <div className="cds-chat-shell__body">{children}</div>
                <ChatDock
                  className="cds-chat-shell__composer"
                  above={above}
                  below={below}
                  layoutRoot={() => columnRef.current}
                  timeScale={timeScale}
                  reduced={reduced}>
                  {prompt}
                </ChatDock>
              </div>
              {nav != null && <div className="cds-chat-shell__nav">{nav}</div>}
              {rail != null && (
                <div className="cds-chat-shell__rail">{rail}</div>
              )}
              {overlay != null && (
                <div className="cds-chat-shell__overlay">{overlay}</div>
              )}
            </div>
            {aside}
          </Layer>
        </section>
      </ChatTurnsContext.Provider>
    </ChatShellContext.Provider>
  );
}
ChatShell.displayName = 'ChatShell';
