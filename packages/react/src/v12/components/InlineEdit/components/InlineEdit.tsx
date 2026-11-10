/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  Checkmark,
  Close,
  Edit,
  EditOff,
  Locked,
} from '@carbon-labs/react-motion-icons';
import { IconButton, type IconButtonSize } from '@carbon-labs/react-tooltip';
import { TextInput } from '@carbon-labs/react-text-input';
import { TextArea } from '@carbon-labs/react-text-area';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { StatusMark, type StatusMarkKind } from '@carbon-labs/react-feedback';
import {
  failureText,
  INLINE_EDIT_MOTION,
  playEditSwap,
  rowsFor,
  tokenMs,
  type BoxSize,
  type EditSwap,
} from './engine';
import './inline-edit.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * InlineEdit: a value shown as text that turns into its field in place.
 *
 *   swap      text and field fade in place (the content swap, distance 0);
 *             the box holds its size, then moves to the new one as a layout
 *             move, and the new face arrives once it lands
 *   actions   save and cancel snap in as marks
 *   saving    a spinner beside the saved value, the status hand-off to a
 *             check, which fades
 *   reduced   a snap; the check goes at once
 *
 * API: IBM Products' InlineEdit and EditInPlace, plus type, fit, reason.
 * ========================================================================== */

export type InlineEditType = 'text' | 'textarea' | 'select';
export type InlineEditSize = 'xs' | 'sm' | 'md' | 'lg';
export type InlineEditFit = 'fill' | 'content';
export const InlineEditSizes: readonly InlineEditSize[] = [
  'xs',
  'sm',
  'md',
  'lg',
];

export interface InlineEditOption {
  value: string;
  label: string;
}

export interface InlineEditProps {
  /** The field's id. Default a generated one. */
  id?: string;
  /** The value's name: the field's hidden label and the edit button's words. */
  labelText: string;
  /** The value (controlled). */
  value?: string;
  /** The value to start from (uncontrolled). */
  defaultValue?: string;
  /** Text, textarea or select. Default text. */
  type?: InlineEditType;
  /** A select's options. */
  options?: InlineEditOption[];
  /** Shown in place of an empty value. */
  placeholder?: string;
  /** Called with the draft on each change. */
  onChange?: (draft: string) => void;
  /** Called with the new value. A promise shows the saving state; a rejection reopens the field with its message. */
  onSave?: (value: string) => void | Promise<unknown>;
  onCancel?: () => void;
  /** Called as the field opens and closes. */
  onEditingChange?: (editing: boolean) => void;
  /** Checks the draft on save: an error message, or nothing when it's fine. */
  validate?: (draft: string) => ReactNode | null | undefined;
  /** An error from outside, shown while editing. */
  invalid?: boolean;
  invalidText?: ReactNode;
  readOnly?: boolean;
  disabled?: boolean;
  /** Why it is read-only or disabled: a lock's tooltip. */
  reason?: string;
  /** xs, sm, md or lg, the field's sizes. Default md. */
  size?: InlineEditSize;
  /** Fill its container, or hug its value. Default fill. */
  fit?: InlineEditFit;
  /** The view's and the field's corners. Default rounded. */
  corners?: 'rounded' | 'full' | 'square';
  /** How the view shows the value. Default its text, or the option's label. */
  renderValue?: (value: string) => ReactNode;
  /** Default "Edit" and the label. */
  editLabel?: string;
  /** Default "Save". */
  saveLabel?: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** A rejected save's words when it gives none. */
  failedText?: string;
  /** How long the saved check holds, ms. Default 1500. */
  savedHold?: number;
  /** Overrides the reduced-motion preference. */
  reduced?: boolean;
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
}

/** The view's button is a step under the row; the edit buttons are the field's size. */
const VIEW_BUTTON: Record<InlineEditSize, IconButtonSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};
const ICON_PX: Record<InlineEditSize, 16 | 20> = {
  xs: 16,
  sm: 16,
  md: 16,
  lg: 20,
};

type Face = 'view' | 'edit';
type Status = 'idle' | 'saving' | 'saved' | 'fading';

const boxOf = (el: HTMLElement | null): BoxSize => {
  const r = el?.getBoundingClientRect();
  return { w: r?.width ?? 0, h: r?.height ?? 0 };
};
const isThenable = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === 'function';

export function InlineEdit({
  id: idProp,
  labelText,
  value: valueProp,
  defaultValue = '',
  type = 'text',
  options = [],
  placeholder,
  onChange,
  onSave,
  onCancel,
  onEditingChange,
  validate,
  invalid: invalidProp = false,
  invalidText: invalidTextProp,
  readOnly: ownReadOnly = false,
  disabled: ownDisabled = false,
  reason,
  size = 'md',
  fit = 'fill',
  corners = 'rounded',
  renderValue,
  editLabel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  failedText = 'Couldn’t save. Try again.',
  savedHold = INLINE_EDIT_MOTION.savedHoldMs,
  reduced: reducedProp,
  timeScale: timeScaleProp,
  className,
}: InlineEditProps) {
  const auto = useId();
  const id = idProp ?? `inline-edit-${auto}`;
  const motion = useFeedbackMotion();
  const reduced = reducedProp ?? motion.reduced;
  const timeScale = timeScaleProp ?? motion.timeScale;

  const [own, setOwn] = useState(defaultValue);
  const value = valueProp ?? own;
  const [face, setFace] = useState<Face>('view');
  const [leaving, setLeaving] = useState<Face | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<ReactNode>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [mark, setMark] = useState<{
    kind: StatusMarkKind;
    from?: StatusMarkKind;
  }>({ kind: 'pending' });
  /** The value shown while it saves. */
  const [pending, setPending] = useState<string | null>(null);
  /** Each save's mark is a new one. */
  const [markKey, setMarkKey] = useState(0);
  const [rows, setRows] = useState(1);
  const [fieldW, setFieldW] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<
    HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement
  >(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const from = useRef<BoxSize | null>(null);
  const running = useRef<EditSwap | null>(null);
  /** Where focus goes once the new face is in. */
  const focusTo = useRef<'field' | 'trigger' | null>(null);
  const saveRun = useRef(0);
  // The prop, else the feedback family's, else the provider's, else the OS's.
  const rolloverReduced = useReducedGetter(reduced);

  // A FormSection's disabled and read-only reach it too.
  const { readOnly, disabled } = useFormFieldState(ownDisabled, ownReadOnly);
  const editable = !readOnly && !disabled;
  const locked = !editable && !!reason;

  // The view's quiet hover: the rollover, an even wash.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !editable) return;
    return attachRollover(root, {
      selector: '.cds-inline-edit__view',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [editable, timeScale, rolloverReduced]);

  const show = (next: Face, focus: 'field' | 'trigger') => {
    if (next === face) return;
    from.current = boxOf(boxRef.current);
    focusTo.current = focus;
    setLeaving(face);
    setFace(next);
    setSwaps((n) => n + 1);
    onEditingChange?.(next === 'edit');
  };

  const open = () => {
    if (!editable || face === 'edit' || status === 'saving') return;
    const text = valueRef.current;
    if (text) {
      const lh = parseFloat(getComputedStyle(text).lineHeight);
      setRows(rowsFor(text.getBoundingClientRect().height, lh));
      // Hugging its value: the field is the text's width and its insets, at least 12rem.
      setFieldW(fit === 'content' ? text.scrollWidth : null);
    }
    setDraft(value);
    setError(null);
    show('edit', 'field');
  };

  const cancel = () => {
    setError(null);
    show('view', 'trigger');
    onCancel?.();
  };

  const save = () => {
    const check = validate?.(draft);
    if (check) {
      setError(check);
      fieldRef.current?.focus();
      return;
    }
    if (draft === value) {
      setError(null);
      show('view', 'trigger');
      return;
    }
    const result = onSave?.(draft);
    setError(null);
    setMarkKey((k) => k + 1);
    if (isThenable(result)) {
      const run = ++saveRun.current;
      setPending(draft);
      setMark({ kind: 'pending' });
      setStatus('saving');
      show('view', 'trigger');
      result.then(
        () => {
          if (run !== saveRun.current) return;
          if (valueProp === undefined) setOwn(draft);
          setPending(null);
          setMark({ kind: 'success' });
          setStatus('saved');
        },
        (why: unknown) => {
          if (run !== saveRun.current) return;
          setPending(null);
          setStatus('idle');
          setError(failureText(why, failedText));
          from.current = boxOf(boxRef.current);
          focusTo.current = 'field';
          setLeaving('view');
          setFace('edit');
          setSwaps((n) => n + 1);
          onEditingChange?.(true);
        }
      );
      return;
    }
    if (valueProp === undefined) setOwn(draft);
    setMark({ kind: 'success', from: 'pending' });
    setStatus('saved');
    show('view', 'trigger');
  };

  // The saved check holds, then fades; reduced, it goes at once.
  useEffect(() => {
    if (status !== 'saved') return;
    const t = window.setTimeout(
      () => setStatus('fading'),
      savedHold * timeScale
    );
    return () => window.clearTimeout(t);
  }, [status, markKey, savedHold, timeScale]);
  useLayoutEffect(() => {
    if (status !== 'fading') return;
    const el = markRef.current;
    if (!el || reduced || typeof el.animate !== 'function') {
      setStatus('idle');
      return;
    }
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: tokenMs(INLINE_EDIT_MOTION.fade, timeScale),
      easing: 'linear',
      fill: 'forwards',
    });
    let live = true;
    fade.finished.then(
      () => live && setStatus('idle'),
      () => {}
    );
    return () => {
      live = false;
      fade.cancel();
    };
  }, [status, reduced, timeScale]);

  // A textarea keeps every line of its draft in view: its rows follow the text at the field's width.
  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (
      type !== 'textarea' ||
      face !== 'edit' ||
      !(el instanceof HTMLTextAreaElement)
    )
      return;
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    el.rows = 1;
    const needed = rowsFor(el.scrollHeight - pad, lh);
    el.rows = needed;
    if (needed !== rows) setRows(needed);
  }, [type, face, draft, rows]);

  // Each change of face: the swap in place, then focus where it belongs.
  useLayoutEffect(() => {
    if (swaps === 0) return;
    const box = boxRef.current;
    if (!box) return;
    const prior = running.current;
    prior?.move?.cancel();
    prior?.marks.forEach((a) => a.cancel());
    const outEl = box.querySelector<HTMLElement>(':scope > [data-leaving]');
    const current = box.querySelector<HTMLElement>(
      `:scope > [data-face="${face}"]`
    );
    if (!current) return;
    const size = from.current ?? boxOf(box);
    if (outEl) {
      outEl.style.inlineSize = `${size.w}px`;
      outEl.style.blockSize = `${size.h}px`;
    }
    const incoming =
      current.querySelector<HTMLElement>('[data-swap-in]') ?? current;
    const marks = [
      ...current.querySelectorAll<HTMLElement>('[data-swap-mark]'),
    ];
    const run = playEditSwap({
      box,
      out: outEl,
      in: incoming,
      from: size,
      marks,
      timeScale,
      reduced,
    });
    running.current = run;
    const to = focusTo.current;
    focusTo.current = null;
    if (to === 'field') {
      const f = fieldRef.current;
      f?.focus({ preventScroll: true });
      if (f && type === 'text') f.select();
    } else if (to === 'trigger')
      triggerRef.current?.focus({ preventScroll: true });
    let live = true;
    const done = () => live && setLeaving(null);
    if (run.swap.outAnimation)
      run.swap.outAnimation.finished.then(done, () => {});
    else done();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per swap
  }, [swaps]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isComposing(e)) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
      return;
    }
    const onField = e.target === fieldRef.current;
    if (e.key === 'Enter' && onField && !(type === 'textarea' && e.shiftKey)) {
      e.preventDefault();
      save();
    }
  };

  const onViewClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('button, a')) return;
    open();
  };

  const change = (next: string) => {
    setDraft(next);
    if (error) setError(validate?.(next) || null);
    onChange?.(next);
  };

  const shown = pending ?? value;
  const label = options.find((o) => o.value === shown)?.label ?? shown;
  const empty = shown === '';
  const text = empty ? placeholder : renderValue ? renderValue(shown) : label;
  const buttonSize = VIEW_BUTTON[size];
  const icon = ICON_PX[size];
  const fieldError = error ?? (invalidProp ? invalidTextProp : null);

  const view = (
    <div
      key="view"
      className="cds-inline-edit__face"
      data-face="view"
      data-leaving={leaving === 'view' || undefined}
      {...inertProps(leaving === 'view' || face !== 'view')}
      aria-hidden={leaving === 'view' || undefined}>
      <div
        className={[
          'cds-inline-edit__view',
          editable && 'cds-inline-edit__view--editable',
        ]
          .filter(Boolean)
          .join(' ')}
        data-swap-in=""
        onClick={editable ? onViewClick : undefined}>
        <span
          ref={valueRef}
          className={[
            'cds-inline-edit__value',
            empty && 'cds-inline-edit__value--empty',
          ]
            .filter(Boolean)
            .join(' ')}
          title={
            typeof label === 'string' && type !== 'textarea' ? label : undefined
          }>
          {text}
        </span>
        <span
          className="cds-inline-edit__mark"
          aria-hidden={status === 'idle' || undefined}>
          {status !== 'idle' && (
            <span
              key={markKey}
              ref={markRef}
              className="cds-inline-edit__mark-face">
              <StatusMark
                kind={mark.kind}
                from={mark.from}
                size={16}
                description={mark.kind === 'pending' ? 'Saving' : 'Saved'}
              />
            </span>
          )}
        </span>
        {editable ? (
          <span className="cds-inline-edit__trigger">
            <IconButton
              ref={triggerRef}
              label={editLabel ?? `Edit ${labelText}`}
              frame="ghost"
              size={buttonSize}
              corners="full"
              timeScale={timeScale}
              onClick={open}>
              <Edit size={icon} />
            </IconButton>
          </span>
        ) : locked ? (
          <span className="cds-inline-edit__trigger">
            <IconButton
              ref={triggerRef}
              label={reason}
              frame="ghost"
              size={buttonSize}
              corners="full"
              timeScale={timeScale}
              aria-disabled="true"
              className="cds-inline-edit__lock"
              onClick={(e) => e.preventDefault()}>
              {readOnly ? <Locked size={icon} /> : <EditOff size={icon} />}
            </IconButton>
          </span>
        ) : null}
      </div>
    </div>
  );

  const fieldProps = {
    id,
    labelText,
    hideLabel: true,
    size,
    corners,
    invalid: !!fieldError,
    invalidText: fieldError,
    lateErrors: false,
  } as const;
  let field: ReactNode;
  if (type === 'textarea') {
    field = (
      <TextArea
        {...fieldProps}
        ref={fieldRef}
        rows={rows}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => change(e.target.value)}
      />
    );
  } else if (type === 'select') {
    field = (
      <Select
        {...fieldProps}
        ref={fieldRef}
        value={draft}
        onChange={(e) => change(e.target.value)}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.label} />
        ))}
      </Select>
    );
  } else {
    field = (
      <TextInput
        {...fieldProps}
        ref={fieldRef}
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => change(e.target.value)}
      />
    );
  }

  const edit = (
    <div
      key="edit"
      className="cds-inline-edit__face"
      data-face="edit"
      data-leaving={leaving === 'edit' || undefined}
      {...inertProps(leaving === 'edit' || face !== 'edit')}
      aria-hidden={leaving === 'edit' || undefined}>
      <div className="cds-inline-edit__edit" onKeyDown={onKeyDown}>
        <div
          className="cds-inline-edit__field"
          data-swap-in=""
          style={
            fieldW != null
              ? { ['--ie-text-w' as string]: `${fieldW}px` }
              : undefined
          }>
          {field}
        </div>
        <span className="cds-inline-edit__actions">
          <span className="cds-inline-edit__action" data-swap-mark="">
            <IconButton
              label={saveLabel}
              frame="ghost"
              size={size}
              corners="full"
              timeScale={timeScale}
              onClick={save}>
              <Checkmark size={icon} />
            </IconButton>
          </span>
          <span className="cds-inline-edit__action" data-swap-mark="">
            <IconButton
              label={cancelLabel}
              frame="ghost"
              size={size}
              corners="full"
              timeScale={timeScale}
              onClick={cancel}>
              <Close size={icon} />
            </IconButton>
          </span>
        </span>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={[
        'cds-inline-edit',
        `cds-inline-edit--${size}`,
        `cds-inline-edit--${fit}`,
        `cds-inline-edit--${type}`,
        corners !== 'rounded' && `cds-inline-edit--${corners}`,
        readOnly && 'cds-inline-edit--readonly',
        disabled && 'cds-inline-edit--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-editing={face === 'edit' || undefined}
      data-status={status}>
      <div ref={boxRef} className="cds-inline-edit__box">
        {(face === 'view' || leaving === 'view') && view}
        {(face === 'edit' || leaving === 'edit') && edit}
      </div>
      <span className="cds-inline-edit__live" role="status" aria-live="polite">
        {status === 'saving'
          ? `Saving ${labelText}`
          : status === 'saved'
            ? `${labelText} saved`
            : ''}
      </span>
    </div>
  );
}
InlineEdit.displayName = 'InlineEdit';
