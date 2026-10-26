/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import {
  Add,
  ArrowUp,
  Microphone,
  SettingsAdjust,
  StopFilledAlt,
} from '@carbon/icons-react';
import { MegaButton } from '@carbon-labs/react-mega-button';
import { useAutoGrow } from '../internal/useAutoGrow';
import { useMeasuredHeight } from '../internal/useMeasuredHeight';
import { useInverseTheme, type CarbonTheme } from '../internal/useInverseTheme';
import { ActionGroup } from './ActionGroup';
import { ContextMenu, SettingsMenu } from './ChatInputMenus';
import { CommandList, filterCommands } from './CommandList';

export type ChatInputSubmitOn = 'enter' | 'mod-enter';

export type ChatInputActionsPlacement = 'below' | 'inside';

export interface ChatInputConnection {
  id: string;
  label: string;
  enabled: boolean;
  /** Disables the row and says why. */
  unavailableReason?: string;
}

export interface ChatInputOption {
  id: string;
  label: string;
}

export interface ChatInputSetting extends ChatInputOption {
  selected: boolean;
}

export interface ChatInputCommand {
  id: string;
  /** Typed after the slash. Matched case-insensitively. */
  name: string;
  description?: string;
}

/** One surface at a time: opening any of them closes the others. */
type OpenSurface = 'none' | 'context' | 'settings' | 'commands';

/** The command list opens while the prompt is a single leading-slash token. */
const slashQuery = /^\/(\S*)$/;

export interface ChatInputProps {
  /**
   * Where the action buttons sit: `below` the pill (the primary layout), or
   * `inside` the box under the prompt, with send at the far end.
   */
  actionsPlacement?: ChatInputActionsPlacement;

  /**
   * The attached files, as FileChips. The product owns their state; the box
   * grows to hold them.
   */
  attachments?: ReactNode;

  /**
   * The model is answering. Send becomes stop and sending is blocked, so a
   * second prompt cannot overlap a response.
   */
  busy?: boolean;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /** `/` commands, listed as the person types after a leading slash. */
  commands?: ChatInputCommand[];

  /** Connected applications, toggled from the `+` menu. */
  connections?: ChatInputConnection[];

  /** The uncontrolled initial prompt. */
  defaultValue?: string;

  /** Disable the whole input. */
  disabled?: boolean;

  /** The prompt's accessible name. */
  label?: string;

  /** Rows of prompt before the box stops growing and scrolls. */
  maxRows?: number;

  /**
   * The theme the menus render in. Defaults to the opposite of the surface
   * the input sits on: the menus are inverse.
   */
  menuTheme?: CarbonTheme;

  /** Agent modes, chosen from the settings menu. */
  modes?: ChatInputOption[];

  /** Models, chosen from the settings menu. */
  models?: ChatInputOption[];

  /** "Upload a file" in the `+` menu. Omit to hide the row. */
  onAddFile?: () => void;

  /** Called when a command is chosen. */
  onCommand?: (command: ChatInputCommand) => void;

  /** Files dropped on the box or pasted into it. */
  onFilesAdded?: (files: File[]) => void;

  /** Called with the id of the agent mode chosen in Settings. */
  onModeChange?: (id: string) => void;

  /** Called with the id of the model chosen in Settings. */
  onModelChange?: (id: string) => void;

  /** "New connection" in the connections submenu. Omit to hide the row. */
  onNewConnection?: () => void;

  /** Called when a setting in Settings is turned on or off. */
  onSettingChange?: (id: string, selected: boolean) => void;

  /** Voice input. Omit to hide the microphone. */
  onSpeechToggle?: (active: boolean) => void;

  /** Called while busy, from the stop control. */
  onStop?: () => void;

  /** Called with the trimmed prompt. Never while empty or busy. */
  onSubmit?: (prompt: string) => void;

  /** Called when a connection in the `+` menu is turned on or off. */
  onToggleConnection?: (id: string, enabled: boolean) => void;

  /** Called with the prompt as it changes. */
  onValueChange?: (value: string) => void;

  /** Shown in the empty prompt. */
  placeholder?: string;

  /** The agent mode checked in Settings. */
  selectedModeId?: string;

  /** The model checked in Settings. */
  selectedModelId?: string;

  /** Other settings for the next turn, shown as selectable rows. */
  settings?: ChatInputSetting[];

  /** Voice input is capturing; the microphone reads as pressed. */
  speechActive?: boolean;

  /**
   * Which keystroke sends. `enter`: Enter sends and Shift-Enter adds a line.
   * `mod-enter`: ⌘ or Ctrl-Enter sends and Enter adds a line.
   */
  submitOn?: ChatInputSubmitOn;

  /** The controlled prompt. Pair with `onValueChange`. */
  value?: string;
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  function ChatInput(
    {
      actionsPlacement = 'below',
      attachments,
      busy = false,
      className,
      commands = [],
      connections = [],
      defaultValue = '',
      disabled = false,
      label = 'Ask anything',
      maxRows = 8,
      menuTheme,
      modes = [],
      models = [],
      onAddFile,
      onCommand,
      onFilesAdded,
      onModeChange,
      onModelChange,
      onNewConnection,
      onSettingChange,
      onSpeechToggle,
      onStop,
      onSubmit,
      onToggleConnection,
      onValueChange,
      placeholder = 'Type “/” to try a command, or ask anything',
      selectedModeId,
      selectedModelId,
      settings = [],
      speechActive = false,
      submitOn = 'enter',
      value: controlledValue,
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--chat-input`;
    const baseId = useId();
    const listId = `${baseId}-commands`;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const addRef = useRef<HTMLButtonElement | null>(null);
    const settingsRef = useRef<HTMLButtonElement | null>(null);
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const value = controlledValue ?? uncontrolled;
    const setValue = useCallback(
      (next: string) => {
        if (controlledValue === undefined) {
          setUncontrolled(next);
        }
        onValueChange?.(next);
      },
      [controlledValue, onValueChange]
    );

    const [surface, setSurface] = useState<OpenSurface>('none');
    // The list opens with nothing active: a preselected row looks chosen,
    // and Enter would fire a command nobody asked for.
    const [activeIndex, setActiveIndex] = useState(-1);
    const [dropActive, setDropActive] = useState(false);

    // Focus is drawn two ways. A keyboard arrival draws Carbon's focus ring;
    // a pointer arrival, or typing, steps the hairline to border-strong
    // (the human's decision 8).
    const [focusMode, setFocusMode] = useState<'none' | 'keyboard' | 'active'>(
      'none'
    );
    const pointerDown = useRef(false);
    // The surface a trigger's press found open. Pressing a trigger blurs its
    // open menu, which closes it before the click arrives; without this the
    // click would open it again.
    const openAtPress = useRef<OpenSurface>('none');

    const multiline = useAutoGrow(textareaRef, value, maxRows);
    const hasAttachments = Children.toArray(attachments).length > 0;
    // The files' row is always rendered and its height animated, so the box
    // grows and shrinks with them on the same motion as the prompt.
    const attachmentsRef = useRef<HTMLDivElement | null>(null);
    const attachmentsHeight = useMeasuredHeight(attachmentsRef, attachments);
    const [attachmentsMoving, setAttachmentsMoving] = useState(false);
    const attachmentsRowRef = useRef<HTMLDivElement | null>(null);
    // Written to the element, not a style prop (labs lint forbids one).
    useLayoutEffect(() => {
      if (attachmentsRowRef.current && attachmentsHeight !== undefined) {
        attachmentsRowRef.current.style.blockSize = `${attachmentsHeight}px`;
      }
    }, [attachmentsHeight]);
    const lastAttachmentsHeight = useRef(attachmentsHeight);
    useEffect(() => {
      const previous = lastAttachmentsHeight.current;
      lastAttachmentsHeight.current = attachmentsHeight;
      if (previous !== undefined && previous !== attachmentsHeight) {
        setAttachmentsMoving(true);
      }
    }, [attachmentsHeight]);
    const grown = multiline || hasAttachments;
    const inverse = useInverseTheme(rootRef, menuTheme, surface !== 'none');

    const query = slashQuery.exec(value)?.[1];
    const matches = useMemo(
      () => filterCommands(commands, query ?? ''),
      [commands, query]
    );
    const listOpen =
      surface === 'commands' && commands.length > 0 && !busy && !disabled;
    const active = activeIndex >= 0 ? matches[activeIndex] : undefined;

    // Typing a slash token opens the list, through the same state as the
    // menus, so it closes whichever menu was open.
    useEffect(() => {
      if (query !== undefined) {
        setSurface('commands');
      } else {
        setSurface((current) => (current === 'commands' ? 'none' : current));
      }
    }, [query]);

    const canSend = value.trim().length > 0 && !disabled;

    function submit() {
      if (!canSend || busy) {
        return;
      }
      onSubmit?.(value.trim());
      setValue('');
      setSurface('none');
    }

    function chooseCommand(command: ChatInputCommand) {
      onCommand?.(command);
      setValue('');
      setSurface('none');
      setActiveIndex(-1);
      textareaRef.current?.focus();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      // An IME is composing: Enter commits a character, it does not send.
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (listOpen && matches.length > 0) {
        const last = matches.length - 1;
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setActiveIndex((i) => (i < 0 || i >= last ? 0 : i + 1));
            return;
          case 'ArrowUp':
            event.preventDefault();
            setActiveIndex((i) => (i <= 0 ? last : i - 1));
            return;
          case 'Home':
            event.preventDefault();
            setActiveIndex(0);
            return;
          case 'End':
            event.preventDefault();
            setActiveIndex(last);
            return;
          case 'Enter':
          case 'Tab':
            if (active) {
              event.preventDefault();
              chooseCommand(active);
              return;
            }
            break;
          case 'Escape':
            event.preventDefault();
            setSurface('none');
            // Clear the token, or the list reopens from the value.
            setValue('');
            return;
          default:
            break;
        }
      }
      const wantsSubmit =
        event.key === 'Enter' &&
        (submitOn === 'enter'
          ? !event.shiftKey
          : event.metaKey || event.ctrlKey);
      if (wantsSubmit) {
        event.preventDefault();
        submit();
      }
    }

    function takeFiles(files: FileList | null) {
      if (!files?.length || !onFilesAdded) {
        return false;
      }
      onFilesAdded(Array.from(files));
      return true;
    }

    function toggle(next: OpenSurface) {
      const wasOpen = openAtPress.current === next;
      openAtPress.current = 'none';
      setSurface((current) => (current === next || wasOpen ? 'none' : next));
    }

    const hasContextMenu = Boolean(onAddFile) || connections.length > 0;
    const hasSettingsMenu =
      models.length > 0 || modes.length > 0 || settings.length > 0;

    const actions = (
      <>
        {hasContextMenu ? (
          <MegaButton
            ref={addRef}
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Add}
            hideTooltip
            disabled={disabled}
            aria-haspopup="menu"
            aria-expanded={surface === 'context'}
            onPointerDown={() => {
              openAtPress.current = surface;
            }}
            onClick={() => toggle('context')}>
            Add context
          </MegaButton>
        ) : null}
        {hasSettingsMenu ? (
          <MegaButton
            ref={settingsRef}
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={SettingsAdjust}
            hideTooltip
            disabled={disabled}
            aria-haspopup="menu"
            aria-expanded={surface === 'settings'}
            onPointerDown={() => {
              openAtPress.current = surface;
            }}
            onClick={() => toggle('settings')}>
            Settings
          </MegaButton>
        ) : null}
        {onSpeechToggle ? (
          <MegaButton
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Microphone}
            hideTooltip
            disabled={disabled}
            isSelected={speechActive}
            onClick={() => onSpeechToggle(!speechActive)}>
            Voice input
          </MegaButton>
        ) : null}
      </>
    );

    const send = busy ? (
      <MegaButton
        kind="primary"
        size="sm"
        hasIconOnly
        renderIcon={StopFilledAlt}
        tooltipAlignment="top"
        // Inside, send joins the group's shared tooltip.
        hideTooltip={actionsPlacement === 'inside'}
        className={`${block}__send`}
        onClick={() => onStop?.()}>
        Stop generating
      </MegaButton>
    ) : (
      <MegaButton
        kind={canSend ? 'primary' : 'ghost'}
        size="sm"
        hasIconOnly
        renderIcon={ArrowUp}
        tooltipAlignment="top"
        // Inside, send joins the group's shared tooltip.
        hideTooltip={actionsPlacement === 'inside'}
        className={`${block}__send`}
        disabled={!canSend}
        onClick={submit}>
        Send
      </MegaButton>
    );

    return (
      <div
        ref={setRootRef}
        className={cx(
          block,
          `${block}--actions-${actionsPlacement}`,
          {
            [`${block}--disabled`]: disabled,
          },
          className
        )}>
        <div
          className={cx(`${block}__box`, {
            [`${block}__box--grown`]: grown || actionsPlacement === 'inside',
            [`${block}__box--keyboard-focus`]: focusMode === 'keyboard',
            [`${block}__box--active`]: focusMode === 'active',
            [`${block}__box--drop`]: dropActive,
          })}
          onPointerDown={() => {
            pointerDown.current = true;
          }}
          onFocus={() => {
            setFocusMode(pointerDown.current ? 'active' : 'keyboard');
            pointerDown.current = false;
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setFocusMode('none');
            }
          }}
          onDragOver={(event: DragEvent<HTMLDivElement>) => {
            if (onFilesAdded && !disabled) {
              event.preventDefault();
              setDropActive(true);
            }
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            if (onFilesAdded && !disabled) {
              event.preventDefault();
              setDropActive(false);
              takeFiles(event.dataTransfer.files);
            }
          }}>
          <div
            className={cx(`${block}__attachments`, {
              // Clip only while moving: at rest a chip's tooltips overflow.
              [`${block}__attachments--moving`]: attachmentsMoving,
            })}
            ref={attachmentsRowRef}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                // Chrome reports the logical property by its physical name.
                (event.propertyName === 'block-size' ||
                  event.propertyName === 'height')
              ) {
                setAttachmentsMoving(false);
              }
            }}>
            <div ref={attachmentsRef} className={`${block}__attachment-list`}>
              {attachments}
            </div>
          </div>
          <div className={`${block}__row`}>
            <textarea
              ref={textareaRef}
              className={`${block}__prompt`}
              rows={1}
              value={value}
              placeholder={placeholder}
              aria-label={label}
              disabled={disabled}
              // Autocomplete semantics without role="combobox", which is not
              // allowed on a multi-line textbox (axe, aria-allowed-attr).
              aria-haspopup={commands.length > 0 ? 'listbox' : undefined}
              aria-autocomplete={commands.length > 0 ? 'list' : undefined}
              aria-controls={listOpen ? listId : undefined}
              aria-activedescendant={
                listOpen && activeIndex >= 0
                  ? `${listId}-${activeIndex}`
                  : undefined
              }
              onChange={(event) => {
                setValue(event.target.value);
                setActiveIndex(-1);
                setFocusMode('active');
              }}
              onKeyDown={handleKeyDown}
              onPaste={(event: ClipboardEvent<HTMLTextAreaElement>) => {
                if (takeFiles(event.clipboardData.files)) {
                  event.preventDefault();
                }
              }}
            />
            {actionsPlacement === 'below' ? send : null}
          </div>
          {actionsPlacement === 'inside' ? (
            <ActionGroup label="Chat input actions">
              {actions}
              <span className={`${block}__spacer`} />
              {send}
            </ActionGroup>
          ) : null}
        </div>
        {actionsPlacement === 'below' ? (
          <ActionGroup label="Chat input actions">{actions}</ActionGroup>
        ) : null}
        <CommandList
          id={listId}
          open={listOpen}
          theme={inverse}
          commands={matches}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
          onChoose={chooseCommand}
        />
        <ContextMenu
          open={surface === 'context'}
          theme={inverse}
          triggerRef={addRef}
          connections={connections}
          onAddFile={onAddFile}
          onNewConnection={onNewConnection}
          onToggleConnection={onToggleConnection}
          onClose={() => setSurface('none')}
        />
        <SettingsMenu
          open={surface === 'settings'}
          theme={inverse}
          triggerRef={settingsRef}
          models={models}
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
          modes={modes}
          selectedModeId={selectedModeId}
          onModeChange={onModeChange}
          settings={settings}
          onSettingChange={onSettingChange}
          onClose={() => setSurface('none')}
        />
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

const optionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

ChatInput.propTypes = {
  /**
   * Where the action buttons sit: `below` the pill (the primary layout), or
   * `inside` the box under the prompt, with send at the far end.
   */
  actionsPlacement: PropTypes.oneOf(['below', 'inside']),

  /**
   * The attached files, as FileChips. The product owns their state; the box
   * grows to hold them.
   */
  // Labs's idiom: prop-types' node is typed against an older ReactNode.
  attachments: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * The model is answering. Send becomes stop and sending is blocked, so a
   * second prompt cannot overlap a response.
   */
  busy: PropTypes.bool,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /** `/` commands, listed as the person types after a leading slash. */
  commands: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ) as unknown as React.Validator<ChatInputCommand[]>,

  /** Connected applications, toggled from the `+` menu. */
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      enabled: PropTypes.bool.isRequired,
      unavailableReason: PropTypes.string,
    })
  ) as unknown as React.Validator<ChatInputConnection[]>,

  /** The uncontrolled initial prompt. */
  defaultValue: PropTypes.string,

  /** Disable the whole input. */
  disabled: PropTypes.bool,

  /** The prompt's accessible name. */
  label: PropTypes.string,

  /** Rows of prompt before the box stops growing and scrolls. */
  maxRows: PropTypes.number,

  /**
   * The theme the menus render in. Defaults to the opposite of the surface
   * the input sits on: the menus are inverse.
   */
  menuTheme: PropTypes.oneOf(['white', 'g10', 'g90', 'g100']),

  /** Models, chosen from the settings menu. */
  models: PropTypes.arrayOf(optionShape) as unknown as React.Validator<
    ChatInputOption[]
  >,

  /** Agent modes, chosen from the settings menu. */
  modes: PropTypes.arrayOf(optionShape) as unknown as React.Validator<
    ChatInputOption[]
  >,

  /** "Upload a file" in the `+` menu. Omit to hide the row. */
  onAddFile: PropTypes.func,

  /** Called when a command is chosen. */
  onCommand: PropTypes.func,

  /** Files dropped on the box or pasted into it. */
  onFilesAdded: PropTypes.func,

  /** Called with the id of the agent mode chosen in Settings. */
  onModeChange: PropTypes.func,

  /** Called with the id of the model chosen in Settings. */
  onModelChange: PropTypes.func,

  /** "New connection" in the connections submenu. Omit to hide the row. */
  onNewConnection: PropTypes.func,

  /** Called when a setting in Settings is turned on or off. */
  onSettingChange: PropTypes.func,

  /** Voice input. Omit to hide the microphone. */
  onSpeechToggle: PropTypes.func,

  /** Called while busy, from the stop control. */
  onStop: PropTypes.func,

  /** Called with the trimmed prompt. Never while empty or busy. */
  onSubmit: PropTypes.func,

  /** Called when a connection in the `+` menu is turned on or off. */
  onToggleConnection: PropTypes.func,

  /** Called with the prompt as it changes. */
  onValueChange: PropTypes.func,

  /** Shown in the empty prompt. */
  placeholder: PropTypes.string,

  /** The agent mode checked in Settings. */
  selectedModeId: PropTypes.string,

  /** The model checked in Settings. */
  selectedModelId: PropTypes.string,

  /** Other settings for the next turn, shown as selectable rows. */
  settings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool.isRequired,
    })
  ) as unknown as React.Validator<ChatInputSetting[]>,

  /** Voice input is capturing; the microphone reads as pressed. */
  speechActive: PropTypes.bool,

  /**
   * Which keystroke sends. `enter`: Enter sends and Shift-Enter adds a line.
   * `mod-enter`: ⌘ or Ctrl-Enter sends and Enter adds a line.
   */
  submitOn: PropTypes.oneOf(['enter', 'mod-enter']),

  /** The controlled prompt. Pair with `onValueChange`. */
  value: PropTypes.string,
};
