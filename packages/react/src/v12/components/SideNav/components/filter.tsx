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
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Search, type SearchSize } from '@carbon-labs/react-search';
import type { FieldFrame } from '@carbon-labs/react-props';
import { useLatest } from '@carbon-labs/react-selection-kit';
import './side-nav-filter.scss';
import { assignRef, isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * SideNav's filter (`filter`): a field pinned at the top of the nav's panel
 * that narrows the nav to what matches.
 * ============================================================================
 *
 * The matching reads the nav's own elements, the `SideNavLink`s and
 * `SideNavGroup`s it's given (directly or in fragments), not a model passed
 * beside them and not the DOM:
 *
 *   link      matches when its label (its text) holds the query, or one of
 *             its `keywords` does at the start of a word, case-insensitive
 *             (so a short query doesn't find every keyword with it inside)
 *   group     a group whose title matches keeps all its links; otherwise it
 *             keeps the links that match, and goes when none does
 *   label     anything else in the list (a section's label, an `<li>` of
 *             the app's) stays with the rows after it, up to the next one,
 *             and goes with them
 *   list      only the matches are rendered; a group with one is open (its
 *             header still shuts it, for that query); with none, a quiet
 *             line where the list would be
 *   groups    their open state is the filter's to keep, so a group the
 *             filter hides comes back as it left: a group you control (`open`)
 *             keeps yours, and the filter never asks it to change; any other
 *             group's state is kept here (`defaultOpen`, or open when it
 *             holds the current page; open when you go to one of its pages;
 *             otherwise as you left it)
 *   snap      while there's a query the nav is `still` (stillness: reactive
 *             UI snaps), and for the commit that clears it and the one after
 *   corners   the field's are the rows' (`corners`, the nav's): the inner
 *             corner, the track's less its inset (side-nav-filter.scss), as
 *             the rows'; full on full rows, square on square ones. Always
 *             given, so a provider's `corners` (KitDefaults) never makes
 *             the field a pill on its own
 *   count     a polite live region, once typing pauses
 *   keys      `/` focuses the field (not while typing in a field, nor while
 *             the nav is hidden); ↓ from the field goes to the first link,
 *             ↑ from that link comes back; Enter with one match follows it;
 *             Escape clears the field (the Search's), then, empty, calls
 *             `onEscape`
 * ========================================================================== */

/** The filter's options (SideNav's `filter`; `true` takes every default). */
export interface SideNavFilterOptions {
  /** The field's name (visually hidden), and its placeholder unless one is given. Default "Filter pages". */
  labelText?: string;
  /** Default `labelText`. */
  placeholder?: string;
  /** The clear button's name. Default "Clear filter". */
  closeButtonLabelText?: string;
  /** What a link is, for the count and the empty line. Default `{ one: 'page', other: 'pages' }`. */
  noun?: { one: string; other: string };
  /** Controlled: the query. */
  value?: string;
  /** Uncontrolled: the first query. Default ''. */
  defaultValue?: string;
  /** The query changed (typing, the clear button, Escape). */
  onChange?: (value: string) => void;
  /** Escape in the empty field (a nav in an overlay closes it). */
  onEscape?: () => void;
  /** The key that focuses the field from the page (not while typing in a field). Default `/`; `false`, none. */
  shortcut?: string | false;
  /** The field's `<input>`. */
  inputRef?: Ref<HTMLInputElement>;
}

/** The count waits for typing to pause this long, so it doesn't chatter. An announcement's debounce, not motion. */
export const SIDE_NAV_FILTER_ANNOUNCE_MS = 500;

/** The query's normal form: trimmed, lower case. '' is no filter. */
export const normalizeFilter = (query: string) => query.trim().toLowerCase();

/** The count's words. */
export function filterCountText(n: number, noun = DEFAULT_NOUN): string {
  return n === 0
    ? `No ${noun.other} match`
    : n === 1
      ? `1 ${noun.one} matches`
      : `${n} ${noun.other} match`;
}

const DEFAULT_NOUN = { one: 'page', other: 'pages' };

/** The two row types the filter reads (SideNav's own components). */
export interface SideNavRowTypes {
  link: unknown;
  group: unknown;
}

/** A node's text (a label given as elements). */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return '';
}

/** The current page's link in a subtree, as a key, or '' when there's none (SideNavGroup's rule). */
function currentKeyOf(node: ReactNode, path = ''): string {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ current?: boolean; children?: ReactNode }>(child))
      continue;
    const key = `${path}/${String(child.key)}`;
    if (child.props.current) return key;
    if (child.props.children) {
      const inner = currentKeyOf(child.props.children, key);
      if (inner) return inner;
    }
  }
  return '';
}

type Props = {
  children?: ReactNode;
  title?: ReactNode;
  keywords?: readonly string[];
};

const has = (q: string, ...texts: (string | undefined)[]) =>
  texts.some((t) => t !== undefined && t.toLowerCase().includes(q));

const WORD = /[\p{L}\p{N}]/u;

/** A keyword holds the query at the start of one of its words ("tab" finds "tab bar", not "selectable"). */
const hasWord = (q: string, words: readonly string[]) =>
  words.some((w) => {
    const t = w.toLowerCase();
    for (let i = t.indexOf(q); i >= 0; i = t.indexOf(q, i + 1))
      if (i === 0 || !WORD.test(t[i - 1]!)) return true;
    return false;
  });

/** What a filtered subtree came to: its nodes and how many links are in them. */
export interface FilteredRows {
  nodes: ReactNode[];
  count: number;
}

/**
 * The nav's children narrowed to `q` (normalized; '' keeps everything). Each
 * group, kept, goes through `group` (its stable key, and its children as
 * filtered), which can give it its open state. Keys are the elements' own
 * (as `Children.toArray` gives them), so a row keeps its identity whether or
 * not the filter is on.
 */
export function filterRows(
  children: ReactNode,
  q: string,
  rows: SideNavRowTypes,
  group: (
    el: ReactElement<Props>,
    key: string,
    children: ReactNode[]
  ) => ReactNode = (el, _k, c) => cloneElement(el, undefined, ...c),
  path = ''
): FilteredRows {
  const out: ReactNode[] = [];
  let count = 0;
  // Labels wait for the rows after them: kept with the first one kept.
  let label: ReactNode[] = [];
  const keep = (node: ReactNode, n: number) => {
    if (q && n === 0) return;
    out.push(...label, node);
    label = [];
    count += n;
  };
  for (const child of Children.toArray(children)) {
    if (!isValidElement<Props>(child)) {
      if (q) label.push(child);
      else out.push(child);
      continue;
    }
    const key = `${path}/${String(child.key)}`;
    if (child.type === rows.link) {
      const p = child.props;
      keep(
        child,
        !q || has(q, textOf(p.children)) || hasWord(q, p.keywords ?? []) ? 1 : 0
      );
    } else if (child.type === rows.group) {
      const whole = !q || has(q, textOf(child.props.title));
      const inner = filterRows(
        child.props.children,
        whole ? '' : q,
        rows,
        group,
        key
      );
      keep(group(child, key, inner.nodes), inner.count);
    } else if (child.type === Fragment) {
      const inner = filterRows(child.props.children, q, rows, group, key);
      if (!q || inner.count)
        keep(<Fragment key={child.key}>{inner.nodes}</Fragment>, inner.count);
    } else if (q) {
      // A label (or anything that isn't a row): it goes where the rows after it go.
      label = [child];
    } else out.push(child);
  }
  return { nodes: out, count };
}

/** The groups' state the filter keeps: each group not controlled by its parent, by key. */
interface Kept {
  open: boolean;
  /** The current page it held last render ('' none): it opens when that changes to one of its pages. */
  seen: string;
}

/** Every group in the tree, its key and props (hidden or not). */
function eachGroup(
  node: ReactNode,
  rows: SideNavRowTypes,
  fn: (
    key: string,
    props: Props & { open?: boolean; defaultOpen?: boolean }
  ) => void,
  path = ''
) {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<Props & { open?: boolean; defaultOpen?: boolean }>(child)
    )
      continue;
    const key = `${path}/${String(child.key)}`;
    if (child.type === rows.group) fn(key, child.props);
    if (child.props.children) eachGroup(child.props.children, rows, fn, key);
  }
}

/** Typing somewhere: the shortcut is a character there. */
function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    !!target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
    )
  );
}

/** The nav's row size → the field's: the row's own height, near enough (26 → 24, 32 → 32, 40 → 40). */
const FIELD_SIZE: Record<'sm' | 'md' | 'lg', SearchSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

export interface SideNavFilterState {
  /** The field, for the top of the track (null without a filter). */
  field: ReactNode;
  /** The nav's children, filtered. */
  children: ReactNode;
  /** The empty line, for the end of the list (null unless nothing matches). */
  empty: ReactNode;
  /** There's a query. */
  filtering: boolean;
  /** The nav's changes snap: a query, or its clearing. */
  still: boolean;
}

/** The rows' corners (the nav's, square on a flush nav) → the field's: `rounded` is drawn at the rows' inner corner (side-nav-filter.scss). */
export const filterFieldCorners = (
  rows: 'full' | 'rounded' | 'square' | undefined
): 'full' | 'rounded' | 'square' =>
  rows === 'full' || rows === 'square' ? rows : 'rounded';

/**
 * SideNav's filter: its field, its state, and the nav's children narrowed.
 * Without `options` the children pass through untouched. `corners` is the
 * rows' (the nav's `corners`, square on a flush nav).
 */
export function useSideNavFilter(
  childrenIn: ReactNode,
  options: boolean | SideNavFilterOptions | undefined,
  navRef: RefObject<HTMLElement | null>,
  size: 'sm' | 'md' | 'lg',
  rows: SideNavRowTypes,
  corners?: 'full' | 'rounded' | 'square',
  frame?: FieldFrame
): SideNavFilterState {
  const on = options !== undefined && options !== false;
  const o: SideNavFilterOptions = typeof options === 'object' ? options : {};
  const labelText = o.labelText ?? 'Filter pages';
  const noun = o.noun ?? DEFAULT_NOUN;

  // The query: the caller's, or ours.
  const [own, setOwn] = useState(o.defaultValue ?? '');
  const query = o.value ?? own;
  const onChangeRef = useLatest(o.onChange);
  const setQuery = useCallback(
    (next: string) => {
      setOwn(next);
      onChangeRef.current?.(next);
    },
    [onChangeRef]
  );
  const q = on ? normalizeFilter(query) : '';
  const filtering = q !== '';

  // The groups: the ones we keep (not controlled by their parent), and those
  // shut for this query (forgotten when it changes).
  const [kept, setKept] = useState<ReadonlyMap<string, Kept>>(() => new Map());
  const [shut, setShut] = useState<{ q: string; ids: ReadonlySet<string> }>({
    q: '',
    ids: new Set(),
  });
  const shutIds = shut.q === q ? shut.ids : null;

  // Kept state follows the current page every render, hidden or not, so a
  // group whose page you went to while filtered out is open when it's back
  // (adjusted as it renders, as SideNavGroup's own state is).
  let next: Map<string, Kept> | null = null;
  if (on)
    eachGroup(childrenIn, rows, (key, p) => {
      if (p.open !== undefined) return;
      const cur = currentKeyOf(p.children);
      const k = kept.get(key);
      if (k && k.seen === cur) return;
      next ??= new Map(kept);
      next.set(
        key,
        k
          ? { open: k.open || cur !== '', seen: cur }
          : { open: p.defaultOpen ?? cur !== '', seen: cur }
      );
    });
  if (next) setKept(next);
  const groups: ReadonlyMap<string, Kept> = next ?? kept;

  const group = (
    el: ReactElement<
      Props & { open?: boolean; onOpenChange?: (o: boolean) => void }
    >,
    key: string,
    c: ReactNode[]
  ) => {
    const p = el.props;
    if (filtering) {
      const open = !shutIds?.has(key);
      return cloneElement(
        el,
        {
          open,
          defaultOpen: undefined,
          onOpenChange: (to: boolean) => {
            const ids = new Set(shutIds ?? []);
            if (to) ids.delete(key);
            else ids.add(key);
            setShut({ q, ids });
          },
        } as object,
        ...c
      );
    }
    if (p.open !== undefined) return cloneElement(el, undefined, ...c);
    return cloneElement(
      el,
      {
        open: groups.get(key)?.open ?? false,
        defaultOpen: undefined,
        onOpenChange: (to: boolean) => {
          setKept((prev) => {
            const k = prev.get(key);
            return k && k.open !== to
              ? new Map(prev).set(key, { ...k, open: to })
              : prev;
          });
          p.onOpenChange?.(to);
        },
      } as object,
      ...c
    );
  };

  const result = on ? filterRows(childrenIn, q, rows, group) : null;
  const count = result?.count ?? 0;

  // Clearing snaps too: the commit that clears and the one after (a group's own landing).
  const [settling, setSettling] = useState(false);
  const [wasFiltering, setWasFiltering] = useState(filtering);
  if (wasFiltering !== filtering) {
    setWasFiltering(filtering);
    if (!filtering) setSettling(true);
  }
  useEffect(() => {
    if (!settling) return;
    const t = window.setTimeout(() => setSettling(false), 0);
    return () => window.clearTimeout(t);
  }, [settling]);

  // The live count, once typing pauses.
  const [announced, setAnnounced] = useState('');
  const announce = filtering ? filterCountText(count, noun) : '';
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(
      () => setAnnounced(announce),
      SIDE_NAV_FILTER_ANNOUNCE_MS
    );
    return () => window.clearTimeout(t);
  }, [on, announce, q]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const callerInputRef = o.inputRef;
  const setInput = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      assignRef(callerInputRef, el);
    },
    [callerInputRef]
  );

  /** The links you can reach, in order (a shut group's are inert). */
  const links = useCallback(
    () =>
      [
        ...(navRef.current?.querySelectorAll<HTMLElement>('.sidenav__link') ??
          []),
      ].filter((el) => !el.closest('[inert]')),
    [navRef]
  );

  // The shortcut focuses the field, unless you're typing in a field or the nav is hidden.
  const shortcut = o.shortcut === undefined ? '/' : o.shortcut;
  useEffect(() => {
    if (!on || !shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key !== shortcut ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.defaultPrevented ||
        typing(e.target)
      )
        return;
      const field = inputRef.current;
      if (!field || !field.getClientRects().length || field.closest('[inert]'))
        return;
      e.preventDefault();
      field.focus();
      field.select();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [on, shortcut]);

  // ↑ from the first link comes back to the field.
  useEffect(() => {
    const nav = navRef.current;
    if (!on || !nav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' || e.defaultPrevented || e.target !== links()[0])
        return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    nav.addEventListener('keydown', onKey);
    return () => nav.removeEventListener('keydown', onKey);
  }, [on, navRef, links]);

  const onEscapeRef = useLatest(o.onEscape);
  const onFieldKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Escape' &&
      !isComposing(e) &&
      query === '' &&
      onEscapeRef.current
    ) {
      onEscapeRef.current();
    } else if (e.key === 'ArrowDown') {
      const first = links()[0];
      if (!first) return;
      e.preventDefault();
      first.focus();
    } else if (e.key === 'Enter' && filtering && count === 1) {
      e.preventDefault();
      links()[0]?.click();
    }
  };

  if (!on)
    return {
      field: null,
      children: childrenIn,
      empty: null,
      filtering: false,
      still: false,
    };

  const field = (
    <div className="sidenav__filter">
      <Search
        ref={setInput}
        size={FIELD_SIZE[size]}
        corners={filterFieldCorners(corners)}
        frame={frame}
        labelText={labelText}
        placeholder={o.placeholder ?? labelText}
        closeButtonLabelText={o.closeButtonLabelText ?? 'Clear filter'}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
        onKeyDown={onFieldKeyDown}
      />
      <div className="sidenav__filter-status" role="status">
        {announced}
      </div>
    </div>
  );
  const empty =
    filtering && count === 0 ? (
      <li className="sidenav__empty">
        No {noun.other} match ‘{query.trim()}’
      </li>
    ) : null;
  return {
    field,
    children: result!.nodes,
    empty,
    filtering,
    still: filtering || settling,
  };
}
