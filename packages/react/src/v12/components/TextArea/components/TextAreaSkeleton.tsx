/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { SkeletonOf } from '@carbon-labs/react-feedback';
import { SkeletonBar } from '@carbon-labs/react-feedback';
import { FieldMessage } from '@carbon-labs/react-text-input';
import type { TextAreaProps } from './TextArea';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import '@carbon-labs/react-scroller/scss/scroller.scss';
import './text-area.scss';

/* ============================================================================
 * TextAreaSkeleton: the text area, loading.
 *
 *   known     the label, helper text and field frame, drawn as themselves;
 *             the field is `rows` lines tall, as the loaded one
 *   data      the text: `skeletonLines` bars on the field's own lines
 *
 * API: Carbon's TextAreaSkeleton, plus the TextArea's layout props.
 * ========================================================================== */

export interface TextAreaSkeletonProps extends Partial<
  Pick<
    TextAreaProps,
    | 'labelText'
    | 'hideLabel'
    | 'helperText'
    | 'rows'
    | 'size'
    | 'corners'
    | 'className'
  >
> {
  id?: string;
  /** How many lines of text it will show: one bar each. Default 2. */
  skeletonLines?: number;
}

export function TextAreaSkeleton({
  id,
  labelText,
  hideLabel = false,
  helperText,
  rows = 4,
  size = 'md',
  corners = 'rounded',
  skeletonLines = 2,
  className,
}: TextAreaSkeletonProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const hasLabel =
    labelText !== undefined && labelText !== null && labelText !== '';
  const lines = Math.max(1, Math.min(skeletonLines, rows));
  return (
    <SkeletonOf>
      <div
        className={[
          'cds-text-input',
          'cds-text-area',
          `cds-text-input--${size}`,
          'cds-text-input--loading',
          corners === 'square' && 'cds-text-input--square',
          corners === 'full' && 'cds-text-input--full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-status="none">
        <div
          className={[
            'cds-field-label-row',
            hideLabel && 'cds-field-label-row--hidden',
          ]
            .filter(Boolean)
            .join(' ')}>
          {hasLabel ? (
            <label
              htmlFor={fieldId}
              className={[
                'cds-field-label',
                hideLabel && 'cds-field-visually-hidden',
              ]
                .filter(Boolean)
                .join(' ')}>
              {labelText}
            </label>
          ) : null}
        </div>
        <div className="cds-text-input__outer">
          <div className="cds-text-input__field cds-text-area__field">
            <div className="cds-scroller cds-scroller--y cds-text-area__scroller">
              {/* The loaded field's own box: its rows, padding and line height. */}
              <textarea
                id={fieldId}
                className="cds-text-input__input cds-text-area__input"
                rows={rows}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                data-skeleton-unseen=""
              />
              <span
                className="cds-text-input__input cds-text-area__input cds-text-area__skeleton"
                aria-hidden="true">
                {Array.from({ length: lines }, (_, i) => (
                  <SkeletonBar
                    key={i}
                    lineHeight="var(--ta-line)"
                    width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
                  />
                ))}
              </span>
            </div>
            <span className="cds-text-input__trail cds-text-area__trail">
              <span className="cds-text-input__mark-slot" />
            </span>
          </div>
          <FieldMessage
            status="none"
            helperText={helperText}
            helperId={`${fieldId}-helper`}
            warnId={`${fieldId}-warn`}
            invalidId={`${fieldId}-invalid`}
          />
        </div>
      </div>
    </SkeletonOf>
  );
}
