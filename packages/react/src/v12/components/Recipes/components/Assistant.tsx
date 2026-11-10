/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Close } from '@carbon-labs/react-motion-icons';
import {
  ChatPane,
  ChatShell,
  ChatTranscript,
  ChatTurnNavigator,
  PromptInput,
  Suggestions,
  type ChatStep,
  type ChatTranscriptProps,
  type ChatTurn,
  type ChatTurnNavigatorWords,
  type ChatRating,
  type ChipFile,
  type PromptInputWords,
  type Suggestion,
} from '@carbon-labs/react-chat';
import { IconButton } from '@carbon-labs/react-tooltip';
import './assistant.scss';

/* ============================================================================
 * Assistant: the assistant recipe.
 *
 * A ChatPane beside the page holding a ChatShell: the header and its turn
 * navigator, the conversation, the prompt and its chips, and suggestions.
 *
 *   open     the pane opens its own space beside the page, which narrows
 *   prompt   send swaps to Stop; its ring turns only while the reply's own
 *            working is out of sight
 *   focus    a chosen suggestion leaves focus in the prompt; closing from the
 *            pane returns it to the element focused as it opened, or the launcher
 *   a11y     the pane is the one named region; a finished reply is announced
 *   reduced  each part's own
 * ========================================================================== */

/** The conversation's word props, passed on to ChatTranscript. */
export type AssistantTranscriptWords = Pick<
  ChatTranscriptProps,
  | 'label'
  | 'jumpToReplyStartLabel'
  | 'retryButtonText'
  | 'actionsProps'
  | 'stepListProps'
>;

export interface AssistantProps {
  /** The pane is open. */
  open: boolean;
  /** The close button (none without it). */
  onClose?: () => void;
  /** The page beside the pane. */
  children?: ReactNode;
  /** The conversation. */
  turns: ChatTurn[];
  /** Called with the prompt's text as it is sent. */
  onSubmit: (text: string) => void;
  /** A reply is working: send becomes Stop. */
  generating?: boolean;
  onStop?: () => void;
  /** Prompts to start from, shown under the prompt until the conversation starts. */
  suggestions?: Suggestion[];
  /** Called with a chosen suggestion. Default: send its words. */
  onChooseSuggestion?: (suggestion: Suggestion) => void;
  /** Attachments, as chips above the prompt's text. */
  files?: ChipFile[];
  onRemoveFile?: (id: string) => void;
  /** The prompt's add menu (MenuItems): files, tools. */
  addMenu?: ReactNode;
  placeholder?: string;
  /** The prompt's field, to put focus back in it. */
  promptRef?: Ref<HTMLTextAreaElement>;
  /** The page's control that opens the pane: focus goes there on close when the pane is open from the start. */
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** Shown while there are no turns. */
  empty?: ReactNode;
  onRetry?: (turn: ChatTurn) => void;
  onContinue?: (turn: ChatTurn) => void;
  onRate?: (turn: ChatTurn, rating: ChatRating) => void;
  onRetryStep?: (turn: ChatTurn, step: ChatStep) => void;
  /** A waiting step's choices (Approve, Skip …). */
  stepActions?: (turn: ChatTurn, step: ChatStep) => ReactNode;
  /** The pane's width, a CSS length. Default `26rem`. */
  size?: string;
  /** The pane's heading and its region's name. Default "Assistant". */
  title?: string;
  /** Default "Close assistant". */
  closeButtonLabel?: string;
  /** The suggestions' name. Default "Suggestions". */
  suggestionsLabel?: string;
  /** The prompt's words (PromptInput's). */
  promptProps?: PromptInputWords & { label?: string };
  /** The conversation's words (ChatTranscript's). */
  transcriptProps?: AssistantTranscriptWords;
  /** The turn navigator's words (ChatTurnNavigator's). */
  navigatorProps?: ChatTurnNavigatorWords;
  timeScale?: number;
  reduced?: boolean;
  className?: string;
}

const textOf = (t: ChatTurn | undefined) =>
  t ? (t.chunks ?? []).join(' ') : '';

/** The latest finished reply: what the live region says. */
const latestDone = (turns: ChatTurn[]) =>
  [...turns].reverse().find((t) => t.role === 'assistant' && t.done);

export function Assistant({
  open,
  onClose,
  children,
  turns,
  onSubmit,
  generating = false,
  onStop,
  suggestions,
  onChooseSuggestion,
  files,
  onRemoveFile,
  addMenu,
  placeholder,
  promptRef,
  launcherButtonRef,
  empty,
  onRetry,
  onContinue,
  onRate,
  onRetryStep,
  stepActions,
  size = '26rem',
  title = 'Assistant',
  closeButtonLabel = 'Close assistant',
  suggestionsLabel = 'Suggestions',
  promptProps,
  transcriptProps,
  navigatorProps,
  timeScale = 1,
  reduced,
  className,
}: AssistantProps) {
  // One working element in sight: Stop's ring turns only while the reply is out of view.
  const [replyInView, setReplyInView] = useState(true);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(promptRef, () => fieldRef.current!, []);

  // The element focused as the pane opens, to go back to as it closes: only while focus is in the
  // pane or nowhere, so a page control that closed it keeps focus; else the launcher.
  const rootRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    if (open && wasOpen.current === false) returnTo.current = active;
    if (!open && wasOpen.current) {
      const pane = rootRef.current?.querySelector(':scope > .cds-chat-pane');
      const stored = returnTo.current;
      const target =
        stored && stored !== document.body && stored.isConnected
          ? stored
          : launcherButtonRef?.current;
      if (
        (!active || active === document.body || pane?.contains(active)) &&
        target
      )
        target.focus();
    }
    wasOpen.current = open;
  }, [open, launcherButtonRef]);

  // A reply finishing is announced once; the ones there at mount are not.
  const [firstDone] = useState(() => latestDone(turns)?.id);
  const done = latestDone(turns);
  const announced = done && done.id !== firstDone ? textOf(done) : '';

  const choose = (s: Suggestion) => {
    if (onChooseSuggestion) onChooseSuggestion(s);
    else onSubmit([s.text, s.secondary].filter(Boolean).join(' '));
    fieldRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={['cds-assistant', className].filter(Boolean).join(' ')}>
      <div className="cds-assistant__page">{children}</div>
      <ChatPane open={open} size={size} label={title} timeScale={timeScale}>
        <ChatShell
          className="cds-assistant__shell"
          label={null}
          timeScale={timeScale}
          reduced={reduced}
          header={
            <>
              <h2 className="cds-assistant__title">{title}</h2>
              <div className="cds-assistant__tools">
                <ChatTurnNavigator {...navigatorProps} />
                {onClose && (
                  <IconButton
                    label={closeButtonLabel}
                    frame="ghost"
                    size="sm"
                    align="left"
                    onClick={onClose}>
                    <Close size={16} />
                  </IconButton>
                )}
              </div>
            </>
          }
          below={
            turns.length === 0 && suggestions?.length ? (
              <Suggestions
                key="suggestions"
                items={suggestions}
                label={suggestionsLabel}
                timeScale={timeScale}
                onChoose={choose}
              />
            ) : null
          }
          prompt={
            <PromptInput
              {...promptProps}
              fieldRef={fieldRef}
              placeholder={placeholder}
              addMenu={addMenu}
              files={files}
              onRemoveFile={onRemoveFile}
              generating={generating}
              onStop={onStop}
              stopRing={!replyInView}
              onSubmit={onSubmit}
              timeScale={timeScale}
            />
          }>
          <ChatTranscript
            {...transcriptProps}
            turns={turns}
            empty={empty}
            onReplyInView={setReplyInView}
            onRetry={onRetry}
            onContinue={onContinue}
            onRate={onRate}
            onRetryStep={onRetryStep}
            stepActions={stepActions}
            timeScale={timeScale}
            reduced={reduced}
          />
        </ChatShell>
        <span
          className="cds-assistant__announce"
          role="status"
          aria-live="polite">
          <span key={done?.id}>{announced}</span>
        </span>
      </ChatPane>
    </div>
  );
}
Assistant.displayName = 'Assistant';
