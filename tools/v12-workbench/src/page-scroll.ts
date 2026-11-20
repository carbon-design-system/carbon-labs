/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The native page scrollbar, hidden from the preview's first frame until the
// page scroller takes over. A docs page paints its text before any story (and
// so the decorator's `PageScroller`) mounts; without this, those first frames
// show the native scrollbar, and a page on a classic scrollbar narrows once
// the pill takes over.
//
// The hold is let go as soon as the page has its scroll in other hands, or
// will have none from the workbench: a page scroller mounted (its
// WindowScroller hides the native scrollbar from then on), an app story ran
// (it brings its own), a story failed or is missing, or a docs page rendered
// with no story on it. A last timer lets it go regardless, so a page is never
// left without a way to see that it scrolls.

import {
  DOCS_RENDERED,
  STORY_ERRORED,
  STORY_MISSING,
  STORY_THREW_EXCEPTION,
} from 'storybook/internal/core-events';

/** On `<html>` while the native page scrollbar is held hidden. */
export const PAGE_SCROLL_HOLD = 'data-v12-page-scroll-hold';

/** The longest the hold lasts with nothing to let it go (ms). */
export const PAGE_SCROLL_HOLD_MAX = 3000;

const STYLE_ID = 'v12-workbench-page-scroll-hold';

/** What a channel needs here: Storybook's preview channel. */
interface Channel {
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
}

let timer: ReturnType<typeof setTimeout> | undefined;
let unwatch: (() => void) | undefined;

/** Lets the hold go: the native scrollbar shows again unless a scroller hides it. */
export function releasePageScroll(doc: Document = document): void {
  doc.documentElement.removeAttribute(PAGE_SCROLL_HOLD);
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
  unwatch?.();
  unwatch = undefined;
}

/** Whether the hold is on. */
export function isPageScrollHeld(doc: Document = document): boolean {
  return doc.documentElement.hasAttribute(PAGE_SCROLL_HOLD);
}

/**
 * Hides the native page scrollbar from now until the page scroller takes
 * over (see the top of this file). Run once, at the preview's load.
 *
 * @param channel the preview's channel, for the events that let it go
 * @param doc the preview's document
 */
export function holdPageScroll(channel?: Channel, doc: Document = document) {
  if (!doc.getElementById(STYLE_ID)) {
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `html[${PAGE_SCROLL_HOLD}] { scrollbar-width: none; }
html[${PAGE_SCROLL_HOLD}]::-webkit-scrollbar,
html[${PAGE_SCROLL_HOLD}] body::-webkit-scrollbar { display: none; }`;
    doc.head.append(style);
  }
  doc.documentElement.setAttribute(PAGE_SCROLL_HOLD, '');
  timer = setTimeout(() => releasePageScroll(doc), PAGE_SCROLL_HOLD_MAX);

  if (!channel) return;
  const release = () => releasePageScroll(doc);
  // A docs page with no story on it has no page scroller to come.
  const docsRendered = () => {
    if (!doc.querySelector('.docs-story')) release();
  };
  const failed = [STORY_ERRORED, STORY_THREW_EXCEPTION, STORY_MISSING];
  failed.forEach((e) => channel.on(e, release));
  channel.on(DOCS_RENDERED, docsRendered);
  unwatch = () => {
    failed.forEach((e) => channel.off(e, release));
    channel.off(DOCS_RENDERED, docsRendered);
  };
}
