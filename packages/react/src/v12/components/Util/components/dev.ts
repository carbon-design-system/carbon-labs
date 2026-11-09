/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The kit's own: no bundler's globals or types are assumed.
declare const process: { env: { NODE_ENV?: string } };

/** Not a production build: `process.env.NODE_ENV` in full, so bundlers replace it; Node reads it as is. */
export const IN_DEVELOPMENT: boolean = (() => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();
