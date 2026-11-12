/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { SNAP_FRAME, type SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  createTooltip,
  isComponentType,
  resolveSelectionStyle,
  sameNode,
  rolloverItems,
  useIconPixelSnap,
  useItemRollover,
  useLandingHold,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionGesture,
  useSelectionList,
  type SelectionItemProps,
  type SelectionItemState,
  type SelectionMotion,
  type LandingHold,
  type SelectionStyleProps,
  type TooltipController,
  useSelectionLoading,
  skeletonRowProps,
  rowStructureProps,
  SelectionSkeletonFace,
  SelectionTakenFace,
  type SelectionLoadingProps,
} from '@carbon-labs/react-selection-kit';
import { useWithTimeScale, type KeyboardMode } from '@carbon-labs/react-props';
import { useDisabledReason } from '@carbon-labs/react-tooltip';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * Content switcher — Carbon v11's ContentSwitcher, on the kit's look and
 * motion. The first member of the selection family: its look, motion and
 * behavior live in the selection kit (`../selection-kit`), which the select
 * list, vertical tabs, menus and toolbars share.
 * ============================================================================
 *
 * The same API as `@carbon/react`'s ContentSwitcher / Switch / IconSwitch:
 * `selectedIndex`, `activation` ('automatic' | 'manual'), `size`,
 * `lowContrast`, `onChange({ index, name, text, key })`, disabled switches,
 * icon-only switches with a tooltip, `role="tablist"` / `role="tab"` with a
 * roving tab stop (the kit's `useSelectionList`), and ← / → that wrap and
 * follow the reading direction. A switch takes an `id` and the
 * `aria-controls` of the panel it shows, as v11's passes them on.
 *
 * The kit adds:
 *
 *   look        a selector with concentric corners inside an 8px track, no
 *               dividers; `inverse` (default), `tonal`, `outlined`
 *   glide       the selector travels from where it is (motion-core
 *               `attachSelection`), its duration from the distance, its
 *               leading edge ahead; labels change color where it covers them
 *   press       the pressed switch takes a flat pressed color, inset 1px,
 *               while held; a grabbed selector insets 1px (`pressColor`)
 *   reach       a press on another switch starts the selector toward it;
 *               sliding off cancels, sliding to another switch retargets
 *   drag        on by default: the selector can be dragged and lands on the
 *               nearest switch, stopping at the walls with a 4px squash
 *   hover       the rollover glow and a label color step on unselected
 *               switches; motion icons play on hover
 *   tooltip     icon switches' tooltips: the first snaps in from the pointer
 *               (the kit's createTooltip — container from the cursor, text
 *               offset on one axis), then it jumps from switch to switch
 *               while shown (stillness); hoverable (WCAG 1.4.13)
 *   weight      `selectedWeight` (500 by default), windowed like the color
 *   timing      40 / 80 / 120 / 160ms by travel, on standard-productive
 *   icons       icon + text switches (`renderIcon`); 16px icons (20 at lg)
 *   keyboard    Home / End; arrows skip disabled switches
 *   size        `xs` (24px) beside v11's sm / md / lg; `fit="fill"` for v11's
 *               equal widths, `hug` (default) to size by label
 *   panels      the kit's `SelectionPanels`: the content swap, traveling with
 *               the selector; each switch's `aria-controls` names its panel
 *   loading     `loading`: the switches are loading — placeholder switches
 *               in the switch's own box, the label a bar (`skeletonCount`,
 *               default the switches on screen, else 3; `skeletonLabels`;
 *               `skeletonIcon`, and with no labels icon-only placeholders),
 *               taken in order as one reflow along x (the kit's
 *               `useSelectionLoading`, the loading standard's structure tier)
 * ========================================================================== */

export interface SwitchEventHandlersParams {
  index?: number;
  name?: string | number;
  text?: string;
  key?: string | number;
}

export interface SwitchProps {
  /** The label. `children` wins when both are given (as in v11). */
  text?: string;
  /**
   * An icon before the label (Carbon's `renderIcon` convention —
   * a component, such as a motion icon). Drawn at the switcher's icon size;
   * a motion icon plays on the switch's hover.
   */
  renderIcon?: ElementType;
  /** Passed back in `onChange`. */
  name?: string | number;
  disabled?: boolean;
  /** Why it's disabled: the arrow keys still reach it, and it shows this in a tooltip. */
  disabledReason?: string;
  children?: ReactNode;
  className?: string;
  /** The switch's id: a panel's `aria-labelledby` names it. */
  id?: string;
  /** The id of the panel this switch shows. */
  'aria-controls'?: string;
}

/** A labeled switch. Read by `ContentSwitcher`; renders nothing on its own. */
export function Switch(_props: SwitchProps): null {
  return null;
}
Switch.displayName = 'Switch';

export interface IconSwitchProps {
  /** The tooltip, and the switch's accessible name. */
  text: string;
  name?: string | number;
  disabled?: boolean;
  /** Why it's disabled: the arrow keys still reach it, and it shows this in a tooltip. */
  disabledReason?: string;
  /** The icon — a motion icon plays on the switch's hover. Drawn at the switcher's icon size. */
  children?: ReactNode;
  /** The icon as a component, instead of `children`. */
  renderIcon?: ElementType;
  className?: string;
  /** Where the tooltip sits. Default `top` (v11's IconButton). */
  align?: 'top' | 'bottom';
  /** The switch's id: a panel's `aria-labelledby` names it. */
  id?: string;
  /** The id of the panel this switch shows. */
  'aria-controls'?: string;
}

/** An icon-only switch with a tooltip. Read by `ContentSwitcher`; renders nothing on its own. */
export function IconSwitch(_props: IconSwitchProps): null {
  return null;
}
IconSwitch.displayName = 'IconSwitch';

/** The switcher's motion dials — the selection kit's. */
export type SwitcherMotion = SelectionMotion;
export const SWITCHER_MOTION: SwitcherMotion = SELECTION_KIT_MOTION;

export interface ContentSwitcherProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'>,
    SelectionStyleProps,
    SelectionLoadingProps {
  /** `Switch` and `IconSwitch` elements. */
  children?: ReactNode;
  className?: string;
  /** @deprecated in v11 for `Layer`; accepted and ignored. */
  light?: boolean;
  onChange: (params: SwitchEventHandlersParams) => void;
  /** The selected switch. Follows changes to the prop, as v11 does. */
  selectedIndex?: number;
  // @carbon-proposal api: activation-prop — One keyboard word, `activation` (automatic or manual), on every selection list: the arrows select, or only move focus. TBD
  /** `automatic` (default): arrows select. `manual`: arrows move focus; Enter / Space select. */
  activation?: KeyboardMode;
  /** `hug` (default): each switch sized by its label. `fill`: v11's equal widths across the container. */
  fit?: 'hug' | 'fill';
  /** Motion dials; omitted keys take `SWITCHER_MOTION`. */
  motion?: Partial<SwitcherMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called as each glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
}

interface Item {
  kind: 'text' | 'icon';
  /** Text switches: an icon before the label. */
  Icon?: ElementType;
  key: string;
  name?: string | number;
  text?: string;
  disabled: boolean;
  /** Disabled with a reason: reachable by the arrow keys, the reason in a tooltip. */
  reason?: string;
  content: ReactNode;
  className?: string;
  align: 'top' | 'bottom';
  id?: string;
  controls?: string;
}

function readItems(children: ReactNode): Item[] {
  const out: Item[] = [];
  Children.toArray(children).forEach((child, i) => {
    if (!isValidElement(child)) return;
    const key = String(child.key ?? i);
    if (isComponentType(child.type, IconSwitch)) {
      const p = child.props as IconSwitchProps;
      const content = p.renderIcon ? (
        <p.renderIcon aria-hidden="true" />
      ) : (
        p.children
      );
      out.push({
        kind: 'icon',
        key,
        name: p.name,
        text: p.text,
        disabled: !!p.disabled,
        reason: p.disabled ? p.disabledReason || undefined : undefined,
        content,
        className: p.className,
        align: p.align ?? 'top',
        id: p.id,
        controls: p['aria-controls'],
      });
    } else if (isComponentType(child.type, Switch)) {
      const p = child.props as SwitchProps;
      out.push({
        kind: 'text',
        key,
        name: p.name,
        text: p.text,
        Icon: p.renderIcon,
        disabled: !!p.disabled,
        reason: p.disabled ? p.disabledReason || undefined : undefined,
        content: p.children ?? p.text,
        className: p.className,
        align: 'top',
        id: p.id,
        controls: p['aria-controls'],
      });
    }
  });
  return out;
}

const ITEM = '.sel__item';

interface SwitchItemProps {
  it: Item;
  index: number;
  selected: boolean;
  /** The list's one tab stop. */
  tabStop: boolean;
  /** Stable: the list model's attributes for a switch. */
  itemProps: (index: number, state: SelectionItemState) => SelectionItemProps;
  /** Loading: the placeholder key the switch took over, and its takeover number. */
  entryKey?: string;
  took?: number;
  takenLabel?: string;
  skeletonIcon: boolean;
  skeletonIconOnly: boolean;
  /** Stable (the switcher's `useCallback`): a click with no pointer behind it selects. */
  commit: (index: number) => void;
  /** Stable: records the switch's element by index. */
  setRef: (index: number, el: HTMLButtonElement | null) => void;
}

/**
 * One switch. Memoized, as a list re-renders only the rows that changed: a
 * parent's render (another switcher on the page selecting,
 * the page's state changing) re-renders only the switches whose own props
 * changed. Its face is compared by `sameNode` (a label, or an icon element
 * of the same type and props), since the parent makes it afresh each render.
 */
const SwitchItem = memo(function SwitchItem({
  it,
  index: i,
  selected: isSel,
  tabStop,
  itemProps,
  entryKey,
  took,
  takenLabel,
  skeletonIcon,
  skeletonIconOnly,
  commit,
  setRef,
}: SwitchItemProps) {
  // Disabled with a reason: the arrow keys reach it, and its focus or hover shows why.
  const reason = useDisabledReason(it.disabled, it.reason, { align: it.align });
  const face =
    it.kind === 'icon' ? (
      it.content
    ) : (
      <>
        {it.Icon && <it.Icon aria-hidden="true" />}
        <span className="sel__text">{it.content}</span>
      </>
    );
  const btn = (
    <button
      {...rowStructureProps(entryKey, took)}
      ref={(el) => {
        setRef(i, el);
        reason.anchorProps.ref?.(el);
      }}
      type="button"
      {...itemProps(i, {
        selected: isSel,
        tabStop,
        id: it.id,
        controls: it.controls,
      })}
      aria-label={it.kind === 'icon' ? it.text : undefined}
      disabled={it.disabled && !reason.active}
      aria-disabled={reason.controlProps['aria-disabled']}
      aria-describedby={reason.describedBy()}
      onPointerEnter={reason.anchorProps.onPointerEnter}
      onPointerLeave={reason.anchorProps.onPointerLeave}
      onFocus={reason.controlProps.onFocus}
      onBlur={reason.controlProps.onBlur}
      // The whole switch is its icon's hover frame: hovering (or focusing)
      // anywhere on it plays a motion icon.
      {...(it.kind === 'icon' || it.Icon
        ? { 'data-motion-icon-frame': '' }
        : null)}
      className={[
        'sel__item',
        it.kind === 'icon' && 'sel__item--icon',
        it.className,
      ]
        .filter(Boolean)
        .join(' ')}
      // Pointer selections happen on pointerup (they can slide or drag);
      // a click with no pointer behind it (Enter, Space, assistive tech) selects here.
      onClick={(e) => {
        if (e.detail === 0 && !reason.active) commit(i);
      }}>
      <SelectionFaces>{face}</SelectionFaces>
      {took !== undefined && (
        <SelectionTakenFace
          key={`taken-${took}`}
          label={takenLabel ?? ''}
          icon={skeletonIcon}
          iconOnly={skeletonIconOnly}
        />
      )}
    </button>
  );
  // The reason's tooltip beside the switch, never in it (its text would join the switch's name).
  return reason.active ? (
    <>
      {btn}
      {reason.tooltip}
    </>
  ) : (
    btn
  );
}, sameSwitch);

const sameItem = (a: Item, b: Item) =>
  a === b ||
  (a.kind === b.kind &&
    a.key === b.key &&
    a.name === b.name &&
    a.text === b.text &&
    a.disabled === b.disabled &&
    a.reason === b.reason &&
    a.className === b.className &&
    a.align === b.align &&
    a.id === b.id &&
    a.controls === b.controls &&
    a.Icon === b.Icon &&
    sameNode(a.content, b.content));

function sameSwitch(a: SwitchItemProps, b: SwitchItemProps): boolean {
  return (
    a.index === b.index &&
    a.selected === b.selected &&
    a.tabStop === b.tabStop &&
    a.itemProps === b.itemProps &&
    a.entryKey === b.entryKey &&
    a.took === b.took &&
    a.takenLabel === b.takenLabel &&
    a.skeletonIcon === b.skeletonIcon &&
    a.skeletonIconOnly === b.skeletonIconOnly &&
    a.commit === b.commit &&
    a.setRef === b.setRef &&
    sameItem(a.it, b.it)
  );
}

/** A switcher's typical labels while its switches load (cycled): short, as switch labels are. */
const SWITCHER_SKELETON_LABELS: readonly string[] = [
  'Option',
  'Option two',
  'Third',
];

export function ContentSwitcher({
  children,
  className,
  light: _light,
  lowContrast,
  variant,
  onChange,
  selectedIndex: selectedIndexProp = 0,
  activation = 'automatic',
  size = 'md',
  fit = 'hug',
  corners,
  interaction,
  contour,
  outlinedFill,
  selectorGlow,
  outline,
  motion: motionProp,
  timeScale,
  onMove,
  selectedWeight,
  holdWidth = true,
  loading,
  skeletonCount,
  skeletonLabels = SWITCHER_SKELETON_LABELS,
  skeletonIcon = false,
  ...rest
}: ContentSwitcherProps) {
  const motion = useWithTimeScale(motionProp, timeScale);
  const items = readItems(children);
  const m: SwitcherMotion = { ...SWITCHER_MOTION, ...motion };
  const style = resolveSelectionStyle(
    {
      variant,
      lowContrast,
      size,
      corners,
      interaction,
      contour,
      outlinedFill,
      selectedWeight,
      selectorGlow,
      outline,
    },
    m
  );

  const [selected, setSelected] = useState(selectedIndexProp);
  const prevProp = useRef(selectedIndexProp);
  useEffect(() => {
    if (prevProp.current !== selectedIndexProp) {
      prevProp.current = selectedIndexProp;
      setSelected(selectedIndexProp);
    }
  }, [selectedIndexProp]);

  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const setItemRef = useCallback((i: number, el: HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  }, []);
  // Loading switches: the structure tier along x (placeholder switches, taken in order).
  const load = useSelectionLoading(
    rootRef,
    { loading, skeletonCount, skeletonLabels },
    items.length,
    3,
    {
      timeScale: m.timeScale,
      axis: 'inline',
      labels: items.map(
        (it) => it.text ?? (typeof it.content === 'string' ? it.content : '')
      ),
    }
  );
  // `skeletonIcon` with no labels: icon-only placeholders.
  const skeletonIconOnly = skeletonIcon && skeletonLabels.length === 0;
  const reduced = usePrefersReducedMotion();
  const reducedRef = useLatest(reduced);
  const mRef = useLatest(m);
  const selectedRef = useLatest(selected);
  const itemsRef = useLatest(items);
  const onChangeRef = useLatest(onChange);

  /* ── the selection ──────────────────────────────────────────────────── */

  const layoutKey = `${items.map((it) => it.key).join('|')}/${size}/${fit}/${load.busy ? 'busy' : ''}${load.standing.length}`;
  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced,
    onMove,
    getRest: () => itemRefs.current[selectedRef.current] ?? null,
    layoutKey,
  });

  useSelectedWeight(rootRef, {
    weight: style.selectedWeight,
    holdWidth,
    itemSelector: ITEM,
    key: layoutKey,
  });
  useIconPixelSnap(rootRef, '.sel__face svg', layoutKey);

  // A selection from anywhere (a click, a key, the prop) glides there — unless
  // the gesture that made it already sent the selector on its way.
  useLayoutEffect(() => {
    const sel = selRef.current;
    const el = itemRefs.current[selected];
    // Loading: nothing is marked until the selected switch lands; then the
    // selector arrives on it (the family's arrival, from 90%).
    if (sel && el && load.active && !sel.shown()) sel.show(el);
    else if (sel && el && sel.target() !== el) sel.moveTo(el);
  }, [selected, selRef, load.active, load.busy]);

  // The switch a move lands on keeps its hover round the selector until it
  // has landed (selection-kit `useLandingHold`, `data-landing`).
  const hold = useLandingHold({
    root: () => rootRef.current,
    sel: () => selRef.current,
    reduced: () => reducedRef.current,
  });
  const commit = useCallback(
    (index: number, key?: string, how: LandingHold = 'hover-focus') => {
      const item = itemsRef.current[index];
      const el = itemRefs.current[index];
      if (!item || item.disabled || !el) return;
      hold(el, selRef.current?.moveTo(el), how);
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      setSelected(index);
      onChangeRef.current({
        index,
        name: item.name,
        text: item.text,
        ...(key ? { key } : null),
      });
    },
    [itemsRef, selRef, selectedRef, onChangeRef, hold]
  );

  /* ── hover, press, drag ─────────────────────────────────────────────── */

  useItemRollover(rootRef, {
    selector: rolloverItems(ITEM, style),
    itemSelector: ITEM,
    press: m.pressColor,
    preview: style.preview,
    timeScale: m.timeScale,
    reduced: reducedRef,
  });

  const { onPointerDown: gestureDown, gesture } = useSelectionGesture({
    rootRef,
    selRef,
    axis: 'x',
    items: () => itemRefs.current,
    isDisabled: (i) => !!itemsRef.current[i]?.disabled,
    selected: () => selectedRef.current,
    motion: () => mRef.current,
    // A press holds its switch's hover; a drag of the selector had none.
    commit: (i) => commit(i, undefined, grabbed.current ? 'none' : 'hover'),
    onPress: () => tipRef.current?.hide(true),
  });
  /** The gesture started on the selected switch: a grab (and maybe a drag) of the selector. */
  const grabbed = useRef(false);

  /* ── keyboard ────────────────────────────────────────────────────────── */

  // The tablist's contract, its tab stop and its keys (right to left included).
  const list = useSelectionList({
    role: 'tablist',
    selected,
    count: items.length,
    // A switch that says why it's off stays in the arrow keys' path.
    isDisabled: (i) => !!items[i]?.disabled && !items[i]?.reason,
    activation,
    focus: (i) => itemRefs.current[i]?.focus(),
    // Its focus only just arrived: only a resting pointer's hover is held.
    select: (i, key) => commit(i, key, 'hover'),
  });

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn) return;
    if (e.key === 'Escape' && !isComposing(e))
      return tipRef.current?.hide(true);
    list.onKeyDown(e, Number(btn.dataset.index));
  };

  /* ── the tooltip (icon switches) ─────────────────────────────────────── */

  const tipElRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<TooltipController | null>(null);
  useEffect(() => {
    if (!tipElRef.current) return;
    const t = createTooltip(tipElRef.current, {
      reduced: () => reducedRef.current,
    });
    tipRef.current = t;
    return () => {
      t.destroy();
      tipRef.current = null;
    };
  }, [reducedRef]);
  // Slow motion reaches the tooltip too.
  useEffect(() => {
    tipRef.current?.configure({ timeScale: m.timeScale });
  }, [m.timeScale]);

  const showTip = (index: number, pointer: { x: number; y: number } | null) => {
    const item = itemsRef.current[index];
    const btn = itemRefs.current[index];
    const sel = selRef.current;
    // A switch with a reason shows the reason's tooltip instead.
    if (!item || item.kind !== 'icon' || item.reason || !btn || !sel) return;
    tipRef.current?.show({
      key: item.key,
      text: item.text ?? '',
      anchor: sel.rectOf(btn),
      align: item.align,
      pointer,
    });
  };

  const onPointerOver = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (gesture.current?.mode === 'drag') return;
    // On the tooltip itself (hoverable, WCAG 1.4.13): it stays. It is a child
    // of the root, so leaving it is the root's pointerleave — it leaves then.
    if (tipElRef.current?.contains(e.target as Node))
      return tipRef.current?.hold({ x: e.clientX, y: e.clientY });
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn) return;
    const index = Number(btn.dataset.index);
    if (itemsRef.current[index]?.kind === 'icon')
      showTip(index, { x: e.clientX, y: e.clientY });
    else tipRef.current?.hide(false, { x: e.clientX, y: e.clientY });
  };

  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn || !btn.matches(':focus-visible')) return;
    showTip(Number(btn.dataset.index), null);
  };

  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null))
      tipRef.current?.hide(true);
  };

  /* ── render ──────────────────────────────────────────────────────────── */

  const iconOnly = load.busy
    ? skeletonIconOnly
    : items.length > 0 && items.every((it) => it.kind === 'icon');
  const classes = [
    ...style.classes,
    'cs',
    `sel--${fit}`,
    iconOnly && 'sel--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...rest}
      ref={rootRef}
      className={classes}
      style={
        style.selectedWeight != null
          ? {
              ...rest.style,
              ['--sel-on-weight' as string]: style.selectedWeight,
            }
          : rest.style
      }
      {...list.listProps}
      aria-busy={load.busy || undefined}
      onPointerDown={(e) => {
        grabbed.current = !!(e.target as Element).closest(
          `${ITEM}[aria-selected="true"]`
        );
        gestureDown(e, ITEM);
      }}
      onPointerOver={onPointerOver}
      onPointerLeave={(e) =>
        tipRef.current?.hide(false, { x: e.clientX, y: e.clientY })
      }
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}>
      <SelectionMarker />
      {items.map((it, i) => {
        // Loading switches: only those the structure has committed, under their placeholder's key.
        const entry = load.active ? load.rowEntry(i) : undefined;
        if (load.active && !entry) return null;
        const took = entry ? load.took(entry.key) : undefined;
        return (
          <SwitchItem
            key={entry?.key ?? it.key}
            it={it}
            index={i}
            selected={i === selected}
            tabStop={i === list.tabStop}
            itemProps={list.itemProps}
            entryKey={entry?.key}
            took={took}
            takenLabel={took !== undefined ? load.labelFor(i) : undefined}
            skeletonIcon={skeletonIcon}
            skeletonIconOnly={skeletonIconOnly}
            commit={commit}
            setRef={setItemRef}
          />
        );
      })}
      {load.standing.map((e) => (
        <button
          key={e.key}
          type="button"
          {...skeletonRowProps(e.key)}
          className={['sel__item', skeletonIconOnly && 'sel__item--icon']
            .filter(Boolean)
            .join(' ')}>
          <SelectionSkeletonFace
            label={load.labelFor(e.slot)}
            icon={skeletonIcon}
            iconOnly={skeletonIconOnly}
          />
        </button>
      ))}
      <div
        className="sel__tip sel__tip--hoverable"
        ref={tipElRef}
        hidden
        aria-hidden="true">
        <span className="sel__tip-frame" {...SNAP_FRAME} />
        <span className="sel__tip-text" />
      </div>
    </div>
  );
}
ContentSwitcher.displayName = 'ContentSwitcher';
