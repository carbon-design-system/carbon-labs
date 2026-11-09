/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Decorator } from '@storybook/react';
import { addons } from 'storybook/preview-api';
import { unstable_Layout as Layout } from '@carbon/react';
import { FollowKitMotion } from '@carbon-labs/react-icon-motion';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { FeedbackMotion, MotionProvider } from '@carbon-labs/v12-motion';
import {
  EVENTS,
  MOTION_LEVEL,
  readGlobals,
  timeScaleOf,
  type V12Parameters,
  type WorkbenchGlobals,
} from './constants';
import { applyClock } from './clock';
import { motionReport } from './motion';

/**
 * Applies the toolbar to a story.
 *
 * - On `<html>`, so what a story portals to the body follows too:
 *   `data-carbon-theme`, `dir`, `data-density` and `data-motion-level` (what carbon-motion's tokens CSS reads).
 * - Around the story: carbon-motion's `MotionProvider` at the forced level
 *   (what `usePrefersReducedMotion` reads), `FeedbackMotion` with the time
 *   scale and the reduced flag, the kit's `KitDefaults` (compact density;
 *   the default leaves each component's own) and Carbon's
 *   `Layout` density, for the parts still drawn by Carbon.
 * - The clock, on the whole document (see `applyClock`).
 * - The Motion panel's data, sent over the channel.
 */
export const withWorkbench: Decorator = (Story, context) => {
  const globals = readGlobals(context.globals);
  const params = context.parameters.v12 as V12Parameters | undefined;
  const declared = JSON.stringify(params ?? null);

  useEffect(() => {
    if (params?.app) return;
    const channel = addons.getChannel();
    const send = () =>
      channel.emit(EVENTS.motion, motionReport(context.id, params));
    send();
    channel.on(EVENTS.request, send);
    return () => channel.off(EVENTS.request, send);
    // `declared` stands for `params`: same declaration, same report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.id, declared]);

  // An app story applies its own picks (WorkbenchFrame, from its own state).
  if (params?.app) return <Story />;

  return (
    <WorkbenchFrame globals={globals}>
      <Story />
    </WorkbenchFrame>
  );
};

/**
 * The picks applied to what it holds: on `<html>` (theme, direction,
 * density, motion level), the clock on the whole document, and the
 * providers (motion level, time scale, the kit's defaults, Carbon's
 * `Layout` density), with the motion icons following the level. The
 * decorator uses it with the toolbar's globals; an app uses it with its own.
 */
export function WorkbenchFrame({
  globals,
  children,
}: {
  globals: WorkbenchGlobals;
  children: ReactNode;
}) {
  const level = MOTION_LEVEL[globals.reducedMotion];
  const timeScale = timeScaleOf(globals.clock);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-carbon-theme', globals.theme);
    html.setAttribute('dir', globals.dir);
    html.setAttribute('data-density', globals.density);
    html.setAttribute('data-motion-level', level);
  }, [globals.theme, globals.dir, globals.density, level]);

  useEffect(() => applyClock(timeScale), [timeScale]);

  return (
    <MotionProvider level={level} scope={false}>
      {/* The motion icons follow the level too: they read their own provider. */}
      <FollowKitMotion>
        <FeedbackMotion timeScale={timeScale} reduced={level !== 'full'}>
          <KitDefaults
            density={globals.density === 'compact' ? 'compact' : undefined}>
            <Layout
              density={globals.density === 'compact' ? 'condensed' : 'normal'}>
              {children}
            </Layout>
          </KitDefaults>
        </FeedbackMotion>
      </FollowKitMotion>
    </MotionProvider>
  );
}
