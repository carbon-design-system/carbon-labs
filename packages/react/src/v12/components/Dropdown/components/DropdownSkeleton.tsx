/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { ChevronDownToggle } from '@carbon-labs/react-motion-icons';
import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { FieldCore } from '@carbon-labs/react-text-input';
import { iconSizeFor } from '@carbon-labs/react-props';
import { Dropdown, type DropdownProps } from './Dropdown';
import { MultiSelect, type MultiSelectProps } from './MultiSelect';
import type { ComboBoxProps } from './ComboBox';

/* ============================================================================
 * The Dropdown family's skeletons.
 *
 *   known     the title, helper text, field frame and chevron, drawn as themselves
 *   data      the value: a bar at the expected value's width (`skeletonValue`)
 *
 * API: Carbon's DropdownSkeleton, plus ComboBoxSkeleton and
 * MultiSelectSkeleton, each with its component's layout props.
 * ========================================================================== */

type Layout = 'titleText' | 'hideLabel' | 'helperText' | 'size' | 'className';

export interface DropdownSkeletonProps extends Partial<
  Pick<DropdownProps<string>, Layout | 'type'>
> {
  id?: string;
  /** The expected value: the bar is its width. Default "Option label". */
  skeletonValue?: string;
}

export function DropdownSkeleton({
  id,
  skeletonValue = 'Option label',
  titleText = '',
  ...rest
}: DropdownSkeletonProps) {
  const auto = useId();
  return (
    <SkeletonOf>
      <Dropdown
        {...rest}
        id={id ?? auto}
        titleText={titleText}
        label=""
        items={[skeletonValue]}
        initialSelectedItem={skeletonValue}
        renderSelectedItem={(v) => <SkeletonRun>{v}</SkeletonRun>}
      />
    </SkeletonOf>
  );
}

export interface MultiSelectSkeletonProps extends Partial<
  Pick<MultiSelectProps<string>, Layout | 'type'>
> {
  id?: string;
  /** The expected label: the bar is its width. Default "Choose options". */
  skeletonValue?: string;
}

export function MultiSelectSkeleton({
  id,
  skeletonValue = 'Choose options',
  ...rest
}: MultiSelectSkeletonProps) {
  const auto = useId();
  return (
    <SkeletonOf>
      <MultiSelect
        {...rest}
        id={id ?? auto}
        items={[]}
        label={<SkeletonRun>{skeletonValue}</SkeletonRun>}
      />
    </SkeletonOf>
  );
}

export interface ComboBoxSkeletonProps extends Partial<
  Pick<ComboBoxProps<string>, Layout>
> {
  id?: string;
  /** The expected value: the bar is its width. Default "Option label". */
  skeletonValue?: string;
}

export function ComboBoxSkeleton({
  id,
  titleText,
  size = 'md',
  skeletonValue = 'Option label',
  className,
  ...rest
}: ComboBoxSkeletonProps) {
  const auto = useId();
  return (
    <SkeletonOf>
      <FieldCore
        {...rest}
        id={id ?? auto}
        labelText={titleText ?? ''}
        size={size}
        loading
        skeletonValue={skeletonValue}
        variantClass={['cds-combo-box', className].filter(Boolean).join(' ')}
        trailing={
          <button
            type="button"
            className="cds-combo-box__toggle"
            tabIndex={-1}
            aria-hidden="true">
            <ChevronDownToggle size={iconSizeFor(size)} aria-hidden="true" />
          </button>
        }
      />
    </SkeletonOf>
  );
}
