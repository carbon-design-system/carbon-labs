/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { mergeRefs } from '@carbon-labs/v12-motion';
import { RadioMark } from '@carbon-labs/react-radio-button';
import {
  fromNested,
  useTileRollover,
  type TileDecoratorProps,
  type TileHoverSteps,
} from './Tile';
import './tile.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * TileGroup and RadioTile — Carbon v11's, on the tiles' standard: one of a
 * set, choosing one unchooses the others (as in carbon-motion's Easing and
 * Duration labs). Tile.tsx has the standard; what's its own:
 *
 *   control  a real radio, visually hidden over the mark, so the group is
 *            the platform's: one tab stop (the chosen tile, or the first),
 *            the arrow keys move the choice and the focus, as v11's radio
 *            group. The kit's ring goes round the tile that has it
 *   choose   a click on the tile's own surface chooses it. Not focus moving
 *            into a control inside it: editing a field in another card
 *            shouldn't change the choice. Its controls answer their own
 *            presses, as in every tile
 *   mark     the RadioButton's mark (RadioMark) at the top end, the radio
 *            inside it, so it moves as the RadioButton's: its own hover (a
 *            wash, 1px out) and press (1px in) over the radio, and its dot
 *            grown in from its center. Off, a 16px circle on the strong
 *            border; on, the family's inverse fill and its dot. Shown on every tile, the empty circles say "choose one"
 *            before anything is chosen (the ring alone would make the set
 *            look like plain clickable tiles), and the circle against the
 *            SelectableTile's square says one, not several
 *   chosen   the steady 2px ring in the selection color, as SelectableTile
 *
 * v11's props: TileGroup `name`, `valueSelected`, `defaultSelected`,
 * `onChange(value, name, event)`, `legend`, `disabled`, `required`,
 * `className`; RadioTile `value`, `checked`, `disabled`, `id`, `name`,
 * `onChange(value, name, event)`, `required`, `tabIndex`, `className`,
 * `aria-labelledby` / `aria-describedby` (on the radio, as v11's); Enter
 * chooses too, as v11's. `decorator`, `slug`, `light` and
 * `hasRoundedCorners` are accepted with no effect (Tile.tsx: no AI label). The ref is the tile, not the
 * radio (v11's is the radio).
 * ========================================================================== */

type Value = string | number;
type ChangeHandler = (
  value: Value,
  name: string | undefined,
  event:
    | ChangeEvent<HTMLInputElement>
    | MouseEvent<HTMLElement>
    | KeyboardEvent<HTMLElement>
) => void;

interface GroupState {
  name: string;
  selected: Value | undefined;
  disabled: boolean;
  required: boolean;
  choose: ChangeHandler;
}

const GroupContext = createContext<GroupState | null>(null);

export interface TileGroupProps extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'onChange' | 'defaultValue'
> {
  children?: ReactNode;
  /** The radios' name. */
  name: string;
  /** Controlled: the chosen tile's value. */
  valueSelected?: Value;
  /** Uncontrolled: the tile chosen at first. */
  defaultSelected?: Value;
  onChange?: ChangeHandler;
  /** The group's label (a `<legend>`). */
  legend?: ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export function TileGroup({
  children,
  name,
  valueSelected,
  defaultSelected,
  onChange,
  legend,
  disabled = false,
  required = false,
  className,
  ...rest
}: TileGroupProps) {
  const [own, setOwn] = useState<Value | undefined>(defaultSelected);
  const selected = valueSelected !== undefined ? valueSelected : own;
  const state: GroupState = {
    name,
    selected,
    disabled,
    required,
    choose: (value, n, event) => {
      if (value === selected) return;
      setOwn(value);
      onChange?.(value, n, event);
    },
  };
  return (
    <fieldset
      {...rest}
      className={cx('cds-kit-tile-group', className)}
      disabled={disabled}>
      {legend ? (
        <legend className="cds-kit-tile-group__legend">{legend}</legend>
      ) : null}
      <div className="cds-kit-tile-group__tiles">
        <GroupContext.Provider value={state}>{children}</GroupContext.Provider>
      </div>
    </fieldset>
  );
}

export interface RadioTileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>, TileDecoratorProps {
  children?: ReactNode;
  value: Value;
  /** Standalone (outside a TileGroup): chosen. */
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  /** Standalone: the radios' name. */
  name?: string;
  /** Standalone: called when it's chosen. */
  onChange?: ChangeHandler;
  required?: boolean;
  tabIndex?: number;
  /** The hover and press steps, `quiet` (default) or `standard`. */
  hoverSteps?: TileHoverSteps;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

export const RadioTile = forwardRef<HTMLDivElement, RadioTileProps>(
  function RadioTile(
    {
      children,
      value,
      checked,
      disabled: ownDisabled = false,
      id,
      name: ownName,
      onChange,
      required,
      tabIndex,
      hoverSteps,
      timeScale,
      className,
      decorator: _decorator,
      slug: _slug,
      light: _light,
      hasRoundedCorners: _round,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) {
    const group = useContext(GroupContext);
    const el = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const uid = useId();
    const inputId = id ?? `cds-radio-tile-${uid}`;
    const contentId = `${inputId}-content`;
    const name = group?.name ?? ownName;
    const isChosen = group ? group.selected === value : !!checked;
    const disabled = ownDisabled || !!group?.disabled;
    useTileRollover(el, disabled, hoverSteps, timeScale);

    const choose: ChangeHandler = (v, n, event) => {
      if (group) group.choose(v, n, event);
      else onChange?.(v, n, event);
    };

    return (
      <div
        data-rollover-surface=""
        {...rest}
        ref={mergeRefs(ref, el)}
        className={cx(
          'cds-kit-tile',
          'cds-kit-tile--radio',
          isChosen && 'cds-kit-tile--selected',
          disabled && 'cds-kit-tile--disabled',
          className
        )}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          // The tile's own surface chooses it; its controls answer their own.
          if (disabled || isChosen || fromNested(e.currentTarget, e.target))
            return;
          input.current?.focus({ preventScroll: true });
          choose(value, name, e);
        }}>
        {/* The RadioButton's circle, its radio inside it: its rollover (hover,
            grow, press) and the dot's growth, as the RadioButton's own. */}
        <RadioMark
          checked={isChosen}
          disabled={disabled}
          timeScale={timeScale}
          className="cds-kit-tile__radio">
          <input
            ref={input}
            id={inputId}
            type="radio"
            className="cds-radio__input cds-kit-tile__radio-input"
            // The tile's own choice: the tile keeps its hover over it (styles/_rollover.scss).
            data-rollover-own=""
            name={name}
            value={String(value)}
            checked={isChosen}
            disabled={disabled}
            required={required ?? group?.required}
            tabIndex={tabIndex}
            aria-labelledby={ariaLabelledBy ?? contentId}
            aria-describedby={ariaDescribedBy}
            onChange={(e) => {
              if (e.target.checked) choose(value, name, e);
            }}
            onKeyDown={(e) => {
              // Enter chooses too, as Space does (v11's).
              if (e.key !== 'Enter' || disabled) return;
              e.preventDefault();
              if (!isChosen) choose(value, name, e);
            }}
          />
        </RadioMark>
        <div id={contentId} className="cds-kit-tile__content">
          {children}
        </div>
      </div>
    );
  }
);
