/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  SNAP_FRAME,
  attachFloatingCastShadow,
  snapAnimations,
  toEasing,
  snapProfileFor,
  useSnapSurface,
  type CastElevation,
  type SelectionMoveInfo,
  originCause,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  Checkmark,
  ChevronRight,
  RadioButtonChecked,
} from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  createTypeahead,
  resolveSelectionStyle,
  rovingKey,
  useLatest,
  useSelectionEngine,
  type SelectionMotion,
  type SelectionSize,
  type SelectionStyleProps,
  useSelectionLoading,
  skeletonRowProps,
  rowStructureProps,
  SelectionSkeletonFace,
  SelectionSkeletonText,
  SelectionTakenFace,
  type SelectionLoadingProps,
} from '@carbon-labs/react-selection-kit';
import {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from '@carbon-labs/react-popover';
import { SNAP_EXIT_FADE_ATTR } from '@carbon-labs/v12-motion';
import { structureTiming } from '@carbon-labs/react-feedback';
import {
  EDGE,
  anchorInset,
  placeAtPoint,
  placeBesideRow,
  placeOnAnchor,
  range,
  themeOf,
  type Placement,
  type Range,
  type SurfaceAlignment,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import { iconSizeFor, useWithTimeScale } from '@carbon-labs/react-props';
import { useDisabledReason } from '@carbon-labs/react-tooltip';

/** Rows the keyboard skips: disabled, unless they say why. */
const skipped = (row: { disabled: boolean; reason?: string } | undefined) =>
  !!row?.disabled && !row.reason;
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { applyDrawnScale, cssPx, drawnScale } from './drawn-scale';
import './menu.scss';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * Menu — Carbon v11's Menu (and its MenuButton / OverflowMenu triggers) on the
 * selection family's look and motion.
 * ============================================================================
 *
 * The same API as `@carbon/react`'s Menu / MenuItem / MenuItemDivider /
 * MenuItemGroup / MenuItemRadioGroup / MenuItemSelectable: `open`, `onClose`,
 * `label`, `size`, `x` / `y` (a point or a [start, end] range), `target`,
 * `menuAlignment`, roles `menu` / `menuitem` / `menuitemcheckbox` /
 * `menuitemradio`, submenus as a MenuItem's children.
 *
 * The kit adds:
 *
 *   surface     the snap's container model (`SNAP.menu`): the frame grows
 *               from 80% about the cause — the pointer that opened it, or the
 *               trigger's center from the keyboard — and the content slides (on y only, the standard)
 *               out of it; it leaves by folding back into the same point —
 *               the far edge collapsing to it, the content still
 *               (motion-core's `exitMode: 'collapse'`), fading out over
 *               its last part and gone on its last frame; it fades up over
 *               the first part coming in (carbon-motion's `SNAP_FADE`; the
 *               fade standard: 40ms on a clock of 220ms or less, as a menu's
 *               always is, the snap's `snapFadeFor`; `exitFade={false}`
 *               leaves opaque)
 *   theme       the trigger's, carried by the portal through the exit too
 *   highlight   one marker for hover and the keyboard (motion-core
 *               `attachSelection`'s highlight mode): it arrives from its
 *               center (from 95%, at most 4px short in height), glides from
 *               row to row on the selection's timing (40 / 80 / 120 / 160ms), and
 *               leaves when the pointer leaves the list. Labels take its
 *               color exactly where it covers them. Danger rows turn it to
 *               the danger button's color, on the glide's clock
 *   press       the marker insets 1px while a row is held (the kit's grab)
 *   submenus    one level: a chevron, opening to the side on hover intent /
 *               → / Enter, snapping from its row; ← / Escape go back
 *   keyboard    ↑ / ↓ wrap, Home / End, typeahead, disabled rows skipped
 *   anchor      `anchor` (an element) places it below its trigger, flipping
 *               above when there's no room, aligned start / center / end;
 *               the menu takes the trigger's theme
 *   inline      `inline` renders the open surface in flow (a gallery):
 *               no portal, no placement, no snap, no close
 *   choices     a radio group marks its choice with a check (the default;
 *               `mark="radio"` for v11's radio mark) and can number its rows
 *               (`shortcuts`, as the model selector does): the number is
 *               live while the menu is open, and wins over typeahead. A
 *               menu's chosen value is marked at the row's start, neutral
 *               (the brand's ink under `variant="hero"`)
 *   shadow      `shadow`: the cast shadow lit from above under the surface,
 *               off by default (the kit's, `KitDefaults shadow`; `true` or an
 *               elevation turns it on) — motion-core's floating cast shadow,
 *               drawn by the open / close helper
 * ========================================================================== */

/* ── the descriptor components ─────────────────────────────────────────── */

export interface MenuItemProps {
  /** The row's text (v11: required; it is also the typeahead's word). */
  label: string;
  /** A hint at the row's end (it doesn't register the shortcut). */
  shortcut?: string;
  /** A leading icon — a motion icon, which plays on the row's hover. 16px (20 at lg). */
  renderIcon?: ElementType;
  /** `danger`: danger text, and the highlight takes the danger button's color. */
  kind?: 'default' | 'danger';
  /** Read by assistive tech on a danger row. */
  dangerDescription?: string;
  disabled?: boolean;
  /** Why it's disabled: the keyboard still reaches it, and it shows this in a tooltip. */
  disabledReason?: string;
  onClick?: (
    event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>
  ) => void;
  /** MenuItems here make a submenu (one level). */
  children?: ReactNode;
  className?: string;
}

/** A row that runs an action, or opens a submenu. Read by `Menu`; renders nothing on its own. */
export function MenuItem(_props: MenuItemProps): null {
  return null;
}
MenuItem.displayName = 'MenuItem';

export interface MenuItemSelectableProps extends Omit<
  MenuItemProps,
  'onClick' | 'children' | 'kind'
> {
  /** Controlled. */
  selected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
  /** `check` (the only mark): a check in the leading column, at the row's start. */
  mark?: 'check';
}

/** A checkbox row (`menuitemcheckbox`). Read by `Menu`. */
export function MenuItemSelectable(_props: MenuItemSelectableProps): null {
  return null;
}
MenuItemSelectable.displayName = 'MenuItemSelectable';

export interface MenuItemRadioGroupProps<Item = unknown> {
  /** The group's name (its `aria-label`, and a heading above it). */
  label: string;
  items: Item[];
  /** Controlled. */
  selectedItem?: Item;
  defaultSelectedItem?: Item;
  onChange?: (selectedItem: Item) => void;
  itemToString?: (item: Item) => string;
  /** No visible heading (its name stays the group's label) — a menu that is only this choice. */
  hideLabel?: boolean;
  /** How the chosen row is marked: `check` (default), a neutral check in the leading column, the brand's ink only under `variant="hero"`; `radio`, a radio mark there. */
  mark?: 'radio' | 'check';
  /** A key per row that chooses it and closes the open menu: `true` for 1–9 by position, or one character per item ('' for none). Shown in the row's shortcut slot; wins over typeahead. */
  shortcuts?: boolean | string[];
  className?: string;
}

/** A group of radio rows (`menuitemradio`). Read by `Menu`. */
export function MenuItemRadioGroup<Item = unknown>(
  _props: MenuItemRadioGroupProps<Item>
): null {
  return null;
}
MenuItemRadioGroup.displayName = 'MenuItemRadioGroup';

export interface MenuItemGroupProps {
  /** The group's name (its `aria-label`, and a heading above it). */
  label: string;
  children?: ReactNode;
  className?: string;
}

/** A labelled group of rows (`group`). Read by `Menu`. */
export function MenuItemGroup(_props: MenuItemGroupProps): null {
  return null;
}
MenuItemGroup.displayName = 'MenuItemGroup';

/** A hairline between rows (`separator`). Read by `Menu`. */
export function MenuItemDivider(_props: { className?: string }): null {
  return null;
}
MenuItemDivider.displayName = 'MenuItemDivider';

/* ── rows, read from the children ──────────────────────────────────────── */

interface RowBase {
  key: string;
  label: string;
  shortcut?: string;
  Icon?: ElementType;
  disabled: boolean;
  /** Disabled with a reason: reachable by the keyboard, the reason in a tooltip. */
  reason?: string;
  className?: string;
}
interface ItemRow extends RowBase {
  type: 'item';
  danger: boolean;
  dangerDescription?: string;
  onClick?: MenuItemProps['onClick'];
  sub: Row[] | null;
}
interface CheckRow extends RowBase {
  type: 'check';
  selected?: boolean;
  defaultSelected: boolean;
  onChange?: (selected: boolean) => void;
  /** A check mark (MenuItemSelectable's only one). */
  checkMark: boolean;
}
interface RadioRow extends RowBase {
  type: 'radio';
  group: RadioGroup;
  value: unknown;
  /** The key that chooses it while the menu is open (`shortcuts`); also shown, as `shortcut`. */
  hotkey?: string;
  /** The chosen row's mark is a check, not a radio mark (any `mark` but `"radio"`). */
  checkMark: boolean;
}
interface RadioGroup {
  key: string;
  selectedItem?: unknown;
  hasSelected: boolean;
  defaultSelectedItem?: unknown;
  onChange?: (item: unknown) => void;
}

/** A radio group's keys: `true` numbers its first nine rows; a list gives each row its own (one character). */
function hotkeys(
  shortcuts: MenuItemRadioGroupProps['shortcuts'],
  count: number
): (string | undefined)[] {
  return Array.from({ length: count }, (_, j) => {
    const k =
      shortcuts === true
        ? j < 9
          ? String(j + 1)
          : undefined
        : Array.isArray(shortcuts)
          ? shortcuts[j]
          : undefined;
    return k && k.length === 1 ? k : undefined;
  });
}
interface DividerRow {
  type: 'divider';
  key: string;
  className?: string;
}
interface GroupRow {
  type: 'group';
  key: string;
  label: string;
  /** The heading is for assistive tech only (a radio group that is the whole menu: a model picker). */
  hideLabel?: boolean;
  rows: Row[];
  className?: string;
}
type ActionRow = ItemRow | CheckRow | RadioRow;
type Row = ActionRow | DividerRow | GroupRow;

/** How deep submenus go (PLAN: one level; raise to nest further). */
const MAX_DEPTH = 1;

function readRows(children: ReactNode, path: string, depth: number): Row[] {
  const out: Row[] = [];
  let i = 0;
  const visit = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        visit((child.props as { children?: ReactNode }).children);
        return;
      }
      const key = `${path}${child.key != null ? `$${String(child.key).replace(/^\.\$?/, '')}` : i}`;
      i++;
      if (child.type === MenuItem) {
        const p = child.props as MenuItemProps;
        const subRows =
          depth < MAX_DEPTH && p.children
            ? readRows(p.children, `${key}.`, depth + 1)
            : [];
        const sub = subRows.length ? subRows : null;
        out.push({
          type: 'item',
          key,
          label: p.label,
          shortcut: sub ? undefined : p.shortcut,
          Icon: p.renderIcon,
          // As v11: a row with a submenu is never disabled or danger.
          disabled: !!p.disabled && !sub,
          reason:
            p.disabled && !sub ? p.disabledReason || undefined : undefined,
          danger: p.kind === 'danger' && !sub,
          dangerDescription: p.dangerDescription,
          onClick: p.onClick,
          sub,
          className: p.className,
        });
      } else if (child.type === MenuItemSelectable) {
        const p = child.props as MenuItemSelectableProps;
        out.push({
          type: 'check',
          key,
          label: p.label,
          shortcut: p.shortcut,
          Icon: p.renderIcon,
          disabled: !!p.disabled,
          reason: p.disabled ? p.disabledReason || undefined : undefined,
          selected: p.selected,
          defaultSelected: !!p.defaultSelected,
          onChange: p.onChange,
          checkMark: true,
          className: p.className,
        });
      } else if (child.type === MenuItemRadioGroup) {
        const p = child.props as MenuItemRadioGroupProps;
        const toStr = p.itemToString ?? ((x: unknown) => String(x));
        const keys = hotkeys(p.shortcuts, p.items.length);
        const checkMark = p.mark !== 'radio';
        const group: RadioGroup = {
          key,
          selectedItem: p.selectedItem,
          hasSelected: 'selectedItem' in p && p.selectedItem !== undefined,
          defaultSelectedItem: p.defaultSelectedItem,
          onChange: p.onChange,
        };
        out.push({
          type: 'group',
          key,
          label: p.label,
          hideLabel: p.hideLabel,
          className: p.className,
          rows: p.items.map((item, j) => ({
            type: 'radio',
            key: `${key}.${j}`,
            label: toStr(item),
            disabled: false,
            group,
            value: item,
            hotkey: keys[j],
            shortcut: keys[j],
            checkMark,
          })),
        });
      } else if (child.type === MenuItemGroup) {
        const p = child.props as MenuItemGroupProps;
        out.push({
          type: 'group',
          key,
          label: p.label,
          rows: readRows(p.children, `${key}.`, depth),
          className: p.className,
        });
      } else if (child.type === MenuItemDivider) {
        out.push({
          type: 'divider',
          key,
          className: (child.props as { className?: string }).className,
        });
      }
    });
  };
  visit(children);
  return out;
}

/** The rows the keyboard and the pointer act on, in order. */
function actionRows(rows: Row[]): ActionRow[] {
  return rows.flatMap((r) =>
    r.type === 'group' ? actionRows(r.rows) : r.type === 'divider' ? [] : [r]
  );
}

/**
 * Whether rows show a mark column (check / radio) or an icon column, so labels line up.
 * Every chosen value's mark is in the column, a check group's too (in
 * a menu, the check at the row's start).
 */
function columns(rows: Row[]): { marks: boolean; icons: boolean } {
  const a = actionRows(rows);
  const marks = a.some((r) => r.type !== 'item');
  const icons = a.some((r) => !!r.Icon);
  // One lead column for marks and icons, unless a mark row has an icon.
  const both = a.some((r) => r.type !== 'item' && !!r.Icon);
  return { marks, icons: icons && (!marks || both) };
}

/* ── placement (shared with the Popover: ../surface/placement) ──────────── */

export type MenuAlignment = SurfaceAlignment;

/** Hover intent before a submenu opens or closes, ms (v11's). */
const HOVER_INTENT_MS = 100;

/* ── the menu ──────────────────────────────────────────────────────────── */

/** The menu's motion dials: the selection kit's glide, plus slow motion for the snap. */
export type MenuMotion = Pick<
  SelectionMotion,
  'stretch' | 'timing' | 'ease' | 'timeScale' | 'arrival'
>;
export const MENU_MOTION: MenuMotion = {
  stretch: SELECTION_KIT_MOTION.stretch,
  // The content switcher's timing, as every selection component.
  timing: SELECTION_KIT_MOTION.timing,
  ease: SELECTION_KIT_MOTION.ease,
  timeScale: 1,
  // The family's arrival: every selection arrival is the snap's
  // entrance, 4px smaller in width and height.
  arrival: SELECTION_KIT_MOTION.arrival,
};

export type MenuStyleProps = Pick<
  SelectionStyleProps,
  'lowContrast' | 'corners' | 'contour' | 'outlinedFill'
> & {
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /**
   * The highlight's look: inverse (default), tonal, outlined, or hero: the
   * marker in the kit's brand (IBM blue unless `KitDefaults brand` says
   * otherwise), drawn as the selection kit draws its hero, as wherever there is a
   * selector or fill. Not the default: a menu's
   * marker follows the pointer and the keys, so a hero one is loud on every
   * page it opens over.
   */
  variant?: SelectionStyleProps['variant'];
  /** The surface's hairline, `--cds-surface-divider`. Default true; false for a surface set off by its layer. */
  outline?: boolean;
  /** The cast shadow under the surface and its submenus: `true` the `floating` elevation, or name one; `false` none. Default: the kit's (`KitDefaults shadow`, none). It grows and folds with the frame. */
  shadow?: SurfaceShadowOption;
};

export interface MenuProps extends MenuStyleProps, SelectionLoadingProps {
  /** The menu's accessible name. */
  label: string;
  open?: boolean;
  /** Escape, Tab, a press outside, or a row's activation asks to close. */
  onClose?: () => void;
  onOpen?: () => void;
  /** MenuItem, MenuItemSelectable, MenuItemRadioGroup, MenuItemGroup, MenuItemDivider. */
  children?: ReactNode;
  /** xs / sm / md (default) / lg — the kit's sizes: a row is the size less the inset (20 / 26 / 32 / 40px). */
  size?: SelectionSize;
  /** A point, or a [start, end] range (v11). Wins over `anchor` for placement. */
  x?: number | Range;
  y?: number | Range;
  /** The trigger. Placed below it (`menuAlignment`), its theme carried over, focus returned to it. */
  anchor?: HTMLElement | null;
  /** With `anchor`. Default `bottom-start`. Start and end are the anchor's inline sides (right-to-left too). */
  menuAlignment?: MenuAlignment;
  /** With `anchor`, never narrower than it, as a Dropdown's list is never narrower than its field. Otherwise content-width, 10rem at least. */
  fitAnchor?: boolean;
  /** Where the menu is portalled. Default `document.body`. */
  target?: Element | null;
  /** The snap's origin in client px: the pointer that opened it. Default: the `x` / `y` point, else the anchor's center (from the keyboard). */
  origin?: { x: number; y: number } | null;
  /** Where focus lands on open: `first` (default) or `last` highlights that row as the menu arrives; `menu` focuses the menu, with no highlight until the pointer or a key moves it. */
  initialFocus?: 'first' | 'last' | 'menu';
  /** @deprecated in v11 (both modes are supported now); accepted and ignored. */
  mode?: 'full' | 'basic';
  /** Render the open surface in flow (galleries) — no portal, placement, snap or close. */
  inline?: boolean;
  /** Motion dials; omitted keys take `MENU_MOTION`. */
  motion?: Partial<MenuMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called as each highlight glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
  /** The snap exit's fade on the menu and its submenus (40ms on a short exit, else 80ms). Default true. `false`: it folds back opaque, for a menu that must not show what's under it. */
  exitFade?: boolean;
  className?: string;
  id?: string;
}

/** What every surface of one menu shares. */
interface MenuCtx {
  id: string;
  size: SelectionSize;
  listClasses: string;
  /** The surface's classes (`cds-menu--inline` is added per surface). */
  surfaceClasses: string;
  motion: SelectionMotion;
  reduced: boolean;
  inline: boolean;
  target: Element | null;
  /** What it opens from: a portalled surface carries its brand zone (`KitPortal`). */
  opener: Element | null;
  /**
   * The scale the trigger is drawn at (`drawn-scale.ts`): a portalled
   * surface takes it as its zoom, so a menu from a trigger in a scaled frame
   * is drawn at the trigger's scale. 1 in flow and with no anchor.
   */
  scale: () => number;
  portalClass: string;
  /** The cast shadow's elevation, or none. */
  elevation: CastElevation | null;
  /** The snap exit's fade (`exitFade`, default true). */
  exitFade: boolean;
  iconPx: 16 | 20;
  onMove?: (info: SelectionMoveInfo) => void;
  checked: (row: CheckRow | RadioRow) => boolean;
  /** The root opening: remember where focus goes back to. */
  beforeOpen: () => void;
  /** Focus moving here doesn't close the menu (its surfaces, its trigger). */
  keepsOpen: (el: Element | null) => boolean;
  activate: (
    row: CheckRow | RadioRow | ItemRow,
    e: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>
  ) => void;
  requestClose: (reason: 'escape' | 'tab' | 'activate' | 'outside') => void;
}

export function Menu({
  label,
  open = false,
  onClose,
  onOpen,
  children,
  size = 'md',
  x,
  y,
  anchor,
  menuAlignment = 'bottom-start',
  fitAnchor = false,
  target,
  origin,
  initialFocus = 'first',
  mode: _mode,
  inline = false,
  motion: motionProp,
  timeScale,
  onMove,
  variant,
  lowContrast,
  corners,
  contour,
  outlinedFill,
  outline = true,
  shadow,
  exitFade = true,
  className,
  id: idProp,
  loading,
  skeletonCount,
  skeletonLabels,
  skeletonIcon,
}: MenuProps) {
  const motion = useWithTimeScale(motionProp, timeScale);
  const autoId = useId();
  const id = idProp ?? `cds-menu-${autoId.replace(/:/g, '')}`;
  // Read again only when the children change: the memos below (and the engine's labels) then hold.
  const rows = useMemo(() => readRows(children, '', 0), [children]);
  const reduced = usePrefersReducedMotion();
  const elevation = useSurfaceShadow(shadow);
  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    drag: false,
    pressColor: false,
    ...MENU_MOTION,
    ...motion,
  };
  const style = resolveSelectionStyle(
    {
      variant,
      lowContrast,
      size,
      corners,
      contour,
      outlinedFill,
      selectedWeight: false,
      orientation: 'vertical',
      highlight: true,
    },
    { drag: false, pressColor: false }
  );

  /* Uncontrolled checks and radios live here, so they outlast the surface (v11's reset on every open). */
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [radios, setRadios] = useState<Record<string, unknown>>({});
  const checked = (row: CheckRow | RadioRow): boolean => {
    if (row.type === 'check')
      return row.selected ?? checks[row.key] ?? row.defaultSelected;
    const g = row.group;
    const cur = g.hasSelected
      ? g.selectedItem
      : g.key in radios
        ? radios[g.key]
        : g.defaultSelectedItem;
    return Object.is(cur, row.value);
  };

  const onOpenRef = useLatest(onOpen);
  const onCloseRef = useLatest(onClose);
  const inMenu = useCallback(
    (n: Node | null) =>
      !!(n instanceof Element && n.closest(`[data-cds-menu="${id}"]`)),
    [id]
  );

  /* Focus goes back where it was (the trigger) when the menu closes. */
  const returnTo = useRef<HTMLElement | null>(null);
  const beforeOpen = () => {
    const a = document.activeElement;
    const was =
      a instanceof HTMLElement && a !== document.body && !inMenu(a) ? a : null;
    returnTo.current = anchor ?? was ?? returnTo.current;
    onOpenRef.current?.();
  };

  const requestClose = useCallback<MenuCtx['requestClose']>(
    (reason) => {
      const back = returnTo.current;
      if (reason !== 'outside') back?.focus({ preventScroll: true });
      else {
        // A press outside: focus goes back only if it landed nowhere.
        window.setTimeout(() => {
          const a = document.activeElement;
          if (!a || a === document.body || inMenu(a))
            back?.focus({ preventScroll: true });
        }, 0);
      }
      onCloseRef.current?.();
    },
    [inMenu, onCloseRef]
  );

  const activate: MenuCtx['activate'] = (row, e) => {
    if (row.disabled) return;
    if (row.type === 'check') {
      const next = !checked(row);
      if (row.selected === undefined)
        setChecks((c) => ({ ...c, [row.key]: next }));
      row.onChange?.(next);
    } else if (row.type === 'radio') {
      if (!row.group.hasSelected)
        setRadios((r) => ({ ...r, [row.group.key]: row.value }));
      if (!checked(row)) row.group.onChange?.(row.value);
    }
    // As v11: the menu closes first, then the action runs.
    if (!inline) requestClose('activate');
    if (row.type === 'item') row.onClick?.(e);
  };

  /* A press outside closes it — not on its own trigger, which toggles (a
     menu placed at a point, a context menu, closes on a press in its area too). */
  const atPoint = x != null && y != null;
  useEffect(() => {
    if (!open || inline) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (inMenu(t) || (!atPoint && anchor?.contains(t))) return;
      requestClose('outside');
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, inline, anchor, atPoint, inMenu, requestClose]);

  // The trigger's theme, KEPT while the menu leaves: read only while open,
  // the portal would drop the theme class and `cds--layer-one` on the exit's
  // first frame, and the frame and labels would turn to the page's theme.
  const keptTheme = useKeptTheme(open && !inline ? themeOf(anchor) : undefined);
  const themeClass = inline ? null : keptTheme;
  const ctx: MenuCtx = {
    id,
    size,
    listClasses: [...style.classes, 'cds-menu__list'].filter(Boolean).join(' '),
    surfaceClasses: [
      'cds-menu',
      `cds-menu--${style.variant}`,
      `cds-menu--${size}`,
      corners === 'square' && 'cds-menu--square',
      corners === 'full' && 'cds-menu--full',
      !outline && 'cds-menu--no-outline',
      className,
    ]
      .filter(Boolean)
      .join(' '),
    motion: m,
    reduced,
    inline,
    target: target ?? (typeof document !== 'undefined' ? document.body : null),
    opener: anchor ?? null,
    scale: () => (inline ? 1 : drawnScale(anchor)),
    portalClass: ['cds-menu-portal', themeClass, themeClass && 'cds--layer-one']
      .filter(Boolean)
      .join(' '),
    elevation,
    exitFade,
    iconPx: iconSizeFor(size),
    onMove,
    checked,
    beforeOpen,
    keepsOpen: (el) =>
      !!el &&
      (inMenu(el) ||
        !!anchor?.contains(el) ||
        !!returnTo.current?.contains(el)),
    activate,
    requestClose,
  };

  const placement = (s: { w: number; h: number }): Placement => {
    if (x != null && y != null) return placeAtPoint(x, y, s);
    // `GAP` from the trigger's visible fill, where it's painted inside its box;
    // a start / end edge stays on the box.
    if (anchor)
      return placeOnAnchor(
        anchor.getBoundingClientRect(),
        s,
        inlineAlignment(menuAlignment, anchor),
        anchorInset(anchor)
      );
    return { left: EDGE, top: EDGE };
  };
  const snapFrom = (): { x: number; y: number } | null => {
    if (origin) return origin;
    if (x != null && y != null) return { x: range(x)[0], y: range(y)[0] };
    // A key's open: the trigger's center, or the menu's own (`pattern.pointer-origin`).
    return originCause(null, anchor?.getBoundingClientRect());
  };

  return (
    <MenuSurface
      ctx={ctx}
      rows={rows}
      depth={0}
      loadingProps={{ loading, skeletonCount, skeletonLabels, skeletonIcon }}
      open={open || inline}
      label={label}
      listId={id}
      placement={placement}
      minWidth={
        fitAnchor && anchor
          ? () => Math.ceil(anchor.getBoundingClientRect().width)
          : undefined
      }
      origin={snapFrom}
      placeKey={
        x != null && y != null ? `${String(x)}/${String(y)}` : undefined
      }
      initialFocus={inline ? 'none' : initialFocus}
      onEscape={() => requestClose('escape')}
    />
  );
}
Menu.displayName = 'Menu';

/**
 * `-start` / `-end` on the anchor's inline sides: placeOnAnchor's are the
 * physical left and right, so a right-to-left anchor swaps them (its start
 * is its right edge).
 */
function inlineAlignment(align: MenuAlignment, anchor: Element): MenuAlignment {
  if (getComputedStyle(anchor).direction !== 'rtl') return align;
  if (align.endsWith('-start'))
    return align.replace('-start', '-end') as MenuAlignment;
  if (align.endsWith('-end'))
    return align.replace('-end', '-start') as MenuAlignment;
  return align;
}

/* ── a surface: the root menu or a submenu ─────────────────────────────── */

interface SurfaceProps {
  ctx: MenuCtx;
  rows: Row[];
  depth: number;
  open: boolean;
  label: string;
  listId: string;
  /** Where it goes, given its size (client px). */
  placement: (size: { w: number; h: number }) => Placement;
  /** Its narrowest, client px (the root menu with `fitAnchor`: the anchor's width). */
  minWidth?: () => number;
  /** The snap's origin, client px (null: the surface's center). */
  origin: () => { x: number; y: number } | null;
  initialFocus: 'first' | 'last' | 'menu' | 'none';
  /** Changes when where it's placed changes while open (a context menu opened again elsewhere): it starts again there. */
  placeKey?: string;
  /** Escape (and ← in a submenu). */
  onEscape: () => void;
  /** A submenu: the pointer came into it. */
  onPointerEnterSurface?: () => void;
  /** The root menu: its rows are loading (the loading standard's structure tier). */
  loadingProps?: SelectionLoadingProps;
}

/** A placeholder row's face, in the row's own slots: the icon slot (room only) and the label, one bar over both. */
function menuSkeletonFace(label: string, skeletonIcon: boolean) {
  return (
    <>
      {skeletonIcon && <span className="cds-menu__slot" aria-hidden="true" />}
      <SelectionSkeletonText
        className="sel__text"
        text={label}
        lead={skeletonIcon}
      />
    </>
  );
}

interface MenuRowProps {
  row: ActionRow;
  index: number;
  /** A check or radio row: chosen. */
  on: boolean;
  /** The list's columns: a mark column, an icon column. */
  marks: boolean;
  icons: boolean;
  iconPx: 16 | 20;
  listId: string;
  /** A row with a submenu: that submenu is open. */
  expanded: boolean;
  /** A row with a submenu: the submenu's list id. */
  subId?: string;
  /** Loading: the placeholder key the row took over, its takeover number and label. */
  entryKey?: string;
  took?: number;
  takenLabel?: string;
  skeletonIcon: boolean;
}

/** One row, memoized as every selection list's rows are: the surface re-renders on every highlight, open and check, a row only when its own props change. Its handlers are the list's (delegated), so it takes none. */
const MenuRow = memo(function MenuRow({
  row,
  index,
  on,
  marks,
  icons,
  iconPx,
  listId,
  expanded,
  subId,
  entryKey,
  took,
  takenLabel,
  skeletonIcon,
}: MenuRowProps) {
  const isCheck = row.type !== 'item';
  const sub = row.type === 'item' && !!row.sub;
  const danger = row.type === 'item' && row.danger;
  // A check (a radio group's default), not a radio mark, in the mark column at the row's start as
  // every menu's chosen value; the row keeps its shortcut at the end.
  const checkMark = row.type !== 'item' && row.checkMark;
  const Mark =
    row.type === 'radio' && !checkMark ? RadioButtonChecked : Checkmark;
  const descId =
    row.type === 'item' && row.danger && row.dangerDescription
      ? `${listId}-${row.key}-desc`
      : undefined;
  // Disabled with a reason: the keyboard reaches the row, and its focus or hover shows why.
  const reason = useDisabledReason(row.disabled, row.reason, {
    align: 'right',
  });
  const face = (
    <>
      {marks && (
        <span
          className={
            isCheck ? 'cds-menu__slot cds-menu__mark' : 'cds-menu__slot'
          }>
          {on && <Mark size={iconPx} animated={false} aria-hidden="true" />}
          {!icons && !isCheck && row.Icon && (
            <row.Icon size={iconPx} aria-hidden="true" />
          )}
        </span>
      )}
      {icons && (
        <span className="cds-menu__slot">
          {row.Icon && <row.Icon size={iconPx} aria-hidden="true" />}
        </span>
      )}
      <span className="sel__text">{row.label}</span>
      {row.shortcut && (
        <span className="sel__accessory cds-menu__shortcut">
          {row.shortcut}
        </span>
      )}
      {sub && (
        <span className="sel__accessory cds-menu__chevron">
          <ChevronRight size={iconPx} aria-hidden="true" />
        </span>
      )}
    </>
  );
  const el = (
    <div
      {...rowStructureProps(entryKey, took)}
      role={
        row.type === 'check'
          ? 'menuitemcheckbox'
          : row.type === 'radio'
            ? 'menuitemradio'
            : 'menuitem'
      }
      tabIndex={-1}
      data-index={index}
      data-key={row.key}
      {...(danger ? { 'data-danger': '' } : null)}
      aria-disabled={row.disabled || undefined}
      aria-checked={isCheck ? on : undefined}
      aria-keyshortcuts={row.type === 'radio' ? row.hotkey : undefined}
      aria-haspopup={sub ? 'menu' : undefined}
      aria-expanded={sub ? expanded : undefined}
      aria-controls={sub && expanded ? subId : undefined}
      aria-describedby={reason.describedBy(descId)}
      {...reason.anchorProps}
      onFocus={reason.controlProps.onFocus}
      onBlur={reason.controlProps.onBlur}
      // The whole row is its icons' hover frame.
      {...(row.Icon || sub ? { 'data-motion-icon-frame': '' } : null)}
      className={[
        'sel__item',
        'cds-menu__item',
        danger && 'cds-menu__item--danger',
        row.className,
      ]
        .filter(Boolean)
        .join(' ')}>
      <SelectionFaces>{face}</SelectionFaces>
      {took !== undefined && (
        <SelectionTakenFace key={`taken-${took}`} label={takenLabel ?? ''}>
          {menuSkeletonFace(takenLabel ?? '', skeletonIcon)}
        </SelectionTakenFace>
      )}
      {descId && (
        <span id={descId} className="cds--visually-hidden">
          {(row as ItemRow).dangerDescription}
        </span>
      )}
    </div>
  );
  // The reason's tooltip beside the row, never in it (its text would join the row's name).
  return reason.active ? (
    <>
      {el}
      {reason.tooltip}
    </>
  ) : (
    el
  );
}, sameMenuRow);

/** What a row draws from its read (handlers, groups and submenus' rows aren't drawn: the list's own). */
function sameRowFace(a: ActionRow, b: ActionRow): boolean {
  if (a === b) return true;
  if (
    a.type !== b.type ||
    a.key !== b.key ||
    a.label !== b.label ||
    a.shortcut !== b.shortcut ||
    a.Icon !== b.Icon ||
    a.disabled !== b.disabled ||
    a.reason !== b.reason ||
    a.className !== b.className
  )
    return false;
  if (a.type === 'item' && b.type === 'item')
    return (
      a.danger === b.danger &&
      a.dangerDescription === b.dangerDescription &&
      !a.sub === !b.sub
    );
  if (a.type === 'radio' && b.type === 'radio')
    return a.checkMark === b.checkMark && a.hotkey === b.hotkey;
  if (a.type === 'check' && b.type === 'check')
    return a.checkMark === b.checkMark;
  return false;
}

function sameMenuRow(a: MenuRowProps, b: MenuRowProps): boolean {
  return (
    a.index === b.index &&
    a.on === b.on &&
    a.marks === b.marks &&
    a.icons === b.icons &&
    a.iconPx === b.iconPx &&
    a.listId === b.listId &&
    a.expanded === b.expanded &&
    a.subId === b.subId &&
    a.entryKey === b.entryKey &&
    a.took === b.took &&
    a.takenLabel === b.takenLabel &&
    a.skeletonIcon === b.skeletonIcon &&
    sameRowFace(a.row, b.row)
  );
}

/** Mounted while open and while it leaves; portalled with its trigger's theme. */
function MenuSurface(p: SurfaceProps) {
  const { present, exited } = useFloatingMount(p.open);
  if (!present) return null;
  const body = <SurfaceBody {...p} onExited={exited} />;
  if (p.ctx.inline || !p.ctx.target) return body;
  return (
    <KitPortal
      target={p.ctx.target}
      anchor={p.ctx.opener}
      hold={!p.open}
      className={p.ctx.portalClass}>
      {body}
    </KitPortal>
  );
}

const ROW = '.sel__item';

function SurfaceBody(p: SurfaceProps & { onExited: () => void }) {
  const { ctx, rows, depth, open } = p;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const action = useMemo(() => actionRows(rows), [rows]);
  const cols = useMemo(() => columns(rows), [rows]);
  const typeahead = useMemo(() => createTypeahead(), []);
  const [subKey, setSubKey] = useState<string | null>(null);
  const [subFocus, setSubFocus] = useState<'first' | 'none'>('none');
  const subKeyRef = useLatest(subKey);
  const timer = useRef(0);
  const lastHover = useRef<string | null>(null);
  const pointerInside = useRef(false);
  /** The highlight has arrived once while this menu is open: after that it comes back still. */
  const arrived = useRef(false);
  const latest = useLatest(p);
  // Loading rows (the root menu): the structure tier — placeholder rows the
  // surface opens around, taken in order as one reflow.
  const load = useSelectionLoading(
    listRef,
    p.loadingProps ?? {},
    action.length,
    4,
    {
      timeScale: ctx.motion.timeScale,
      labels: action.map((r) => r.label),
    }
  );
  const skeletonIcon = !!p.loadingProps?.skeletonIcon;
  // An in-flow menu (a gallery) has no snap: its shadow is drawn under its frame, solved once.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el || !ctx.inline || !ctx.elevation) return;
    const c = attachFloatingCastShadow(el, {
      elevation: ctx.elevation,
      inline: true,
    });
    return () => c.detach();
  }, [ctx.inline, ctx.elevation]);

  /* ── the highlight ──────────────────────────────────────────────────── */

  const layoutKey = `${action.map((r) => r.key).join('|')}/${ctx.size}/${load.busy ? 'busy' : ''}${load.standing.length}`;
  const selRef = useSelectionEngine({
    rootRef: listRef,
    itemSelector: ROW,
    motion: ctx.motion,
    reduced: ctx.reduced,
    onMove: (info) => {
      // The danger color changes on the glide's own clock.
      listRef.current?.style.setProperty('--cds-menu-glide', `${info.ms}ms`);
      latest.current.ctx.onMove?.(info);
    },
    getRest: () => null,
    layoutKey,
  });

  const rowEl = (key: string) =>
    listRef.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(key)}"]`
    ) ?? null;
  const rowOf = (el: Element | null): ActionRow | null => {
    const r = el?.closest<HTMLElement>(ROW);
    if (!r || !listRef.current?.contains(r)) return null;
    return action[Number(r.dataset.index)] ?? null;
  };
  const indexOfFocus = () => {
    const a = document.activeElement;
    const r =
      a instanceof HTMLElement && listRef.current?.contains(a)
        ? a.closest<HTMLElement>(ROW)
        : null;
    return r ? Number(r.dataset.index) : -1;
  };

  const highlight = (el: HTMLElement, instant = false) => {
    const list = listRef.current;
    const sel = selRef.current;
    if (!list || !sel) return;
    // Stillness: only the highlight's first arrival in an open menu grows in;
    // every return is simply there, at full size. Hover is instant: the pointer
    // jumps the highlight from row to row; the keyboard's steps keep the glide
    // (a step's direction is worth seeing), and the first arrival its grow-in.
    const byPointer = list.dataset.input === 'pointer';
    const still =
      instant ||
      (!sel.shown() && arrived.current) ||
      (sel.shown() && byPointer);
    arrived.current = true;
    // A mark arriving takes its color at once; a glide changes it on its clock.
    if (!sel.shown() || still)
      list.style.setProperty('--cds-menu-glide', '0ms');
    if (el.dataset.danger != null) list.dataset.danger = '';
    else delete list.dataset.danger;
    delete list.dataset.hiding;
    sel.show(el, { instant: still });
  };

  /**
   * The highlight leaving (the pointer left the list): `data-hiding` while it
   * fades, so the labels cross-fade with it (menu.scss); otherwise the covered
   * label would keep its on-marker color over the fading marker and pop to its
   * own color when the fade ends.
   */
  const hideMarker = () => {
    const list = listRef.current;
    const sel = selRef.current;
    if (!sel) return;
    if (list && sel.shown()) list.dataset.hiding = '';
    sel.hide();
  };

  const focusRow = (index: number, instant = false) => {
    const row = action[index];
    const el = row ? rowEl(row.key) : null;
    if (!el) return;
    highlight(el, instant);
    el.focus({ preventScroll: true });
  };

  /* ── arrive and leave ───────────────────────────────────────────────── */

  // The floating surface's lifecycle (motion-core `useSnapSurface`): from
  // its cause, turning round mid-exit, back into it, hidden on the last
  // frame (before React unmounts it a task later — a frame painted in
  // between showed the whole menu again, full size, after its exit).
  const surface = useSnapSurface(surfaceRef, {
    // Its own snap, as every snap has it (a submenu is its own behavior).
    profile: () => snapProfileFor(depth > 0 ? 'submenu' : 'menu'),
    reduced: ctx.reduced,
    timeScale: ctx.motion.timeScale,
    // The cast shadow lit from above, outside the snap's clip, growing and folding with the frame.
    shadow: ctx.elevation,
  });

  /** Where it goes now, on whole device px, at its current size. */
  const target = (s: { w: number; h: number }) => {
    const at = latest.current.placement(s);
    const dpr = window.devicePixelRatio || 1;
    return {
      left: Math.round(at.left * dpr) / dpr,
      top: Math.round(at.top * dpr) / dpr,
    };
  };

  /** The surface's zoom: its trigger's drawn scale when portalled (1 unportalled: it is drawn where it sits). */
  const scale = () => (ctx.inline || !ctx.target ? 1 : ctx.scale());

  /**
   * Placed in client px, written in its own (zoomed) px: at its trigger's
   * drawn scale (shared with the listbox: `drawn-scale.ts`).
   */
  const place = () => {
    const el = surfaceRef.current;
    if (!el) return;
    const z = scale();
    applyDrawnScale(el, z);
    el.style.width = '';
    el.style.minWidth = latest.current.minWidth
      ? cssPx(latest.current.minWidth(), z)
      : '';
    el.style.left = '0px';
    el.style.top = '0px';
    const r = el.getBoundingClientRect();
    // Whole px wide, on whole device px: the icons inside stay on the pixel grid.
    const s = { w: Math.ceil(r.width), h: Math.ceil(r.height) };
    el.style.width = cssPx(s.w, z);
    const at = target(s);
    el.style.left = cssPx(at.left, z);
    el.style.top = cssPx(at.top, z);
  };

  /** Reopened while leaving: does it still belong where it is (else it starts again, somewhere new)? */
  const stillPlaced = (el: HTMLElement) => {
    const z = scale();
    const at = target({ w: el.offsetWidth * z, h: el.offsetHeight * z });
    return (
      Math.abs(at.left - parseFloat(el.style.left) * z) < 1 &&
      Math.abs(at.top - parseFloat(el.style.top) * z) < 1
    );
  };

  const enabledFrom = (from: number, dir: 1 | -1) =>
    rovingKey(dir === 1 ? 'ArrowDown' : 'ArrowUp', from, {
      orientation: 'vertical',
      count: action.length,
      isDisabled: (i) => skipped(action[i]),
    });

  const markerEl = () =>
    listRef.current?.querySelector<HTMLElement>('.sel__indicator') ?? null;
  // Its lifecycle (`useFloatingPresence`): open, close, and while open the
  // root follows its trigger through scrolls and resizes, once a frame (a
  // submenu closes). In flow (a gallery), none of it.
  useFloatingPresence(surface, {
    open,
    enabled: !ctx.inline,
    enter: () => {
      if (!surfaceRef.current) return;
      if (depth === 0) ctx.beforeOpen();
      markerEl()?.style.removeProperty('box-shadow');
      // Reopened mid-exit where it still belongs: it turns round; else it starts again, placed anew.
      surface.open({
        cause: latest.current.origin(),
        place,
        turnRound: stillPlaced,
      });
      // The first row's highlight is content: it comes with the surface, not as a second snap.
      const f = latest.current.initialFocus;
      if (f === 'first' || f === 'last') {
        const i =
          f === 'first' ? enabledFrom(-1, 1) : enabledFrom(action.length, -1);
        if (i != null && i >= 0 && i < action.length) focusRow(i, true);
      } else if (f === 'menu') listRef.current?.focus({ preventScroll: true });
      // Loading: no rows to focus yet — the menu itself, so Escape and Tab work; the row comes when it lands.
      if (load.busy && f !== 'none')
        listRef.current?.focus({ preventScroll: true });
    },
    // Leaving, it is frozen as it is on screen. Focus has already gone back
    // to the trigger, so the marker's keyboard ring (a `:focus-visible` rule)
    // would ease off over the exit: it is held. No pointer reaches it
    // (`data-leaving`: pointer-events none), or the collapse's clip passing the
    // pointer would fire a pointerleave and fade the highlight mid-exit.
    // It fades over the fold's last 40ms (80ms past a 160ms fold), gone on its last frame (carbon-motion's
    // `snapExitFades`; `exitFade={false}` keeps it opaque).
    leave: () => {
      if (!surfaceRef.current) return false;
      // Its submenu goes with it, and no hover intent brings one back: reopened as it leaves, it opens with none.
      window.clearTimeout(timer.current);
      lastHover.current = null;
      setSubKey(null);
      const marker = markerEl();
      if (marker) marker.style.boxShadow = getComputedStyle(marker).boxShadow;
    },
    onExited: () => latest.current.onExited(),
    follow:
      depth === 0
        ? {
            reflow: () => {
              setSubKey(null);
              if (!snapAnimations(surfaceRef.current).length) place();
            },
          }
        : null,
  });

  // The rows landing (a structure commit): the surface is sized and placed
  // for the placeholders (the loading standard's rule 23 — decided once);
  // the list's length follows on the structure clock (the kit), and the
  // surface's width and place move with it, on the same clock, so a menu
  // that grows upward keeps its anchored edge. The first row's highlight
  // comes with its row, as it comes with the surface.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    const list = listRef.current;
    if (!el || !list || !load.active || ctx.inline || !latest.current.open)
      return;
    const rz = load.resize.current;
    // Its own px (zoomed: `place`), placed in client px.
    const z = scale();
    const w0 = el.offsetWidth;
    const left0 = parseFloat(el.style.left) || 0;
    const top0 = parseFloat(el.style.top) || 0;
    el.style.width = '';
    const w1c = Math.ceil(el.getBoundingClientRect().width);
    const h1 =
      (rz ? rz.to : list.offsetHeight) + (el.offsetHeight - list.offsetHeight);
    const placed = target({ w: w1c, h: h1 * z });
    const w1 = w1c / z;
    const at = { left: placed.left / z, top: placed.top / z };
    el.style.width = `${w1}px`;
    el.style.left = `${at.left}px`;
    el.style.top = `${at.top}px`;
    if (
      !load.busy &&
      document.activeElement === list &&
      !pointerInside.current
    ) {
      const f = latest.current.initialFocus;
      const i =
        f === 'first'
          ? enabledFrom(-1, 1)
          : f === 'last'
            ? enabledFrom(action.length, -1)
            : null;
      if (i != null && i >= 0 && i < action.length) focusRow(i, true);
    }
    const travel = Math.max(
      Math.abs(w1 - w0),
      Math.abs(at.left - left0),
      Math.abs(at.top - top0)
    );
    if (ctx.reduced || travel < 0.5) return;
    const t = structureTiming(
      rz ? Math.abs(rz.to - rz.from) : travel,
      ctx.motion.timeScale
    );
    const easing =
      rz?.easing ??
      cubicBezier(toEasing({ name: 'standard', mode: 'expressive' }));
    const a = el.animate(
      [
        { width: `${w0}px`, left: `${left0}px`, top: `${top0}px` },
        { width: `${w1}px`, left: `${at.left}px`, top: `${at.top}px` },
      ],
      { duration: rz?.ms ?? t.ms, easing }
    );
    surface.syncShadow();
    // A task, not the animation's promise: a hidden tab never finishes it.
    const timer = window.setTimeout(() => a.cancel(), rz?.ms ?? t.ms);
    return () => {
      window.clearTimeout(timer);
      a.cancel();
    };
    // On each structure commit only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.sig]);

  // Opened again somewhere else while open (a second right-click): it starts again there.
  const placedKey = useRef(p.placeKey);
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (placedKey.current === p.placeKey) return;
    placedKey.current = p.placeKey;
    if (!el || !open || ctx.inline) return;
    setSubKey(null);
    hideMarker();
    surface.open({ cause: latest.current.origin(), place, turnRound: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new place only
  }, [p.placeKey]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* ── submenus ───────────────────────────────────────────────────────── */

  const subListId = (key: string) =>
    `${p.listId}-sub-${key.replace(/[^\w-]/g, '_')}`;

  const openSub = (row: ItemRow, focus: 'first' | 'none') => {
    window.clearTimeout(timer.current);
    if (subKeyRef.current === row.key) {
      if (focus === 'first') {
        document
          .getElementById(subListId(row.key))
          ?.querySelector<HTMLElement>(`${ROW}:not([aria-disabled="true"])`)
          ?.focus({ preventScroll: true });
      }
      return;
    }
    setSubFocus(focus);
    setSubKey(row.key);
  };

  const closeSub = (refocus: boolean) => {
    window.clearTimeout(timer.current);
    const key = subKeyRef.current;
    setSubKey(null);
    if (refocus && key) {
      const el = rowEl(key);
      if (el) {
        highlight(el);
        el.focus({ preventScroll: true });
      }
    }
  };

  /* ── activation ─────────────────────────────────────────────────────── */

  const activateRow = (
    row: ActionRow,
    e: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>,
    byKey: boolean
  ) => {
    if (row.disabled) return;
    if (row.type === 'item' && row.sub)
      return openSub(row, byKey ? 'first' : 'none');
    ctx.activate(row, e);
  };

  /* ── keyboard ───────────────────────────────────────────────────────── */

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Keys drive focus now: the focus ring shows (see `onPointerMove`).
    if (listRef.current) listRef.current.dataset.input = 'keyboard';
    if (ctx.inline && (e.key === 'Escape' || e.key === 'Tab')) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      ctx.requestClose('tab');
      return;
    }
    if (
      (e.key === 'Escape' && !isComposing(e)) ||
      (e.key === 'ArrowLeft' && depth > 0)
    ) {
      e.preventDefault();
      p.onEscape();
      return;
    }
    const cur = indexOfFocus();
    const row = cur >= 0 ? action[cur] : undefined;
    const opts = {
      orientation: 'vertical' as const,
      count: action.length,
      isDisabled: (i: number) => skipped(action[i]),
    };
    const next =
      cur < 0 && e.key === 'ArrowUp'
        ? rovingKey('End', -1, opts)
        : rovingKey(e.key, cur, opts);
    if (next != null) {
      e.preventDefault();
      if (next >= 0 && next < action.length) focusRow(next);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && row) {
      e.preventDefault();
      activateRow(row, e as unknown as ReactKeyboardEvent<HTMLElement>, true);
      return;
    }
    if (e.key === 'ArrowRight' && row?.type === 'item' && row.sub) {
      e.preventDefault();
      openSub(row, 'first');
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // A radio group's keys (`shortcuts`) choose their row, and win over
      // typeahead — a label may start with the same character ("4o"). The
      // highlight lands on the row at once, so the fold shows what was chosen.
      const k = e.key.toLowerCase();
      const hit = action.findIndex(
        (r) =>
          r.type === 'radio' && !r.disabled && r.hotkey?.toLowerCase() === k
      );
      if (hit >= 0) {
        e.preventDefault();
        focusRow(hit, true);
        activateRow(
          action[hit]!,
          e as unknown as ReactKeyboardEvent<HTMLElement>,
          true
        );
        return;
      }
      const i = typeahead(
        e.key,
        cur,
        action.map((r) => r.label),
        (j) => skipped(action[j])
      );
      if (i != null) {
        e.preventDefault();
        focusRow(i);
      }
    }
  };

  /* ── pointer ────────────────────────────────────────────────────────── */

  const hoverIntent = (row: ActionRow) => {
    if (lastHover.current === row.key) return;
    lastHover.current = row.key;
    window.clearTimeout(timer.current);
    if (row.key === subKeyRef.current) return;
    if (row.type === 'item' && row.sub) {
      timer.current = window.setTimeout(
        () => openSub(row, 'none'),
        HOVER_INTENT_MS
      );
    } else if (subKeyRef.current != null) {
      timer.current = window.setTimeout(() => {
        setSubKey(null);
        if (!pointerInside.current) hideMarker();
      }, HOVER_INTENT_MS);
    }
  };

  /** On its way out: the pointer changes nothing (see the close, above). */
  const leaving = () => !!surfaceRef.current?.hasAttribute('data-leaving');

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (leaving()) return;
    pointerInside.current = true;
    if (e.pointerType === 'touch') return;
    // The pointer drives focus now. Hovering a row focuses it (so keys carry
    // on from there), and Chrome counts that focus as visible, so v11's blue
    // ring would draw round every hovered row. The highlight is the pointer's
    // mark: no ring until a key is pressed.
    if (listRef.current) listRef.current.dataset.input = 'pointer';
    const row = rowOf(e.target as Element);
    // Over a disabled row, a divider or a heading the highlight stays where it is.
    if (!row || row.disabled) return;
    const el = rowEl(row.key);
    if (el && document.activeElement !== el) el.focus({ preventScroll: true });
    // Back on the row that kept focus when the pointer left (an inline menu
    // keeps it): no focus event comes, so bring the highlight back here.
    else if (el && !selRef.current?.shown()) highlight(el);
    hoverIntent(row);
  };

  const onPointerLeave = () => {
    if (leaving()) return;
    pointerInside.current = false;
    lastHover.current = null;
    const key = subKeyRef.current;
    const subRow = key ? rowEl(key) : null;
    // A submenu is open: its row stays highlighted (gliding back if the pointer crossed another).
    if (subRow) {
      highlight(subRow);
      return;
    }
    hideMarker();
    const list = listRef.current;
    if (
      list &&
      !ctx.inline &&
      list.contains(document.activeElement) &&
      document.activeElement !== list
    )
      list.focus({ preventScroll: true });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const row = rowOf(e.target as Element);
    const list = listRef.current;
    if (!row || row.disabled || e.button !== 0 || !list || leaving()) return;
    const el = rowEl(row.key);
    if (el && document.activeElement !== el) el.focus({ preventScroll: true });
    // Held: the marker insets 1px (the kit's grab).
    list.dataset.grabbed = '';
    const up = () => {
      delete list.dataset.grabbed;
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const row = rowOf(e.target as Element);
    if (row)
      activateRow(
        row,
        e as unknown as ReactMouseEvent<HTMLElement>,
        e.detail === 0
      );
  };

  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    const r = (e.target as Element).closest<HTMLElement>(ROW);
    if (
      r &&
      listRef.current?.contains(r) &&
      r.getAttribute('aria-disabled') !== 'true'
    )
      highlight(r);
  };

  // Focus leaving every surface of this menu (not to its trigger) closes it.
  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (ctx.inline || depth > 0) return;
    const to = e.relatedTarget as Element | null;
    if (!to || ctx.keepsOpen(to) || !latest.current.open) return;
    window.setTimeout(() => {
      const a = document.activeElement;
      if (
        a &&
        a !== document.body &&
        !latest.current.ctx.keepsOpen(a) &&
        latest.current.open
      )
        latest.current.ctx.requestClose('outside');
    }, 0);
  };

  /* ── render ─────────────────────────────────────────────────────────── */

  const renderRow = (row: ActionRow, index: number) => {
    // Loading rows: only those the structure has committed, under their placeholder's key.
    const entry = load.active ? load.rowEntry(index) : undefined;
    if (load.active && !entry) return null;
    const took = entry ? load.took(entry.key) : undefined;
    const sub = row.type === 'item' && !!row.sub;
    return (
      <MenuRow
        key={entry?.key ?? row.key}
        row={row}
        index={index}
        on={row.type !== 'item' ? ctx.checked(row) : false}
        marks={cols.marks}
        icons={cols.icons}
        iconPx={ctx.iconPx}
        listId={p.listId}
        expanded={sub && subKey === row.key}
        subId={sub ? subListId(row.key) : undefined}
        entryKey={entry?.key}
        took={took}
        takenLabel={took !== undefined ? load.labelFor(index) : undefined}
        skeletonIcon={skeletonIcon}
      />
    );
  };

  /** A placeholder row's face, in the row's own slots: the icon slot (room only) and the label, one bar over both. */
  const skeletonFace = (label: string) => menuSkeletonFace(label, skeletonIcon);

  let index = 0;
  const renderRows = (list: Row[]): ReactNode =>
    list.map((r) => {
      // Loading rows: dividers and group labels come with the rows.
      if (load.busy && r.type !== 'group' && r.type !== 'divider')
        return renderRow(r, index++);
      if (load.busy) return r.type === 'group' ? renderRows(r.rows) : null;
      if (r.type === 'divider')
        return (
          <div
            key={r.key}
            role="separator"
            className={['cds-menu__divider', r.className]
              .filter(Boolean)
              .join(' ')}
          />
        );
      if (r.type === 'group') {
        const labelId = `${p.listId}-${r.key}-label`;
        return (
          <div
            key={r.key}
            role="group"
            aria-labelledby={labelId}
            className={['cds-menu__group', r.className]
              .filter(Boolean)
              .join(' ')}>
            <div
              id={labelId}
              className={
                r.hideLabel ? 'cds--visually-hidden' : 'cds-menu__group-label'
              }
              aria-hidden="true">
              {r.label}
            </div>
            {renderRows(r.rows)}
          </div>
        );
      }
      return renderRow(r, index++);
    });

  const subRows = action.filter(
    (r): r is ItemRow => r.type === 'item' && !!r.sub
  );

  return (
    <>
      <div
        ref={surfaceRef}
        className={[ctx.surfaceClasses, ctx.inline && 'cds-menu--inline']
          .filter(Boolean)
          .join(' ')}
        data-cds-menu={ctx.id}
        {...(ctx.exitFade ? null : { [SNAP_EXIT_FADE_ATTR]: 'false' })}
        aria-busy={load.busy || undefined}
        onPointerEnter={p.onPointerEnterSurface}>
        <span className="cds-menu__frame" {...SNAP_FRAME} />
        <div
          ref={listRef}
          id={p.listId}
          role="menu"
          aria-label={p.label}
          aria-busy={load.busy || undefined}
          tabIndex={-1}
          className={ctx.listClasses}
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onFocus={onFocus}
          onBlur={onBlur}>
          <SelectionMarker />
          {renderRows(rows)}
          {load.standing.map((e) => (
            <div
              key={e.key}
              {...skeletonRowProps(e.key, 'div')}
              className="sel__item cds-menu__item">
              <SelectionSkeletonFace label={load.labelFor(e.slot)}>
                {skeletonFace(load.labelFor(e.slot))}
              </SelectionSkeletonFace>
            </div>
          ))}
        </div>
      </div>
      {subRows.map((row) => (
        <MenuSurface
          key={row.key}
          // An inline menu's submenus float, unportalled, so they keep its theme.
          ctx={ctx.inline ? { ...ctx, inline: false, target: null } : ctx}
          rows={row.sub!}
          depth={depth + 1}
          open={open && subKey === row.key}
          label={row.label}
          listId={subListId(row.key)}
          placement={(s) => {
            const r = rowEl(row.key)?.getBoundingClientRect();
            const parent = surfaceRef.current?.getBoundingClientRect();
            const inset = listRef.current
              ? parseFloat(getComputedStyle(listRef.current).paddingTop) || 0
              : 0;
            return r && parent
              ? placeBesideRow(r, parent, inset, s)
              : { left: EDGE, top: EDGE };
          }}
          origin={() => {
            // From its row: the row's center, clamped into the submenu's box.
            const r = rowEl(row.key)?.getBoundingClientRect();
            return r
              ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
              : null;
          }}
          initialFocus={subFocus}
          onEscape={() => closeSub(true)}
          onPointerEnterSurface={() => {
            window.clearTimeout(timer.current);
            lastHover.current = null;
            const el = rowEl(row.key);
            if (el && subKeyRef.current === row.key) highlight(el);
          }}
        />
      ))}
    </>
  );
}
