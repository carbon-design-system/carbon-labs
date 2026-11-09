/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Carbon's static icons, without a framework: an `@carbon/icons` descriptor
 * (plain data, one file per icon and artboard) in, the `<svg>` that
 * `@carbon/icons-react` renders out, as data (`iconTree`) or markup (`toSVG`).
 *
 * The root attributes follow `@carbon/icons-react` (its `Icon` and
 * `@carbon/icon-helpers`' `getAttributes`) step for step, in the same order,
 * so the DOM is the same: `focusable="false"`, `preserveAspectRatio`,
 * `fill="currentColor"`, the caller's own attributes, `width` / `height` (the
 * size), the drawing's `viewBox`, then `role="img"` when labelled
 * (`aria-label` / `aria-labelledby`; a `tabindex` makes it focusable) or
 * `aria-hidden="true"` when not, then `class` and `xmlns`. A `title` is an
 * attribute, as Carbon's.
 *
 * No React here: the React wrapper (`carbonIcon`) and the web components both
 * build on these.
 */

/** An element in a Carbon icon descriptor. */
export interface IconNode {
  elem: string;
  attrs: Record<string, string | number>;
  content?: readonly IconNode[];
}

/** One `@carbon/icons` module's default export: an icon's drawing on one artboard. */
export interface IconDescriptor extends IconNode {
  name: string;
  size: number | string;
}

/** An attribute value as the caller passes it (a framework may pass its own values through, e.g. React's style object or handlers). */
export type AttrValue = unknown;
export type Attrs = Record<string, AttrValue>;

/** The resolved `<svg>`: its attributes in Carbon's order, and the drawing's elements. */
export interface IconTree {
  elem: 'svg';
  attrs: Attrs;
  content: readonly IconNode[];
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** `16`, `"16"` and `"16px"` all mean 16, as in `@carbon/icons-react`. */
const sizeOf = (size: number | string) =>
  typeof size === 'number' ? size : Number(String(size).replace(/px$/, ''));

/**
 * The drawing Carbon shows at `size`: the artboard drawn for that size when
 * the icon has one (16, 20 or 24), otherwise the 32 drawing, scaled. Pass
 * only the artboards that carry their own drawing, plus the 32.
 */
export function pickDrawing(
  drawings: readonly IconDescriptor[],
  size: number | string = 16
): IconDescriptor {
  const n = sizeOf(size);
  return (
    drawings.find((d) => d.size === n) ??
    drawings.find((d) => d.size === 32) ??
    drawings[drawings.length - 1]
  );
}

/**
 * The root `<svg>`'s attributes for `drawing` at `size`, with the caller's
 * own `attrs` (DOM names: `class`, `tabindex`, `aria-label`, `title`, …),
 * exactly as `@carbon/icons-react` builds them.
 */
export function svgAttributes(
  drawing: IconDescriptor,
  size: number | string = 16,
  attrs: Attrs = {}
): Attrs {
  // The icon module's own props, then the caller's (which may override them).
  const {
    class: className,
    tabindex,
    xmlns = SVG_NS,
    preserveAspectRatio = 'xMidYMid meet',
    width,
    height,
    viewBox = `0 0 ${width} ${height}`,
    ...rest
  }: Attrs = {
    width: size,
    height: size,
    xmlns: SVG_NS,
    viewBox: drawing.attrs.viewBox,
    fill: 'currentColor',
    ...attrs,
  };
  // getAttributes
  const out: Attrs = {
    focusable: 'false',
    preserveAspectRatio: 'xMidYMid meet',
    ...rest,
    width,
    height,
    viewBox,
  };
  if (out['aria-label'] || out['aria-labelledby']) {
    out.role = 'img';
    if (tabindex !== undefined && tabindex !== null) {
      out.focusable = 'true';
      out.tabindex = tabindex;
    }
  } else {
    out['aria-hidden'] = true;
  }
  // Icon: class after the labelling, then tabindex, xmlns, preserveAspectRatio.
  const { tabindex: focusTab, ...result } = out;
  if (className) {
    result.class = className;
  }
  if (focusTab !== undefined && focusTab !== null) {
    result.tabindex =
      typeof focusTab === 'number' ? focusTab : Number(tabindex);
  }
  if (xmlns) {
    result.xmlns = xmlns;
  }
  if (preserveAspectRatio) {
    result.preserveAspectRatio = preserveAspectRatio;
  }
  return result;
}

/** The `<svg>` for an icon (its drawings, see `pickDrawing`) at `size`, as data. */
export function iconTree(
  drawings: readonly IconDescriptor[],
  size: number | string = 16,
  attrs: Attrs = {}
): IconTree {
  const drawing = pickDrawing(drawings, size);
  return {
    elem: 'svg',
    attrs: svgAttributes(drawing, size, attrs),
    content: drawing.content ?? [],
  };
}

/**
 * A descriptor attribute's value as `@carbon/icons-react` writes it: some
 * descriptors keep tabs and line breaks from the source SVG inside path
 * data, where Carbon's React icons have spaces (the same path either way).
 */
export const attrValue = (v: string | number): string | number =>
  typeof v === 'string' ? v.replace(/[\t\n\r]/g, ' ') : v;

const escape = (v: string) =>
  v
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Markup for a tree (or any descriptor node). Attributes that are null,
 * undefined, false, functions or objects are left out (a string `style`
 * is kept).
 */
export function toSVG(node: IconTree | IconNode): string {
  let attrs = '';
  for (const [k, v] of Object.entries(node.attrs)) {
    if (
      v === null ||
      v === undefined ||
      v === false ||
      typeof v === 'function' ||
      typeof v === 'object'
    ) {
      continue;
    }
    attrs += ` ${k}="${escape(String(node.elem === 'svg' ? v : attrValue(v as string | number)))}"`;
  }
  const inner = (node.content ?? []).map(toSVG).join('');
  return `<${node.elem}${attrs}>${inner}</${node.elem}>`;
}
