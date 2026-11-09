/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The types of @carbon/icons' per-icon modules (it ships none), for whoever compiles this package's source.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- an ambient wildcard module can't be imported
/// <reference path="./carbonIcons.d.ts" />
/**
 * Still drawings as data (refactor stage 2): what an icon draws with
 * `animated={false}` (Carbon's exact art, decision 5) or a toggle in a
 * state when motion is off. Bindings turn them into their own output: the
 * React package into components (`carbonIcon` for Carbon's art), the web
 * components into markup (`toSVG(iconTree(…))`).
 *
 *  - `carbonArt(…descriptors)`: Carbon's own icon, from its `@carbon/icons`
 *    descriptors (the 32 drawing plus any artboard Carbon draws separately),
 *    optionally mirrored;
 *  - `specStill(spec)`: another icon's rest drawing (a frame icon still);
 *  - `geoStill(name, geo)`: a rest drawing from geometry alone.
 */
import type { Shapes } from '../engine/shapes';
import type { IconDescriptor } from './svg';

export { attrValue, iconTree, pickDrawing, svgAttributes, toSVG } from './svg';
export type {
  Attrs,
  AttrValue,
  IconDescriptor,
  IconNode,
  IconTree,
} from './svg';

/** Carbon's own art: an `@carbon/icons` icon, as data. */
export interface CarbonArt {
  readonly kind: 'carbon';
  readonly drawings: readonly IconDescriptor[];
  /** Drawn mirrored left to right (a CSS `scaleX(-1)` on the svg, as Carbon's own mirrored uses). */
  readonly mirror?: boolean;
}
/** Another icon's rest drawing (its own still, whatever that is). */
export interface SpecStill {
  readonly kind: 'spec';
  /** An icon spec (engine/spec.ts); typed loosely here so the static layer doesn't depend on the spec types. */
  readonly spec: { readonly kind: string; readonly name: string };
}
/** A rest drawing from geometry: the frame engine's still, without an icon of its own. */
export interface GeoStill {
  readonly kind: 'geo';
  readonly name: string;
  readonly geo: (f: { h: number }, size?: number) => Shapes;
}
export type Still = CarbonArt | SpecStill | GeoStill;

/** Carbon's own icon from its descriptors (e.g. `carbonArt(Warning16, Warning32)`). */
/* @__NO_SIDE_EFFECTS__ */
export function carbonArt(...drawings: IconDescriptor[]): CarbonArt {
  return { kind: 'carbon', drawings };
}
/** Carbon's art, mirrored left to right. */
/* @__NO_SIDE_EFFECTS__ */
export function mirrored(art: CarbonArt): CarbonArt {
  return { ...art, mirror: true };
}
/** An icon's own rest drawing, as another icon's still. */
/* @__NO_SIDE_EFFECTS__ */
export function specStill(spec: {
  readonly kind: string;
  readonly name: string;
}): SpecStill {
  return { kind: 'spec', spec };
}
/** A rest drawing from geometry. */
/* @__NO_SIDE_EFFECTS__ */
export function geoStill(name: string, geo: GeoStill['geo']): GeoStill {
  return { kind: 'geo', name, geo };
}
