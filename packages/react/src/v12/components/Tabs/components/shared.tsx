/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { distanceTokens } from '@carbon-labs/v12-motion';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  SelectionPanels,
  isComponentType,
  sameNode,
  sameProps,
  useLatest,
  type SelectionMotion,
  type SelectionStyleProps,
} from '@carbon-labs/react-selection-kit';
import { useWithTimeScale } from '@carbon-labs/react-props';
import { assignRef, elementRef } from '@carbon-labs/react-util';
import { Scroller } from '@carbon-labs/react-scroller';

/* ============================================================================
 * What horizontal tabs (`Tabs`) and vertical tabs (`TabsVertical`) share:
 * the root's state, the context, the data-only `Tab` / `IconTab` /
 * `TabPanel`, and `TabPanels` — the content swap along the list's axis.
 * Each list (TabList, TabListVertical) is its own component.
 * ========================================================================== */

/** The tabs' motion dials — the selection kit's. */
export type TabsMotion = SelectionMotion;
/** The content switcher's timing (40 / 80 / 120 / 160ms), as every selection component. */
export const TABS_MOTION: TabsMotion = SELECTION_KIT_MOTION;

/** Row or control heights: v11's layout sizes, sm 32 / md 40 / lg 48 / xl 64px. */
export type TabsSize = 'sm' | 'md' | 'lg' | 'xl';

export interface TabsContextValue {
  baseId: string;
  selected: number;
  /** Select a tab: state, then `onChange`. The list moves the selector itself. */
  select: (index: number) => void;
  style: Omit<SelectionStyleProps, 'size'> & {
    size?: TabsSize;
    holdWidth: boolean;
    frame?: 'inset' | 'ghost' | 'line';
  };
  motion: TabsMotion;
  onMove?: (info: SelectionMoveInfo) => void;
  /** The list's axis: panels swap along it. */
  axis: 'x' | 'y';
  /** Vertical tabs with `height`: the panels scroll inside it. */
  fixed: boolean;
  /** Vertical tabs: the list reports its tabs loading (the root is `aria-busy`). */
  setBusy: (busy: boolean) => void;
  /** Horizontal tabs: every tab has a close control. */
  dismissable: boolean;
  onTabCloseRequest?: (index: number) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(who: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${who} must be inside Tabs or TabsVertical`);
  return ctx;
}

export const tabId = (base: string, i: number) => `${base}-tab-${i}`;
export const panelId = (base: string, i: number) => `${base}-tabpanel-${i}`;

/** The props both roots share: v11's state, and the kit's look and motion. */
export interface TabsRootProps extends Omit<SelectionStyleProps, 'size'> {
  /** The tab selected on first render. Default 0. */
  defaultSelectedIndex?: number;
  /** The selected tab. Follows changes to the prop (as the content switcher does). */
  selectedIndex?: number;
  onChange?: (state: { selectedIndex: number }) => void;
  /** The size, for every list inside (a list's own `size` wins). */
  size?: TabsSize;
  /** Motion dials; omitted keys take `TABS_MOTION`. */
  motion?: Partial<TabsMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called as each glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
}

/** A root's state and context value. */
export function useTabsRoot(
  p: TabsRootProps & {
    prefix: string;
    axis: 'x' | 'y';
    fixed?: boolean;
    dismissable?: boolean;
    onTabCloseRequest?: (index: number) => void;
    /** Vertical tabs' `frame`: `inset` (the track), `ghost` (none) or `line` (the rule). */
    frame?: 'inset' | 'ghost' | 'line';
  }
): { ctx: TabsContextValue; busy: boolean } {
  const {
    selectedIndex: prop,
    defaultSelectedIndex = 0,
    onChange,
    motion: motionProp,
    timeScale,
    holdWidth = true,
  } = p;
  const motion = useWithTimeScale(motionProp, timeScale);
  const [selected, setSelected] = useState(prop ?? defaultSelectedIndex);
  // A changed prop is taken in the same render, not an effect later: an app
  // that closes a tab and moves the selection in one update must not show a
  // render with the new tabs and the old index (the selector would visit the
  // tab that now has that index first).
  const [prevProp, setPrevProp] = useState(prop);
  if (prop !== prevProp) {
    setPrevProp(prop);
    if (prop != null) setSelected(prop);
  }

  const selectedRef = useLatest(selected);
  const onChangeRef = useLatest(onChange);
  const select = useCallback(
    (index: number) => {
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      setSelected(index);
      onChangeRef.current?.({ selectedIndex: index });
    },
    [selectedRef, onChangeRef]
  );

  const baseId = `${p.prefix}-${useId().replace(/:/g, '')}`;
  const [busy, setBusy] = useState(false);
  const m = useMemo<TabsMotion>(
    () => ({ ...TABS_MOTION, ...motion }),
    [motion]
  );
  const {
    variant,
    lowContrast,
    size,
    corners,
    interaction,
    contour,
    outlinedFill,
    selectorGlow,
    selectedWeight,
    frame,
    outline,
  } = p;
  const {
    onMove,
    axis,
    fixed = false,
    dismissable = false,
    onTabCloseRequest,
  } = p;
  const ctx = useMemo<TabsContextValue>(
    () => ({
      baseId,
      selected,
      select,
      style: {
        variant,
        lowContrast,
        size,
        corners,
        interaction,
        contour,
        outlinedFill,
        selectedWeight,
        holdWidth,
        selectorGlow,
        frame,
        outline,
      },
      motion: m,
      onMove,
      axis,
      fixed,
      setBusy,
      dismissable,
      onTabCloseRequest,
    }),
    // prettier-ignore
    [baseId, selected, select, variant, lowContrast, size, corners, interaction, contour, outlinedFill, selectedWeight, holdWidth, selectorGlow, frame, outline, m, onMove, axis, fixed, dismissable, onTabCloseRequest]
  );
  return { ctx, busy };
}

/* ── Tab, IconTab ──────────────────────────────────────────────────────── */

export interface TabProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** The label. */
  children?: ReactNode;
  disabled?: boolean;
  /**
   * An icon before the label (a component, such as a motion icon): 16px, 20
   * at lg; it plays on the tab's hover. v11 draws it after the label.
   */
  renderIcon?: ElementType;
  /** A second line under the label. A list with any second line has two-line tabs. */
  secondaryLabel?: string;
}

/** A tab. Read by its list, which renders it: its ref is the tab's button. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  function Tab(_props, _ref): null {
    return null;
  }
);
Tab.displayName = 'Tab';

export interface IconTabProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** The tooltip, and the tab's accessible name. */
  label: ReactNode;
  /** The icon (v11). A motion icon plays on the tab's hover. */
  children?: ReactNode;
  /** The icon as a component, instead of `children`. */
  renderIcon?: ElementType;
  disabled?: boolean;
  /**
   * A dot on the icon: something new behind this tab. Say so in `label` too.
   * On a motion icon that takes a notification status (Chat, Notification,
   * Email, User, …) it's the icon's own pip (`status="notification"`, toned
   * red), the icon cut away round it; on any other icon, the kit's dot with
   * the same cut round it (`.tabs__badge`).
   */
  badgeIndicator?: boolean;
  /** v11: accepted. The tooltip keeps the kit's delays. */
  defaultOpen?: boolean;
  enterDelayMs?: number;
  leaveDelayMs?: number;
}

/** An icon-only tab with a tooltip (horizontal tabs). Read by `TabList`, which renders it: its ref is the tab's button. */
export const IconTab = forwardRef<HTMLButtonElement, IconTabProps>(
  function IconTab(_props, _ref): null {
    return null;
  }
);
IconTab.displayName = 'IconTab';

/** A motion icon that takes a notification status (motion-icons' status layer: Chat, Notification, …). */
function takesNotification(type: unknown): boolean {
  const status = (type as { status?: { statuses?: readonly string[] } } | null)
    ?.status;
  return !!status?.statuses?.includes('notification');
}

/**
 * The icon's own notification pip: motion-icons' status layer, the pip toned
 * red in its corner, the icon cut away round it (geometry, on any surface).
 */
const NOTIFICATION = { status: 'notification', tone: 'error' } as const;

export interface TabItem {
  kind: 'text' | 'icon';
  key: string;
  /** The label (text tabs) or the icon (icon tabs). */
  content: ReactNode;
  /** The label as text: the truncation tooltip, an icon tab's tooltip and name. */
  text: string;
  secondary?: string;
  Icon?: ElementType;
  /** The kit's dot on the icon (`badgeIndicator` on an icon without its own pip). */
  badge: boolean;
  disabled: boolean;
  props: Omit<HTMLAttributes<HTMLButtonElement>, 'children'>;
  /** The `Tab`'s or `IconTab`'s own ref: the button the list renders for it. */
  ref?: Ref<HTMLButtonElement>;
}

export function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return '';
}

/** A list's `Tab` and `IconTab` children, as data. */
export function readTabs(children: ReactNode): TabItem[] {
  const out: TabItem[] = [];
  Children.toArray(children).forEach((child, i) => {
    if (!isValidElement(child)) return;
    const key = String(child.key ?? i);
    if (isComponentType(child.type, IconTab)) {
      const {
        label,
        children: icon,
        renderIcon: R,
        disabled,
        badgeIndicator,
        defaultOpen: _o,
        enterDelayMs: _e,
        leaveDelayMs: _l,
        ...props
      } = child.props as IconTabProps;
      // `badgeIndicator` on a motion icon that takes a notification status is
      // that icon's pip; on any other icon, the kit's dot (`badge`).
      const own =
        !!badgeIndicator &&
        (R
          ? takesNotification(R)
          : isValidElement(icon) && takesNotification(icon.type));
      const content = R ? (
        <R aria-hidden="true" {...(own && NOTIFICATION)} />
      ) : own && isValidElement(icon) ? (
        cloneElement(
          icon as ReactElement<Record<string, unknown>>,
          NOTIFICATION
        )
      ) : (
        icon
      );
      out.push({
        kind: 'icon',
        key,
        content,
        text: textOf(label),
        badge: !!badgeIndicator && !own,
        disabled: !!disabled,
        props,
        ref: elementRef<HTMLButtonElement>(child),
      });
    } else if (isComponentType(child.type, Tab)) {
      const {
        children: label,
        disabled,
        renderIcon,
        secondaryLabel,
        ...props
      } = child.props as TabProps;
      out.push({
        kind: 'text',
        key,
        content: label,
        text: textOf(label),
        secondary: secondaryLabel,
        Icon: renderIcon,
        badge: false,
        disabled: !!disabled,
        props,
        ref: elementRef<HTMLButtonElement>(child),
      });
    }
  });
  return out;
}

/** A tab's labels: the label, and its second line. */
export function TabLabels({ item }: { item: TabItem }) {
  return (
    <span className="tabs__labels">
      <span className="sel__text">{item.content}</span>
      {item.secondary && (
        <span className="tabs__secondary sel__quiet">{item.secondary}</span>
      )}
    </span>
  );
}

/** Two reads of a tab that would draw the same: its face by `sameNode`, its pass-through props by `sameProps`. */
export const sameTab = (a: TabItem, b: TabItem) =>
  a === b ||
  (a.kind === b.kind &&
    a.key === b.key &&
    a.text === b.text &&
    a.secondary === b.secondary &&
    a.Icon === b.Icon &&
    a.badge === b.badge &&
    a.disabled === b.disabled &&
    a.ref === b.ref &&
    sameNode(a.content, b.content) &&
    sameProps(a.props, b.props));

/** The tab's full text when its label or second line is cut short, else null. */
export function truncatedText(
  btn: HTMLElement | null | undefined,
  item: TabItem | undefined
): string | null {
  if (!btn || !item || item.kind !== 'text') return null;
  const cut = (sel: string) => {
    const el = btn.querySelector<HTMLElement>(
      `.sel__face:not(.sel__face--on) ${sel}`
    );
    return !!el && el.scrollWidth > el.clientWidth + 0.5;
  };
  if (cut('.sel__text')) return item.text;
  if (item.secondary && cut('.tabs__secondary')) return item.secondary;
  return null;
}

/* ── TabPanels / TabPanel ──────────────────────────────────────────────── */

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** A panel. Read by `TabPanels`, which renders it: its ref is the panel. */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel(_props, _ref): null {
    return null;
  }
);
TabPanel.displayName = 'TabPanel';

export interface TabPanelsProps {
  /** `TabPanel` elements, one per tab. */
  children?: ReactNode;
  /** The panel container — the surface that resizes, so give it the background. */
  className?: string;
  /** `content` (default) resizes to each panel; `largest` holds the largest panel's size. */
  fit?: 'content' | 'largest';
}

/**
 * The panels: the kit's content swap — out, then in — along the list's axis,
 * in a container that resizes as a window. The content travels with the
 * selector (a tab to the right: the content moves right; down the vertical
 * list: down), 8px (`sm`), half the content switcher's 16.
 */
export function TabPanels({
  children,
  className,
  fit = 'content',
}: TabPanelsProps) {
  const { baseId, selected, motion: m, fixed, axis } = useTabs('TabPanels');
  const panels = Children.toArray(children).filter(
    (c) => isValidElement(c) && isComponentType(c.type, TabPanel)
  ) as ReactElement<TabPanelProps>[];
  // Each `TabPanel`'s ref, on the panel rendered for it (the selection kit
  // draws the panels; they are found here by their ids), after every render.
  const attached = useRef(new Map<Ref<HTMLDivElement>, HTMLElement | null>());
  useLayoutEffect(() => {
    const next = new Map<Ref<HTMLDivElement>, HTMLElement | null>();
    panels.forEach((p, i) => {
      const ref = elementRef<HTMLDivElement>(p);
      if (ref) next.set(ref, document.getElementById(panelId(baseId, i)));
    });
    for (const ref of attached.current.keys())
      if (!next.has(ref)) assignRef(ref, null);
    for (const [ref, el] of next)
      if (attached.current.get(ref) !== el)
        assignRef(ref, el as HTMLDivElement | null);
    attached.current = next;
  });
  useEffect(
    () => () => {
      for (const ref of attached.current.keys()) assignRef(ref, null);
    },
    []
  );
  return (
    <SelectionPanels
      selectedIndex={selected}
      axis={axis}
      travel="with"
      distance={distanceTokens.sm}
      fit={fixed ? 'content' : fit}
      timeScale={m.timeScale}
      className={['tabs__panels', className].filter(Boolean).join(' ')}
      panelProps={(i) => {
        const { children: _c, className: pc, ...rest } = panels[i]?.props ?? {};
        return {
          ...rest,
          id: panelId(baseId, i),
          'aria-labelledby': tabId(baseId, i),
          // A panel is a tab stop of its own, so its content is reachable even
          // when it has nothing focusable (WAI-ARIA tabs; v11 leaves it out).
          // With a fixed height the stop is its Scroller's viewport, the
          // element that scrolls (so the keys scroll it).
          tabIndex: fixed ? undefined : i === selected ? 0 : -1,
          className: ['tabs__panel', pc].filter(Boolean).join(' '),
        };
      }}>
      {panels.map((p, i) => (
        <Fragment key={p.key ?? i}>
          {fixed ? (
            // A fixed height (vertical tabs' `height`): each panel scrolls in the kit's Scroller.
            <Scroller
              className="tabs__panel-scroller"
              viewportProps={{ tabIndex: i === selected ? 0 : -1 }}
              timeScale={m.timeScale}>
              {p.props.children}
            </Scroller>
          ) : (
            p.props.children
          )}
        </Fragment>
      ))}
    </SelectionPanels>
  );
}
TabPanels.displayName = 'TabPanels';
