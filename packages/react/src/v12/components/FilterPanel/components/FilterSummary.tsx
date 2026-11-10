/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { RefObject } from 'react';
import { Button } from '@carbon-labs/react-button';
import type { TagSize, TagType } from '@carbon-labs/react-tag';
import { TagSet, type TagSetTag } from '@carbon-labs/react-tag-set';
import { filtersInUse, type FilterSection, type FilterValues } from './filters';
import './filter-panel.scss';

/* ============================================================================
 * FilterSummary: the filters in use as dismissible tags, and Clear filters,
 * for the toolbar's filters row.
 *
 *   tags     the TagSet's: a filter applied snaps in from below, one dismissed
 *            snaps out while the rest close the gap
 *   focus    a dismissal moves to the next tag; none left, to `returnFocusRef`
 *   reduced  the TagSet's: at once
 *
 * API: IBM Products' FilterSummary (`clearFiltersText`), on sections and values.
 * ========================================================================== */

export interface FilterSummaryProps {
  sections: readonly FilterSection[];
  values: FilterValues;
  /** The values with a filter, or all of them, cleared. */
  onChange: (values: FilterValues) => void;
  /** Default "Clear filters". */
  clearFiltersText?: string;
  /** Where the focus goes once no filter is left (the Filters button). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** The tags' type. Default `outline`. */
  type?: TagType;
  size?: TagSize;
  'aria-label'?: string;
  timeScale?: number;
  className?: string;
}

export function FilterSummary({
  sections,
  values,
  onChange,
  clearFiltersText = 'Clear filters',
  returnFocusRef,
  type = 'outline',
  size,
  'aria-label': ariaLabel = 'Filters in use',
  timeScale = 1,
  className,
}: FilterSummaryProps) {
  const inUse = filtersInUse(sections, values);
  if (!inUse.length) return null;
  const apply = (next: FilterValues) => {
    onChange(next);
    if (!filtersInUse(sections, next).length)
      requestAnimationFrame(() => returnFocusRef?.current?.focus());
  };
  const ids = new Set(sections.map((s) => s.id));
  const tags: TagSetTag[] = inUse.map((f) => ({
    id: f.id,
    label: f.label,
    type,
    onClose: () => apply(f.clear(values)),
  }));
  return (
    <div
      className={['cds-filter-summary', className].filter(Boolean).join(' ')}>
      <TagSet
        tags={tags}
        multiline
        size={size}
        timeScale={timeScale}
        aria-label={ariaLabel}
      />
      <Button
        frame="ghost"
        size="sm"
        timeScale={timeScale}
        onClick={() =>
          apply(
            Object.fromEntries(
              Object.entries(values).filter(([k]) => !ids.has(k))
            )
          )
        }>
        {clearFiltersText}
      </Button>
    </div>
  );
}
