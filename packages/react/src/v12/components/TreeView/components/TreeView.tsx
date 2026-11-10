/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  createContext,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { flushSync } from 'react-dom';
import {
  usePrefersReducedMotion,
  type Selection,
} from '@carbon-labs/v12-motion';
import { CaretDown } from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  createTypeahead,
  resolveSelectionStyle,
  rolloverItems,
  sameNode,
  useIconPixelSnap,
  useItemRollover,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionGesture,
  useSelectionJump,
  type SelectionMotion,
  type SelectionVariant,
} from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import {
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { transitionOf } from '@carbon-labs/react-disclosure';
import { ROW_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { Checkbox } from '@carbon-labs/react-checkbox';
import {
  mixedState,
  mixedToggleTo,
  type MixedState,
} from '@carbon-labs/react-selection-kit';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tree-view.scss';
import { cx } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';
import { inlineKey } from '@carbon-labs/react-util';

/* ============================================================================
 * TreeView and TreeNode — Carbon v11's, prop for prop, on the kit's look
 * and motion.
 *
 *   structure v11's: a `<ul role="tree">` of `<li role="treeitem">` nodes, a
 *             parent's children in a `<ul role="group">` inside it; the node
 *             (the `li`) takes focus, its row is what you see and press
 *   marker    the selection kit's selector (the select list's), on the
 *             selected node's row, single select only. Between two leaves of
 *             one group it glides: one clock for all four edges from the
 *             longest travel, the leading edge ahead, labels taking the
 *             selected face where it covers them
 *   jump      every other move jumps, glides only within a group: to
 *             another parent or depth, and to or from a
 *             group's row, two groups side by side included. The side nav's
 *             jump from the selection kit (jump.ts): the old marker shrinks
 *             4px and is gone, then the new one grows in from 4px small, on
 *             fast-01, a third out and two thirds in. The new row keeps its
 *             hover round the marker until it lands (a glide's too), and on a
 *             jump that hover shrinks with the old marker. The pointer, the
 *             keyboard and a change from outside (`selected`, `active`) take
 *             the same rule. Reduced: there at once
 *   many      `multiselect`: no marker (a selector moving round checked
 *             boxes is unexpected). Every selected
 *             node is its checkbox and the selected wash, the data table's
 *             rule for selected rows; the focus ring shows where the
 *             keyboard is; the active node (v11's `active`) has no mark of
 *             its own: it's `aria-current` and the tab stop. A checkbox on
 *             every row, after the caret: the kit's Checkbox, checked when
 *             the node is selected; a click anywhere on the row toggles the
 *             node (as MultiSelect's listbox does; v11
 *             selects the node alone), the caret still only opens and shuts.
 *             The node keeps the focus and `aria-selected`; the box is hidden
 *             from assistive tech and takes no focus
 *   mixed     multiselect: a parent's box is its children's (the selection
 *             kit's mixed rule, selection-kit/mixed.ts): all checked, checked;
 *             some, mixed (the Checkbox's `indeterminate`, the dash); none,
 *             unchecked. Toggling a parent sets every enabled node under it:
 *             a mixed or unchecked parent selects them all (Carbon's
 *             checkbox), a checked one clears them. Disabled nodes aren't
 *             counted and aren't changed. A parent in `selected` counts as
 *             all its enabled nodes selected
 *   press     the reach toward the pressed row, slide to retarget, slide
 *             off to cancel (the kit's gesture); no drag
 *   double    a double-click on a parent's row opens or shuts it, as in file
 *             trees; its first click selects, as any
 *             click. Multiselect: the second click doesn't toggle the node
 *             back, so a double-click toggles it once and opens it. Not on the
 *             caret (its two clicks toggled already) or the checkbox (two
 *             clicks are two toggles). v11 has none
 *   hover     the kit's rollover and label step on every row
 *   disclosure  a parent's children open and shut on the disclosure module:
 *             the travel's step (shutting one step faster), the children
 *             coming down 8px with the opening from half the open, the soft
 *             edge closing over them on the way out. Every node that changes
 *             in one commit is one motion on the tree. The caret turns on
 *             the same clock and curve
 *   folded    shutting a parent over the selected node takes the marker
 *             with the row, at once (it would hang over the rows moving up
 *             under it); opening it again, the marker arrives on the row
 *             once the children have landed
 *   keyboard  v11's: ↑ ↓ between visible nodes, Home / End, → opens or
 *             goes to the first child, ← shuts or goes to the parent,
 *             Enter / Space select (Enter also toggles a parent), type-ahead;
 *             multiselect: Space or a click toggles a node (its checkbox),
 *             Enter selects it alone,
 *             Ctrl + A selects every visible node, Ctrl + Shift + Home / End
 *             selects to the end. One tab stop
 *   reduced   no travel: open or shut at once, the children fading in; the
 *             marker fades at the new node while a ghost fades at the old;
 *             the caret turns at once
 *
 * v11's props: TreeView `label`, `hideLabel`, `size` (xs / sm / md / lg), `multiselect`,
 * `selected`, `active`, `onSelect`, `onActivate`, `className`; TreeNode
 * `id`, `label`, `value`, `renderIcon`, `isExpanded`, `defaultIsExpanded`,
 * `onToggle`, `onSelect`, `onNodeFocusEvent`, `disabled`, `className`.
 * The kit adds TreeView `variant` (the kit's selector styles), `timeScale`.
 * ========================================================================== */

export type TreeNodeId = string | number;
export type TreeViewSize = 'xs' | 'sm' | 'md' | 'lg';
/** The kit's selector styles. */
export type TreeViewVariant = SelectionVariant;

/** What `onSelect` and `onToggle` are told about a node (v11's shape). */
export interface TreeNodeInfo {
  id: TreeNodeId;
  label: ReactNode;
  value?: string;
  /** `onToggle`: the state it asked for. */
  isExpanded?: boolean;
  /** TreeView's `onSelect`, on a plain selection: the node now active. */
  activeNodeId?: TreeNodeId;
}

type TreeEvent = SyntheticEvent | Event;

/* ── context ───────────────────────────────────────────────────────────── */

interface NodeRecord {
  /** The node's own id (a number stays a number). */
  id: TreeNodeId;
  /** Its parent node's id as a DOM attribute; null at the top level. */
  parent: string | null;
  label: ReactNode;
  value?: string;
  disabled: boolean;
  hasChildren: boolean;
  expanded: () => boolean;
  toggle: (event: TreeEvent, to?: boolean) => void;
  onSelect?: (event: TreeEvent, node: TreeNodeInfo) => void;
}

/** The tree's selection, as its nodes read it (through the store, one node's share each). */
interface TreeSelection {
  multiselect: boolean;
  selected: readonly TreeNodeId[];
  active: TreeNodeId | undefined;
  /** The node the marker sits on (single select; multiselect has no marker). */
  marked: TreeNodeId | null;
  /** Multiselect: each node's box, from its children (the mixed rule); null in single select. */
  states: ReadonlyMap<string, MixedState> | null;
}

/**
 * The selection behind a subscription: the context carries only what never
 * changes, so a pick doesn't render every node through it; each node reads
 * its own share (`useNodeSelection`) and renders when that share changed,
 * the old node and the new on a pick.
 */
interface TreeStore {
  get: () => TreeSelection;
  set: (next: TreeSelection) => void;
  subscribe: (listener: () => void) => () => void;
}

function createTreeStore(first: TreeSelection): TreeStore {
  let now = first;
  const listeners = new Set<() => void>();
  return {
    get: () => now,
    set: (next) => {
      if (next === now) return;
      now = next;
      for (const l of [...listeners]) l();
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/** One node's share of the selection. */
interface NodeSelection {
  multiselect: boolean;
  /** Its box (multiselect's; in single select, checked when selected). */
  box: MixedState;
  isSelected: boolean;
  isMarked: boolean;
  isActive: boolean;
}

function nodeSelectionOf(t: TreeSelection, id: TreeNodeId): NodeSelection {
  // Multiselect: its box, from its children if it has any (the mixed rule).
  const box: MixedState =
    t.states?.get(domId(id)) ??
    (t.selected.includes(id) ? 'checked' : 'unchecked');
  return {
    multiselect: t.multiselect,
    box,
    isSelected: t.multiselect ? box === 'checked' : t.selected.includes(id),
    isMarked: t.marked === id,
    isActive: t.active === id,
  };
}

const sameShare = (a: NodeSelection, b: NodeSelection) =>
  a.multiselect === b.multiselect &&
  a.box === b.box &&
  a.isSelected === b.isSelected &&
  a.isMarked === b.isMarked &&
  a.isActive === b.isActive;

/** A node's share of the tree's selection: it renders when its share changes, not with every pick. */
function useNodeSelection(store: TreeStore, id: TreeNodeId): NodeSelection {
  const last = useRef<NodeSelection | null>(null);
  const get = () => {
    const next = nodeSelectionOf(store.get(), id);
    if (last.current && sameShare(last.current, next)) return last.current;
    last.current = next;
    return next;
  };
  return useSyncExternalStore(store.subscribe, get, get);
}

interface TreeContextValue {
  /** The selection, by subscription (the context itself doesn't change with it). */
  store: TreeStore;
  select: (event: TreeEvent, id: TreeNodeId, toggle: boolean) => void;
  register: (id: TreeNodeId, record: NodeRecord) => () => void;
  moves: DisclosureMoves;
  requestSync: (rows?: boolean) => void;
  onRowPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
}

const NO_MOVES: DisclosureMoves = { move: (_body, _open, landed) => landed() };
const TreeContext = createContext<TreeContextValue>({
  store: createTreeStore({
    multiselect: false,
    selected: [],
    active: undefined,
    marked: null,
    states: null,
  }),
  select: () => {},
  register: () => () => {},
  moves: NO_MOVES,
  requestSync: () => {},
  onRowPointerDown: () => {},
});
const DepthContext = createContext(0);
/** The node a node sits in (its id as a DOM attribute), null at the top level. */
const ParentContext = createContext<string | null>(null);

const ROW = '.cds-tree__row';
const NODE = '[role="treeitem"]';

/** A node's id as a DOM attribute. */
const domId = (id: TreeNodeId) => String(id);

/** The node a row's node sits in (its parent), or null at the top level. */
const parentOf = (row: Element) =>
  row.closest(NODE)?.parentElement?.closest(NODE) ?? null;

/** A row is a leaf's: its node has no children (it isn't a group). */
const isLeaf = (row: Element) =>
  !!row.closest(NODE)?.classList.contains('cds-tree__node--leaf');

/**
 * A move from `from` to `to` jumps unless it's between two leaves of one
 * group. So it glides only between
 * siblings that aren't groups themselves; it jumps between different parents
 * (another branch, or another depth) and to or from a group's row, two groups
 * side by side included. Document order only: no layout read.
 */
const jumps = (from: Element, to: Element) =>
  !(isLeaf(from) && isLeaf(to) && parentOf(from) === parentOf(to));

/** A node is reachable when it's enabled and no shut parent hides it. */
function reachable(node: HTMLElement): boolean {
  if (node.getAttribute('aria-disabled') === 'true') return false;
  return !node.closest('.cds-disclosure__body:not([data-open])');
}

/* ── multiselect: a parent's box from its children ──────────────────────── */

/** A node's place in the tree, all the multiselect boxes are counted from. */
interface ShapeNode {
  id: TreeNodeId;
  parent: string | null;
  disabled: boolean;
}
/** The tree's nodes by id (as a DOM attribute), in the order they came. */
type TreeShape = ReadonlyMap<string, ShapeNode>;

/** The nodes' children, by their parent's id (null: the top level). */
function childrenOf(reg: TreeShape): Map<string | null, string[]> {
  const kids = new Map<string | null, string[]>();
  for (const [k, r] of reg) {
    const p = r.parent != null && reg.has(r.parent) ? r.parent : null;
    const list = kids.get(p);
    if (list) list.push(k);
    else kids.set(p, [k]);
  }
  return kids;
}

/** The enabled children a parent's box counts (a disabled one can't be changed from it). */
const counted = (
  reg: TreeShape,
  kids: Map<string | null, string[]>,
  k: string
) => (kids.get(k) ?? []).filter((c) => !reg.get(c)!.disabled);

/**
 * Every node's box (the selection kit's mixed rule): a node with no enabled
 * children is `on`'s; a parent is its enabled children's, all checked
 * checked, some (or one mixed) mixed, none unchecked.
 */
function treeStates(
  reg: TreeShape,
  kids: Map<string | null, string[]>,
  on: (k: string) => boolean
): Map<string, MixedState> {
  const out = new Map<string, MixedState>();
  const visit = (k: string): MixedState => {
    const all = kids.get(k) ?? [];
    const st = all.map(visit).filter((_s, i) => !reg.get(all[i]!)!.disabled);
    const s: MixedState = st.length
      ? mixedState(
          st.filter((x) => x === 'checked').length,
          st.length,
          st.filter((x) => x === 'mixed').length
        )
      : on(k)
        ? 'checked'
        : 'unchecked';
    out.set(k, s);
    return s;
  };
  for (const k of kids.get(null) ?? []) visit(k);
  return out;
}

/** `selected` as given: a node is on if it, or a parent over it (not past a disabled one), is in it. */
function inheritedOn(reg: TreeShape, selected: readonly TreeNodeId[]) {
  const set = new Set(selected.map(domId));
  return (k: string) => {
    for (let c: string | null = k; c != null; c = reg.get(c)?.parent ?? null) {
      if (set.has(c)) return true;
      if (reg.get(c)?.disabled) return false;
    }
    return false;
  };
}

/**
 * Multiselect's toggle of `key`, cascaded: every enabled node under it with
 * no enabled children of its own is set to `mixedToggleTo` its box (a mixed
 * or unchecked parent selects all, a checked one clears), and the selection
 * is written back whole: every node whose box is then checked, parents
 * included, and any id the tree doesn't hold, kept.
 */
function toggleCascaded(
  reg: TreeShape,
  selected: readonly TreeNodeId[],
  key: string
): TreeNodeId[] {
  const kids = childrenOf(reg);
  const now = treeStates(reg, kids, inheritedOn(reg, selected));
  const isEnd = (k: string) => counted(reg, kids, k).length === 0;
  const on = new Set(
    [...now].filter(([k, s]) => s === 'checked' && isEnd(k)).map(([k]) => k)
  );
  const to = mixedToggleTo(now.get(key) ?? 'unchecked');
  const set = (k: string) => {
    if (reg.get(k)!.disabled) return;
    const under = counted(reg, kids, k);
    if (!under.length) {
      if (to) on.add(k);
      else on.delete(k);
    }
    under.forEach(set);
  };
  set(key);
  const next = treeStates(reg, kids, (k) => on.has(k));
  return [
    ...selected.filter((id) => !reg.has(domId(id))),
    ...[...reg].filter(([k]) => next.get(k) === 'checked').map(([, r]) => r.id),
  ];
}

/* ── TreeView ──────────────────────────────────────────────────────────── */

export interface TreeViewProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'onSelect' | 'children'
> {
  /** The tree's label (v11: required): shown above it, or its accessible name with `hideLabel`. */
  label: string;
  /** The label is for assistive tech only. */
  hideLabel?: boolean;
  /** Row height, the kit's row scale (the selection family's rows): `xs` 20px, `sm` 26px, `md` 32px (default), `lg` 40px. Unset, a `KitDefaults` density's: compact sm, default md, spacious lg. v11's `xs` 24 and `sm` 32 are the migration table's. */
  size?: TreeViewSize;
  /** More than one node can be selected (a click on a row toggles it; Ctrl + A). */
  multiselect?: boolean;
  /** The selected nodes' ids. Initial, and followed whenever it changes. */
  selected?: readonly TreeNodeId[];
  /** The active node's id: the last one picked without a modifier. Initial, and followed. */
  active?: TreeNodeId;
  /** A node is selected (or, with a modifier, toggled). */
  onSelect?: (event: TreeEvent, node: TreeNodeInfo) => void;
  /** The active node changed. */
  onActivate?: (activeNodeId?: TreeNodeId) => void;
  /** The kit's selector style. Default `inverse`. */
  variant?: TreeViewVariant;
  /** Slow motion for the marker and the caret (the bodies follow the token variables). Default 1. */
  timeScale?: number;
  children?: ReactNode;
}

export function TreeView({
  label,
  hideLabel = false,
  size: sizeProp,
  multiselect = false,
  selected: selectedProp,
  active: activeProp,
  onSelect,
  onActivate,
  variant,
  timeScale = 1,
  className,
  children,
  onKeyDown,
  ...rest
}: TreeViewProps) {
  // KitDefaults: the provider's density through the row scale when no `size` is given.
  const { size = 'md' } = useKitProps({ size: sizeProp }, ROW_KIT);
  const rootRef = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();
  const labelId = `cds-tree-label-${useId().replace(/:/g, '')}`;

  /* ── selection state: v11's — initial, then followed ─────────────────── */

  const [selected, setSelected] = useState<readonly TreeNodeId[]>(
    selectedProp ?? []
  );
  // Followed by its contents, so a new array of the same ids (an inline literal) changes nothing.
  const selectedKey = selectedProp?.map(String).join('\u0000');
  const [seenSelected, setSeenSelected] = useState(selectedKey);
  if (seenSelected !== selectedKey) {
    setSeenSelected(selectedKey);
    if (selectedProp) setSelected(selectedProp);
  }
  const [active, setActive] = useState<TreeNodeId | undefined>(activeProp);
  const [seenActive, setSeenActive] = useState(activeProp);
  if (seenActive !== activeProp) {
    setSeenActive(activeProp);
    setActive(activeProp);
  }
  // The marker is for one choice. Multiselect has none:
  // its selected rows are its checkboxes and the wash, the focus ring shows
  // where the keyboard is (a selector moving round checked boxes is
  // unexpected).
  const marked: TreeNodeId | null = multiselect
    ? null
    : active !== undefined && selected.includes(active)
      ? active
      : (selected.at(-1) ?? null);

  const registry = useRef(new Map<string, NodeRecord>());
  // The tree's shape (each node's parent and whether it's disabled): the
  // multiselect boxes are counted from it. A node registers again only when
  // its place changes. Registrations land in `shapeNow` as they come and
  // reach state once per commit: one copy of the map, where a copy per node
  // made mounting N nodes O(N²). Before paint, so a parent's box is right on
  // the first frame: the tree's own layout effect (below) runs after its
  // nodes' and flushes what they registered; nodes that come or go without
  // the tree rendering (a node's own children) are flushed from a microtask,
  // synchronously (`flushSync`; a plain setState there would wait a paint).
  const shapeNow = useRef(new Map<string, ShapeNode>());
  const [shape, setShape] = useState<TreeShape>(() => new Map());
  const shapeDirty = useRef(false);
  const shapeQueued = useRef(false);
  const flushShape = useCallback(() => {
    if (!shapeDirty.current) return;
    shapeDirty.current = false;
    setShape(new Map(shapeNow.current));
  }, []);
  useLayoutEffect(flushShape);
  const register = useCallback(
    (id: TreeNodeId, record: NodeRecord) => {
      const key = domId(id);
      const flush = () => {
        shapeDirty.current = true;
        if (shapeQueued.current) return;
        shapeQueued.current = true;
        queueMicrotask(() => {
          shapeQueued.current = false;
          if (shapeDirty.current) flushSync(flushShape);
        });
      };
      registry.current.set(key, record);
      const place: ShapeNode = {
        id: record.id,
        parent: record.parent,
        disabled: record.disabled,
      };
      shapeNow.current.set(key, place);
      flush();
      return () => {
        if (registry.current.get(key) === record) registry.current.delete(key);
        if (shapeNow.current.get(key) !== place) return;
        shapeNow.current.delete(key);
        flush();
      };
    },
    [flushShape]
  );
  // Multiselect: each node's box, a parent's from its children (the mixed rule).
  const states = useMemo(
    () =>
      multiselect
        ? treeStates(shape, childrenOf(shape), inheritedOn(shape, selected))
        : null,
    [multiselect, selected, shape]
  );

  const latest = useLatest({
    selected,
    active,
    multiselect,
    onSelect,
    onActivate,
    marked,
  });

  // The nodes' view of the selection: one store, each node subscribed to its own share.
  const view = useMemo<TreeSelection>(
    () => ({ multiselect, selected, active, marked, states }),
    [multiselect, selected, active, marked, states]
  );
  const [store] = useState(() => createTreeStore(view));
  // Before the marker's sync (below), so the nodes it reads are this commit's.
  useLayoutEffect(() => store.set(view), [store, view]);

  const select = useCallback(
    (event: TreeEvent, id: TreeNodeId, toggle: boolean) => {
      const rec = registry.current.get(domId(id));
      if (!rec || rec.disabled) return;
      const node: TreeNodeInfo = { id, label: rec.label, value: rec.value };
      const l = latest.current;
      if (l.multiselect && toggle) {
        // A parent takes every node under it with it; its box is theirs (the mixed rule).
        setSelected(toggleCascaded(shapeNow.current, l.selected, domId(id)));
        rec.onSelect?.(event, node);
        l.onSelect?.(event, node);
        return;
      }
      setSelected([id]);
      setActive(id);
      rec.onSelect?.(event, node);
      l.onSelect?.(event, { activeNodeId: id, ...node });
      if (l.active !== id) l.onActivate?.(id);
    },
    [latest]
  );

  /* ── the selection kit: the marker, the hover, the press ─────────────── */

  const m: SelectionMotion = useMemo(
    () => ({ ...SELECTION_KIT_MOTION, drag: false, timeScale }),
    [timeScale]
  );
  // The kit's ghost (`.sel--ghost`: no track, rows 2px apart, a 4px corner),
  // the tree's own. Its hover keeps its own rule: toward the
  // selection on tonal and outlined (`interaction: 'preview'`), and the
  // rollover's own lightness steps (not `style.steps`, ghost's softer dark
  // step, which would change it on g100).
  const style = resolveSelectionStyle(
    {
      variant,
      size,
      orientation: 'vertical',
      frame: 'ghost',
      interaction: 'preview',
    },
    m
  );
  const layoutKey = `${size}/${style.variant}`;
  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ROW,
    motion: m,
    reduced,
    // The tree places its marker itself (`sync`): it can have none.
    getRest: () => null,
    layoutKey,
  });
  const rehold = useSelectedWeight(rootRef, {
    weight: style.selectedWeight,
    holdWidth: true,
    itemSelector: ROW,
    key: layoutKey,
  });
  const resnap = useIconPixelSnap(rootRef, '.sel__face svg', layoutKey);

  const reducedRef = useLatest(reduced);
  const mRef = useLatest(m);
  /**
   * The selection kit's jump (selection-kit/jump.ts): between levels the
   * marker goes out, then in, as the side nav's between groups, not a
   * glide. It also holds the new row's hover round the marker until
   * the marker lands on it, a glide's as a jump's (`data-landing`).
   */
  const jump = useSelectionJump({
    root: () => rootRef.current,
    sel: () => selRef.current,
    motion: () => mRef.current,
    reduced: () => reducedRef.current,
  });
  useItemRollover(rootRef, {
    selector: `${rolloverItems(ROW, style)}:not([data-disabled])`,
    itemSelector: ROW,
    press: m.pressColor,
    preview: style.preview,
    timeScale,
    reduced: reducedRef,
  });

  /** Every row, in document order. */
  const rows = () => [
    ...(rootRef.current?.querySelectorAll<HTMLElement>(ROW) ?? []),
  ];
  const rowOf = (id: TreeNodeId | null) =>
    id == null
      ? null
      : (rootRef.current?.querySelector<HTMLElement>(
          `${ROW}[data-node-id="${CSS.escape(domId(id))}"]`
        ) ?? null);

  /* ── the marker: on the marked node's row, while it shows ────────────── */

  const mounting = useRef(true);
  const placedFor = useRef<Selection | null>(null);
  /** `sync`, for the jump's out to call when it's done (it ends after the commit that started it). */
  const syncRef = useRef<() => void>(() => {});
  const sync = useCallback(() => {
    const root = rootRef.current;
    const sel = selRef.current;
    if (!root || !sel) return;
    sel.measure();
    const row = rowOf(latest.current.marked);
    const first = placedFor.current !== sel;
    placedFor.current = sel;
    // Under a shut parent, or one still opening: no marker yet.
    const hiddenBy = row?.closest(
      '.cds-disclosure__body:not([data-unclipped])'
    );
    if (!row || hiddenBy) {
      jump.clear();
      if (sel.shown()) {
        // Folded away with its row, at once: its exit would hang over the rows moving under it.
        if (row && !hiddenBy?.hasAttribute('data-open'))
          root.dataset.selFolded = '';
        sel.hide();
      }
      return;
    }
    delete root.dataset.selFolded;
    // A jump's out under way: the in waits for it, and plays at whatever is marked then.
    if (jump.leaving()) return;
    if (!sel.shown()) {
      const instant = mounting.current || first;
      // The jump's in: the kit's arrival, from JUMP_IN_SHRINK small, on its share of the jump's clock.
      if (jump.arriving() && !instant) jump.arrive(row);
      else sel.show(row, instant ? { instant: true } : undefined);
      jump.clear();
      return;
    }
    jump.clear();
    const from = sel.target();
    if (from === row) return;
    // Anything but leaf to leaf in one group: out, then in (the in from this sync, once the out is done). Reduced: there at once.
    if (from && jumps(from, row)) {
      jump.leave(row, () => syncRef.current());
      return;
    }
    // Leaves of one group: the glide, the new row keeping its hover until the marker lands on it.
    if (sel.moveTo(row) > 0) jump.hold();
  }, [selRef, latest, jump]);
  useLayoutEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  /* ── focus: one tab stop ─────────────────────────────────────────────── */

  const lastFocus = useRef<string | null>(null);
  const tabStop = () => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>(NODE)];
    const open = nodes.filter(reachable);
    const by = (id: TreeNodeId | null | undefined) =>
      id == null ? undefined : open.find((n) => n.dataset.nodeId === domId(id));
    // The last focused node, else the marked one; multiselect (no marker):
    // the active node, else the first selected.
    const { marked: m, active: a, selected: s } = latest.current;
    const stop = by(lastFocus.current) ?? by(m) ?? by(a) ?? by(s[0]) ?? open[0];
    for (const n of nodes) n.tabIndex = n === stop ? 0 : -1;
  };

  // One sync per commit: nodes ask from their layout effects; it runs once, before paint.
  const queued = useRef(false);
  const rowsDirty = useRef(false);
  const requestSync = useCallback(
    (rowsChanged?: boolean) => {
      if (rowsChanged) rowsDirty.current = true;
      if (queued.current) return;
      queued.current = true;
      queueMicrotask(() => {
        queued.current = false;
        sync();
        if (rowsDirty.current) {
          rowsDirty.current = false;
          rehold();
          resnap();
        }
        tabStop();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tabStop reads the DOM
    [sync, rehold, resnap]
  );
  useLayoutEffect(() => requestSync(), [marked, layoutKey, requestSync]);
  useEffect(() => {
    const t = window.setTimeout(() => (mounting.current = false), 0);
    return () => window.clearTimeout(t);
  }, []);

  // The caret turns on the bodies' clock: each motion's clock, given to the
  // carets' running transitions as it starts (the disclosure retimes the
  // bodies the same way).
  const moves = useDisclosureMoves(rootRef, {
    reason: 'tree-view',
    onTimed: (clock) => {
      for (const caret of rootRef.current?.querySelectorAll(
        '.cds-tree__caret'
      ) ?? []) {
        transitionOf(caret, 'rotate')?.effect?.updateTiming({
          duration: clock,
        });
      }
    },
    onEnd: () => requestSync(),
  });

  const lastPointer = useRef<TreeEvent | null>(null);
  const { onPointerDown: gestureDown } = useSelectionGesture({
    rootRef,
    selRef,
    axis: 'y',
    items: rows,
    isDisabled: (_i, el) =>
      !el ||
      el.hasAttribute('data-disabled') ||
      !!el.closest('.cds-disclosure__body:not([data-open])'),
    selected: () => {
      const row = rowOf(latest.current.marked);
      return row ? rows().indexOf(row) : -1;
    },
    motion: () => m,
    commit: (i) => {
      const row = rows()[i];
      const id = row ? registryIdOf(row) : null;
      if (!row || id == null) return;
      // A leaf of the same group: the glide starts from the reach now. Any
      // other move jumps from the sync, out from where the reach left the marker.
      const sel = selRef.current;
      const from = sel?.target();
      if (
        sel?.shown() &&
        from !== row &&
        !(from && jumps(from, row)) &&
        sel.moveTo(row) > 0
      )
        jump.hold();
      select(lastPointer.current ?? new Event('pointerup'), id, false);
      (row.closest<HTMLElement>(NODE) ?? row).focus({ preventScroll: true });
    },
  });
  /** The id a row stands for, as registered (number ids stay numbers). */
  const registryIdOf = (row: HTMLElement): TreeNodeId | null => {
    const raw = row.dataset.nodeId;
    if (raw == null) return null;
    const node = row.closest<HTMLElement>(NODE);
    return node?.dataset.idType === 'number' ? Number(raw) : raw;
  };

  // Stable (the gesture's handler is made each render): the rows are memoized (TreeRow).
  const onRowPointerDown = useStableCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if ((e.target as Element).closest('.cds-tree__caret')) return;
      // Multiselect: a click toggles (the row's onClick), so the marker's gesture stays out of it.
      if (latest.current.multiselect) return;
      lastPointer.current = e;
      gestureDown(e, ROW);
    }
  );

  /* ── keyboard ────────────────────────────────────────────────────────── */

  const [typeahead] = useState(() => createTypeahead());
  const onKeys = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    const root = rootRef.current;
    const node = (e.target as Element).closest<HTMLElement>(NODE);
    if (e.defaultPrevented || !root || !node || !root.contains(node)) return;
    const id = registryIdOf(node.querySelector<HTMLElement>(ROW)!);
    const rec = id == null ? undefined : registry.current.get(domId(id));
    const visible = [...root.querySelectorAll<HTMLElement>(NODE)].filter(
      reachable
    );
    const at = visible.indexOf(node);
    const ctrl = e.ctrlKey || e.metaKey;
    const go = (to: HTMLElement | undefined) => {
      if (!to) return;
      to.focus();
    };
    const multi = latest.current.multiselect;
    const selectRange = (from: number, to: number) => {
      const ids = visible
        .slice(Math.min(from, to), Math.max(from, to) + 1)
        .map((n) => registryIdOf(n.querySelector<HTMLElement>(ROW)!))
        .filter((x): x is TreeNodeId => x != null);
      setSelected((s) => [...s, ...ids.filter((x) => !s.includes(x))]);
    };

    // Right to left a child sits further left: ← opens and goes in, → closes and goes out.
    switch (inlineKey(e.key, root)) {
      case 'ArrowDown':
        e.preventDefault();
        go(visible[at + 1]);
        return;
      case 'ArrowUp':
        e.preventDefault();
        go(visible[at - 1]);
        return;
      case 'Home':
        e.preventDefault();
        if (multi && ctrl && e.shiftKey) selectRange(at, 0);
        go(visible[0]);
        return;
      case 'End':
        e.preventDefault();
        if (multi && ctrl && e.shiftKey) selectRange(at, visible.length - 1);
        go(visible.at(-1));
        return;
      case 'ArrowRight': {
        if (!rec?.hasChildren || rec.disabled) return;
        e.preventDefault();
        if (!rec.expanded()) rec.toggle(e, true);
        else go(visible.find((n) => n.parentElement?.closest(NODE) === node));
        return;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (rec?.hasChildren && rec.expanded() && !rec.disabled)
          rec.toggle(e, false);
        else go(node.parentElement?.closest<HTMLElement>(NODE) ?? undefined);
        return;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (id == null || !rec || rec.disabled) return;
        if (e.key === 'Enter' && rec.hasChildren) rec.toggle(e);
        // Multiselect: Space toggles the node, as its checkbox does; Enter selects it alone (Ctrl toggles).
        select(e, id, multi && (ctrl || e.key === ' '));
        return;
      }
      default:
        break;
    }
    if (multi && ctrl && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      selectRange(0, visible.length - 1);
      return;
    }
    if (ctrl || e.altKey) return;
    const labels = visible.map(
      (n) => n.querySelector('.cds-tree__label')?.textContent ?? ''
    );
    const next = typeahead(e.key, at, labels, () => false);
    if (next != null) {
      e.preventDefault();
      go(visible[next]);
    }
  };

  // Nothing here changes with the selection (the nodes read that from the store).
  const ctx = useMemo<TreeContextValue>(
    () => ({ store, select, register, moves, requestSync, onRowPointerDown }),
    [store, select, register, moves, requestSync, onRowPointerDown]
  );

  return (
    <>
      {!hideLabel && (
        <label id={labelId} className="cds-tree-label">
          {label}
        </label>
      )}
      <TreeContext.Provider value={ctx}>
        <DepthContext.Provider value={0}>
          <ul
            {...rest}
            ref={rootRef}
            role="tree"
            aria-label={hideLabel ? label : undefined}
            aria-labelledby={hideLabel ? undefined : labelId}
            aria-multiselectable={multiselect || undefined}
            className={cx(
              ...style.classes,
              'cds-tree',
              `cds-tree--${size}`,
              className
            )}
            style={
              style.selectedWeight != null
                ? {
                    ...rest.style,
                    ['--sel-on-weight' as string]: style.selectedWeight,
                  }
                : rest.style
            }
            onKeyDown={onKeys}
            onFocus={(e) => {
              const n = (e.target as Element).closest<HTMLElement>(NODE);
              if (n?.dataset.nodeId != null)
                lastFocus.current = n.dataset.nodeId;
              tabStop();
            }}>
            <SelectionMarker />
            {children}
          </ul>
        </DepthContext.Provider>
      </TreeContext.Provider>
    </>
  );
}
TreeView.displayName = 'TreeView';

/* ── TreeNode ──────────────────────────────────────────────────────────── */

export interface TreeNodeProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'onSelect' | 'onToggle' | 'id'
> {
  /** The node's id: unique in the tree, what `selected` and `active` name. Default a generated one. */
  id?: TreeNodeId;
  /** The node's label. */
  label: ReactNode;
  /** The node's value, passed back in `onSelect`. */
  value?: string;
  /** An icon before the label. A motion icon plays on the row's hover. */
  renderIcon?: ElementType;
  /** Expanded. Initial, and followed whenever it changes; a toggle changes it in between. */
  isExpanded?: boolean;
  /** Expanded at first, when `isExpanded` isn't given. */
  defaultIsExpanded?: boolean;
  /** The node asked to open or shut, with the state it asked for. */
  onToggle?: (event: TreeEvent, node: TreeNodeInfo) => void;
  /** This node is selected. */
  onSelect?: (event: TreeEvent, node: TreeNodeInfo) => void;
  /** The node gained or lost focus. */
  onNodeFocusEvent?: (event: ReactFocusEvent<HTMLLIElement>) => void;
  /** Can't be selected, opened or focused. */
  disabled?: boolean;
  /** Child nodes. */
  children?: ReactNode;
}

interface TreeRowProps {
  nodeId: string;
  labelId: string;
  label: ReactNode;
  Icon?: ElementType;
  depth: number;
  hasChildren: boolean;
  disabled: boolean;
  multiselect: boolean;
  box: MixedState;
  isSelected: boolean;
  isMarked: boolean;
  /** The tree's (stable). */
  onRowPointerDown: TreeContextValue['onRowPointerDown'];
  /** Stable (the node's `useStableCallback`). */
  onCaretClick: (e: ReactMouseEvent<HTMLSpanElement>) => void;
  onRowClick: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onRowMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
}

/**
 * A node's row: caret, check, icon and label in the selection faces.
 * Memoized, as every row of a selection list is:
 * a node renders when its share of the selection changes (the tree's store)
 * or its own state does; its row re-renders only when what it draws changed,
 * its label compared by `sameNode`.
 */
const TreeRow = memo(
  function TreeRow({
    nodeId,
    labelId,
    label,
    Icon,
    depth,
    hasChildren,
    disabled,
    multiselect,
    box,
    isSelected,
    isMarked,
    onRowPointerDown,
    onCaretClick,
    onRowClick,
    onRowMouseDown,
  }: TreeRowProps) {
    const caret = hasChildren ? (
      <span
        className="cds-tree__caret"
        aria-hidden="true"
        onClick={onCaretClick}>
        <CaretDown size={16} animated={false} />
      </span>
    ) : (
      <span
        className="cds-tree__caret cds-tree__caret--none"
        aria-hidden="true"
      />
    );
    // Multiselect: the row's checkbox. Only in the row's own face: multiselect has no marker,
    // so the selected face never shows. Inert, so it takes no focus and no press of its own:
    // a click on it is the row's.
    const check = multiselect && (
      <span className="cds-tree__check" aria-hidden="true">
        <span {...inertProps(true)}>
          <Checkbox
            id={`${nodeId}__check`}
            labelText=""
            hideLabel
            checked={box === 'checked'}
            indeterminate={box === 'mixed'}
            disabled={disabled}
            tabIndex={-1}
            onChange={() => {}}
          />
        </span>
      </span>
    );
    return (
      <div
        className={cx('sel__item', 'cds-tree__row')}
        data-node-id={nodeId}
        data-selected={isMarked || undefined}
        // A selected node the marker isn't on (every one, in multiselect): the selected wash, still.
        data-also-selected={(isSelected && !isMarked) || undefined}
        data-disabled={disabled || undefined}
        style={{ ['--cds-tree-depth' as string]: depth }}
        // The whole row is its icon's hover frame.
        {...(Icon ? { 'data-motion-icon-frame': '' } : null)}
        onPointerDown={disabled ? undefined : onRowPointerDown}
        onClick={onRowClick}
        onMouseDown={onRowMouseDown}>
        <SelectionFaces
          onFace={
            <>
              {caret}
              {Icon && <Icon aria-hidden="true" />}
              <span className="sel__text cds-tree__label">{label}</span>
            </>
          }>
          {caret}
          {check}
          {Icon && <Icon aria-hidden="true" />}
          <span className="sel__text cds-tree__label" id={labelId}>
            {label}
          </span>
        </SelectionFaces>
      </div>
    );
  },
  (a, b) => {
    for (const k of Object.keys(a) as (keyof TreeRowProps)[])
      if (k === 'label' ? !sameNode(a.label, b.label) : a[k] !== b[k])
        return false;
    return true;
  }
);

export function TreeNode({
  id: idProp,
  label,
  value,
  renderIcon: Icon,
  isExpanded,
  defaultIsExpanded,
  onToggle,
  onSelect,
  onNodeFocusEvent,
  disabled = false,
  className,
  children,
  onFocus,
  onBlur,
  ...rest
}: TreeNodeProps) {
  const tree = useContext(TreeContext);
  const depth = useContext(DepthContext);
  const parent = useContext(ParentContext);
  const reduced = usePrefersReducedMotion();
  const generated = `cds-tree-node-${useId().replace(/:/g, '')}`;
  const id: TreeNodeId = idProp ?? generated;
  // Its own share of the selection: a pick renders the nodes it changed, not every node.
  const { multiselect, box, isSelected, isMarked, isActive } = useNodeSelection(
    tree.store,
    id
  );
  const labelId = `${domId(id)}__label`;
  const hasChildren = Children.toArray(children).some(isValidElement);

  // v11's: starts at `isExpanded` (else `defaultIsExpanded`), follows `isExpanded` when it changes.
  const [expanded, setExpanded] = useState(
    isExpanded ?? defaultIsExpanded ?? false
  );
  const [seen, setSeen] = useState(isExpanded);
  if (seen !== isExpanded) {
    setSeen(isExpanded);
    if (isExpanded !== undefined) setExpanded(isExpanded);
  }
  const open = hasChildren && expanded;

  const latest = useLatest({
    expanded,
    label,
    value,
    onToggle,
    onSelect,
    disabled,
  });
  const toggle = (event: TreeEvent, to?: boolean) => {
    const l = latest.current;
    if (l.disabled) return;
    const next = to ?? !l.expanded;
    if (next === l.expanded) return;
    setExpanded(next);
    l.onToggle?.(event, {
      id,
      label: l.label,
      value: l.value,
      isExpanded: next,
    });
  };
  const toggleRef = useLatest(toggle);

  // Registered again only when its place in the tree changes (the multiselect boxes are counted from it).
  const { register } = tree;
  useLayoutEffect(
    () =>
      register(id, {
        id,
        parent,
        get label() {
          return latest.current.label;
        },
        get value() {
          return latest.current.value;
        },
        get disabled() {
          return latest.current.disabled;
        },
        get onSelect() {
          return latest.current.onSelect;
        },
        hasChildren,
        expanded: () => latest.current.expanded,
        toggle: (event, to) => toggleRef.current(event, to),
      }),
    [register, id, parent, hasChildren, disabled, toggleRef, latest]
  );

  const bodyRef = useRef<HTMLDivElement>(null);
  const body = useDisclosureBody(bodyRef, open, tree.moves, reduced);

  // The marker and the tab stop follow the rows: as a node opens or shuts, lands, comes or goes.
  const { requestSync } = tree;
  useLayoutEffect(() => {
    requestSync(true);
    return () => requestSync(true);
  }, [requestSync]);
  useLayoutEffect(
    () => requestSync(),
    [open, body.landed, disabled, requestSync]
  );

  // The row's handlers: stable, so the memoized row (TreeRow) re-renders
  // only when what it draws changed, not with every selection in the tree.
  const onCaretClick = useStableCallback(
    (e: ReactMouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      toggle(e);
    }
  );
  const onRowClick = useStableCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled || (e.target as Element).closest('.cds-tree__caret')) return;
    // Multiselect: a click anywhere on the row toggles the node, as the checkbox does
    // (the caret still only opens and shuts). A parent's double-click opens it: its
    // second click doesn't toggle the node back (the box's still does).
    if (multiselect) {
      if (
        !(
          e.detail > 1 &&
          hasChildren &&
          !(e.target as Element).closest('.cds-tree__check')
        )
      )
        tree.select(e, id, true);
    }
    // A click on the marked node: the gesture leaves it be; v11 selects it again (one selection, if many).
    else if (isMarked) tree.select(e, id, false);
  });
  // A double-click on a parent's row opens or shuts it, as in file trees (the first click
  // selected it). It acts on the second press, not on `dblclick`, which waits for that
  // press's release: the node moves as the second click lands, so it never feels sluggish.
  // Not on the caret, whose clicks already toggled, nor the checkbox.
  const onRowMouseDown = useStableCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.detail !== 2 || e.button !== 0) return;
      if (
        disabled ||
        !hasChildren ||
        (e.target as Element).closest('.cds-tree__caret, .cds-tree__check')
      )
        return;
      toggle(e);
    }
  );

  return (
    <li
      {...rest}
      role="treeitem"
      id={domId(id)}
      data-node-id={domId(id)}
      data-id-type={typeof id === 'number' ? 'number' : undefined}
      tabIndex={-1}
      aria-labelledby={labelId}
      aria-level={depth + 1}
      aria-expanded={hasChildren ? open : undefined}
      aria-selected={disabled ? undefined : isSelected}
      aria-disabled={disabled || undefined}
      aria-current={isActive ? 'true' : undefined}
      className={cx(
        'cds-tree__node',
        hasChildren ? 'cds-tree__node--parent' : 'cds-tree__node--leaf',
        isSelected && 'cds-tree__node--selected',
        disabled && 'cds-tree__node--disabled',
        className
      )}
      onFocus={(e) => {
        onFocus?.(e);
        if (e.target === e.currentTarget) onNodeFocusEvent?.(e);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (e.target === e.currentTarget) onNodeFocusEvent?.(e);
      }}>
      <TreeRow
        nodeId={domId(id)}
        labelId={labelId}
        label={label}
        Icon={Icon}
        depth={depth}
        hasChildren={hasChildren}
        disabled={disabled}
        multiselect={multiselect}
        box={box}
        isSelected={isSelected}
        isMarked={isMarked}
        onRowPointerDown={tree.onRowPointerDown}
        onCaretClick={onCaretClick}
        onRowClick={onRowClick}
        onRowMouseDown={onRowMouseDown}
      />
      {hasChildren && (
        <div
          ref={bodyRef}
          className="cds-disclosure__body cds-tree__body"
          {...body.bodyProps}>
          <div className="cds-disclosure__clip">
            <ul
              role="group"
              className="cds-disclosure__content cds-tree__group">
              <DepthContext.Provider value={depth + 1}>
                <ParentContext.Provider value={domId(id)}>
                  {children}
                </ParentContext.Provider>
              </DepthContext.Provider>
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
TreeNode.displayName = 'TreeNode';
