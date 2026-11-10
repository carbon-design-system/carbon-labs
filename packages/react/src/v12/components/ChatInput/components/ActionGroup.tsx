/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import cx from 'classnames';
import { Popover, PopoverContent, usePrefix } from '@carbon/react';

// Carbon's Tooltip timing: it opens after 100ms and stays 300ms after the
// pointer leaves, so it can be hovered (WCAG 1.4.13).
const enterDelayMs = 100;
const leaveDelayMs = 300;

interface Tip {
  label: string;
  start: number;
  size: number;
}

export interface ActionGroupProps {
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * A row of icon-only MegaButtons that share one tooltip. Each Carbon Tooltip
 * stays 300ms after the pointer leaves, so neighbours 36px apart always showed
 * two at once. Here one tooltip slides to the button under the pointer or the
 * keyboard and changes its label; only the first waits the enter delay. It is
 * Carbon's Popover with Carbon's tooltip classes, inside the group, so moving
 * onto it keeps it open. The buttons are named by `aria-label` (MegaButton's
 * `hideTooltip`), so the tooltip is hidden from assistive technology rather
 * than read twice.
 */
export function ActionGroup({ label, className, children }: ActionGroupProps) {
  const prefix = usePrefix();
  const block = `${prefix}--chat-input`;
  const groupRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLSpanElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [tip, setTip] = useState<Tip | null>(null);
  const [open, setOpen] = useState(false);
  const [sliding, setSliding] = useState(false);
  // A pressed button opens a menu or acts; its tooltip stays away until the
  // pointer reaches another button.
  const pressed = useRef<HTMLButtonElement | null>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Position written to the element: labs lint forbids a style prop.
  useLayoutEffect(() => {
    if (tipRef.current && tip) {
      tipRef.current.style.insetInlineStart = `${tip.start}px`;
      tipRef.current.style.inlineSize = `${tip.size}px`;
    }
  }, [tip]);

  function tipFor(button: HTMLButtonElement): Tip | null {
    const name = button.getAttribute('aria-label');
    return name
      ? { label: name, start: button.offsetLeft, size: button.offsetWidth }
      : null;
  }

  function show(button: HTMLButtonElement, immediately: boolean) {
    clearTimeout(timer.current);
    const next = tipFor(button);
    if (!next) {
      return;
    }
    if (open || immediately) {
      // Already showing: slide to the new button, no delay.
      setSliding(open);
      setTip(next);
      setOpen(true);
      return;
    }
    timer.current = setTimeout(() => {
      setSliding(false);
      setTip(next);
      setOpen(true);
    }, enterDelayMs);
  }

  function hide(delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), delay);
  }

  function buttonFrom(target: EventTarget): HTMLButtonElement | null {
    const button = (target as Element).closest?.('button');
    return button && groupRef.current?.contains(button) ? button : null;
  }

  return (
    // The listeners are delegated: they act for the buttons inside, which
    // stay the only interactive elements.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={groupRef}
      role="group"
      aria-label={label}
      className={cx(`${block}__actions`, className)}
      onPointerOver={(event: PointerEvent<HTMLDivElement>) => {
        const button = buttonFrom(event.target);
        if (!button) {
          // Over the tooltip or a gap: keep what is showing.
          clearTimeout(timer.current);
          return;
        }
        if (button === pressed.current) {
          return;
        }
        pressed.current = null;
        show(button, false);
      }}
      onPointerLeave={() => {
        pressed.current = null;
        hide(leaveDelayMs);
      }}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        pressed.current = buttonFrom(event.target);
        if (pressed.current) {
          clearTimeout(timer.current);
          setOpen(false);
        }
      }}
      onFocus={(event: FocusEvent<HTMLDivElement>) => {
        const button = buttonFrom(event.target);
        if (button?.matches(':focus-visible')) {
          show(button, true);
        }
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          hide(0);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        // A tooltip can always be dismissed without moving (WCAG 1.4.13).
        if (event.key === 'Escape' && open) {
          clearTimeout(timer.current);
          setOpen(false);
        }
      }}>
      {children}
      <Popover
        ref={tipRef}
        open={open && tip !== null}
        align="top"
        highContrast
        dropShadow={false}
        className={cx(`${prefix}--tooltip`, `${block}__tip`, {
          [`${block}__tip--sliding`]: sliding,
        })}>
        {/* What Carbon's floating positioning (v12) anchors to; without a
            child it has no reference and pins the content at 0,0. */}
        <span className={`${block}__tip-anchor`} />
        <PopoverContent
          aria-hidden="true"
          className={`${prefix}--tooltip-content`}>
          {tip?.label}
        </PopoverContent>
      </Popover>
    </div>
  );
}
