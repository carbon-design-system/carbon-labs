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
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';
import {
  MenuItemGroup,
  MenuItemRadioGroup,
  MenuItemSelectable,
} from '@carbon-labs/react-menu';
import { useStillTrigger } from '@carbon-labs/react-tooltip';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  isComponentType,
  resolveSelectionStyle,
  useDefaultFrame,
  rolloverItems,
  useItemRollover,
  useLatest,
  useSelectionEngine,
  useSelectionGesture,
  type SelectionSize,
} from '@carbon-labs/react-selection-kit';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  TooltipGroupContext,
  useTooltipTrigger,
} from '@carbon-labs/v12-motion';
import {
  ToggleGroupContext,
  iconPx,
  useToolbar,
  type ToggleGroupContextValue,
  type ToolbarGroupFrame,
} from './context';
import { ToolbarToggle, type ToolbarToggleProps } from './ToolbarButton';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './toolbar.scss';
import { TOOLTIP_LEAVE_LABEL_MS } from '@carbon-labs/react-tooltip';

/* ============================================================================
 * ToolbarToggleGroup: toggles that belong together.
 *
 *   single    a compact selection track (`radiogroup`): the content switcher's
 *             selector, gliding by travel, the reach on press, drag; `frame`
 *             inset (a track) or ghost (none)
 *   multiple  each toggle keeps its own pressed fill (`group`)
 *   keys      arrows move focus without choosing; Enter / Space choose
 *   overflow  a radio group, or a group of checkable items, in the more menu
 * ========================================================================== */

/** The group's name: `label`. */
type GroupName = {
  /** The group's name (`aria-label`, and its heading in the overflow menu). */
  label: string;
};

interface CommonProps {
  /** The group's name. */
  label: string;
  /** ToolbarToggle elements, each with a `value` (default: its label). */
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SingleProps extends CommonProps {
  type: 'single';
  /** Controlled: the chosen toggle's value. */
  value?: string;
  /** Default: the first enabled toggle (an exclusive group always has one chosen). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** `inset` (the switcher's track) or `ghost` (no track). Default: the toolbar's `groupFrame` (`inset`). */
  frame?: ToolbarGroupFrame;
}

interface MultipleProps extends CommonProps {
  type: 'multiple';
  /** Controlled: the pressed toggles' values. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type ToolbarToggleGroupSingleProps = Omit<SingleProps, 'label'> &
  GroupName;
export type ToolbarToggleGroupMultipleProps = Omit<MultipleProps, 'label'> &
  GroupName;
export type ToolbarToggleGroupProps =
  | ToolbarToggleGroupSingleProps
  | ToolbarToggleGroupMultipleProps;

export function ToolbarToggleGroup(props: ToolbarToggleGroupProps) {
  const { label } = props;
  return props.type === 'single' ? (
    <SingleToggleGroup {...props} label={label} />
  ) : (
    <MultipleToggleGroup {...props} label={label} />
  );
}
ToolbarToggleGroup.displayName = 'ToolbarToggleGroup';

/* ── the toggles, read from the children ───────────────────────────────── */

interface Toggle {
  key: string;
  value: string;
  label: string;
  Icon?: ElementType;
  icon?: ReactNode;
  showLabel: boolean;
  disabled: boolean;
}

function readToggles(children: ReactNode): Toggle[] {
  const out: Toggle[] = [];
  Children.toArray(children).forEach((child, i) => {
    if (!isValidElement(child) || !isComponentType(child.type, ToolbarToggle))
      return;
    const p = child.props as ToolbarToggleProps;
    const hasIcon = !!p.renderIcon || p.children != null;
    out.push({
      key: String(child.key ?? i),
      value: p.value ?? p.label,
      label: p.label,
      Icon: p.renderIcon,
      icon: p.children,
      showLabel: p.showLabel ?? !hasIcon,
      disabled: !!p.disabled,
    });
  });
  return out;
}

/* ── multiple ──────────────────────────────────────────────────────────── */

function MultipleToggleGroup({
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  children,
  className,
}: MultipleProps) {
  const register = useToolbar()?.register;
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const current = value ?? inner;
  const latest = useLatest({
    current,
    controlled: value !== undefined,
    onChange,
    label,
    children,
    disabled,
  });

  const toggle = useCallback(
    (v: string) => {
      const { current: cur, controlled, onChange: cb } = latest.current;
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      if (!controlled) setInner(next);
      cb?.(next);
    },
    [latest]
  );

  const ctx = useMemo<ToggleGroupContextValue>(
    () => ({ isPressed: (v) => current.includes(v), toggle, disabled }),
    [current, toggle, disabled]
  );

  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      register?.({
        el: () => ref.current,
        menu: (key) => {
          const p = latest.current;
          return (
            <MenuItemGroup key={key} label={p.label}>
              {readToggles(p.children).map((t) => (
                <MenuItemSelectable
                  key={t.key}
                  label={t.label}
                  renderIcon={t.Icon}
                  disabled={p.disabled || t.disabled}
                  selected={p.current.includes(t.value)}
                  onChange={() => toggle(t.value)}
                />
              ))}
            </MenuItemGroup>
          );
        },
      }),
    [register, latest, toggle]
  );

  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={['cds-toolbar__group', className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

/* ── single: the selection track ───────────────────────────────────────── */

const ITEM = '.sel__item';

const GROUP_FRAMES = ['inset', 'ghost'] as const;

function SingleToggleGroup({
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  children,
  className,
  frame,
}: SingleProps) {
  const tb = useToolbar();
  const items = readToggles(children);
  const size: SelectionSize = tb?.size ?? 'md';
  const orientation = tb?.orientation ?? 'horizontal';
  // Its own frame, else the toolbar's, else a Region's default. Inset is a layer wherever
  // it is: its track, a rounded box (toolbar.scss).
  const look = useDefaultFrame(frame ?? tb?.groupFrame, GROUP_FRAMES, 'inset');
  const m = tb?.motion ?? SELECTION_KIT_MOTION;
  // Outside a Toolbar, the MotionProvider's or the OS's setting.
  const prefersReduced = usePrefersReducedMotion();
  const reduced = tb?.reduced ?? prefersReduced;
  // The track's opt-in hairline is an inset group's only (a ghost group has no track; not `.sel--ghost`, so not via `frame`).
  const style = resolveSelectionStyle(
    {
      ...tb?.style,
      outline: look === 'inset' && tb?.style.outline,
      size,
      orientation,
      selectedWeight: false,
    },
    m
  );

  const [inner, setInner] = useState<string | undefined>(
    () => defaultValue ?? items.find((it) => !it.disabled)?.value
  );
  const current = value ?? inner;
  const selected = Math.max(
    0,
    items.findIndex((it) => it.value === current)
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedRef = useLatest(reduced);
  const mRef = useLatest(m);
  const selectedRef = useLatest(selected);
  const itemsRef = useLatest(items);
  const latest = useLatest({
    controlled: value !== undefined,
    onChange,
    label,
    disabled,
  });
  const tipGroup = useContext(TooltipGroupContext);

  const setItemRef = useCallback((i: number, el: HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  }, []);

  /* ── the selection (as the content switcher's) ──────────────────────── */

  const layoutKey = `${items.map((it) => it.key).join('|')}/${size}/${orientation}/${look}`;
  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced,
    getRest: () => itemRefs.current[selectedRef.current] ?? null,
    layoutKey,
  });

  // A selection from anywhere (a click, a key, the prop, the overflow menu)
  // glides there, unless the gesture that made it already sent it.
  useLayoutEffect(() => {
    const sel = selRef.current;
    const el = itemRefs.current[selected];
    if (sel && el && sel.target() !== el) sel.moveTo(el);
  }, [selected, selRef]);

  const isOff = useCallback(
    (i: number) => latest.current.disabled || !!itemsRef.current[i]?.disabled,
    [latest, itemsRef]
  );

  const commit = useCallback(
    (index: number) => {
      const item = itemsRef.current[index];
      const el = itemRefs.current[index];
      if (!item || isOff(index) || !el) return;
      selRef.current?.moveTo(el);
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      if (!latest.current.controlled) setInner(item.value);
      latest.current.onChange?.(item.value);
    },
    [itemsRef, isOff, selRef, selectedRef, latest]
  );

  /* ── hover, press, drag ─────────────────────────────────────────────── */

  useItemRollover(rootRef, {
    selector: rolloverItems(ITEM, style, 'aria-checked'),
    itemSelector: ITEM,
    press: m.pressColor,
    preview: style.preview,
    timeScale: m.timeScale,
    reduced: reducedRef,
  });

  const { onPointerDown } = useSelectionGesture({
    rootRef,
    selRef,
    axis: orientation === 'vertical' ? 'y' : 'x',
    items: () => itemRefs.current,
    isDisabled: isOff,
    selected: () => selectedRef.current,
    motion: () => mRef.current,
    commit,
    onPress: () => tipGroup?.surface.hide(true),
  });

  /* ── the overflow menu's entry ──────────────────────────────────────── */

  const register = tb?.register;
  useLayoutEffect(() => {
    return register?.({
      el: () => rootRef.current,
      menu: (key) => {
        const list = itemsRef.current;
        const chosen = list[selectedRef.current]?.value;
        return (
          <MenuItemRadioGroup<string>
            key={key}
            label={latest.current.label}
            items={list.filter((_, i) => !isOff(i)).map((it) => it.value)}
            selectedItem={chosen}
            itemToString={(v) => list.find((it) => it.value === v)?.label ?? v}
            onChange={(v) => commit(list.findIndex((it) => it.value === v))}
          />
        );
      },
    });
  }, [register, itemsRef, selectedRef, latest, isOff, commit]);

  /* ── render ──────────────────────────────────────────────────────────── */

  const iconOnly = items.length > 0 && items.every((it) => !it.showLabel);
  const classes = [
    ...style.classes,
    'cds-toolbar__track',
    look === 'ghost' && 'cds-toolbar__track--ghost',
    iconOnly && 'sel--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={label}
      className={classes}
      onPointerDown={(e) => onPointerDown(e, ITEM)}>
      <SelectionMarker />
      {items.map((it, i) => (
        <TrackToggle
          key={it.key}
          item={it}
          index={i}
          size={size}
          checked={i === selected}
          disabled={disabled || it.disabled}
          setItemRef={setItemRef}
          onActivate={() => commit(i)}
        />
      ))}
    </div>
  );
}

/** One toggle of an exclusive group: a kit switch with its two faces, a radio, a tooltip trigger in the toolbar's group. */
function TrackToggle({
  item,
  index,
  size,
  checked,
  disabled,
  setItemRef,
  onActivate,
}: {
  item: Toggle;
  index: number;
  size: SelectionSize;
  checked: boolean;
  disabled: boolean;
  setItemRef: (index: number, el: HTMLButtonElement | null) => void;
  onActivate: () => void;
}) {
  const iconOnly = !item.showLabel;
  const { props: trigger, tooltip } = useTooltipTrigger({
    label: iconOnly ? item.label : undefined,
    enterDelayMs: 100,
    leaveDelayMs: TOOLTIP_LEAVE_LABEL_MS,
    closeOnActivation: true,
    disabled: disabled || !iconOnly,
  });
  // A button that comes under a resting pointer shows no tooltip until it moves.
  const gated = useStillTrigger(trigger);
  // One stable ref: the tooltip's (its first callback serves for good) and the group's list.
  const [triggerRef] = useState(() => trigger.ref);
  const setRef = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerRef(el);
      setItemRef(index, el);
    },
    [triggerRef, setItemRef, index]
  );

  const Icon = item.Icon;
  const icon = Icon ? (
    <Icon size={iconPx(size)} aria-hidden="true" />
  ) : (
    item.icon
  );
  const face = iconOnly ? (
    icon
  ) : (
    <>
      {icon}
      <span className="sel__text">{item.label}</span>
    </>
  );
  const hasIcon = icon != null;

  return (
    <>
      <button
        ref={setRef}
        type="button"
        role="radio"
        aria-checked={checked}
        aria-labelledby={trigger['aria-labelledby']}
        data-tooltip-trigger={trigger['data-tooltip-trigger']}
        tabIndex={-1}
        data-toolbar-stop=""
        disabled={disabled}
        data-index={index}
        // The whole switch is its icon's hover frame.
        {...(hasIcon ? { 'data-motion-icon-frame': '' } : null)}
        className={['sel__item', iconOnly && 'sel__item--icon']
          .filter(Boolean)
          .join(' ')}
        onPointerEnter={(e) => {
          // While the selector is dragged, the tooltip stays put.
          if (!e.currentTarget.closest('[data-dragging]'))
            gated.onPointerEnter(e);
        }}
        onPointerLeave={gated.onPointerLeave}
        onFocus={trigger.onFocus}
        onBlur={trigger.onBlur}
        onKeyDown={trigger.onKeyDown}
        // Pointer selections happen on pointerup (they can slide or drag); a
        // click with no pointer behind it — Enter, Space, assistive tech — selects here.
        onClick={(e) => {
          trigger.onClick(e);
          if (e.detail === 0) onActivate();
        }}>
        <SelectionFaces>{face}</SelectionFaces>
      </button>
      {tooltip}
    </>
  );
}
