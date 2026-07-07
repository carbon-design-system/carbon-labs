/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { TimeDisplayProps } from './TimeDisplay.types';
import { useTimeCalculation } from '../hooks/useTimeCalculation';
import { AnimatedNumber } from './AnimatedNumber';
import {
  formatTimeValue,
  getUnitLabel,
  filterTimeUnits,
  generateAccessibleText,
  formatColonTime,
  validateTimeDisplayProps,
} from '../utils/timeUtils';

/**
 * TimeDisplay renders elapsed time, remaining time, or a fixed duration
 * using structured numeric units and Carbon productive-motion digit transitions.
 */
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  mode,
  label,
  hideLabel = false,
  labelPosition,
  startTime,
  endTime,
  duration,
  units = ['hours', 'minutes', 'seconds'],
  format = 'split',
  padWithZero = true,
  showZeroUnits = true,
  animated = true,
  completeLabel,
  onComplete,
  announcementMode = 'off',
  thresholds = [],
  helperText,
  className,
  'data-testid': dataTestId,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--time-display`;

  const validation = validateTimeDisplayProps(mode, startTime, endTime, duration);
  if (!validation.valid) {
    console.error(`TimeDisplay: ${validation.error}`);
    return null;
  }

  const effectiveLabelPosition =
    labelPosition ?? (format === 'inline' ? 'inline' : 'top');

  const { timeValues, isComplete, announcementText } = useTimeCalculation({
    mode,
    startTime,
    endTime,
    duration,
    onComplete,
    // Always forward thresholds so onReach callbacks fire regardless of
    // announcementMode. announceThresholds controls whether the aria-live
    // region is also populated.
    thresholds,
    announceThresholds: announcementMode === 'threshold',
  });

  const displayUnits = filterTimeUnits(timeValues, units, showZeroUnits);
  const accessibleText = generateAccessibleText(label, timeValues, units, showZeroUnits);

  const renderLabel = () => (
    <span
      className={[
        `${blockClass}__label`,
        effectiveLabelPosition === 'inline' && `${blockClass}__label--inline`,
        hideLabel && `${blockClass}__label--hidden`,
      ]
        .filter(Boolean)
        .join(' ')}
      id={dataTestId ? `${dataTestId}-label` : undefined}
    >
      {label}
    </span>
  );

  const renderSplitFormat = () => (
    // dir="ltr" freezes unit sequence order (hr→min→sec) in RTL layouts.
    // The outer component layout still mirrors via text-align: start on the root.
    <div className={`${blockClass}__split-container`} dir="ltr">
      {displayUnits.map(({ unit, value }, index) => (
        <div
          key={unit}
          className={[
            `${blockClass}__split-unit`,
            index === 0 && `${blockClass}__split-unit--first`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={`${blockClass}__split-value-wrapper`}>
            <div className={`${blockClass}__split-value`}>
              <AnimatedNumber
                value={formatTimeValue(value, padWithZero)}
                animated={animated}
                mode={mode}
              />
            </div>
            <div className={`${blockClass}__split-label`}>
              {getUnitLabel(unit, value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBoxedFormat = () => (
    // dir="ltr" freezes unit sequence order (hr→min→sec) in RTL layouts.
    <div className={`${blockClass}__boxed-container`} dir="ltr">
      {displayUnits.map(({ unit, value }) => (
        <div key={unit} className={`${blockClass}__boxed-unit`}>
          <div className={`${blockClass}__boxed-value`}>
            <AnimatedNumber
              value={formatTimeValue(value, padWithZero)}
              animated={animated}
              mode={mode}
            />
          </div>
          <div className={`${blockClass}__boxed-label`}>
            {getUnitLabel(unit, value)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderColonFormat = () => (
    <div className={`${blockClass}__colon-container`}>
      <div className={`${blockClass}__colon-value`}>
        <AnimatedNumber
          value={formatColonTime(timeValues, units, padWithZero)}
          animated={animated}
          mode={mode}
        />
      </div>
    </div>
  );

  const renderInlineFormat = () => (
    // dir="ltr" freezes unit sequence order (hr→min→sec) in RTL layouts.
    <div className={`${blockClass}__inline-container`} dir="ltr">
      {displayUnits.map(({ unit, value }) => (
        <React.Fragment key={unit}>
          <span className={`${blockClass}__inline-value`}>
            <AnimatedNumber
              value={formatTimeValue(value, padWithZero)}
              animated={animated}
              mode={mode}
            />
          </span>
          <span className={`${blockClass}__inline-unit`}>
            {getUnitLabel(unit, value)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  const renderTimeDisplay = () => {
    if (isComplete && completeLabel) {
      return (
        <div
          className={`${blockClass}__complete-label`}
          role="status"
          aria-live="polite"
        >
          {completeLabel}
        </div>
      );
    }

    switch (format) {
      case 'boxed':
        return renderBoxedFormat();
      case 'colon':
        return renderColonFormat();
      case 'inline':
        return renderInlineFormat();
      case 'split':
      default:
        return renderSplitFormat();
    }
  };

  return (
    <div
      className={[
        blockClass,
        animated && `${blockClass}--animated`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={dataTestId}
    >
      {/* Accessible text for screen readers — updates live but is visually hidden */}
      <div className={`${blockClass}__sr-only`} role="status" aria-live="off">
        {accessibleText}
      </div>

      {/* Live region for threshold announcements */}
      {announcementMode === 'threshold' && announcementText && (
        <div
          className={`${blockClass}__live-region`}
          role="status"
          aria-live="polite"
        >
          {announcementText}
        </div>
      )}

      {effectiveLabelPosition === 'top' && renderLabel()}

      <div>
        {effectiveLabelPosition === 'inline' && renderLabel()}
        {renderTimeDisplay()}
      </div>

      {helperText && (
        <div className={`${blockClass}__helper-text`}>{helperText}</div>
      )}
    </div>
  );
};

TimeDisplay.displayName = 'TimeDisplay';

export default TimeDisplay;
