/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect } from 'react';

// useLayoutEffect on the client, useEffect on the server
const useIsomorphicEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicEffect;
