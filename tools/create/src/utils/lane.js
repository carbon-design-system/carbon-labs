/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { join } from 'path';

export const V12_STORYBOOK_GROUP = 'V12';

/**
 * Where a component is generated inside its package. The v12 lane is
 * `src/v12/components`; everything else is `src/components`.
 *
 * @param {object} [opts] - lane options
 * @param {boolean} [opts.v12] - true for the v12 lane
 * @returns {string} the components directory, relative to the package
 */
export function getComponentsDir({ v12 = false } = {}) {
  return v12 ? join('src', 'v12', 'components') : join('src', 'components');
}

/**
 * Throws when the v12 lane is asked for a component type it does not take.
 * The lane is React first: web components are ported in Carbon after the
 * React preview.
 *
 * @param {object} opts - lane options
 * @param {boolean} [opts.v12] - true for the v12 lane
 * @param {string} opts.type - "react" or "web-component"
 */
export function validateLane({ v12 = false, type }) {
  if (v12 && type !== 'react') {
    throw new Error(
      `--v12 supports React components only (got --type ${type}). ` +
        'Web components are ported in Carbon after the React preview.'
    );
  }
}

/**
 * The Storybook sidebar group for a generated story. v12 stories are always
 * titled under `V12/`; a group nests beneath it (`V12/<group>/<Name>`).
 *
 * @param {object} [opts] - lane options
 * @param {boolean} [opts.v12] - true for the v12 lane
 * @param {string} [opts.group] - the requested Storybook group, if any
 * @returns {string | undefined} undefined when not v12 and no group was given
 */
export function getV12StorybookGroup({ v12 = false, group } = {}) {
  if (!v12) {
    return group;
  }
  if (
    group === V12_STORYBOOK_GROUP ||
    group?.startsWith(`${V12_STORYBOOK_GROUP}/`)
  ) {
    return group;
  }
  return [V12_STORYBOOK_GROUP, group].filter(Boolean).join('/');
}

/**
 * The Storybook script that shows components from this lane.
 *
 * @param {object} [opts] - lane options
 * @param {boolean} [opts.v12] - true for the v12 lane
 * @returns {string} the package.json script name
 */
export function getStorybookScript({ v12 = false } = {}) {
  return v12 ? 'storybook:v12' : 'storybook';
}
