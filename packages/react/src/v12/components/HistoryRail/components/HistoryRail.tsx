/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { HistoryMarker } from './HistoryMarker';
import { HistoryMarkerCard } from './HistoryMarkerCard';

export interface HistoryIteration {
  /**
   * One line on what changed, shown in the card and read out with the label.
   */
  description?: string;

  /**
   * Identifies the iteration to the product. Returned by `onChange`.
   */
  id: string;

  /**
   * What this iteration is called — "Iteration 11".
   */
  label: string;

  /**
   * `failed` marks a run that did not finish.
   */
  status?: 'done' | 'failed';
}

export interface HistoryRailTranslations {
  /**
   * Builds what a screen reader hears for an iteration. The default reads the
   * label, the position, and what changed.
   */
  valueText: (
    iteration: HistoryIteration,
    position: number,
    total: number
  ) => string;
}

export interface HistoryRailProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The id of the live iteration — the state of the work. It is drawn as a
   * square and does not move as you scrub.
   */
  current?: string;

  /**
   * Which iteration is selected on mount (uncontrolled). Defaults to
   * `current`, or the last one.
   */
  defaultValue?: string;

  /**
   * The iterations, oldest first.
   */
  items: HistoryIteration[];

  /**
   * Names the rail for assistive technology — "History of this conversation".
   */
  label: string;

  /**
   * At most this many marks. A longer history shows the marks that fit,
   * keeping the selected one in view; the rest come back as the conversation
   * scrolls. Measuring the panel is the product's job, not the rail's.
   */
  maxMarks?: number;

  /**
   * Called when the selection moves: by an arrow key, Home or End, or a click
   * on the track, which lands on the nearest iteration.
   */
  onChange?: (iteration: HistoryIteration, index: number) => void;

  /**
   * The words a screen reader hears, for translation.
   */
  translations?: Partial<HistoryRailTranslations>;

  /**
   * The selected iteration (controlled). Pair with `onChange`.
   */
  value?: string;
}

const defaultTranslations: HistoryRailTranslations = {
  valueText: (iteration, position, total) =>
    [`${iteration.label}, ${position} of ${total}`, iteration.description]
      .filter(Boolean)
      .join('. '),
};

/** Keeps `count` marks around `index`, biased to the end of the history. */
function windowOf(total: number, index: number, count?: number) {
  if (!count || total <= count) {
    return { start: 0, end: total };
  }
  const start = Math.min(
    Math.max(0, index - Math.floor(count / 2)),
    total - count
  );
  return { start, end: start + count };
}

/**
 * The side-scroller: one control, not a row of links. The whole track takes
 * the pointer and resolves to the nearest iteration, so there is one target
 * rather than one per mark — which is what keeps a dense rail hittable.
 */
export const HistoryRail = forwardRef<HTMLDivElement, HistoryRailProps>(
  function HistoryRail(
    {
      className,
      current,
      defaultValue,
      items,
      label,
      maxMarks,
      onChange,
      translations,
      value: valueProp,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--history-rail`;
    const t = { ...defaultTranslations, ...translations };
    const trackId = useId();
    const trackRef = useRef<HTMLDivElement>(null);
    const fallback = current ?? items[items.length - 1]?.id;
    const [valueState, setValueState] = useState(defaultValue ?? fallback);
    const [hovered, setHovered] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    const value = valueProp ?? valueState;

    const selected = Math.max(
      0,
      items.findIndex((item) => item.id === value)
    );

    const select = useCallback(
      (index: number) => {
        const next = items[index];
        if (!next || next.id === value) {
          return;
        }
        if (valueProp === undefined) {
          setValueState(next.id);
        }
        onChange?.(next, index);
      },
      [items, onChange, value, valueProp]
    );

    const { start, end } = windowOf(items.length, selected, maxMarks);
    const shown = items.slice(start, end);

    /**
     * The mark nearest a point on the track, which is what a scrubber does.
     * It measures the slots where they actually are rather than dividing the
     * track evenly, because the mark being reached for pushes its neighbours
     * apart: what you see and what you hit have to be the same places.
     */
    function nearest(clientY: number) {
      const track = trackRef.current;
      if (!track || shown.length === 0) {
        return 0;
      }
      let best = 0;
      let closest = Infinity;
      Array.from(track.children).forEach((slot, index) => {
        const box = slot.getBoundingClientRect();
        const distance = Math.abs(clientY - (box.top + box.height / 2));
        if (distance < closest) {
          closest = distance;
          best = index;
        }
      });
      return start + best;
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      const keys: Record<string, number> = {
        ArrowUp: selected - 1,
        ArrowLeft: selected - 1,
        ArrowDown: selected + 1,
        ArrowRight: selected + 1,
        Home: 0,
        End: items.length - 1,
      };
      const next = keys[event.key];
      if (next === undefined) {
        return;
      }
      event.preventDefault();
      select(Math.min(Math.max(next, 0), items.length - 1));
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
      const item = items[nearest(event.clientY)];
      setHovered(item ? item.id : null);
    }

    // The card is what the rail says about the iteration you are reaching for,
    // so it appears on the one under the pointer and goes away with it. At
    // rest it would be a permanent label on a control nobody is using. The
    // keyboard gets it while the rail holds focus, which is the same moment.
    const shownId = hovered ?? (focused ? value : null);
    const shownItem = items.find((item) => item.id === shownId);
    // The mark stays blue wherever the selection is, pointer or no pointer:
    // only the card comes and goes.
    const markedId = hovered ?? value;
    const active = items[selected];
    // Which way each mark gets out of the way. The mark being reached for
    // stays where it is and its neighbours part around it, so the thing under
    // the pointer never moves out from under it.
    const shownIndex = items.findIndex((item) => item.id === shownId);

    return (
      <div
        ref={ref}
        className={cx(block, className)}
        onPointerLeave={() => setHovered(null)}
        {...rest}>
        <div
          ref={trackRef}
          id={trackId}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={items.length}
          aria-valuenow={selected + 1}
          aria-valuetext={
            active ? t.valueText(active, selected + 1, items.length) : undefined
          }
          aria-orientation="vertical"
          className={`${block}__track`}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPointerMove={handlePointerMove}
          onClick={(event) => select(nearest(event.clientY))}>
          {shown.map((item, i) => {
            const index = start + i;
            const state =
              item.id === markedId
                ? 'highlighted'
                : item.id === current
                  ? 'current'
                  : item.status === 'failed'
                    ? 'failed'
                    : 'default';
            return (
              // The card rides in the highlighted mark's own slot, so nothing
              // has to compute where it goes and the pitch stays in one place.
              <span
                key={item.id}
                className={`${block}__slot`}
                data-index={index}
                data-push={
                  shownIndex < 0
                    ? undefined
                    : index < shownIndex
                      ? 'up'
                      : index > shownIndex
                        ? 'down'
                        : 'at'
                }>
                <HistoryMarker state={state} />
                {item.id === shownId && shownItem ? (
                  <HistoryMarkerCard
                    label={shownItem.label}
                    description={shownItem.description}
                    className={`${block}__card`}
                  />
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
);

HistoryRail.displayName = 'HistoryRail';

HistoryRail.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * The id of the live iteration — the state of the work. It is drawn as a
   * square and does not move as you scrub.
   */
  current: PropTypes.string,

  /**
   * Which iteration is selected on mount (uncontrolled). Defaults to
   * `current`, or the last one.
   */
  defaultValue: PropTypes.string,

  /**
   * The iterations, oldest first.
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['done', 'failed'] as const),
    })
  ).isRequired,

  /**
   * Names the rail for assistive technology — "History of this conversation".
   */
  label: PropTypes.string.isRequired,

  /**
   * At most this many marks. A longer history shows the marks that fit,
   * keeping the selected one in view; the rest come back as the conversation
   * scrolls. Measuring the panel is the product's job, not the rail's.
   */
  maxMarks: PropTypes.number,

  /**
   * Called when the selection moves: by an arrow key, Home or End, or a click
   * on the track, which lands on the nearest iteration.
   */
  onChange: PropTypes.func,

  /**
   * The words a screen reader hears, for translation.
   */
  translations: PropTypes.shape({
    valueText: PropTypes.func,
  }),

  /**
   * The selected iteration (controlled). Pair with `onChange`.
   */
  value: PropTypes.string,
} as React.WeakValidationMap<HistoryRailProps>;
