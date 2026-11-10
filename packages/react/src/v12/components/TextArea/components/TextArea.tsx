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
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import {
  attachScroller,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import {
  counterAnnouncement,
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
  FIELD_TIMING,
} from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { FieldMessage } from '@carbon-labs/react-text-input';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import { attachScrollSoftEdge } from '@carbon-labs/react-scroller';
import type { FieldFrame, FieldVariant } from '@carbon-labs/react-props';
import { FIELD_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import '@carbon-labs/react-scroller/scss/scroller.scss';
import './text-area.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { useAiFill, type FieldAiProps } from '@carbon-labs/react-text-input';

/* ============================================================================
 * TextArea — Carbon v11's TextArea on the kit's text field.
 * ============================================================================
 *
 * v11's props and behaviour: `id`, `labelText`, `hideLabel`, `helperText`,
 * `placeholder`, `rows` (default 4), `cols`, `enableCounter` + `maxCount`
 * with `counterMode` (`character`, the default, or `word`: v11's word
 * count, its blocked space and Enter at the limit and its truncated paste),
 * `invalid` + `invalidText`, `warn` + `warnText` (read-only and disabled
 * beat both, invalid beats warn), `readOnly`, `disabled`, `decorator` /
 * `slug`, `light`, `value` / `defaultValue` / `onChange` / `onClick` and
 * every native textarea attribute (spread on the `<textarea>`; `className`
 * is the wrapper's). The ref is the `<textarea>`.
 *
 * It IS the text input's field: the same classes, so the same container —
 * the fill per theme, the outline's ladder (hover, a press stepping its
 * contrast, focus at 2px, the error's edge), the label row and counter,
 * FieldMessage and FieldStatusMark. What it adds (text-area.scss):
 *
 *   height    `rows` lines of the field's type, inside the size's inset
 *             (one line is exactly the size's field height); the user can
 *             drag it taller or shorter, vertical only (v11)
 *   mark      at the top of the trailing edge, on the first line (v11). Its
 *             room is kept in the text's end padding at all times, so a
 *             status arriving never re-wraps the typed text
 *   scroll    the kit's scroller: the pill instead of the native bar, and
 *             the soft edge the text leaves into as it scrolls
 * ========================================================================== */

export type TextAreaSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TextAreaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    FieldAiProps {
  /** The `<textarea>`'s id; the message ids derive from it (v11). */
  id: string;
  /** The label. A node, without interactive content (v11). */
  labelText: ReactNode;
  /** Classes on the wrapper (v11). */
  className?: string;
  /** v11's experimental decorator (an AILabel …), at the field's trailing edge. */
  decorator?: ReactNode;
  /** v11: deprecated for `decorator`; accepted. */
  slug?: ReactNode;
  disabled?: boolean;
  /** Show `count/maxCount` in the label row (needs `maxCount`). */
  enableCounter?: boolean;
  /** What the counter counts: `character` (default; also the textarea's `maxLength`) or `word` (v11). */
  counterMode?: 'character' | 'word';
  helperText?: ReactNode;
  hideLabel?: boolean;
  invalid?: boolean;
  invalidText?: ReactNode;
  /** v11: deprecated for `<Layer>`; `$field-02`. */
  light?: boolean;
  /** The counter's limit, in characters or words (`counterMode`). */
  maxCount?: number;
  placeholder?: string;
  readOnly?: boolean;
  /** Visible lines. Default 4 (v11). */
  rows?: number;
  /** Width in characters (v11): the field sizes to it and can't be resized. */
  cols?: number;
  warn?: boolean;
  warnText?: ReactNode;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  // @carbon-proposal api: textarea-size — TextArea takes the field family's `size` (xs 24 to lg 48px), so it lines up with the other fields. TBD
  /** The field's inset and its one-line height: xs 24 · sm 32 · md 40 (default) · lg 48. */
  size?: TextAreaSize;
  /** Errors (and warnings) arrive late: while typing, after a pause or on blur. Default true. */
  lateErrors?: boolean;
  /** The typing pause a rising status waits for, ms. Default 1000. */
  typingPauseMs?: number;
  /** Where the message line sits: `gap` (default) in the form's 32px gap, or `flow` in the layout. */
  messagePlacement?: 'gap' | 'flow';
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default): the selected edge is greyscale. `hero`: the kit's brand, for expressive fields. */
  variant?: FieldVariant;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (8px, default), `square`, or `full` (half a one-line field's height). */
  corners?: 'full' | 'rounded' | 'square';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrame;
  /** The status mark plays its motion-icon once as it arrives. Default false. */
  statusBeat?: boolean;
}

/** v11's word: a run of letters. */
const WORD = /\p{L}+/gu;
const countWords = (s: string) => s.match(WORD)?.length ?? 0;
const countOf = (s: string, mode: 'character' | 'word') =>
  mode === 'word' ? countWords(s) : s.length;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id,
      labelText,
      className,
      decorator,
      slug,
      disabled: ownDisabled = false,
      enableCounter = false,
      counterMode = 'character',
      helperText,
      hideLabel = false,
      invalid = false,
      invalidText,
      light = false,
      maxCount,
      placeholder,
      readOnly: ownReadOnly = false,
      rows = 4,
      cols,
      warn = false,
      warnText,
      size: sizeProp,
      lateErrors = true,
      typingPauseMs = FIELD_TIMING.typingPauseMs,
      messagePlacement = 'gap',
      variant: variantProp,
      corners: cornersProp,
      frame = 'inset',
      statusBeat = false,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      onChange,
      onClick,
      onFocus,
      onBlur,
      onKeyDown,
      onPaste,
      'aria-describedby': describedBy,
      ...rest
    },
    ref
  ) {
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    // KitDefaults: the provider's size, corners and variant for the props not given.
    const {
      size = 'md',
      corners = 'rounded',
      variant,
    } = useKitProps(
      { size: sizeProp, corners: cornersProp, variant: variantProp },
      FIELD_KIT
    );

    const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
    const late = useLateStatus(norm.status, {
      late: lateErrors,
      pauseMs: typingPauseMs,
    });
    const shown = late.shown;

    const areaRef = useRef<HTMLTextAreaElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const scrollRootRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);

    // The counter: controlled from `value`, otherwise counted on change (v11).
    const { value, defaultValue } = rest;
    const [typed, setTyped] = useState(() =>
      countOf(String(value ?? defaultValue ?? ''), counterMode)
    );
    const count =
      value !== undefined ? countOf(String(value ?? ''), counterMode) : typed;
    const counterOn = enableCounter && !!maxCount;
    const words = counterMode === 'word';

    // v11's announcement: cleared, then written a second later (two for words), once it changes.
    const announcerRef = useRef<HTMLSpanElement>(null);
    const announcement = counterOn
      ? words
        ? counterAnnouncement(count, maxCount, 'word', 'words')
        : counterAnnouncement(count, maxCount)
      : null;
    const lastAnnounced = useRef('');
    useEffect(() => {
      const el = announcerRef.current;
      if (!el || !announcement || announcement === lastAnnounced.current)
        return;
      el.textContent = '';
      const t = window.setTimeout(
        () => {
          el.textContent = announcement;
          lastAnnounced.current = announcement;
        },
        words ? 2000 : 1000
      );
      return () => window.clearTimeout(t);
    }, [announcement, words]);

    // The kit's scroller on the textarea itself: the pill for the native bar, and the soft edge,
    // attached the first time the text overflows (typed, set, or the field resized, or a font loads late).
    const reduced = usePrefersReducedMotion();
    const reducedRef = useLatest(reduced);
    const checkOverflow = useRef<(() => void) | null>(null);
    useLayoutEffect(() => {
      const vp = areaRef.current;
      const root = scrollRootRef.current;
      if (!vp || !root) return;
      let stop: (() => void) | null = null;
      const attach = () => {
        const engine = attachScroller(
          vp,
          { root, y: railRef.current, x: null },
          { thickness: 4, focusable: false, reduced: () => reducedRef.current }
        );
        const stopEdge = attachScrollSoftEdge(vp, { x: false, y: true });
        stop = () => {
          stopEdge();
          engine.destroy();
        };
      };
      const resized =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => check());
      const unwatch = () => {
        checkOverflow.current = null;
        resized?.disconnect();
        vp.removeEventListener('input', check);
        document.fonts?.removeEventListener?.('loadingdone', check);
      };
      function check() {
        if (stop || !vp || vp.scrollHeight <= vp.clientHeight) return;
        unwatch();
        attach();
      }
      if (!resized) attach();
      else {
        checkOverflow.current = check;
        resized.observe(vp);
        vp.addEventListener('input', check);
        // A web font loading after mount can change scrollHeight without changing clientHeight.
        document.fonts?.addEventListener?.('loadingdone', check);
        check();
      }
      return () => {
        unwatch();
        stop?.();
      };
    }, [reducedRef]);
    // A value set from outside (no input event).
    useLayoutEffect(() => checkOverflow.current?.(), [value]);

    // Focus: by the pointer (the caret placed by a press) or not (Tab, or the app).
    const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
    const pointerDown = useRef(false);

    const ai = useAiFill({
      id,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      controlRef: areaRef,
      fieldRef,
      helperText,
      size,
      disabled: norm.disabled,
      readOnly,
    });

    const aria = fieldAria({
      shown,
      ids: norm,
      hasHelper: hasText(ai.helperText),
      hasWarnText: hasText(warnText),
      hasInvalidText: hasText(invalidText),
      describedBy:
        [describedBy, ai.describedBy].filter(Boolean).join(' ') || undefined,
    });
    // v11: the limit is described ("Character limit 200"), beside the helper.
    const counterDescId = counterOn ? `${id}-counter-desc` : undefined;
    const ariaDescribedBy =
      [aria['aria-describedby'], shown === 'none' ? counterDescId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (norm.disabled) return;
      late.onInput();
      setTyped(countOf(e.target.value, counterMode));
      onChange?.(e);
    };
    // Word mode (v11): at the limit, a space or a new line would start another word.
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        !norm.disabled &&
        counterOn &&
        words &&
        count >= maxCount! &&
        (e.key === ' ' || e.key === 'Enter')
      )
        e.preventDefault();
      if (!norm.disabled) onKeyDown?.(e);
    };
    // Word mode (v11): a paste past the limit keeps the words up to it.
    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
      if (norm.disabled) return;
      const el = areaRef.current;
      if (counterOn && words && el) {
        const have: string[] = el.value.match(WORD) ?? [];
        const pasted: string[] =
          e.clipboardData.getData('text').match(WORD) ?? [];
        if (have.length + pasted.length > maxCount!) {
          e.preventDefault();
          // Through the native setter and an input event, so `onChange` (and a controlled value) hear it.
          const set = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            'value'
          )?.set;
          set?.call(el, have.concat(pasted).slice(0, maxCount).join(' '));
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      onPaste?.(e);
    };
    const handleClick = (e: MouseEvent<HTMLTextAreaElement>) => {
      if (!norm.disabled) onClick?.(e);
    };
    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      setFocus(pointerDown.current ? 'pointer' : 'keyboard');
      pointerDown.current = false;
      late.onFocus();
      onFocus?.(e);
    };
    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
      setFocus(null);
      late.onBlur();
      onBlur?.(e);
    };
    const onFieldPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      const area = areaRef.current;
      if (e.target === area && document.activeElement !== area)
        pointerDown.current = true;
      // A press on a field that already has focus holds the selected edge (the press step never lowers it).
      const field = fieldRef.current;
      if (field && document.activeElement === area) {
        holdUntilRelease(field);
      }
    };
    // A press anywhere in the field that isn't on a control puts the caret in.
    const onFieldMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      const t = e.target as Element;
      if (
        t === areaRef.current ||
        t.closest('button, a, [tabindex]') ||
        norm.disabled
      )
        return;
      // The scroller's strip claims its own presses.
      if (t.closest('.cds-scroller__rail')) return;
      e.preventDefault();
      pointerDown.current = true;
      areaRef.current?.focus();
    };

    const hasLabel =
      labelText !== undefined && labelText !== null && labelText !== '';
    const label = hasLabel ? (
      <label
        htmlFor={id}
        className={[
          'cds-field-label',
          hideLabel && 'cds-field-visually-hidden',
          norm.disabled && 'cds-field-label--disabled',
        ]
          .filter(Boolean)
          .join(' ')}>
        {labelText}
      </label>
    ) : null;
    const counter = counterOn ? (
      <div
        className={[
          'cds-field-counter',
          disabled && 'cds-field-counter--disabled',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true">
        {count}/{maxCount}
      </div>
    ) : null;
    const deco = slug ?? decorator;

    const classes = [
      'cds-text-input',
      'cds-text-area',
      `cds-text-input--${size}`,
      readOnly && 'cds-text-input--readonly',
      norm.disabled && 'cds-text-input--disabled',
      light && 'cds-text-input--light',
      corners === 'square' && 'cds-text-input--square',
      corners === 'full' && 'cds-text-input--full',
      frame === 'ghost' && 'cds-text-input--ghost',
      variant === 'hero' && 'cds-text-input--primary',
      deco && 'cds-text-input--decorated cds-text-area--decorated',
      cols && 'cds-text-area--cols',
      ai.reserved && 'cds-text-input--revertible cds-text-area--revertible',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes} data-status={shown} data-ai-state={aiState}>
        <div
          className={[
            'cds-field-label-row',
            hideLabel && !counter && 'cds-field-label-row--hidden',
          ]
            .filter(Boolean)
            .join(' ')}>
          {label}
          {counter}
        </div>
        {counterOn && (
          <span id={counterDescId} className="cds-field-visually-hidden">
            {words ? `Word limit ${maxCount}` : `Character limit ${maxCount}`}
          </span>
        )}
        <div className="cds-text-input__outer">
          <div
            ref={fieldRef}
            className="cds-text-input__field cds-text-area__field"
            data-focus={focus ?? undefined}
            onPointerDown={onFieldPointerDown}
            onMouseDown={onFieldMouseDown}>
            <div
              ref={scrollRootRef}
              className="cds-scroller cds-scroller--y cds-text-area__scroller"
              data-rest="faint">
              <textarea
                {...rest}
                {...aria}
                aria-describedby={ariaDescribedBy}
                aria-readonly={readOnly || undefined}
                ref={mergeRefs<HTMLTextAreaElement>(areaRef, ref as never)}
                id={id}
                className="cds-text-input__input cds-text-area__input cds-scroll-edge"
                placeholder={placeholder}
                disabled={norm.disabled}
                readOnly={readOnly}
                rows={rows}
                cols={cols}
                maxLength={counterOn && !words ? maxCount : rest.maxLength}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onClick={handleClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <div
                ref={railRef}
                className="cds-scroller__rail cds-scroller__rail--y"
                aria-hidden="true">
                <div className="cds-scroller__pill" data-scroller-pill="" />
              </div>
            </div>
            <span className="cds-text-input__trail cds-text-area__trail">
              <span className="cds-text-input__mark-slot">
                <FieldStatusMark status={shown} beat={statusBeat} />
              </span>
              {ai.revert}
              {deco ? (
                <span className="cds-text-input__decorator">{deco}</span>
              ) : null}
            </span>
            {ai.note}
            <span
              ref={announcerRef}
              className="cds-field-visually-hidden"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            />
          </div>
          <FieldMessage
            status={shown}
            helperText={ai.helperText}
            warnText={warnText}
            invalidText={invalidText}
            helperId={norm.helperId}
            warnId={norm.warnId}
            invalidId={norm.invalidId}
            disabled={norm.disabled}
            placement={messagePlacement}
          />
        </div>
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';
