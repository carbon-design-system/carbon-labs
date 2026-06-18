/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Parses a comma-separated string of GitHub handles into a normalized array.
 * Adds "@" prefix if missing. Deduplicated.
 */
export function parseOwners(str) {
  if (!str) return [];
  const seen = new Set();
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((handle) => (handle.startsWith('@') ? handle : `@${handle}`))
    .filter((handle) => {
      if (seen.has(handle)) return false;
      seen.add(handle);
      return true;
    });
}

/**
 * Returns the first non-empty owner list in priority order: flag > config > [].
 */
export function mergeOwners(flagOwners, configOwners) {
  if (flagOwners && flagOwners.length > 0) return flagOwners;
  if (configOwners && configOwners.length > 0) return configOwners;
  return [];
}
