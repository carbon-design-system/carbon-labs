/* eslint-disable jsdoc/require-jsdoc */
/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useSyncExternalStore } from 'react';

export function useMatchMedia(mediaQueryString) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(mediaQueryString);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [mediaQueryString]
  );

  // `getSnapshot` runs only on the client; `getServerSnapshot` returns `false`
  // during SSR and the initial hydration render so the markup matches the
  // server. React then re-renders with the real client value after hydration,
  // without a hydration mismatch - see
  // https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering
  const getSnapshot = () => window.matchMedia(mediaQueryString).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
