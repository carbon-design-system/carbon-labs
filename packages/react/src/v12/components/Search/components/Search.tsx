/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { SNAP, usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { Close, Search as SearchIcon } from '@carbon-labs/react-motion-icons';
import { IconButton, mergeRefs } from '@carbon-labs/react-tooltip';
import { useSearchExpand } from './useSearchExpand';
import { CONTROL_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import type { FieldFrame, FieldVariant } from '@carbon-labs/react-props';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import './search.scss';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * Search — Carbon v11's Search, re-implemented on the kit's text field.
 * ExpandableSearch is in ./ExpandableSearch.
 * ============================================================================
 *
 * v11's props and behaviour: `labelText` (visually hidden, names the
 * `role="search"` landmark), `id`, `placeholder` ("Search"), `size` (xs 24 ·
 * sm 32 · md 40 · lg 48), `value` / `defaultValue` / `onChange`, `onClear`,
 * `closeButtonLabelText` ("Clear search input"), `disabled`, `renderIcon`,
 * `autoComplete` ("off"), `type` ("search"), `light` (deprecated; `<Layer>`
 * instead), `role` (deprecated), `className` (on the container), every
 * other attribute on the `<input>` (so `readOnly`). The ref is the `<input>`.
 * Escape clears the value; with nothing to clear, in an expandable search,
 * it moves focus to the magnifier, and otherwise passes on. `isExpanded` + `onExpand` make it
 * expandable (ExpandableSearch keeps that state itself).
 *
 * The kit adds:
 *
 *   field     the text input's field: its fill, 8px corners (or full /
 *             square), its hairline and its contrast ladder on the outline
 *             (hover, press, focus); read-only and disabled as the text
 *             input draws them (text-input.scss, shared by class)
 *   clear     the family's ghost IconButton inside the field, inset as the
 *             password toggle is; it arrives as the snap's mark (half size,
 *             opaque, growing about its centre on fast-02) when the first
 *             character is typed, and leaves one step faster (fast-01,
 *             exit-productive) back to half size, fading, when the field is
 *             emptied. Typing never moves it. Not shown read-only
 *   expand    an expandable search is the family's ghost IconButton until
 *             it opens; the field grows from the button's box to its full
 *             width (`useSearchExpand`: duration by travel, the content
 *             moving with the opening), and closes back into the button
 *   reduced   no travel and no scale: open or shut at once, the content and
 *             the clear button fading on the reduced clock
 *   hover     the field is the magnifier's frame (`data-motion-icon-frame`):
 *             hovering anywhere on it plays the magnifier's motion-icon hover
 *             (not while disabled or read-only)
 *   icons     16px (the kit's IconButton rule), 20 at lg
 * ========================================================================== */

export type SearchSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SearchProps extends Omit<
  HTMLAttributes<HTMLInputElement>,
  'onChange' | 'defaultValue' | 'className'
> {
  /** The `<input>`'s `autocomplete`. Default `off` (v11). */
  autoComplete?: string;
  /** Classes on the container (v11). */
  className?: string;
  /** The clear button's name and tooltip. Default "Clear search input" (v11). */
  closeButtonLabelText?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  /** An expandable search (`onExpand` set) is open. Default true (v11). */
  isExpanded?: boolean;
  /** The input's id. Default a generated one. */
  id?: string;
  /** Names the search for assistive tech (visually hidden). No interactive content (v11). */
  labelText: ReactNode;
  /** v11: deprecated for `<Layer>`; `$field-02`. */
  light?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The value was cleared (the clear button, or Escape). */
  onClear?: () => void;
  /** Makes the search expandable: called when its magnifier is activated (click, Enter, Space). */
  onExpand?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void;
  /** Default "Search" (v11). */
  placeholder?: string;
  /** The magnifier's icon. Default motion-icons `Search`. */
  renderIcon?: ElementType;
  /** v11: deprecated (`<input type="search">` has the role). Passed to the input. */
  role?: string;
  /** The input is read-only: no clear button, no hover. */
  readOnly?: boolean;
  /** Default `md` (40px). */
  size?: SearchSize;
  /** Default `search` (v11). */
  type?: string;
  value?: string | number;
  tabIndex?: number;
  inert?: boolean;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  /** `rounded` (8px, default), `full` (half the height) or `square` — the text input's. */
  corners?: 'full' | 'rounded' | 'square';
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrame;
  /** The focus edge: `neutral` (greyscale, default) or `hero` (blue) — the text input's. */
  variant?: FieldVariant;
}

/** v11's `isSearchValuePresent`. */
const present = (v: unknown) => v !== '' && v !== undefined && v !== null;

const ICON_PX = (size: SearchSize): 16 | 20 => (size === 'lg' ? 20 : 16);

export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    autoComplete = 'off',
    className,
    closeButtonLabelText = 'Clear search input',
    defaultValue,
    disabled = false,
    isExpanded = true,
    inert,
    id,
    labelText,
    light = false,
    onChange,
    onClear,
    onKeyDown,
    onExpand,
    onFocus,
    onBlur,
    placeholder = 'Search',
    renderIcon: Icon = SearchIcon,
    role,
    readOnly = false,
    size: sizeProp,
    tabIndex,
    type = 'search',
    value,
    corners: cornersProp,
    frame = 'inset',
    variant = 'neutral',
    style,
    ...rest
  },
  forwardedRef
) {
  // KitDefaults: the provider's size and corners for the props not given.
  const { size = 'md', corners = 'rounded' } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const autoId = useId();
  const uniqueId = id ?? `search-input-${autoId.replace(/:/g, '')}`;
  const searchId = `${uniqueId}-search`;
  const inputRef = useRef<HTMLInputElement>(null);
  const magnifierRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(
    null
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const expandable = !!onExpand;
  const collapsed = expandable && !isExpanded;

  // Whether there's something to clear: v11 counts it from the props and on change.
  const [typed, setHasContent] = useState(
    present(value) || present(defaultValue)
  );
  const hasContent = value !== undefined ? present(value) : typed;

  const { moving, rootProps } = useSearchExpand(rootRef, {
    expandable,
    expanded: !collapsed,
    reduced,
  });
  const open = !collapsed;
  // The field is the magnifier's hover frame, unless it can't be hovered.
  const hoverFrame = !disabled && !readOnly;

  // Focus: the field shows where the caret is (the text input's `data-focus`).
  const [focused, setFocused] = useState(false);

  function clearInput() {
    const input = inputRef.current;
    if (!input) return;
    if (!value) input.value = '';
    // v11 calls onChange with a stand-in event whose target's value is ''.
    const target = Object.assign({}, input, { value: '' });
    onChange?.({
      bubbles: false,
      cancelable: false,
      currentTarget: input,
      defaultPrevented: false,
      eventPhase: 0,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      isTrusted: false,
      nativeEvent: new Event('change'),
      persist: () => {},
      preventDefault: () => {},
      stopPropagation: () => {},
      target,
      timeStamp: 0,
      type: 'change',
    } as unknown as ChangeEvent<HTMLInputElement>);
    onClear?.();
    setHasContent(false);
    input.focus({ preventScroll: true });
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setHasContent(e.target.value !== '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key !== 'Escape' || isComposing(e)) return;
    // Handled here (clearing, or back to the magnifier): stopped and marked. An empty field
    // passes it on to the popover, layer or form round it, as the kit's other fields do.
    if (inputRef.current?.value) {
      e.stopPropagation();
      e.preventDefault();
      clearInput();
    } else if (expandable && isExpanded) {
      e.stopPropagation();
      e.preventDefault();
      magnifierRef.current?.focus();
    }
  };

  // A press on the field that isn't on a control puts the caret in (the text input's).
  const onFieldMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as Element;
    if (
      collapsed ||
      disabled ||
      t === inputRef.current ||
      t.closest('button, a')
    )
      return;
    e.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
  };
  // A press on a field that already has the caret holds its focus edge (the text input's
  // `data-held`): the press step never lowers it.
  const onFieldPointerDown = () => {
    const field = fieldRef.current;
    if (!field || document.activeElement !== inputRef.current) return;
    holdUntilRelease(field);
  };

  const iconPx = ICON_PX(size);
  const magnifier = expandable ? (
    <IconButton
      ref={magnifierRef}
      frame="ghost"
      size={size}
      corners={corners}
      label={labelText}
      className="cds-search__magnifier cds-search__magnifier--button"
      aria-labelledby={searchId}
      aria-expanded={isExpanded}
      aria-controls={uniqueId}
      iconFrame={!hoverFrame}
      disabled={disabled}
      // The one way in while shut; open, the input is (v11: -1).
      tabIndex={collapsed ? 0 : -1}
      onClick={(e) => onExpand?.(e)}>
      <Icon size={iconPx} aria-hidden="true" />
    </IconButton>
  ) : (
    <span className="cds-search__magnifier" aria-hidden="true">
      <Icon size={iconPx} aria-hidden="true" />
    </span>
  );

  // Nothing to clear when it can't be changed: disabled or read-only.
  const showClear = hasContent && !collapsed && !readOnly && !disabled;

  const classes = [
    'cds-text-input',
    `cds-text-input--${size}`,
    'cds-search',
    `cds-search--${size}`,
    expandable && 'cds-search--expandable',
    expandable && open && 'cds-search--expanded',
    collapsed && !moving && 'cds-search--collapsed',
    readOnly && 'cds-text-input--readonly',
    disabled && 'cds-text-input--disabled cds-search--disabled',
    light && 'cds-text-input--light',
    corners === 'square' && 'cds-text-input--square',
    corners === 'full' && 'cds-text-input--full',
    frame === 'ghost' && 'cds-text-input--ghost',
    variant === 'hero' && 'cds-text-input--primary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // The clear button's arrival and departure: the snap's mark, from carbon-motion.
  const markVars = {
    '--cds-search-mark-from': String(SNAP.mark.from),
    '--cds-search-mark-in': `var(--cds-motion-duration-${SNAP.mark.in})`,
    '--cds-search-mark-ease': `var(--cds-motion-easing-${SNAP.mark.ease})`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      role="search"
      aria-labelledby={searchId}
      className={classes}
      data-reduced={reduced || undefined}
      {...rootProps}
      style={markVars}>
      <div
        ref={fieldRef}
        className="cds-text-input__field cds-search__field"
        data-focus={focused ? 'keyboard' : undefined}
        data-motion-icon-frame={hoverFrame ? '' : undefined}
        onPointerDown={onFieldPointerDown}
        onMouseDown={onFieldMouseDown}>
        {magnifier}
        <label
          id={searchId}
          htmlFor={uniqueId}
          className="cds-field-visually-hidden">
          {labelText}
        </label>
        <div className="cds-search__clip">
          <div className="cds-search__content">
            <input
              {...rest}
              ref={mergeRefs<HTMLInputElement>(inputRef, forwardedRef as never)}
              id={uniqueId}
              className="cds-text-input__input cds-search__input"
              autoComplete={autoComplete}
              defaultValue={defaultValue}
              value={value}
              disabled={disabled}
              readOnly={readOnly}
              role={role}
              placeholder={placeholder}
              type={type}
              style={style}
              // Shut, the input is out of reach (v11).
              {...inertProps(collapsed || inert)}
              tabIndex={collapsed ? -1 : tabIndex}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={(e: FocusEvent<HTMLInputElement>) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                setFocused(false);
                onBlur?.(e);
              }}
            />
            <span
              className="cds-search__clear-slot"
              data-shown={showClear || undefined}>
              <IconButton
                frame="ghost"
                size={size === 'lg' ? 'lg' : 'md'}
                label={closeButtonLabelText}
                align="bottom-end"
                className="cds-text-input__toggle cds-search__clear"
                disabled={disabled}
                // Hidden, it's out of reach.
                tabIndex={showClear ? undefined : -1}
                aria-hidden={showClear ? undefined : true}
                onClick={clearInput}>
                <Close size={iconPx} aria-hidden="true" />
              </IconButton>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
Search.displayName = 'Search';
