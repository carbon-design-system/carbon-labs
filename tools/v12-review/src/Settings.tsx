/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The app's settings, one way wherever they open: an icon button that opens
// the kit's anchored Popover (its floating surface, grown from the button on
// its snap and folded back into it; focus in, Escape back to the button), and
// in it a panel with a head (its title, what it applies to, its actions) over
// a scrolling body. The header's picks open from its gear and close on a
// press outside. A component page's story settings open from a button
// floating at the window's end corner and stay open on a press outside, so
// the story can be tried while they change it: Escape, the button or Close
// closes them, and a press may take focus out to the story. Either way, Tab
// past the last control or Shift+Tab from the first closes them, focus back
// on their button, as Escape does.
// The floating button is the app's (`FloatingSettings`, beside the page
// swap), so it holds still while one page with settings goes out and the
// next comes in; it snaps in when a page with settings arrives and out when
// none is left (at home, or a page without them), on the floating surfaces'
// snap, and it and its panel cast the floating surfaces' shadow.

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Popover } from '@carbon-labs/react-popover';
import type { PopoverAlignment } from '@carbon-labs/react-popover';
import { IconButton } from '@carbon-labs/react-tooltip';
import type { IconButtonProps } from '@carbon-labs/react-tooltip';
import { Scroller } from '@carbon-labs/react-scroller';
import { Close, SettingsAdjust } from '@carbon-labs/react-motion-icons';
import {
  attachFloatingCastShadow,
  snapFloating,
  usePrefersReducedMotion,
  useSnapSurface,
} from '@carbon-labs/v12-motion';
import { PageLeavingContext } from './PageSwap';

/** What a page's floating settings ask of the app's button. */
interface FloatingRequest {
  label: string;
  tooltipAlign: IconButtonProps['align'];
  icon: ReactNode;
  open: boolean;
  /** Its page is going out: the button is out of reach. */
  leaving: boolean;
  toggle: () => void;
}

/** A page whose settings aren't known yet: the button stays as it is, out of reach. */
const HOLD = 'hold';

type FloatingAsk = FloatingRequest | typeof HOLD;

/** The app's floating button, for the settings of the page shown. */
interface FloatingHost {
  /** The button, for the panel to open from. */
  button: HTMLElement | null;
  show: (id: symbol, ask: FloatingAsk) => void;
  hide: (id: symbol) => void;
}

const FloatingHostContext = createContext<FloatingHost | null>(null);

/** The sliders: the settings button's icon unless one is given. */
const SLIDERS = <SettingsAdjust size={20} aria-hidden="true" />;

export interface SettingsProps {
  /** The button's tooltip and name, and the panel's. */
  label: string;
  /** The panel's title. */
  title: string;
  /** What the settings apply to, after the title. */
  detail?: ReactNode;
  /** The head's actions (a Reset). */
  actions?: ReactNode;
  /** Where the panel opens from the button. */
  align: PopoverAlignment;
  /** Where the button's tooltip goes. */
  tooltipAlign: IconButtonProps['align'];
  /** The button's motion icon, 20px. Default the sliders (SettingsAdjust). */
  icon?: ReactNode;
  /**
   * `floating`: the button stands on the floating surface at the window's end
   * corner, and the panel stays open on a press outside, with a Close in its
   * head.
   */
  floating?: boolean;
  className?: string;
  children: ReactNode;
}

export function Settings({
  label,
  title,
  detail,
  actions,
  align,
  tooltipAlign,
  icon = SLIDERS,
  floating = false,
  className,
  children,
}: SettingsProps) {
  const [asked, setOpen] = useState(false);
  const [own, setOwn] = useState<HTMLElement | null>(null);
  // A page going out takes its settings with it: closed, and the button out of reach.
  const leaving = useContext(PageLeavingContext);
  const open = asked && !leaving;
  // Escape inside the panel, seen before the Popover asks to close.
  const escape = useRef(false);
  // Floating, the button is the app's; this asks for it while mounted.
  const fab = useContext(FloatingHostContext);
  const hosted = floating && !!fab;
  const button = hosted ? fab.button : own;
  const [id] = useState(() => Symbol('settings'));
  const toggle = useCallback(() => setOpen((was) => !was), []);
  useLayoutEffect(() => {
    if (hosted) {
      fab.show(id, { label, tooltipAlign, icon, open, leaving, toggle });
    }
  }, [hosted, fab, id, label, tooltipAlign, icon, open, leaving, toggle]);
  useLayoutEffect(() => {
    if (hosted) {
      return () => fab.hide(id);
    }
  }, [hosted, fab, id]);
  return (
    <>
      {hosted ? null : (
        <IconButton
          ref={setOwn}
          frame="ghost"
          size="lg"
          corners="full"
          align={tooltipAlign}
          label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}>
          {icon}
        </IconButton>
      )}
      <Popover
        open={open}
        anchor={button}
        label={label}
        align={align}
        // Floating, the panel casts the button's shadow: drawn by its snap while open, gone with it.
        shadow={floating ? 'floating' : undefined}
        onRequestClose={() => {
          // Floating, only Escape closes it here (not a press outside, nor focus
          // leaving); its button and Close close it themselves.
          if (!floating || escape.current) {
            setOpen(false);
          }
        }}>
        {/* Not a control: it notes an Escape its controls let through, before the Popover closes. */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={['v12r-settings', className].filter(Boolean).join(' ')}
          onKeyDown={(e) => {
            // A control inside that handled the key (a select's list) keeps it, as the Popover does.
            if (e.key === 'Escape' && !e.defaultPrevented) {
              escape.current = true;
              queueMicrotask(() => {
                escape.current = false;
              });
            }
            // Tab past the last control, or Shift+Tab from the first, closes it, focus back on the button.
            if (
              e.key === 'Tab' &&
              !e.defaultPrevented &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey &&
              tabsOut(e.currentTarget, e.target, e.shiftKey)
            ) {
              e.preventDefault();
              setOpen(false);
              button?.focus({ preventScroll: true });
            }
          }}>
          <div className="v12r-settings__head">
            <span className="v12r-settings__title">{title}</span>
            {detail ? (
              <span className="v12r-settings__detail">{detail}</span>
            ) : null}
            {actions}
            {floating ? (
              <IconButton
                className="v12r-settings__close"
                frame="ghost"
                size="md"
                corners="full"
                align="left"
                label="Close"
                onClick={() => {
                  setOpen(false);
                  button?.focus({ preventScroll: true });
                }}>
                <Close size={16} aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
          <Scroller
            className="v12r-settings__scroll"
            viewportClassName="v12r-settings__body"
            viewportProps={{ role: 'group', 'aria-label': title }}>
            {children}
          </Scroller>
        </div>
      </Popover>
    </>
  );
}

/** What Tab stops on: a control in the tab order, drawn and not disabled. */
const TABBABLE =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

function tabStops(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      // A customizable select's own button is the select's, not a stop of its own.
      !el.parentElement?.closest('select') &&
      !el.closest('[inert]') &&
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== 'hidden'
  );
}

/**
 * Whether Tab (`back`: Shift+Tab) from `from` leaves the panel: no stop after
 * it (before it). Not for a key from what the panel opened elsewhere (a
 * select's list), which keeps it.
 */
function tabsOut(
  panel: HTMLElement,
  from: EventTarget,
  back: boolean
): boolean {
  if (!(from instanceof HTMLElement) || !panel.contains(from)) {
    return false;
  }
  const side = back
    ? Node.DOCUMENT_POSITION_PRECEDING
    : Node.DOCUMENT_POSITION_FOLLOWING;
  return !tabStops(panel).some(
    (stop) => stop !== from && !!(from.compareDocumentPosition(stop) & side)
  );
}

/**
 * The app's floating settings button, beside the page swap (`children`), in
 * the workspace's theme. A page's floating `Settings` ask for it while
 * mounted; a page going out keeps it, out of reach, and the next page's
 * settings take it over in the same commit, so it holds still. With no page
 * asking it snaps out, and in again when one does.
 */
export function FloatingSettings({
  theme,
  children,
}: {
  /** The workspace's theme: the shadow is solved again when it changes. */
  theme: string;
  children: ReactNode;
}) {
  const [held, setHeld] = useState<{ id: symbol; ask: FloatingAsk } | null>(
    null
  );
  const [button, setButton] = useState<HTMLElement | null>(null);
  const host = useMemo<FloatingHost>(
    () => ({
      button,
      show: (id, ask) => setHeld({ id, ask }),
      hide: (id) => setHeld((h) => (h?.id === id ? null : h)),
    }),
    [button]
  );
  return (
    <FloatingHostContext.Provider value={host}>
      {children}
      <FloatingButton
        ask={held?.ask ?? null}
        theme={theme}
        buttonRef={setButton}
      />
    </FloatingHostContext.Provider>
  );
}

/**
 * While a page's settings aren't known yet (its stories loading), the
 * floating button stays as it is, out of reach: one that was in doesn't snap
 * out and in again on the way to the next page with settings.
 */
export function FloatingSettingsHold() {
  const fab = useContext(FloatingHostContext);
  const [id] = useState(() => Symbol('hold'));
  useLayoutEffect(() => {
    if (!fab) {
      return;
    }
    fab.show(id, HOLD);
    return () => fab.hide(id);
  }, [fab, id]);
  return null;
}

/**
 * The button on its surface: the quiet fill and hairline on a frame under
 * it, and under that the floating surfaces' cast shadow (the kit's
 * `attachFloatingCastShadow`, drawn in place), solved against what it floats
 * over, again when the theme changes. It snaps in and out on the floating
 * surfaces' snap (`snapFloating`, from its center: the whole button, shadow
 * and all); reduced motion, there and gone at once. Drawn as last asked while
 * it leaves or is held, then hidden.
 */
function FloatingButton({
  ask,
  theme,
  buttonRef,
}: {
  ask: FloatingAsk | null;
  theme: string;
  buttonRef: (el: HTMLElement | null) => void;
}) {
  const request = ask && ask !== HOLD ? ask : null;
  const [kept, setKept] = useState(request);
  if (request && request !== kept) {
    setKept(request);
  }
  // In while a page has settings; held, as it was.
  const [wanted, setWanted] = useState(false);
  const next = request ? true : ask === HOLD ? wanted : false;
  if (next !== wanted) {
    setWanted(next);
  }
  const shown = request ?? kept;
  const here = !!shown;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!usePrefersReducedMotion();
  const surface = useSnapSurface(ref, { profile: snapFloating, reduced });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const shadow = attachFloatingCastShadow(el, { inline: true });
    // A new theme reaches the page round it after the shell's own commit: solved again a frame on.
    const frame = requestAnimationFrame(() => shadow.follow(true));
    return () => {
      cancelAnimationFrame(frame);
      shadow.detach();
    };
  }, [here, theme]);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    if (next) {
      surface.open();
    } else {
      surface.close();
    }
  }, [here, next, surface]);

  // Out of reach while it leaves or is held, and while its page goes out.
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.inert = !request || request.leaving;
    }
  }, [request]);

  if (!shown) {
    return null;
  }
  return (
    <div ref={ref} className="v12r-fab">
      <span className="v12r-fab__frame" />
      <IconButton
        ref={buttonRef}
        frame="ghost"
        size="lg"
        corners="full"
        align={shown.tooltipAlign}
        label={shown.label}
        aria-haspopup="dialog"
        aria-expanded={!!request?.open}
        onClick={() => request?.toggle()}>
        {shown.icon}
      </IconButton>
    </div>
  );
}
