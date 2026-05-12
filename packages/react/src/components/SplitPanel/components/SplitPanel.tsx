/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import cx from 'classnames';
import { DragHorizontal, DragVertical } from '@carbon/react/icons';

/** Primary UI component for user interaction */

interface SplitPanelProps {
  /**
   * children placed in the panel after the split
   */
  childrenAfterSplit: React.ReactNode;
  /**
   * children placed in the panel before the split
   */
  childrenBeforeSplit: React.ReactNode;
  /**
   * class to add to the outer component
   */
  className?: string;
  /**
   * initial position/value (0 to 100) of splitter, defaults to 50.
   */
  defaultSplitValue?: number;
  /**
   * gap between panels used to handle the split
   * sizes default, narrow and none correspond to Carbon grid default,
   * narrow and condensed gaps
   */
  gap?: 'default' | 'narrow' | 'none';
  /**
   * onChange event reporting the current split value
   * @param splitValue
   * @returns
   */
  onChange?: (splitValue: number) => void;
  /**
   *  panel arrangement is horizontal or vertical
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   *  lowest possible split value and default 0
   */
  splitMin?: number;
  /**
   *  highest possible split value and default 100
   */
  splitMax?: number;
  /**
   *  Number of pixels moved using cursor keys
   */
  splitKeyStepPixels?: number;
  /**
   *  Number of pixels moved using shift and  cursor keys
   */
  splitShiftKeyStepPixels?: number;
}

type handledKeyType = {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  Home: boolean;
  End: boolean;
};

const handledKeys = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
];

const toDP = (num, dp) => {
  return parseFloat(num.toFixed(dp));
};

const sanitizeValue = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const SplitPanel = ({
  childrenBeforeSplit,
  childrenAfterSplit,
  className,
  defaultSplitValue = 50,
  gap = 'default',
  onChange,
  orientation = 'horizontal',
  splitMin = 0,
  splitMax = 100,
  splitKeyStepPixels = 5,
  splitShiftKeyStepPixels = 25,
  ...rest
}: SplitPanelProps) => {
  const prefix = usePrefix();
  const splitPanelRef = useRef<HTMLInputElement>(null);
  const splitHandleRef = useRef<HTMLInputElement>(null);
  const mousePrev = useRef<{ value: number } | null>(null);
  const [kbInteraction, setKbInteraction] = useState(false);
  const panelSize = useRef(1);
  const isHorizontal = orientation === 'horizontal';
  const localSplitMin = sanitizeValue(splitMin);
  const localSplitMax = sanitizeValue(splitMax);
  // keep value between localSplitMin and localSplitMax
  const [splitValue, setSplitValue] = useState<number>(
    sanitizeValue(defaultSplitValue, localSplitMin, localSplitMax)
  );

  // Deprecation warning
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'SplitPanel is deprecated and unlikely to progress to v1.0.0. ' +
          'Please migrate to Resizer for continued support. ' +
          'See migration guide: https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/SplitPanel/DEPRECATION-plan.md'
      );
    }
  }, []);

  const updatePanelSize = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const splitPanelRect = splitPanelRef.current!.getBoundingClientRect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const splitRect = splitHandleRef.current!.getBoundingClientRect();

    panelSize.current = isHorizontal
      ? splitPanelRect.width - splitRect.width
      : splitPanelRect.height - splitRect.height;
  };

  const splitMouseDown = (ev) => {
    setKbInteraction(false);
    updatePanelSize();
    mousePrev.current = { value: isHorizontal ? ev.clientX : ev.clientY };
  };

  const splitMouseUp = () => {
    mousePrev.current = null;
  };

  const doSplitChange = (change) => {
    setSplitValue((prevSplitValue) => {
      const splitStart = (prevSplitValue * panelSize.current) / 100;

      const newPosition = sanitizeValue(
        (100 * (splitStart + change)) / panelSize.current,
        localSplitMin,
        localSplitMax
      );

      const result = toDP(newPosition, 3);
      onChange?.(result);
      return result;
    });
  };

  const splitMouseMove = (ev) => {
    if (!mousePrev?.current) {
      return;
    }

    const change =
      (isHorizontal ? ev.clientX : ev.clientY) - mousePrev.current.value;

    // update previous mouse position
    mousePrev.current = { value: isHorizontal ? ev.clientX : ev.clientY };

    doSplitChange(change);
  };

  const style = {
    [`--${prefix}--split-panel-before-size`]: `${splitValue / 100}fr`,
    [`--${prefix}--split-panel-after-size`]: `${1 - splitValue / 100}fr`,
  } as React.CSSProperties;

  const splitKeyMove = (ev) => {
    if (!handledKeys.includes(ev.key)) {
      return;
    }

    const key = { [`${ev.key}`]: true } as handledKeyType;

    if (
      (isHorizontal && (key.ArrowUp || key.ArrowDown)) ||
      (!isHorizontal && (key.ArrowLeft || key.ArrowRight))
    ) {
      return;
    }

    updatePanelSize();
    setKbInteraction(true);

    if (key.Home) {
      setSplitValue(localSplitMin);
    } else if (key.End) {
      setSplitValue(localSplitMax);
    } else {
      let change;
      if ((isHorizontal && key.ArrowLeft) || (!isHorizontal && key.ArrowUp)) {
        change =
          -1 * (ev.shiftKey ? splitShiftKeyStepPixels : splitKeyStepPixels);
      }
      if (
        (isHorizontal && key.ArrowRight) ||
        (!isHorizontal && key.ArrowDown)
      ) {
        change = ev.shiftKey ? splitShiftKeyStepPixels : splitKeyStepPixels;
      }

      doSplitChange(change);
    }
  };

  return (
    <div
      className={cx(className, `${prefix}--split-panel`)}
      {...rest}
      ref={splitPanelRef}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={cx(
          `${prefix}--split-panel__content--${orientation}`,
          `${prefix}--split-panel__content--gap-${gap}`,
          {
            [`${prefix}--split-panel__content--kb-interaction`]: kbInteraction,
          }
        )}
        // eslint-disable-next-line react/forbid-dom-props
        style={style}
        onMouseMove={splitMouseMove}
        onMouseUp={splitMouseUp}
        onMouseLeave={splitMouseUp}>
        <div className={`${prefix}--split-panel__panel`}>
          {childrenBeforeSplit}
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className={`${prefix}--split-panel__handle--${orientation}`}
          role="separator"
          aria-orientation={orientation}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          aria-valuenow={splitValue}
          aria-valuemin={localSplitMin}
          aria-valuemax={localSplitMax}
          data-key-step={splitKeyStepPixels}
          data-key-shift-step={splitShiftKeyStepPixels}
          ref={splitHandleRef}
          onMouseDown={splitMouseDown}
          onKeyDown={splitKeyMove}>
          {orientation === 'horizontal' ? (
            <DragHorizontal
              className={`${prefix}--split-panel__handle-icon`}
              size={20}
            />
          ) : (
            <DragVertical
              className={`${prefix}--split-panel__handle-icon`}
              size={20}
            />
          )}
        </div>
        <div className={`${prefix}--split-panel__panel`}>
          {childrenAfterSplit}
        </div>
      </div>
    </div>
  );
};
