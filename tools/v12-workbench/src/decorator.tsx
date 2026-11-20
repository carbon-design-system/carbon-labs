/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Decorator } from '@storybook/react';
import { addons, useGlobals } from 'storybook/preview-api';
import { FollowKitMotion } from '@carbon-labs/react-icon-motion';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { WindowScroller } from '@carbon-labs/react-scroller';
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
import { releasePageScroll } from './page-scroll';

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
 * - The page's scroll in the kit's Scroller (`PageScroller`), so no story
 *   scrolls on the native scrollbar.
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

  // An app story brings its own page scroll: the preview's hold on the
  // native scrollbar (page-scroll.ts) is let go before it paints.
  const app = !!params?.app;
  useLayoutEffect(() => {
    if (app) releasePageScroll();
  }, [app]);

  // An app story applies its own picks (WorkbenchFrame, from its own state).
  if (app) return <Story />;

  return (
    <WorkbenchFrame globals={globals}>
      <Story />
      <PageScroller timeScale={timeScaleOf(globals.clock)} />
    </WorkbenchFrame>
  );
};

/** The page scroller's own class: another `WindowScroller` is any root without it. */
export const PAGE_SCROLLER_CLASS = 'v12-workbench-page-scroller';

/** The page scrollers mounted, first first: only the first draws (a docs page renders many stories). */
const pageScrollers: symbol[] = [];
const pageScrollerListeners = new Set<() => void>();

/** Whether a `WindowScroller` other than the page scroller is mounted. */
function otherWindowScroller(): boolean {
  return (
    typeof document !== 'undefined' &&
    !!document.querySelector(
      `.cds-scroller-window:not(.${PAGE_SCROLLER_CLASS})`
    )
  );
}

/**
 * The story page's scroll on the kit's `WindowScroller`: every story gets it,
 * so a story taller than its frame never shows the native scrollbar. A story
 * that brings its own (a page shell's) is the one that shows: this one stands
 * down while another is mounted, and of several stories on one page only the
 * first draws, so the window never has two pills.
 */
export function PageScroller({ timeScale }: { timeScale?: number }) {
  // Both start from what's on the page now, so the first commit already
  // draws (or doesn't) and the page never paints a frame on the native
  // scrollbar. Stories mounted in one commit all start first; the layout
  // effect settles them on one before paint.
  const [other, setOther] = useState(otherWindowScroller);
  const [first, setFirst] = useState(() => pageScrollers.length === 0);
  useLayoutEffect(() => {
    const me = Symbol('page scroller');
    const readFirst = () => setFirst(pageScrollers[0] === me);
    pageScrollers.push(me);
    pageScrollerListeners.add(readFirst);
    pageScrollerListeners.forEach((l) => l());
    const read = () => setOther(otherWindowScroller());
    read();
    // A window scroller is on the page now (this one's, drawn in this
    // commit, or another's), and it hides the native scrollbar itself.
    releasePageScroll();
    const mo = new MutationObserver(read);
    mo.observe(document.body, { childList: true });
    return () => {
      mo.disconnect();
      pageScrollers.splice(pageScrollers.indexOf(me), 1);
      pageScrollerListeners.delete(readFirst);
      pageScrollerListeners.forEach((l) => l());
    };
  }, []);
  if (!first) return null;
  return (
    <WindowScroller
      className={PAGE_SCROLLER_CLASS}
      disabled={other}
      timeScale={timeScale}
    />
  );
}

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

  // Before paint, so a story never paints a frame in the previous theme,
  // direction or motion level (Applied writes the level), and a story's
  // useEffect reads the picks already on <html>.
  useLayoutEffect(() => {
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

  // Before paint too, with the theme and direction (WorkbenchFrame).
  useLayoutEffect(() => {
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
