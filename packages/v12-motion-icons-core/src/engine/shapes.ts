/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shapes → SVG, without a framework.
 *
 * An icon's geometry returns `{ key: attributes }` (the React package's
 * `Shapes`). Two painters put them on the page, differing only in who owns
 * the elements; both write attributes the same way (`setAttrs`):
 *  - `paint()` (the web components) owns them: one element per key inside
 *    the ink group, created, reordered and removed as the key set changes;
 *  - `paintKeyed()` (the React package) paints onto the elements React
 *    rendered (`[data-k]`), attributes only: React owns the elements.
 * `shapesMarkup()` is the same drawing as an HTML string, for server output
 * (declarative shadow DOM) and tests.
 *
 * Attribute names follow React's mapping for the props the geometry uses
 * (`strokeWidth` → `stroke-width`, `fillRule` → `fill-rule`, …), so the DOM
 * a web component paints is the DOM the React component renders.
 */
export type ShapeAttrs = Record<string, string | number>;
export type Shapes = Record<string, ShapeAttrs>;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** camelCase SVG attributes that keep their case (React passes these through). */
const KEEP = new Set([
  'pathLength',
  'viewBox',
  'gradientTransform',
  'gradientUnits',
  'patternUnits',
  'preserveAspectRatio',
]);
const nameCache = new Map<string, string>();
export function attrName(a: string): string {
  let n = nameCache.get(a);
  if (n === undefined) {
    n = KEEP.has(a) ? a : a.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    nameCache.set(a, n);
  }
  return n;
}

const byKey = new WeakMap<Element, Map<string, Element>>();

/** Paint `shapes` into `group` (the `<g data-mc-ink>`). Safe to call every frame. */
export function paint(group: Element | null, shapes: Shapes): void {
  if (!group) {
    return;
  }
  let els = byKey.get(group);
  if (!els) {
    byKey.set(group, (els = new Map()));
  }
  const keys = Object.keys(shapes);
  // Structure: one element per key, in key order (a status adds its mark's keys, a placement swap may drop some).
  let i = 0;
  let structural = keys.length !== els.size;
  for (const k of keys) {
    const tag = String(shapes[k].tag ?? 'path');
    let el = els.get(k);
    if (!el || el.localName !== tag) {
      el?.remove();
      el = group.ownerDocument.createElementNS(SVG_NS, tag);
      el.setAttribute('data-k', k);
      els.set(k, el);
      structural = true;
    }
    if (structural || group.children[i] !== el) {
      group.insertBefore(el, group.children[i] ?? null);
    }
    i++;
  }
  if (structural) {
    for (const [k, el] of els) {
      if (!(k in shapes)) {
        el.remove();
        els.delete(k);
      }
    }
  }
  for (const k of keys) {
    setAttrs(els.get(k)!, shapes[k], true);
  }
}

const keyedCache = new WeakMap<Element, Map<string, Element>>();

/**
 * Paint `shapes` onto the elements already rendered under `root` (one
 * `[data-k]` element per key, as a React render leaves them): attributes
 * only, never adding, removing or reordering elements (React owns those).
 * A key with no element is skipped.
 */
export function paintKeyed(root: Element | null, shapes: Shapes): void {
  if (!root) {
    return;
  }
  let byKey = keyedCache.get(root);
  if (!byKey) {
    keyedCache.set(root, (byKey = new Map()));
  }
  for (const k in shapes) {
    let el = byKey.get(k);
    // Gone from under the root (re-rendered, or a `<defs>` replaced): look it up again.
    if (!el || !root.contains(el)) {
      el = root.querySelector(`[data-k="${k}"]`) ?? undefined;
      if (el) {
        byKey.set(k, el);
      }
    }
    if (el) {
      setAttrs(el, shapes[k], false);
    }
  }
}

/** The attributes `paint` last set on each element. */
const setBy = new WeakMap<Element, Set<string>>();

/**
 * One shape's attributes onto its element, for both painters: names as React
 * maps them (`attrName`), and only values that changed are written. With
 * `drop` (`paint`, which owns its elements), an attribute the shape no longer
 * sets goes, as React drops a prop; `paintKeyed` leaves it, as the React
 * package does.
 */
function setAttrs(el: Element, attrs: ShapeAttrs, drop: boolean): void {
  const now = drop ? new Set<string>() : undefined;
  for (const a in attrs) {
    if (a === 'tag') {
      continue;
    }
    const v = attrs[a];
    if (v === undefined || v === null) {
      continue;
    }
    const name = attrName(a);
    now?.add(name);
    const s = String(v);
    if (el.getAttribute(name) !== s) {
      el.setAttribute(name, s);
    }
  }
  if (!now) {
    return;
  }
  const before = setBy.get(el);
  if (before) {
    for (const name of before) {
      if (!now.has(name)) {
        el.removeAttribute(name);
      }
    }
  }
  setBy.set(el, now);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The shapes as markup (`<path data-k="…" d="…"/>…`), no DOM needed. */
export function shapesMarkup(shapes: Shapes): string {
  let out = '';
  for (const k in shapes) {
    const { tag = 'path', ...attrs } = shapes[k] as ShapeAttrs & {
      tag?: string;
    };
    out += `<${tag} data-k="${esc(k)}"`;
    for (const a in attrs) {
      const v = attrs[a];
      if (v === undefined || v === null) {
        continue;
      }
      out += ` ${attrName(a)}="${esc(String(v))}"`;
    }
    out += `></${tag}>`;
  }
  return out;
}
