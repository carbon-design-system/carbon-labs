/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Add,
  ArrowUp,
  SettingsAdjust,
  StopFilledAlt,
} from '@carbon-labs/react-motion-icons';
import { watchTonal } from '@carbon-labs/v12-motion';
import {
  MenuButton,
  MenuItem,
  MenuItemDivider,
  MenuItemRadioGroup,
  OverflowMenu,
} from '@carbon-labs/react-menu';
import { Popover } from '@carbon-labs/react-popover';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Spinner, SwapSlot } from '@carbon-labs/react-feedback';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  useChatShell,
  useChatVariant,
  type ChatCorners,
  type ChatVariant,
} from './context';
import { DictationButton, DictationStatus } from './DictationButton';
import { FileChips, type ChipFile, type FileChipsWords } from './FileChips';
import { PromptNotice, type PromptNoticeValue } from './PromptNotice';
import { useChatRollover } from './rollover';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import './chat.scss';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * PromptInput: the chat's prompt.
 *
 *   field    a textarea on Text input's classes, growing a line at a time to
 *            `maxRows`; Enter sends, Shift+Enter is a new line
 *   footer   add menu, parameters, the model, the host's tools, dictation, send
 *   stop     while `generating`, send swaps to Stop in place and the kit's
 *            Spinner turns round it (`stopRing`)
 *   selected focus anywhere in the prompt keeps the field's selected edge
 *   parts    FileChips above the text; PromptNotice behind the top edge
 *   reduced  the swaps on the reduced clock and no ring
 * ========================================================================== */

/** PromptInput's words, each a prop with an English default, beside `label` and `placeholder`. */
export interface PromptInputWords extends FileChipsWords {
  /** The add menu's button. Default "Add". */
  addButtonLabel?: string;
  /** The Parameters button and its popover. Default "Parameters". */
  parametersButtonLabel?: string;
  /** The model list's name. Default "Model". */
  modelMenuLabel?: string;
  /** The submenu of more models. Default "More models". */
  moreModelsMenuLabel?: string;
  /** Default "Send". */
  sendButtonLabel?: string;
  /** Send while a reply generates. Default "Stop generating". */
  stopButtonLabel?: string;
  /** The microphone, off and on. Default "Dictate", "Stop dictation". */
  dictateButtonLabel?: string;
  stopDictationButtonLabel?: string;
  /** Dictation's status, before its first second and after. Default "Ready when you are.", "Listening". */
  dictationReadyText?: string;
  dictationListeningText?: string;
  /** The docked notice's close. Default "Close notification". */
  closeNoticeButtonLabel?: string;
}

export interface PromptInputProps extends PromptInputWords {
  /** The textarea, for the host to put focus back in it (after a follow-up's choice, Skip). */
  fieldRef?: Ref<HTMLTextAreaElement>;
  /** The field's accessible name. Default "Prompt". */
  label?: string;
  /** Default "Type “/” to try a command, or ask anything". */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (text: string) => void;
  /** Enter (or the send button) with text in the field. */
  onSubmit?: (text: string) => void;
  /** The `+` menu's items (MenuItems). None: no `+`. */
  addMenu?: ReactNode;
  /** The Parameters panel's content. None: no Parameters button. */
  parameters?: ReactNode;
  /** The models to choose from. None: no model picker. */
  models?: string[];
  model?: string;
  defaultModel?: string;
  onModelChange?: (model: string) => void;
  /** More models, in a submenu after the main list (no shortcuts). */
  moreModels?: string[];
  /** The model menu's own rows after the models, past a divider (e.g. a Fast mode group): Menu rows as elements, which the Menu reads by type. */
  modelMenuExtra?: ReactNode;
  /** The cast shadow under the menus and the Parameters popover. Default: the kit's (`KitDefaults shadow`, none); `true` or an elevation turns it on. */
  shadow?: SurfaceShadowOption;
  /** The host's own footer tools after the model (ghost IconButtons at sm). */
  tools?: ReactNode;
  /** A reply is generating: send becomes Stop, with a spinner ring round it. */
  generating?: boolean;
  /** Stop, while `generating`. */
  onStop?: () => void;
  /** Stop's spinner ring while `generating`; false while the reply's own working is in sight. Default true. */
  stopRing?: boolean;
  /** Show the microphone. Default true. */
  voice?: boolean;
  /** Dictation is on (controlled). */
  listening?: boolean;
  onListeningChange?: (listening: boolean) => void;
  /** The field grows to this many lines, then scrolls. Default 8. */
  maxRows?: number;
  /** Attachments, above the text. */
  files?: ChipFile[];
  onRemoveFile?: (id: string) => void;
  /** A notification docked to the field's top edge. */
  notice?: PromptNoticeValue | null;
  onCloseNotice?: () => void;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (8px, default), `full` (a pill), `square`. Default the enclosing ChatShell's. */
  corners?: ChatCorners;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** Stop's fill and the menus' marker (Send and listening take the brand). Default the shell's; `hero` adds the blue selected edge. */
  variant?: ChatVariant | 'hero';
  /** Slow motion for the chips, the notice and dictation's status. Default 1. */
  timeScale?: number;
  disabled?: boolean;
  className?: string;
}

const NO_FILES: ChipFile[] = [];

export function PromptInput({
  fieldRef: fieldRefProp,
  label = 'Prompt',
  placeholder = 'Type “/” to try a command, or ask anything',
  addButtonLabel = 'Add',
  parametersButtonLabel = 'Parameters',
  modelMenuLabel = 'Model',
  moreModelsMenuLabel = 'More models',
  sendButtonLabel = 'Send',
  stopButtonLabel = 'Stop generating',
  dictateButtonLabel,
  stopDictationButtonLabel,
  dictationReadyText,
  dictationListeningText,
  closeNoticeButtonLabel,
  attachmentsLabel,
  removeFileButtonLabel,
  removeFileTooltipLabel,
  value: valueProp,
  defaultValue = '',
  onChange,
  onSubmit,
  addMenu,
  parameters,
  models,
  model: modelProp,
  defaultModel,
  onModelChange,
  moreModels,
  modelMenuExtra,
  shadow,
  tools,
  generating = false,
  onStop,
  stopRing = true,
  voice = true,
  listening: listeningProp,
  onListeningChange,
  maxRows = 8,
  files,
  onRemoveFile,
  notice = null,
  onCloseNotice,
  corners: cornersProp,
  variant: variantProp,
  timeScale = 1,
  disabled = false,
  className,
}: PromptInputProps) {
  const shell = useChatShell();
  const corners = cornersProp ?? shell?.corners ?? 'rounded';
  const hero = variantProp === 'hero';
  const variant = useChatVariant(
    variantProp === 'hero' ? undefined : variantProp
  );
  const [ownListening, setOwnListening] = useState(false);
  const listening = listeningProp ?? ownListening;
  const setListening = (on: boolean) => {
    if (listeningProp === undefined) setOwnListening(on);
    onListeningChange?.(on);
  };
  const [own, setOwn] = useState(defaultValue);
  const text = valueProp ?? own;
  const [ownModel, setOwnModel] = useState(defaultModel ?? models?.[0] ?? '');
  const model = modelProp ?? ownModel;
  const [paramsOpen, setParamsOpen] = useState(false);
  const [paramsButton, setParamsButton] = useState<HTMLButtonElement | null>(
    null
  );
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(fieldRefProp, () => fieldRef.current!, []);
  // A tonal prompt takes its hue from where it sits (the core's tonal watcher, for the tonal look only).
  const rootRef = useRef<HTMLDivElement>(null);
  // The parameters draw in a portal: the rollover takes its reduced motion from this prompt there too.
  const paramsRef = useRef<HTMLDivElement>(null);
  useChatRollover(rootRef, paramsRef);
  const microphone = () =>
    rootRef.current?.querySelector<HTMLElement>('.cds-dictation') ?? null;
  useLayoutEffect(
    () => (variant === 'tonal' ? watchTonal(rootRef.current) : undefined),
    [variant]
  );
  // Selected while focus is anywhere in the prompt, its portalled menus included, so moving between
  // its parts never steps the edge down; a blur waits a task for focus moving within it.
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(blurTimer.current), []);
  const onFocusWithin = () => {
    window.clearTimeout(blurTimer.current);
    setFocused(true);
  };
  const onBlurWithin = () => {
    window.clearTimeout(blurTimer.current);
    blurTimer.current = window.setTimeout(() => setFocused(false), 0);
  };

  // The field grows with its text, a line at a time, up to `maxRows`. The
  // text's height is read once: a second read after the write would lay
  // the page out again on every key.
  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 20;
    el.style.height = 'auto';
    const max =
      line * maxRows + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const content = el.scrollHeight;
    el.style.height = `${Math.min(content, max)}px`;
    el.style.overflowY = content > max ? 'auto' : 'hidden';
  }, [text, maxRows]);

  const chooseModel = (next: string) => {
    if (modelProp === undefined) setOwnModel(next);
    onModelChange?.(next);
  };
  const setText = (t: string) => {
    if (valueProp === undefined) setOwn(t);
    onChange?.(t);
  };
  const send = () => {
    const t = text.trim();
    if (!t || disabled || generating) return;
    onSubmit?.(t);
    if (valueProp === undefined) setOwn('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing(e)) {
      e.preventDefault();
      send();
    }
  };
  const hasText = text.trim().length > 0;
  const { reduced } = useFeedbackMotion();

  return (
    <div
      ref={rootRef}
      className={[
        'cds-text-input',
        'cds-text-input--md',
        'cds-prompt',
        `cds-prompt--${variant}`,
        corners === 'square' && 'cds-text-input--square',
        corners === 'full' && 'cds-text-input--full',
        hero && 'cds-text-input--primary',
        disabled && 'cds-text-input--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      {voice && (
        <DictationStatus
          listening={listening}
          prompt={rootRef}
          microphone={microphone}
          dictationReadyText={dictationReadyText}
          dictationListeningText={dictationListeningText}
          timeScale={timeScale}
        />
      )}
      <PromptNotice
        notice={notice}
        onClose={onCloseNotice}
        closeButtonLabel={closeNoticeButtonLabel}
        timeScale={timeScale}
      />
      <div
        className="cds-text-input__field cds-prompt__shell"
        data-focus={focused || undefined}
        onFocus={onFocusWithin}
        onBlur={onBlurWithin}
        onPointerDown={(e) => {
          // No press step (Text input's `data-held`) when the field is already
          // selected, or when the press is on one of the footer's controls.
          const shell = e.currentTarget;
          if (!focused && !(e.target as Element).closest('button')) return;
          holdUntilRelease(shell);
        }}
        // A press on the shell's empty space puts the caret in the field.
        onMouseDown={(e) => {
          const t = e.target as Element;
          if (
            t === e.currentTarget ||
            t.classList.contains('cds-prompt__footer')
          ) {
            e.preventDefault();
            fieldRef.current?.focus();
          }
        }}>
        <FileChips
          files={files ?? NO_FILES}
          onRemove={onRemoveFile}
          onEmptied={() => fieldRef.current?.focus()}
          attachmentsLabel={attachmentsLabel}
          removeFileButtonLabel={removeFileButtonLabel}
          removeFileTooltipLabel={removeFileTooltipLabel}
          timeScale={timeScale}
        />
        <textarea
          ref={fieldRef}
          className="cds-prompt__field"
          rows={1}
          aria-label={label}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="cds-prompt__footer">
          <div className="cds-prompt__tools">
            {addMenu != null && (
              <OverflowMenu
                label={addButtonLabel}
                renderIcon={Add}
                size="sm"
                menuSize="md"
                menuAlignment="bottom-start"
                disabled={disabled}
                variant={variant}
                shadow={shadow}
                className="cds-prompt__tool">
                {addMenu}
              </OverflowMenu>
            )}
            {parameters != null && (
              <>
                <IconButton
                  ref={setParamsButton as never}
                  label={parametersButtonLabel}
                  frame="ghost"
                  size="sm"
                  disabled={disabled}
                  isSelected={paramsOpen}
                  aria-expanded={paramsOpen}
                  aria-haspopup="dialog"
                  className="cds-prompt__tool"
                  onClick={() => setParamsOpen((o) => !o)}>
                  <SettingsAdjust size={16} />
                </IconButton>
                <Popover
                  open={paramsOpen}
                  onRequestClose={() => setParamsOpen(false)}
                  anchor={paramsButton}
                  label={parametersButtonLabel}
                  align="bottom-start"
                  shadow={shadow}>
                  <div ref={paramsRef} className="cds-prompt__params">
                    {parameters}
                  </div>
                </Popover>
              </>
            )}
            {models && models.length > 0 && (
              <MenuButton
                label={model}
                frame="ghost"
                size="sm"
                menuSize="md"
                disabled={disabled}
                menuVariant={variant}
                shadow={shadow}
                className="cds-prompt__model">
                <MenuItemRadioGroup
                  label={modelMenuLabel}
                  hideLabel
                  mark="check"
                  shortcuts
                  items={models}
                  selectedItem={model}
                  onChange={(m) => chooseModel(String(m))}
                />
                {moreModels && moreModels.length > 0 && (
                  <>
                    <MenuItemDivider />
                    <MenuItem label={moreModelsMenuLabel}>
                      <MenuItemRadioGroup
                        label={moreModelsMenuLabel}
                        hideLabel
                        mark="check"
                        items={moreModels}
                        selectedItem={model}
                        onChange={(m) => chooseModel(String(m))}
                      />
                    </MenuItem>
                  </>
                )}
                {modelMenuExtra != null && (
                  <>
                    <MenuItemDivider />
                    {modelMenuExtra}
                  </>
                )}
              </MenuButton>
            )}
            {tools}
          </div>
          <div className="cds-prompt__actions">
            {voice && (
              <DictationButton
                dictateButtonLabel={dictateButtonLabel}
                stopDictationButtonLabel={stopDictationButtonLabel}
                listening={listening}
                onListeningChange={setListening}
                disabled={disabled}
                className="cds-prompt__tool"
              />
            )}
            <span className="cds-prompt__send-place">
              <IconButton
                label={generating ? stopButtonLabel : sendButtonLabel}
                frame="ghost"
                size="sm"
                corners="full"
                disabled={generating ? !onStop : disabled || !hasText}
                className={[
                  'cds-prompt__send',
                  (hasText || generating) && 'cds-prompt__send--ready',
                  hasText &&
                    !generating &&
                    !disabled &&
                    'cds-prompt__send--hero',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={generating ? onStop : send}>
                {/* Out, then in: the arrow leaves, then the square arrives (and back). */}
                <SwapSlot swapKey={generating ? 'stop' : 'send'}>
                  {generating ? (
                    <StopFilledAlt size={16} />
                  ) : (
                    <ArrowUp size={16} />
                  )}
                </SwapSlot>
              </IconButton>
              {/* The spinner ring round Stop: still working. Its words are the button's. */}
              {!reduced && (
                <span className="cds-prompt__stop-ring" aria-hidden="true">
                  {/* Always the base breaking round the arc: inset, the arc would cross Send's circle. */}
                  <Spinner
                    size={32}
                    motion={{ gapStyle: 'break' }}
                    active={generating && stopRing}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
PromptInput.displayName = 'PromptInput';
