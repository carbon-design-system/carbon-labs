/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { addons } from 'storybook/preview-api';
import { unstable_Layout as Layout } from '@carbon/react';
import { FeedbackMotion, MotionProvider } from '@carbon-labs/v12-motion';
import {
  EVENTS,
  MOTION_LEVEL,
  readGlobals,
  timeScaleOf,
  type V12Parameters,
} from './constants';
import { applyClock } from './clock';
import { motionReport } from './motion';

/**
 * Applies the toolbar to a story.
 *
 * - On `<html>`, so what a story portals to the body follows too:
 *   `data-carbon-theme`, `dir`, `data-density`, `data-corners` and
 *   `data-motion-level` (what carbon-motion's tokens CSS reads).
 * - Around the story: carbon-motion's `MotionProvider` at the forced level
 *   (what `usePrefersReducedMotion` reads), `FeedbackMotion` with the time
 *   scale and the reduced flag, and Carbon's `Layout` density.
 * - The clock, on the whole document (see `applyClock`).
 * - The Motion panel's data, sent over the channel.
 */
export const withWorkbench: Decorator = (Story, context) => {
  const globals = readGlobals(context.globals);
  const level = MOTION_LEVEL[globals.reducedMotion];
  const timeScale = timeScaleOf(globals.clock);
  const params = context.parameters.v12 as V12Parameters | undefined;
  const declared = JSON.stringify(params ?? null);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-carbon-theme', globals.theme);
    html.setAttribute('dir', globals.dir);
    html.setAttribute('data-density', globals.density);
    html.setAttribute('data-corners', globals.corners);
    html.setAttribute('data-motion-level', level);
  }, [globals.theme, globals.dir, globals.density, globals.corners, level]);

  useEffect(() => applyClock(timeScale), [timeScale]);

  useEffect(() => {
    const channel = addons.getChannel();
    const send = () =>
      channel.emit(EVENTS.motion, motionReport(context.id, params));
    send();
    channel.on(EVENTS.request, send);
    return () => channel.off(EVENTS.request, send);
    // `declared` stands for `params`: same declaration, same report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.id, declared]);

  return (
    <MotionProvider level={level} scope={false}>
      <FeedbackMotion timeScale={timeScale} reduced={level !== 'full'}>
        <Layout
          density={globals.density === 'compact' ? 'condensed' : 'normal'}>
          <Story />
        </Layout>
      </FeedbackMotion>
    </MotionProvider>
  );
};
