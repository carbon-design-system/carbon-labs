/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { breakpoints } from '@carbon/layout';
import { useEffect, useState } from 'react';

const prefix = 'carbon-mdx-components';
const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm.width})`,
  md: `(min-width: ${breakpoints.md.width})`,
  lg: `(min-width: ${breakpoints.lg.width})`,
  xlg: `(min-width: ${breakpoints.xlg.width})`,
  max: `(min-width: ${breakpoints.max.width})`,
};
let globalIndex = 0;

/**
 * Queries the window if it exists.
 * @param {string} query of the dimensions needed
 * @returns the matchMedia function
 */
const getMatchMedia = (query: string) => {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(query)
    : null;
};

/**
 * Gives an ID to the markdown components.
 * @param {string} label component name string
 * @returns string for component ID
 */
const useId = (label: string) => {
  // TODO: delete this hook and use react 18 useId instead.
  const [id] = useState(++globalIndex);

  return `cp__${label}__${id}`;
};

/**
 * Function that returns the viewport media dimensions.
 * @param {string} query string
 * @returns boolean stating if it matches viewport dimensions
 */
const useMatchMedia = (query: string) => {
  const [matches, setMatches] = useState(getMatchMedia(query)?.matches);

  useEffect(() => {
    const matchMediaResult = getMatchMedia(query);
    /**
     *
     * @param {any} e event
     * @param {(
     *   boolean |
     *   ((prevState: boolean | undefined) => boolean | undefined) |
     *   undefined
     * )} e.matches boolean stating if it matches
     */
    const updateMatch = (e: {
      matches:
        | boolean
        | ((prevState: boolean | undefined) => boolean | undefined)
        | undefined;
    }) => {
      setMatches(e.matches);
    };

    matchMediaResult?.addEventListener('change', updateMatch);

    return () => {
      matchMediaResult?.removeEventListener('change', updateMatch);
    };
  }, [query]);

  return matches;
};

/**
 * Adds a prefix specific to the carbon platform mdx components to the provided string. This is
 * often used in conjunction with the scss utility `with-prefix` to assign unique class names to
 * styles for components.
 *
 * @param {string} className The string to which to add a prefix.
 * @returns A prefixed string.
 */
function withPrefix(className: string) {
  return prefix + '--' + className;
}

export { mediaQueries, useId, useMatchMedia, withPrefix };
