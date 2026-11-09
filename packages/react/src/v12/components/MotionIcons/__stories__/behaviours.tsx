/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What the gallery says for each behaviour (dev only: stories). One entry per behaviour,
 * in the house vocabulary, each with the same fields: what it is, when to use it,
 * and its API with the React and web-component names side by side.
 */
import React from 'react';
import type { ApiRow } from './galleryKit';
import { useGalleryUI } from './statusControls';

/** The behaviours, in the order of the gallery's content switcher. */
export const BEHAVIOUR_ORDER = ['Toggle', 'Status', 'Action', 'Hover'] as const;
export type Behaviour = (typeof BEHAVIOUR_ORDER)[number];

const C = ({ children }: { children: React.ReactNode }) => (
  <code>{children}</code>
);

export interface BehaviourInfo {
  /** "toggle icons", for the search label. */
  plural: string;
  what: React.ReactNode;
  when: React.ReactNode;
  api: readonly ApiRow[];
  apiNote: React.ReactNode;
}

/** What every icon takes, and where the full reference is, for the platforms the host has. */
function Common() {
  const { webComponents } = useGalleryUI();
  return webComponents ? (
    <>
      Every icon also takes <C>size</C>, <C>animated</C>, <C>aria-label</C> and
      a <C>ref</C> (React) or the same attributes and methods (web components).
      Full reference: <strong>Motion Icons › Overview</strong> and{' '}
      <strong>› Web components</strong>.
    </>
  ) : (
    <>
      Every icon also takes <C>size</C>, <C>animated</C>, <C>aria-label</C> and
      a <C>ref</C>. Full reference: <strong>Motion Icons › Overview</strong>.
    </>
  );
}
const COMMON = <Common />;

export const BEHAVIOURS: Record<Behaviour, BehaviourInfo> = {
  Toggle: {
    plural: 'toggle icons',
    what: (
      <>
        A toggle changes the icon's state: outline ⇄ filled (a disc fills from
        the center), on ⇄ off (Carbon's slash draws in), one icon to another
        (one cuts to the other), or a direction (it folds over). One toggle per
        family, named for one of its icons (<C>BookmarkToggle</C>,{' '}
        <C>PlayPauseToggle</C>); on ⇄ off toggles are named for the off icon (
        <C>VideoOffToggle</C>).
      </>
    ),
    when: (
      <>
        The icon itself shows a setting the user switches: bookmark, mute, play
        and pause, expand. Click a card (or press Enter on it) to switch every
        size; its state shows top right. Paired icons show once, starting
        outline or off.
      </>
    ),
    api: [
      {
        react: <C>value</C>,
        wc: <C>value</C>,
        does: 'The state by name. Controlled in React; in HTML the start state, set later it animates.',
      },
      {
        react: <C>initial</C>,
        wc: <C>value</C>,
        does: 'The uncontrolled start state.',
      },
      {
        react: <C>onChange(next)</C>,
        wc: (
          <>
            <C>clabs-motion-icon-beingchanged</C>,{' '}
            <C>clabs-motion-icon-changed</C>
          </>
        ),
        does: "The icon's own click asks for the next state. The web component's first event is cancelable: cancel it and set value yourself.",
      },
      {
        react: <C>toggled</C>,
        wc: <C>toggled</C>,
        does: 'Two-state shorthand: true is the second state (onToggle in React).',
      },
      {
        react: <C>asButton</C>,
        wc: <C>as-button</C>,
        does: 'A standalone icon becomes the button: focusable, Enter and Space, aria-pressed.',
      },
      {
        react: <C>disableToggle</C>,
        wc: <C>disable-toggle</C>,
        does: "The icon's clicks don't change it (a parent button owns the state). Hover still plays.",
      },
      {
        react: (
          <>
            <C>filled</C>, <C>variant</C>
          </>
        ),
        wc: (
          <>
            <C>filled</C>, <C>variant</C>
          </>
        ),
        does: "Picks Carbon's drawings: filled art, or a family's extra drawings (PlayPauseToggle outline, NotificationToggle ring).",
      },
    ],
    apiNote: COMMON,
  },
  Status: {
    plural: 'status icons',
    what: (
      <>
        A status is a mark on the icon that stays until it's cleared: success,
        warning, error or pending on a process icon, and a notification dot or a
        count on a notification icon. The mark sits in a corner, and the icon is
        cut away around it. While a status shows, the icon holds still on hover.
      </>
    ),
    when: (
      <>
        A process's result should stay visible on its icon until it changes:
        saved, failed to sync, uploading, three unread. Color alone shouldn't
        carry the meaning: pair a toned mark with a label. For a one-off moment,
        use an action that hands off to a status.
      </>
    ),
    api: [
      {
        react: <C>status</C>,
        wc: <C>status</C>,
        does: "Process icons: 'success' | 'warning' | 'error' | 'pending'. Notification icons: 'notification' (the dot). Unset is the plain icon.",
      },
      {
        react: <C>count</C>,
        wc: <C>count</C>,
        does: 'Notification icons: a count in a pill. Numbers show at size 32 only; smaller sizes show the dot. A change rolls to the new number.',
      },
      {
        react: <C>max</C>,
        wc: <C>max</C>,
        does: '9 or 99: at this count or more the pill shows 9+ or 99+.',
      },
      {
        react: <C>countPlacement</C>,
        wc: <C>count-placement</C>,
        does: "'overhang' (the default: off the frame's corner, so don't clip the parent) or 'inside'.",
      },
      {
        react: <C>tone</C>,
        wc: <C>tone</C>,
        does: 'true: each mark in its support color. A named tone colors the dot and count. Off: currentColor.',
      },
      {
        react: <C>{'<StatusPip count>'}</C>,
        wc: <C>{'<clabs-motion-status-pip count>'}</C>,
        does: 'A count on its own, not on an icon (max, tone).',
      },
    ],
    apiNote: <>Status has no events: it is input. {COMMON}</>,
  },
  Action: {
    plural: 'action icons',
    what: (
      <>
        An action is a one-shot motion the icon plays when the thing it stands
        for happens: copied, sent, deleted, a new notification, renewed. It
        plays once and returns to rest, leaving no state. It can loop while a
        process runs, and hand off to a status as it settles. It can draw
        slightly outside the icon's box (up to 2px at size 32), so don't clip
        its parent.
      </>
    ),
    when: (
      <>
        To confirm that something just happened, at the icon that did it. Loop
        it while a process runs (Renew while syncing), then hand off to the
        status that reports the result.
      </>
    ),
    api: [
      {
        react: <C>ref.trigger(options)</C>,
        wc: <C>el.trigger(options)</C>,
        does: 'Plays the action and returns a promise that resolves when it ends. Options: loop, until (loop until a promise settles), then and failed (the hand-off status, and for how many ms).',
      },
      {
        react: <C>ref.stop()</C>,
        wc: <C>el.stop()</C>,
        does: 'Ends a loop: the pass in flight finishes (a turning icon eases out to its next rest).',
      },
      {
        react: <C>actionKey</C>,
        wc: <C>action-key</C>,
        does: 'Plays whenever the key changes (not on mount).',
      },
      {
        react: <C>actionOn="click"</C>,
        wc: <C>action-on="click"</C>,
        does: "Plays on the icon's own click.",
      },
      {
        react: <C>loop</C>,
        wc: <C>loop</C>,
        does: 'Loops while set; unset, the pass finishes, then the hand-off.',
      },
      {
        react: <C>actionThen</C>,
        wc: <C>action-then="success 1500"</C>,
        does: 'The status the declarative actions hand off to.',
      },
    ],
    apiNote: (
      <>
        Under reduced motion nothing plays and the hand-off status applies at
        once. {COMMON}
      </>
    ),
  },
  Hover: {
    plural: 'icons',
    what: (
      <>
        A hover is a preview on pointer or keyboard focus: the icon hints at
        what it does, then plays back as the pointer leaves. Every icon has one,
        including the badged icons (Document add, Settings view, Task edit, …).
        It plays in over moderate-01 (160ms) and out over fast-02 (120ms), and
        line weight stays constant.
      </>
    ),
    when: (
      <>
        Always on: put <C>data-motion-icon-frame</C> on the button or link that
        holds the icon, so hovering or tabbing to the whole control plays it.
        Touch never plays it; call <C>play()</C> to show it on touch or for
        emphasis.
      </>
    ),
    api: [
      {
        react: <C>data-motion-icon-frame</C>,
        wc: <C>data-motion-icon-frame</C>,
        does: 'On an ancestor: its pointer and keyboard focus (:focus-visible) play the hover. Without one, the icon is its own frame.',
      },
      {
        react: <C>ref.play()</C>,
        wc: <C>el.play()</C>,
        does: 'Plays the hover once, in then out, and returns a promise that resolves when it ends. Does nothing under reduced motion or in a disabled button.',
      },
      {
        react: <C>usePlayHover()</C>,
        wc: '—',
        does: 'A ref for a frame or group, and a play() for every icon inside it (playHover(element) without the hook).',
      },
    ],
    apiNote: COMMON,
  },
};
