/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { Search, type SearchProps } from './Search';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * ExpandableSearch — Carbon v11's ExpandableSearch: a Search that is its
 * magnifier button until it's activated, then grows into the field and takes
 * focus; emptied and blurred (or Escape on an empty field), it closes back
 * into the button. `isExpanded` holds it open. Search's props.
 *
 * The motion is Search's (useSearchExpand): the field grows from the
 * button's box by its travel's step, the content moving with the opening.
 * ========================================================================== */

export type ExpandableSearchProps = SearchProps;

const present = (v: unknown) => v !== '' && v !== undefined && v !== null;

export const ExpandableSearch = forwardRef<
  HTMLInputElement,
  ExpandableSearchProps
>(function ExpandableSearch(
  { onBlur, onChange, onExpand, onKeyDown, defaultValue, isExpanded, ...rest },
  forwardedRef
) {
  const [expanded, setExpanded] = useState(isExpanded || false);
  const [typed, setHasContent] = useState(
    present(defaultValue) || present(rest.value)
  );
  const hasContent = rest.value !== undefined ? present(rest.value) : typed;
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldFocus = useRef(false);

  // v11: the prop sets it whenever it changes.
  useEffect(() => {
    setExpanded(!!isExpanded);
  }, [isExpanded]);

  // Opened from the button: the input takes focus (without scrolling the clip).
  useEffect(() => {
    if (expanded && shouldFocus.current) {
      shouldFocus.current = false;
      searchRef.current?.focus({ preventScroll: true });
    }
  }, [expanded]);

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    onBlur?.(e);
    // Focus moving to the clear button keeps it open (v11).
    const toClear = (e.relatedTarget as Element | null)?.closest?.(
      '.cds-search__clear'
    );
    if (expanded && !toClear && !hasContent && !isExpanded) setExpanded(false);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e);
    setHasContent(e.target.value !== '');
  }

  function handleExpand(
    e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) {
    onExpand?.(e);
    shouldFocus.current = true;
    setExpanded(true);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e);
    // Collapsing handles it; with text, the field's own Escape clears it.
    if (
      expanded &&
      e.key === 'Escape' &&
      !isComposing(e) &&
      !(e.target as HTMLInputElement).value &&
      !isExpanded
    ) {
      e.stopPropagation();
      e.preventDefault();
      setExpanded(false);
    }
  }

  return (
    <Search
      {...rest}
      defaultValue={defaultValue}
      isExpanded={expanded}
      ref={mergeRefs<HTMLInputElement>(searchRef, forwardedRef as never)}
      onBlur={handleBlur}
      onChange={handleChange}
      onExpand={handleExpand}
      onKeyDown={handleKeyDown}
    />
  );
});
ExpandableSearch.displayName = 'ExpandableSearch';
