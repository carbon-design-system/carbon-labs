/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { SURFACE_RULE_OVER_PX, timesAsSurface } from '../index';
import mdx from './Snap.mdx';

export default {
  title: 'V12/Snap',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['snap'],
      reduced: {},
      states: ['rest'],
    },
  },
};

const SIZES = [
  { w: 160, h: 120 },
  { w: 320, h: 240 },
  { w: 480, h: 430 },
];

/** Which rule a free-floating surface of each size times by. */
export const Default = {
  render: () => (
    <table>
      <caption>Over {SURFACE_RULE_OVER_PX}px: the surface rule</caption>
      <tbody>
        {SIZES.map((s) => (
          <tr key={`${s.w}x${s.h}`}>
            <td>
              {s.w} × {s.h}
            </td>
            <td>{timesAsSurface(s) ? 'surface' : 'floating'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
