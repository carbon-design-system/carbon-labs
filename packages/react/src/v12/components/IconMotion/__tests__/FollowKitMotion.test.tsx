/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MotionProvider } from '@carbon-labs/v12-motion';
import {
  MotionIconProvider,
  useMotionContext,
} from '@carbon-labs/react-motion-icons';
import {
  FollowKitMotion,
  useIconAnimated,
} from '../components/FollowKitMotion';

/* The motion icons follow the kit's reduced motion: the nearest
   MotionProvider's level (the server snapshot is the OS's "no preference"). */

function Probe() {
  return (
    <i
      data-animated={String(useMotionContext().animated)}
      data-kit={String(useIconAnimated())}
    />
  );
}
const read = (node: ReactNode) => {
  const html = renderToStaticMarkup(node);
  return {
    icons: /data-animated="(\w+)"/.exec(html)?.[1],
    kit: /data-kit="(\w+)"/.exec(html)?.[1],
  };
};

describe('FollowKitMotion', () => {
  it('without it, an icon follows only the OS, whatever the level', () => {
    expect(
      read(
        <MotionProvider level="reduced">
          <Probe />
        </MotionProvider>
      )
    ).toEqual({ icons: 'true', kit: 'false' });
  });

  it('with it, the icons follow the level: reduced and none still, full animated', () => {
    for (const [level, animated] of [
      ['reduced', 'false'],
      ['none', 'false'],
      ['full', 'true'],
      ['system', 'true'],
    ] as const) {
      expect(
        read(
          <MotionProvider level={level}>
            <FollowKitMotion>
              <Probe />
            </FollowKitMotion>
          </MotionProvider>
        ).icons,
        level
      ).toBe(animated);
    }
  });

  it('a nested level wins, and a MotionIconProvider further in still wins', () => {
    expect(
      read(
        <MotionProvider level="full">
          <FollowKitMotion>
            <MotionProvider level="reduced">
              <FollowKitMotion>
                <Probe />
              </FollowKitMotion>
            </MotionProvider>
          </FollowKitMotion>
        </MotionProvider>
      ).icons
    ).toBe('false');
    expect(
      read(
        <MotionProvider level="full">
          <FollowKitMotion>
            <MotionIconProvider animated={false}>
              <Probe />
            </MotionIconProvider>
          </FollowKitMotion>
        </MotionProvider>
      ).icons
    ).toBe('false');
  });
});
