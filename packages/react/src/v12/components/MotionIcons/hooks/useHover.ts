/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import {
  bindHover,
  FRAME_SELECTOR as CORE_FRAME_SELECTOR,
} from '@carbon-labs/motion-icons-core/engine/env';
import {
  bindPress,
  mayPress,
} from '@carbon-labs/motion-icons-core/engine/press';
import { attachInk } from '../utils/ink';

interface UseHoverOptions {
  /**
   * The hover plays in. Return a promise for the end of the hover-in (the
   * frame engine's `hoverTo(1)` does) and `play()` plays it back out
   * exactly when it lands; anything else ends the play at once.
   */
  onEnter?: () => unknown;
  /** The hover plays out. Return a promise for the end of the hover-out (`hoverTo(0)` does) and `play()`'s promise waits for it. */
  onLeave?: () => unknown;
  disabled?: boolean;
  /**
   * The icons' press (the core's press.ts), bound with the hover: `own`, the
   * icon is its own control (`asButton`, `actionOn="click"`); `force`, the
   * author's `press` prop. Absent: no press. Read on each press.
   */
  press?: { own?: boolean; force?: boolean };
  /**
   * Bind a click on the marked frame's padding to `frameClickRef` (see
   * "Interactive frame"). Default true; an icon that never assigns
   * `frameClickRef` (a hover icon) passes false and binds no click.
   */
  frameClick?: boolean;
}

interface UseHoverResult {
  ref: React.RefObject<SVGSVGElement | null>;
  isHovering: boolean;
  /**
   * Assign a click/toggle handler here on every render (e.g.
   * `frameClickRef.current = handleToggle`) to have it also fire for clicks
   * that land inside a larger caller-supplied interactive ancestor but
   * outside the SVG's own rendered box. See the "Interactive frame" comment
   * below for the full mechanism. Leave unset (`null`) if the consumer has
   * no click-triggered behavior of its own.
   */
  frameClickRef: React.MutableRefObject<
    ((e?: React.MouseEvent) => void) | null
  >;
  /**
   * Play the hover once, in then out (see "play()" below). A no-op while
   * `disabled`, before mount, and while a hover already shows. Resolves
   * when the play is over (see "play()"); at once when nothing played.
   */
  play: () => Promise<void>;
}

/**
 * Interactive frame
 * ─────────────────
 * These icons are frequently rendered as a bare `<svg>` (`asButton={false}`)
 * nested inside a caller-supplied interactive ancestor that is much larger
 * than the icon's own tight `size`×`size` box — e.g. Carbon's
 * `HeaderGlobalAction`, a real `<button>` with generous padding around a
 * small nested icon.
 *
 * `mouseenter`/`mouseleave` do not bubble, so listeners bound directly to
 * the small `<svg>` only fire when the pointer is precisely over the glyph,
 * never over the ancestor's padding — even though that padding is squarely
 * inside the ancestor's own hoverable/clickable box. Native `click` events
 * DO bubble, but only upward from whatever the pointer actually landed on:
 * a click that starts in the ancestor's padding never touches the `<svg>`
 * at all, so the SVG's own `onClick` (which, in these toggle icons, drives
 * the toggle's entrance/exit animation) silently never fires either.
 *
 * Opting in: mark the ancestor that should act as the icon's hit area with
 * `data-motion-icon-frame` (e.g. `<HeaderGlobalAction data-motion-icon-frame>`,
 * a whole-card link tile, or a value block with a padded hit area). Once
 * mounted we walk up from the SVG to the nearest marked ancestor:
 *   - hover: the enter/leave listeners (see "Touch") are bound to that ancestor instead of
 *     the SVG, so the pointer entering/leaving anywhere in its box drives the
 *     hover animation, and keyboard focus on it plays it too (see "Keyboard focus").
 *   - click: a `click` listener is bound to that same ancestor. Clicks whose
 *     target is the SVG (or a descendant) are ignored here — those already
 *     bubble to the SVG's own `onClick` — so this only adds coverage for the
 *     padding and never double-fires. Toggles leave `frameClickRef` null
 *     when `asButton` is set (their own button already handles activation).
 *
 * It is opt-in on purpose. Implicitly adopting the nearest button, link or
 * role="button" would make a toggle inside a clickable card, table row or
 * accordion header toggle on any click anywhere in it, and hover with
 * the whole element. With no marked ancestor, hover and click stay on the
 * SVG itself.
 *
 * Touch
 * ─────
 * Hover is ignored on touch, decided per pointer event, not by a media query
 * (a laptop with a touchscreen hovers with its mouse and taps with a finger).
 *   - Hover starts on `pointerenter` with `pointerType` "mouse" or "pen" and
 *     ends on `pointerleave`. A "touch" pointer never starts it.
 *   - After a tap, browsers fire compatibility mouse events (mouseover,
 *     mouseenter, mousemove, mousedown, mouseup, click). They must not start a
 *     hover: nothing would ever end it (a finger never "leaves"), and the icon
 *     would rest hovered. So `mouseenter` only starts a hover when no pointer
 *     event has been seen on the frame at all (an engine without Pointer
 *     Events, or a test firing bare mouse events). Once pointer events are
 *     seen, they alone start hovers.
 *   - The last pointerType is remembered from pointerover / pointerenter /
 *     pointerdown, because WebKit reports "mouse" on the click that follows a
 *     tap.
 *   - Leaving is always honoured, from either event family.
 * Toggles still play on tap: that is the click, not the hover.
 *
 * Keyboard focus
 * ──────────────
 * Keyboard focus plays the hover too: `:focus-visible` on
 * the marked frame, or on a toggle's own `asButton` button. A mouse click
 * that focuses the frame isn't `:focus-visible`, so it adds nothing to the
 * pointer's hover. Pointer and focus together play the hover once; it plays
 * out when both have ended (the pointer has left and focus has gone).
 *
 * play()
 * ──────
 * `play()` plays the hover once, in then out, with no pointer: for
 * hover-only icons on touch, or emphasis the app asks for. To play an icon
 * you render (whose useHover you don't hold), use `usePlayHover()`. It
 * doesn't restart a hover already showing; a pointer or focus arriving
 * mid-play keeps the icon hovered until they end too. Under reduced motion
 * the icons render still drawings with no binding, so it does nothing.
 *
 * It returns a promise for the end of the play: the hover played back out
 * (once `onLeave`'s promise settles, when it returns one), or a pointer or
 * focus that arrived mid-play holding it once the hover-in has landed. When
 * nothing plays (a hover already showing, a disabled frame, no binding) it
 * resolves at once. An icon's ref handle (`MotionIconHandle.play()`) is this
 * play, reached through the icon's svg (`playIconHover`).
 *
 * Disabled frames
 * ───────────────
 * No hover inside a disabled button: when the frame is
 * `:disabled`, `aria-disabled="true"`, or a custom element carrying
 * `disabled` (Carbon's `cds-button` / `cds-icon-button`), pointer hover,
 * keyboard focus and `play()` don't animate. Disabled mid-hover, the icon
 * plays out; enabled again, it hovers if the pointer or focus is still there.
 */
/**
 * Selector for an icon's interactive frame — see "Interactive frame" above.
 */
export const FRAME_SELECTOR: typeof CORE_FRAME_SELECTOR = CORE_FRAME_SELECTOR;

const resolved = (): Promise<void> => Promise.resolve();
/** Each bound svg's play(), for the icons' ref handles (`playIconHover`). */
const plays = new WeakMap<Element, () => Promise<void>>();

/**
 * Play the hover of the icon whose `<svg>` is `svg` (see "play()" above).
 * Resolves at once when it has no hover binding (a still drawing, or not
 * an icon). What an icon's ref handle calls.
 */
export function playIconHover(svg: Element | null): Promise<void> {
  const play = svg ? plays.get(svg) : undefined;
  return play ? play() : resolved();
}

export function useHover({
  onEnter,
  onLeave,
  disabled,
  press,
  frameClick = true,
}: UseHoverOptions = {}): UseHoverResult {
  const ref = useRef<SVGSVGElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const frameClickRef = useRef<((e?: React.MouseEvent) => void) | null>(null);
  // The bound play (see "play()"), while bound.
  const playRef = useRef<(() => Promise<void>) | null>(null);

  // Keep latest callbacks in refs so listeners never need to be re-registered
  // when inline closures change identity each render.
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);
  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });

  // ref.current is populated by the time effects run. The binding (frame
  // lookup, the touch rule, frame clicks) is the core's bindHover: one
  // implementation for the React package and the web components. Returns
  // the unbind; `swapped` (the svg was replaced) plays a hover still showing
  // back out, since the new svg's binding starts with nothing holding it.
  const bind = (svg: SVGSVGElement): ((swapped: boolean) => void) => {
    // The last hover-in's result, and the play in flight's end (one at most: the binding doesn't restart a play).
    let entered: { result: unknown } | null = null;
    let end: ((out?: unknown) => void) | null = null;
    let active = false;
    const b = bindHover(svg, {
      enter() {
        active = true;
        setIsHovering(true);
        const result = onEnterRef.current?.();
        entered = { result };
        return result;
      },
      leave() {
        active = false;
        setIsHovering(false);
        const out = onLeaveRef.current?.();
        end?.(out);
      },
      // Clicks in a marked frame's padding (a click on the svg itself already reaches its own onClick).
      frameClick: frameClick ? () => frameClickRef.current?.() : undefined,
    });
    const play = () =>
      new Promise<void>((resolve) => {
        entered = null;
        b.play();
        const started = entered as { result: unknown } | null;
        // Nothing played: a hover already showing, or a disabled frame.
        if (!started) {
          return resolve();
        }
        // Over once the hover-out lands, or (below) once the hover-in lands with a pointer or focus holding it.
        const done = (out?: unknown) => {
          end = null;
          Promise.resolve(out).then(
            () => resolve(),
            () => resolve()
          );
        };
        end = done;
        // The binding plays out when the hover-in lands (its reaction is registered first, so it runs first).
        const held = () => {
          if (end === done) {
            done();
          }
        };
        Promise.resolve(started.result).then(held, held);
      });
    playRef.current = play;
    plays.set(svg, play);
    return (swapped) => {
      b();
      if (playRef.current === play) {
        playRef.current = null;
      }
      if (plays.get(svg) === play) {
        plays.delete(svg);
      }
      // Unbound mid-play: the play is over.
      end?.();
      if (swapped && active) {
        setIsHovering(false);
        onLeaveRef.current?.();
      }
    };
  };

  // What's bound now, and to which svg. Rebound when the svg is replaced (a toggle's `asButton` swaps
  // `<svg>` for `<button><svg/></button>`) or `disabled` changes; checked after every commit, which costs a comparison.
  const bound = useRef<{
    svg: SVGSVGElement;
    disabled: boolean;
    unbind: (swapped: boolean) => void;
    unink: () => void;
  } | null>(null);
  useEffect(() => {
    const svg = ref.current;
    const off = !!disabled;
    const was = bound.current;
    if (was?.svg === svg && was.disabled === off) {
      return;
    }
    const swapped = !!was && was.svg !== svg;
    was?.unbind(swapped);
    if (was && swapped) {
      was.unink();
    }
    if (!svg) {
      bound.current = null;
      return;
    }
    bound.current = {
      svg,
      disabled: off,
      unbind: off ? () => {} : bind(svg),
      // Ink: strokes follow a consumer/Carbon `fill` on the svg (see utils/ink).
      // Independent of `disabled` — colour must follow even when hover is off.
      unink: was && !swapped ? was.unink : attachInk(svg),
    };
  });
  // The press: one scale on the drawing's ink group while the icon's control is held. Bound only while it animates
  // (bound and not disabled) and may press (`force`, or by default: its own control, or any frame, whose attribute
  // may turn "press" later), so an icon that never presses outside a frame (a hover icon in a plain button, or in
  // a menu item that isn't a frame) binds nothing. An icon in a frame that never presses (a rollover button, the
  // kit's menu rows) binds the press's two start listeners, which do nothing. Checked after every commit.
  const pressed = useRef<{ svg: SVGSVGElement; unpress: () => void } | null>(
    null
  );
  useEffect(() => {
    const b = bound.current;
    const p = pressRef.current;
    const svg =
      b && !b.disabled && p && mayPress(b.svg, p.force, !!p.own) ? b.svg : null;
    if (pressed.current?.svg === svg) {
      return;
    }
    pressed.current?.unpress();
    pressed.current = svg
      ? {
          svg,
          unpress: bindPress(svg, {
            force: () => pressRef.current?.force,
            own: () => !!pressRef.current?.own,
            animated: () => true,
            groups: () =>
              [...svg.children].filter((c) => c.hasAttribute('data-mc-ink')),
            size: () => Number(svg.getAttribute('width')) || 32,
          }),
        }
      : null;
  });
  useEffect(
    () => () => {
      bound.current?.unbind(false);
      bound.current?.unink();
      bound.current = null;
      pressed.current?.unpress();
      pressed.current = null;
    },
    []
  );

  const play = useCallback(() => playRef.current?.() ?? resolved(), []);

  return { ref, isHovering, frameClickRef, play };
}
