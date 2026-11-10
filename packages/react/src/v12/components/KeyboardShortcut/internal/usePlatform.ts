/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { detectPlatform, type Platform } from './keys';

// The platform a server render assumes. A server cannot know the visitor's
// platform without the request, so it renders the non-mac words and a caller
// who knows better (from the User-Agent header) passes `platform`.
const SERVER_PLATFORM: Platform = 'other';

/**
 * The platform never changes while a page is open, so there is nothing to
 * subscribe to.
 *
 * @returns An unsubscribe that does nothing.
 */
const subscribe = () => () => {};

/**
 * @returns The platform the browser reports.
 */
const getSnapshot = (): Platform =>
  typeof navigator === 'undefined'
    ? SERVER_PLATFORM
    : detectPlatform(navigator);
/**
 * @returns The platform a server render assumes.
 */
const getServerSnapshot = (): Platform => SERVER_PLATFORM;

type UseSyncExternalStore = <T>(
  subscribe: (onChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
) => T;

/**
 * React 16 and 17 have no useSyncExternalStore. This package adds no dependency
 * for one hook, so it falls back to a state that starts at the server value and
 * settles after mount. On React 16/17 every render, client-only too, therefore
 * shows the non-mac keys for one frame on a Mac (MIGRATION.md). At graduation,
 * core takes `use-sync-external-store/shim`, as internal/useDocumentLang.tsx
 * does, and this fallback is deleted.
 *
 * @param {Function} _subscribe Unused: the platform never changes.
 * @param {Function} getClientSnapshot Reads the value in the browser.
 * @param {Function} [getServer] The value a server render and its hydration use.
 * @returns The value.
 */
export function useSyncExternalStoreFallback<T>(
  _subscribe: (onChange: () => void) => () => void,
  getClientSnapshot: () => T,
  getServer: () => T = getClientSnapshot
): T {
  const [value, setValue] = useState(getServer);
  useEffect(() => {
    setValue(getClientSnapshot());
  }, [getClientSnapshot]);
  return value;
}

const useSync: UseSyncExternalStore =
  (React as unknown as { useSyncExternalStore?: UseSyncExternalStore })
    .useSyncExternalStore ?? useSyncExternalStoreFallback;

/**
 * The platform to render for. An explicit `mac` or `other` wins. On `auto`,
 * with React 18 or later, a client-only render reads the browser on its first
 * render, so the right keys paint first and nothing shifts (on React 16/17, see
 * the fallback above). A server render and its hydration use
 * `other`, and React re-renders with the detected platform straight after
 * hydrating, so the markup always matches and nothing reads `window` on the
 * server.
 *
 * @param {Platform | 'auto'} [platform] `mac`, `other`, or `auto` to detect it.
 * @returns `mac` or `other`.
 */
export function usePlatform(platform: Platform | 'auto' = 'auto'): Platform {
  const detected = useSync(subscribe, getSnapshot, getServerSnapshot);
  return platform === 'auto' ? detected : platform;
}
