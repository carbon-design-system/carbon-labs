/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf } from '@carbon-labs/react-feedback';
import type { ToggleProps } from './Toggle';
import './toggle.scss';

/* ============================================================================
 * ToggleSkeleton: the toggle, loading.
 *
 *   known     the label, drawn as itself
 *   data      on or off: the track is a block of its own box and corners;
 *             the state text keeps its room, unseen (one block, not two)
 *
 * API: Carbon's ToggleSkeleton, plus the Toggle's layout props.
 * ========================================================================== */

export type ToggleSkeletonProps = Pick<
  ToggleProps,
  | 'labelText'
  | 'labelA'
  | 'labelB'
  | 'hideLabel'
  | 'size'
  | 'corners'
  | 'className'
>;

/** The toggle's own markup, without its glide engine: nothing moves a skeleton's knob. */
export function ToggleSkeleton({
  labelText,
  labelA = 'Off',
  labelB = 'On',
  hideLabel = false,
  size = 'md',
  corners = 'full',
  className,
}: ToggleSkeletonProps) {
  return (
    <SkeletonOf blocks=".cds-toggle__track" unseen=".cds-toggle__state">
      <div
        className={[
          'cds-toggle',
          `cds-toggle--${size}`,
          corners !== 'full' && `cds-toggle--${corners}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {labelText != null && (
          <label
            className={[
              'cds-toggle__label',
              hideLabel && 'cds-toggle__visually-hidden',
            ]
              .filter(Boolean)
              .join(' ')}>
            {labelText}
          </label>
        )}
        <div className="cds-toggle__row">
          <button type="button" tabIndex={-1} className="cds-toggle__track" />
          {(labelA || labelB) && (
            <span className="cds-toggle__state">
              <span className="cds-toggle__state-text" data-active="">
                {labelA}
              </span>
              <span className="cds-toggle__state-text">{labelB}</span>
            </span>
          )}
        </div>
      </div>
    </SkeletonOf>
  );
}
