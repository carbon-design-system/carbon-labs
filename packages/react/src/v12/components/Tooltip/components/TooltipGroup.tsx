/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { SNAP_FRAME } from '@carbon-labs/v12-motion';
import {
  normalizeTooltipAlign,
  type TooltipAlign,
  type TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import {
  TooltipGroupContext,
  TooltipMotionContext,
  useTooltipSurface,
  useTooltipTrigger as useMotionTooltipTrigger,
  type TooltipGroupValue,
  type TooltipTriggerOptions,
} from '@carbon-labs/v12-motion';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tooltip.scss';
import { TOOLTIP_LEAVE_LABEL_MS } from './delays';

/* ============================================================================
 * TooltipGroup — triggers inside share ONE tooltip. Once it shows, moving to
 * a neighbor puts it there at once (stillness: no slide, no second snap)
 * with its text changing in place, and it blinks off when it goes; coming
 * back while the first one leaves turns it round where it is. Its
 * `autoAlign` flips only to the opposite side, never beside a trigger onto
 * its neighbor. (Every tooltip on the page shares one warm clock,
 * carbon-motion's `TOOLTIPS`; a group keeps one surface and one DOM node.)
 * The content switcher's icon tooltips, as a wrapper any row of controls can
 * use (the Toolbar's).
 *
 *   <TooltipGroup align="bottom">
 *     <IconButton label="Copy" frame="ghost"><Copy /></IconButton>
 *     <IconButton label="Share" frame="ghost"><Share /></IconButton>
 *   </TooltipGroup>
 *
 * Any `Tooltip` or `IconButton` inside joins; a custom trigger joins through
 * `useTooltipTrigger` (it reads the group from context). The group's `align`,
 * `autoAlign` and delays apply unless a trigger sets its own `align`. It
 * renders no element of its own: the shared tooltip is a sibling after the
 * children (fixed, out of flow), so it takes the children's `<Theme>` scope.
 * ========================================================================== */

export interface TooltipGroupProps {
  children?: ReactNode;
  /** Default `top`. */
  align?: TooltipAlign | TooltipAlignDeprecated;
  autoAlign?: boolean;
  /** The first tooltip's delay. Default 100 (v11's IconButton). Moving on is at once. */
  enterDelayMs?: number;
  /** Default 120 (`fast-02`, a label's leave delay). */
  leaveDelayMs?: number;
  /** A class on the shared tooltip. */
  tooltipClassName?: string;
  /** The outlined surface (a 1px hairline, the inverse fill mixed 12% toward its text). Default: the enclosing `TooltipMotion`'s, else none. */
  outline?: boolean;
}

export function TooltipGroup({
  children,
  align,
  autoAlign = false,
  enterDelayMs = 100,
  leaveDelayMs = TOOLTIP_LEAVE_LABEL_MS,
  tooltipClassName,
  outline,
}: TooltipGroupProps) {
  const motion = useContext(TooltipMotionContext);
  const outlined = outline ?? motion.outline ?? false;
  const tipRef = useRef<HTMLSpanElement>(null);
  const { surface, openKey } = useTooltipSurface(tipRef, {
    enterMs: enterDelayMs,
    leaveMs: leaveDelayMs,
  });
  const id = useId().replace(/:/g, '');
  const a = normalizeTooltipAlign(align);
  // `openKey` (which trigger the shared tooltip is open for) changes on every
  // show, hide and move between neighbours; in the context value it rendered
  // every trigger in the group each time (audit OV-6). It's behind a
  // subscription instead (`openStore`), so the value holds while the tooltip
  // moves; the value's `openKey` is a getter on it, and the kit's
  // `useTooltipTrigger` subscribes for its `open` (the two triggers whose
  // `open` changed render, not the group). The fix that belongs in
  // carbon-motion: `openKey` out of `TooltipGroupValue`, behind this kind of
  // subscription.
  const [openStore] = useState(createOpenStore);
  useLayoutEffect(() => openStore.set(openKey), [openStore, openKey]);
  const value = useMemo<TooltipGroupValue>(
    () => ({
      id,
      surface,
      get openKey() {
        return openStore.get();
      },
      align: a,
      autoAlign,
    }),
    [id, surface, a, autoAlign, openStore]
  );

  return (
    <TooltipGroupOpenContext.Provider value={openStore}>
      <TooltipGroupContext.Provider value={value}>
        {children}
        <span
          ref={tipRef}
          className={[
            'sel__tip',
            'sel__tip--fixed',
            'sel__tip--hoverable',
            outlined && 'sel__tip--outline',
            tooltipClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          hidden
          aria-hidden="true"
          onPointerEnter={(e) => surface.hold({ x: e.clientX, y: e.clientY })}
          onPointerLeave={(e) =>
            surface.hide(false, { x: e.clientX, y: e.clientY })
          }>
          <span className="sel__tip-frame" {...SNAP_FRAME} />
          <span className="sel__tip-text" />
        </span>
      </TooltipGroupContext.Provider>
    </TooltipGroupOpenContext.Provider>
  );
}
TooltipGroup.displayName = 'TooltipGroup';

/* ── which trigger the group's tooltip is open for, by subscription ────── */

interface OpenStore {
  get: () => string | null;
  set: (key: string | null) => void;
  subscribe: (listener: () => void) => () => void;
}

function createOpenStore(): OpenStore {
  let key: string | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => key,
    set: (next) => {
      if (next === key) return;
      key = next;
      for (const l of [...listeners]) l();
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const TooltipGroupOpenContext = createContext<OpenStore | null>(null);
const noSubscribe = () => () => {};

/**
 * carbon-motion's `useTooltipTrigger`, with `open` kept right inside a kit
 * TooltipGroup: the group's open trigger is behind a subscription (audit
 * OV-6), so this subscribes to whether it's this trigger, and only a trigger
 * whose `open` changed renders. Outside a group, or with `group: false`, it's
 * carbon-motion's as is. The kit's own triggers don't read `open` in a group
 * and call carbon-motion's directly.
 */
export function useTooltipTrigger(
  o: TooltipTriggerOptions
): ReturnType<typeof useMotionTooltipTrigger> {
  const t = useMotionTooltipTrigger(o);
  const store = useContext(TooltipGroupOpenContext);
  const s = o.group === false ? null : store;
  const open = useSyncExternalStore(
    s ? s.subscribe : noSubscribe,
    () => (s ? s.get() === t.id : t.open),
    () => (s ? s.get() === t.id : t.open)
  );
  return s ? { ...t, open } : t;
}
