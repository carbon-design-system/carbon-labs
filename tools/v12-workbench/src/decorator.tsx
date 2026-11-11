/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Decorator } from '@storybook/react';
import { addons, useGlobals } from 'storybook/preview-api';
import { FollowKitMotion } from '@carbon-labs/react-icon-motion';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import {
  FeedbackMotion,
  MotionProvider,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import {
  EVENTS,
  MOTION_LEVEL,
  levelOf,
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
 *   `data-carbon-theme`, `dir` and `data-motion-level` (what carbon-motion's
 *   tokens CSS reads).
 * - Around the story: carbon-motion's `MotionProvider` at the picked level,
 *   or at the system's when nothing is forced (what
 *   `usePrefersReducedMotion` reads), `FeedbackMotion` with the time scale
 *   and the reduced flag, and the kit's `KitDefaults`, the one path density
 *   and corners take (the default of each leaves a component's own).
 * - The clock, on the whole document (see `applyClock`).
 * - The Motion panel's data, sent over the channel.
 * - A theme not on the toolbar (a v11 one in an address from before) is
 *   written back as the theme it falls back to, so the toolbar shows it.
 */
export const withWorkbench: Decorator = (Story, context) => {
  const globals = readGlobals(context.globals);
  const params = context.parameters.v12 as V12Parameters | undefined;
  const declared = JSON.stringify(params ?? null);
  const [, updateGlobals] = useGlobals();
  const given = context.globals.theme;
  const stale = given !== undefined && given !== globals.theme;

  useEffect(() => {
    if (stale) updateGlobals({ theme: globals.theme });
  }, [stale, globals.theme, updateGlobals]);

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
 * The picks applied to what it holds: on `<html>` (theme, direction, motion
 * level), the clock on the whole document, and the providers (motion level,
 * time scale, the kit's defaults for density and corners), with the motion
 * icons following the level. With no motion pick the level is the system's.
 * The decorator uses it with the toolbar's globals; an app uses it with its
 * own.
 */
export function WorkbenchFrame({
  globals,
  children,
}: {
  globals: WorkbenchGlobals;
  children: ReactNode;
}) {
  const timeScale = timeScaleOf(globals.clock);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-carbon-theme', globals.theme);
    html.setAttribute('dir', globals.dir);
  }, [globals.theme, globals.dir]);

  useEffect(() => applyClock(timeScale), [timeScale]);

  return (
    <MotionProvider level={MOTION_LEVEL[globals.reducedMotion]} scope={false}>
      <Applied globals={globals} timeScale={timeScale}>
        {children}
      </Applied>
    </MotionProvider>
  );
}

/** What reads the resolved level: the `<html>` attribute and the providers below. */
function Applied({
  globals,
  timeScale,
  children,
}: {
  globals: WorkbenchGlobals;
  timeScale: number;
  children: ReactNode;
}) {
  // Under `system` the provider holds no level, so this is the operating
  // system's setting.
  const systemReduces = usePrefersReducedMotion();
  const level = levelOf(globals.reducedMotion, systemReduces);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion-level', level);
  }, [level]);

  return (
    // The motion icons follow the level too: they read their own provider.
    <FollowKitMotion>
      <FeedbackMotion timeScale={timeScale} reduced={level !== 'full'}>
        <KitDefaults
          density={globals.density === 'default' ? undefined : globals.density}
          corners={globals.corners === 'default' ? undefined : globals.corners}>
          {children}
        </KitDefaults>
      </FeedbackMotion>
    </FollowKitMotion>
  );
}
