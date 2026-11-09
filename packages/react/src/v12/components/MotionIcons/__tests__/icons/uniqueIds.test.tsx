/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Package from '../../index';
import { MotionIconProvider } from '../../context/MotionIconProvider';

// Every exported icon component (PascalCase function exports that aren't
// providers). Hooks are camelCase and skipped by the regex.
const icons = Object.entries(Package).filter(
  // A function, or a forwardRef object where React has no ref prop (React 18).
  ([name, value]) =>
    /^[A-Z]/.test(name) &&
    (typeof value === 'function' ||
      (typeof value === 'object' && value !== null)) &&
    name !== 'MotionIconProvider'
) as [string, React.ComponentType<Record<string, unknown>>][];

// Two copies of an icon on one page must each reference their OWN masks and
// clip paths — a hard-coded id makes the second copy's `url(#id)` resolve
// to the first copy's element, so hovering one animates the other's mask.
describe.each([true, false])(
  'url(#id) references stay inside their own SVG (animated=%s)',
  (animated) => {
    it.each(icons)('%s', (_name, Icon) => {
      const { container } = render(
        <MotionIconProvider animated={animated}>
          <Icon size={32} />
          <Icon size={32} />
        </MotionIconProvider>
      );
      for (const svg of container.querySelectorAll('svg')) {
        for (const el of svg.querySelectorAll('[mask], [clip-path]')) {
          for (const attr of ['mask', 'clip-path']) {
            const ref = el.getAttribute(attr)?.match(/url\(#(.+)\)/)?.[1];
            if (!ref) continue;
            const target = [...svg.querySelectorAll('[id]')].find(
              (node) => node.id === ref
            );
            expect(
              target,
              `${attr}="url(#${ref})" must resolve inside its own <svg>`
            ).toBeTruthy();
          }
        }
      }
      const ids = [...container.querySelectorAll('mask[id], clipPath[id]')].map(
        (node) => node.id
      );
      expect(new Set(ids).size).toBe(ids.length);
    });
  }
);
