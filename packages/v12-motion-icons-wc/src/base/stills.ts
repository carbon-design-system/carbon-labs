/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Still drawings (data, from the core's specs) as markup: what an element
 * draws with `animated="false"`, as the React package does.
 *
 *  - Carbon's art (`carbonArt`): Carbon's own drawing for the size (the
 *    artboard Carbon draws separately, else the 32), with its viewBox;
 *    mirrored ones flip with a CSS `scaleX(-1)`.
 *  - A rest drawing (`geoStill`, or `specStill`: another icon's): the
 *    painted shapes at rest, with their `data-k` keys.
 *
 * Pure string work, so the server output (`ssr.ts`) uses it too.
 */
import {
  FrameController,
  fromHover,
  fromToggle,
  shapesMarkup,
  type DrawingSpec,
  type Shapes,
  type StateSpec,
} from '@carbon-labs/motion-icons-core/engine';
import {
  pickDrawing,
  toSVG,
  type Still,
} from '@carbon-labs/motion-icons-core/static/index';

/** A drawing spec as the engine's state spec (one per drawing, so a controller sees the same object). */
const engineSpecs = new WeakMap<object, StateSpec<string>>();
export function engineSpec(d: DrawingSpec): StateSpec<string> {
  let s = engineSpecs.get(d);
  if (s) {
    return s;
  }
  if (d.kind === 'hover') {
    s = fromHover(d) as StateSpec<string>;
  } else if (d.kind === 'toggle') {
    s = fromToggle(d as never) as StateSpec<string>;
  } else {
    s = {
      states: d.states,
      rest: d.rest,
      geo: d.geo,
      change: d.change as StateSpec<string>['change'],
      hover: d.hover,
      pressed: d.pressed,
    } as StateSpec<string>;
  }
  engineSpecs.set(d, s);
  return s;
}

/** A drawing's shapes at rest, in a state (hover icons have one). */
export function restShapesOf(
  d: DrawingSpec,
  size: number,
  state?: string
): Shapes {
  const s = engineSpec(d);
  return new FrameController(
    s,
    () => undefined,
    size,
    state && s.states.includes(state) ? state : s.states[0]
  ).shapes();
}

const SVG_NS = 'http://www.w3.org/2000/svg';
/** An attribute value as markup (the still goes through unsafeHTML on the client). */
const esc = (v: unknown) =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** The `<svg>` for a still at `size` (inside an element's shadow root). */
export function stillSVG(still: Still, drawSize: number): string {
  // A number, whatever it is given (a string set as a property would otherwise be markup).
  const size =
    Number.isFinite(Number(drawSize)) && Number(drawSize) > 0
      ? Number(drawSize)
      : 32;
  if (still.kind === 'carbon') {
    const drawing = pickDrawing(still.drawings, size);
    const style = still.mirror ? ' style="transform:scaleX(-1)"' : '';
    const inner = (drawing.content ?? []).map((n) => toSVG(n)).join('');
    return `<svg part="svg" xmlns="${SVG_NS}" viewBox="${esc(drawing.attrs.viewBox)}" width="${size}" height="${size}" aria-hidden="true" focusable="false"${style}>${inner}</svg>`;
  }
  const shapes =
    still.kind === 'geo'
      ? still.geo({ h: 0 }, size)
      : restShapesOf(still.spec as DrawingSpec, size);
  return `<svg part="svg" xmlns="${SVG_NS}" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false"><g data-mc-ink>${shapesMarkup(shapes)}</g></svg>`;
}
