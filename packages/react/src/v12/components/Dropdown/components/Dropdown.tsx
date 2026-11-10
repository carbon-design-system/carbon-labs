/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDownToggle } from '@carbon-labs/react-motion-icons';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/v12-motion';
import { createTypeahead, rovingKey } from '@carbon-labs/react-selection-kit';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { CONTROL_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import {
  iconSizeFor,
  type FieldFrame as FieldFrameKind,
} from '@carbon-labs/react-props';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import {
  FieldFrame,
  defaultItemToString,
  indexOfItem,
  isItemDisabled,
  type ListboxSize,
} from './FieldFrame';
import {
  ListboxSurface,
  optionId,
  type ListboxActive,
  type ListboxOption,
} from './ListboxSurface';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { useAiFill, type FieldAiProps } from '@carbon-labs/react-text-input';

/* ============================================================================
 * Dropdown — Carbon v11's Dropdown on the kit's text field and the
 * selection family's floating list.
 * ============================================================================
 *
 * v11's props: `id`, `items`, `itemToString`, `itemToElement`,
 * `renderSelectedItem`, `selectedItem` / `initialSelectedItem`, `onChange`
 * (`{ selectedItem }`), `label` (shown with nothing chosen), `titleText`,
 * `hideLabel`, `helperText`, `invalid` / `invalidText`, `warn` / `warnText`,
 * `size` (xs 24 · sm 32 · md 40 · lg 48), `type` (`default` / `inline`),
 * `disabled`, `readOnly`, `direction` (`bottom` / `top`), `aria-label`; the
 * ref is the trigger button. `light`, `autoAlign`, `downshiftProps`,
 * `translateWithId`, `decorator` / `slug` are accepted.
 *
 * ARIA: the WAI-ARIA select-only combobox. The trigger is a `button` with
 * `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`,
 * `aria-controls` and `aria-activedescendant`; focus never leaves it. The
 * list is a `listbox` of `option`s with `aria-selected`.
 *
 * Keyboard — closed: ↓ / Enter / Space open on the chosen option (else the
 * first), ↑ on the chosen (else the last), Home / End on the first / last, a
 * letter on its match. Open: ↑ / ↓ (no wrap), Home / End, Page Up / Down
 * (10), typeahead, Enter / Space / Alt ↑ choose and close, Escape and Tab
 * close. Disabled options are skipped.
 *
 * The kit adds:
 *
 *   field      the text input's: the quiet fill, the hairline's ladder
 *              (hover a step, press 2px, focus the accent at 2px), the
 *              error's border, the status mark and the one message line;
 *              the chevron is motion-icons' ChevronDownToggle, turning
 *              while the list shows
 *   list       the Menu's surface, snapping from the press (or the field's
 *              center from the keyboard) and folding back into it; the
 *              kit's highlight marker; a check on the chosen option
 *   inline     `type="inline"`: the label beside a quiet field (no fill and
 *              no hairline until hover), the list hugging its options
 * ========================================================================== */

export interface DropdownProps<Item>
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'onChange'>,
    FieldAiProps {
  id: string;
  items: Item[];
  /** Default: the string, the number, or the object's `label` (v11). */
  itemToString?: (item: Item | null) => string;
  /** An option as a node, not its string. */
  itemToElement?: ((item: Item) => NonNullable<ReactNode>) | null;
  /** The chosen item, in the trigger, as a node. */
  renderSelectedItem?: (item: Item) => ReactNode;
  /** Controlled. */
  selectedItem?: Item | null;
  initialSelectedItem?: Item | null;
  onChange?: (data: { selectedItem: Item | null }) => void;
  /** Shown in the trigger while nothing is chosen. */
  label: NonNullable<ReactNode>;
  /** The visible label. */
  titleText: ReactNode;
  hideLabel?: boolean;
  helperText?: ReactNode;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** Default `md` (40px). */
  size?: ListboxSize;
  /** `default`, or `inline`: the label beside a quiet field. */
  type?: 'default' | 'inline';
  disabled?: boolean;
  readOnly?: boolean;
  /** The side the list opens on. Default `bottom`; it flips when there's no room. */
  direction?: 'top' | 'bottom';
  /** The trigger's name when there's no `titleText`. */
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  /** v11: accepted; the list always flips and stays in the viewport. */
  autoAlign?: boolean;
  /** v11: accepted, ignored (there's no Downshift here). */
  downshiftProps?: unknown;
  /** v11: accepted. */
  translateWithId?: (id: string) => string;
  /** v11's decorator (an AILabel …), at the field's trailing edge. */
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. */
  slug?: ReactNode;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

  /** `rounded` (8px, default), `full` or `square`, as the text input's. */
  corners?: 'full' | 'rounded' | 'square';
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrameKind;
  /** The list's cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion for the list (a lab dial). Default 1. */
  timeScale?: number;
}

/** The revert over its room, from layout offsets, not client rects, so a scaled ancestor can't move it. */
function placeRevert(
  button: HTMLElement | null,
  room: HTMLElement | null,
  over: HTMLElement | null
) {
  if (!button || !room || !over) return;
  Object.assign(over.style, {
    left: `${button.offsetLeft + button.clientLeft + room.offsetLeft}px`,
    top: `${button.offsetTop + button.clientTop + room.offsetTop}px`,
    width: `${room.offsetWidth}px`,
    height: `${room.offsetHeight}px`,
  });
}

/** Page Up / Page Down move this many options (Downshift's). */
const PAGE = 10;

function DropdownInner<Item>(
  {
    id,
    items,
    itemToString = defaultItemToString as (item: Item | null) => string,
    itemToElement = null,
    renderSelectedItem,
    selectedItem: selectedItemProp,
    initialSelectedItem,
    onChange,
    label,
    titleText,
    hideLabel = false,
    helperText,
    invalid = false,
    invalidText,
    warn = false,
    warnText,
    size: sizeProp,
    type = 'default',
    disabled: ownDisabled = false,
    readOnly: ownReadOnly = false,
    direction = 'bottom',
    'aria-label': ariaLabelProp,
    ariaLabel: deprecatedAriaLabel,
    light: _light,
    autoAlign: _autoAlign,
    downshiftProps: _downshiftProps,
    translateWithId: _translateWithId,
    decorator,
    slug,
    corners: cornersProp,
    frame = 'inset',
    shadow,
    timeScale,
    aiState,
    aiSuggestion,
    onRevert,
    aiText,
    className,
    ...rest
  }: DropdownProps<Item>,
  ref: Ref<HTMLButtonElement>
) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  // KitDefaults: the provider's size and corners for the props not given.
  const { size = 'md', corners } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const inline = type === 'inline';
  const listId = `${id}__menu`;
  const labelId = `${id}-label`;

  /* ── the choice ────────────────────────────────────────────────────── */

  const controlled = selectedItemProp !== undefined;
  const [own, setOwn] = useState<Item | null>(initialSelectedItem ?? null);
  const selected = controlled ? selectedItemProp : own;
  const chosen = indexOfItem(items, selected, itemToString);

  const options: ListboxOption[] = items.map((item, i) => ({
    key: String(i),
    label: itemToString(item),
    content: itemToElement ? itemToElement(item) : undefined,
    disabled: isItemDisabled(item),
    selected: i === chosen,
  }));
  const isDisabled = (i: number) => !!options[i]?.disabled;
  const step = (key: string, from: number) =>
    rovingKey(key, from, {
      orientation: 'vertical',
      wrap: false,
      count: options.length,
      isDisabled,
    });
  const first = () => step('Home', -1) ?? -1;
  const last = () => step('End', -1) ?? -1;
  /** `n` enabled options on from `from` (Page Up / Down), stopping at the ends. */
  const page = (from: number, dir: 1 | -1) => {
    let i = from;
    for (let k = 0; k < PAGE; k++) {
      const n = step(dir === 1 ? 'ArrowDown' : 'ArrowUp', i);
      if (n == null || n === i) break;
      i = n;
    }
    return i;
  };

  /* ── open / closed ─────────────────────────────────────────────────── */

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ListboxActive>({
    index: -1,
    how: 'open',
  });
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [field, setField] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useMemo(
    () => mergeRefs<HTMLButtonElement>(setField, buttonRef, ref),
    [ref]
  );
  const press = useRef<{ x: number; y: number } | null>(null);
  const typeahead = useMemo(() => createTypeahead(), []);
  const typedAt = useRef(-Infinity);

  const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
  const interactive = !norm.disabled && !readOnly;

  const show = (index: number, from: { x: number; y: number } | null) => {
    setOrigin(from);
    setActive({ index, how: 'open' });
    setOpen(true);
  };
  const choose = (i: number) => {
    const item = items[i];
    if (item === undefined || isDisabled(i)) return;
    setOpen(false);
    if (i === chosen) return;
    if (!controlled) setOwn(item);
    onChange?.({ selectedItem: item });
  };

  /* ── the field's states ────────────────────────────────────────────── */

  const late = useLateStatus(norm.status, { late: false });
  const shown = late.shown;
  const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
  const pointerDown = useRef(false);
  // The AI fill: the swap runs over the trigger's value, and
  // the revert lies over a room kept in the trigger, since a button can't hold a button.
  const valueRef = useRef<HTMLSpanElement>(null);
  const ai = useAiFill({
    id,
    aiState,
    aiSuggestion,
    onRevert,
    aiText,
    controlRef: valueRef,
    fieldRef: buttonRef,
    focusRef: buttonRef,
    helperText,
    size,
    disabled: norm.disabled,
    readOnly,
  });
  const roomRef = useRef<HTMLSpanElement>(null);
  const revertRef = useRef<HTMLSpanElement>(null);
  // The revert lies over its room in the trigger: placed on each commit and on a resize.
  useLayoutEffect(() =>
    placeRevert(buttonRef.current, roomRef.current, revertRef.current)
  );
  const revertShown = !!ai.revertButton;
  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!revertShown || !button) return;
    const ro = new ResizeObserver(() =>
      placeRevert(button, roomRef.current, revertRef.current)
    );
    ro.observe(button);
    return () => ro.disconnect();
  }, [revertShown]);

  const aria = fieldAria({
    shown,
    ids: norm,
    hasHelper: !inline && hasText(ai.helperText),
    hasWarnText: hasText(warnText),
    hasInvalidText: hasText(invalidText),
    describedBy: ai.describedBy,
  });

  /* ── keyboard ──────────────────────────────────────────────────────── */

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!interactive) {
      // Read-only: it takes focus, never opens (v11).
      if (['ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(e.key))
        e.preventDefault();
      return;
    }
    const printable =
      e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    // Space inside a typeahead run is part of the word, not a choice.
    const typing = e.key === ' ' && e.timeStamp - typedAt.current < 500;
    if (!open) {
      const from = chosen >= 0 ? chosen : -1;
      if (
        e.key === 'ArrowDown' ||
        e.key === 'Enter' ||
        (e.key === ' ' && !typing)
      ) {
        e.preventDefault();
        show(from >= 0 ? from : first(), null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        show(from >= 0 ? from : last(), null);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        show(e.key === 'Home' ? first() : last(), null);
      } else if (printable && e.key !== ' ') {
        e.preventDefault();
        typedAt.current = e.timeStamp;
        const i = typeahead(
          e.key,
          from,
          options.map((o) => o.label),
          isDisabled
        );
        show(i ?? (from >= 0 ? from : first()), null);
      } else if (typing) e.preventDefault();
      return;
    }
    const cur = active.index;
    const move = (index: number) =>
      setActive({ index, how: e.repeat ? 'repeat' : 'key' });
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        if (e.altKey && e.key === 'ArrowUp') {
          if (cur >= 0) choose(cur);
          else setOpen(false);
          return;
        }
        const next =
          cur < 0
            ? e.key === 'ArrowDown'
              ? first()
              : last()
            : step(e.key, cur);
        if (next != null && next >= 0) move(next);
        return;
      }
      case 'Home':
      case 'End':
        e.preventDefault();
        move(e.key === 'Home' ? first() : last());
        return;
      case 'PageDown':
      case 'PageUp':
        e.preventDefault();
        move(
          page(
            cur < 0 ? (e.key === 'PageDown' ? -1 : options.length) : cur,
            e.key === 'PageDown' ? 1 : -1
          )
        );
        return;
      case 'Enter':
        e.preventDefault();
        if (cur >= 0) choose(cur);
        else setOpen(false);
        return;
      case ' ':
        e.preventDefault();
        if (typing) return;
        if (cur >= 0) choose(cur);
        else setOpen(false);
        return;
      case 'Escape':
        if (isComposing(e)) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
    if (printable) {
      e.preventDefault();
      typedAt.current = e.timeStamp;
      const i = typeahead(
        e.key,
        cur,
        options.map((o) => o.label),
        isDisabled
      );
      if (i != null) move(i);
    }
  };

  /* ── render ────────────────────────────────────────────────────────── */

  const deco = slug ?? decorator;
  const hasValue = chosen >= 0 || (selected !== null && selected !== undefined);
  const value = hasValue
    ? renderSelectedItem && selected != null
      ? renderSelectedItem(selected)
      : itemToString(selected ?? null)
    : label;
  const hasTitle =
    titleText !== undefined && titleText !== null && titleText !== '';
  const iconPx = iconSizeFor(size);

  return (
    <FieldFrame
      id={id}
      labelId={labelId}
      titleText={titleText}
      hideLabel={hideLabel}
      onLabelClick={() => field?.focus()}
      helperText={ai.helperText}
      warnText={warnText}
      invalidText={invalidText}
      shown={shown}
      norm={norm}
      size={size}
      inline={inline}
      readOnly={readOnly}
      corners={corners}
      frame={frame}
      className={className}
      variantClass="cds-dropdown"
      rest={{ ...rest, 'data-ai-state': aiState }}>
      <button
        ref={fieldRef}
        id={id}
        type="button"
        className="cds-text-input__field cds-dropdown__field"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && options[active.index]
            ? optionId(listId, options[active.index]!.key)
            : undefined
        }
        aria-labelledby={hasTitle ? labelId : undefined}
        aria-label={
          hasTitle ? undefined : (ariaLabelProp ?? deprecatedAriaLabel)
        }
        aria-readonly={readOnly || undefined}
        {...aria}
        disabled={norm.disabled}
        title={typeof value === 'string' ? value : undefined}
        data-focus={focus ?? undefined}
        data-motion-icon-frame=""
        onPointerDown={(e) => {
          press.current = { x: e.clientX, y: e.clientY };
          if (document.activeElement !== e.currentTarget)
            pointerDown.current = true;
          else {
            // A press on the focused field holds its focus edge (it never steps down).
            const el = e.currentTarget;
            holdUntilRelease(el);
          }
        }}
        onClick={(e) => {
          if (!interactive) return;
          if (open) return setOpen(false);
          // No pointer behind the click (assistive tech): from the field's center.
          const byKey = e.detail === 0;
          show(
            chosen >= 0 ? chosen : byKey ? first() : -1,
            byKey ? null : press.current
          );
        }}
        onKeyDown={onKeyDown}
        // Space's click comes on keyup: the keydown already acted.
        onKeyUp={(e) => {
          if (e.key === ' ') e.preventDefault();
        }}
        onFocus={() => {
          setFocus(pointerDown.current ? 'pointer' : 'keyboard');
          pointerDown.current = false;
          late.onFocus();
        }}
        onBlur={() => {
          setFocus(null);
          setOpen(false);
          late.onBlur();
        }}>
        <span
          ref={valueRef}
          className={[
            'cds-dropdown__value',
            !hasValue && 'cds-dropdown__value--empty',
          ]
            .filter(Boolean)
            .join(' ')}>
          {value}
        </span>
        <span className="cds-text-input__trail">
          <span className="cds-text-input__mark-slot">
            <FieldStatusMark status={shown} />
          </span>
          {ai.reserved ? (
            <span
              ref={roomRef}
              className="cds-field-ai-room"
              aria-hidden="true"
            />
          ) : null}
          {deco ? (
            <span className="cds-text-input__decorator">{deco}</span>
          ) : null}
          <span className="cds-dropdown__chevron">
            <ChevronDownToggle
              size={iconPx}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </span>
        </span>
      </button>
      {ai.revertButton ? (
        <span ref={revertRef} className="cds-dropdown__revert">
          {ai.revertButton}
        </span>
      ) : null}
      {ai.note}
      <ListboxSurface
        corners={corners === 'full' ? 'full' : undefined}
        id={listId}
        open={open}
        anchor={field}
        labelledBy={hasTitle ? labelId : undefined}
        label={ariaLabelProp ?? deprecatedAriaLabel}
        options={options}
        active={active}
        onHover={(index) => setActive({ index, how: 'pointer' })}
        onPick={choose}
        size={size}
        direction={direction}
        origin={origin}
        hug={inline}
        shadow={shadow}
        timeScale={timeScale}
      />
    </FieldFrame>
  );
}

/** v11's Dropdown, on the kit's text field and the selection family's list. The ref is the trigger. */
export const Dropdown = forwardRef(DropdownInner) as <Item>(
  props: DropdownProps<Item> & { ref?: Ref<HTMLButtonElement> }
) => ReactElement | null;
(Dropdown as { displayName?: string }).displayName = 'Dropdown';
