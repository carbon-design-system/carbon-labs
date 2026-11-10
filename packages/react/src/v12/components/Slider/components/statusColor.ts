/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The line's status colors, solved against the surface the slider sits on,
 * darker or lighter by context as the chart status icons are.
 *
 *   surface  measured: the nearest ancestor with an opaque background (as
 *            motion-core's `tonalContext` finds it), so `$background`, a
 *            `$layer-01/02/03` inside Carbon's `<Layer>`, a card or a tinted
 *            panel. Written on the slider as `--cds-slider-surface`: the
 *            pill's center. None found: the CSS falls back to `$background`
 *   color    the kit's chart family's method, both halves of it:
 *              - the step (`lightnessStep`, below): the support
 *                color moved in CIELAB L*, away from the surface (darker on a
 *                light one, lighter on a dark one), hue kept;
 *              - the amount (`contrast.ts`, the 3:1 rule): the fewest whole
 *                L* that reach 3:1 against the surface. A color that already
 *                passes is used as it is.
 *            Written per status as `--cds-slider-<status>`; the support color
 *            is the theme's own token, read where the slider is (so it
 *            follows `<Theme>`). The line's status fill takes it.
 *            Exception: warning on a light surface keeps Carbon's yellow
 *            (1.7:1 on white)
 *   when     on mount (before paint), and whenever a
 *            class or `data-carbon-theme` changes anywhere (a theme switch, a
 *            `<Layer>` or a card's class) or a background-color transition
 *            ends, batched to one frame. One watcher for the page.
 *
 * `lightnessStep` is the chart family's, inlined: the kit can't import
 * the charts.
 *
 * Contextual tokens alone can't do it: Carbon's `$layer` is the layer ABOVE
 * the surface (a field's), not the surface, and the 3:1 needs the color.
 * ========================================================================== */

import { onThemeChange } from '@carbon-labs/react-util';

export type SolvedStatus = 'success' | 'warning' | 'error' | 'info';

/** The 3:1 a status color holds against the surface. */
export const STATUS_CONTRAST = 3;

type Rgba = [number, number, number, number];
let ctx: CanvasRenderingContext2D | null = null;

/** Any CSS color (rgb(), hex, oklch(), color(srgb …)) → sRGB bytes and alpha, through a 1px canvas. */
function rgba(css: string): Rgba | null {
  ctx ??= document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true });
  if (!ctx || !css) {
    return null;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#0000';
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r!, g!, b!, a! / 255];
}

const hex = ([r, g, b]: Rgba) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

/** Any opaque CSS color as `#rrggbb`, or null (empty, or not opaque). */
export function cssHex(css: string): string | null {
  const c = rgba(css.trim());
  return c && c[3] >= 0.999 ? hex(c) : null;
}

/* ── the chart family's lightness step (CIELAB L*, hue kept) ── */

type Lab = [number, number, number];
type Rgb = [number, number, number];

const toLinear = (v: number) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) =>
  (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255;
// D65 white.
const XN = 0.95047;
const ZN = 1.08883;
const f = (t: number) =>
  t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
const fInv = (t: number) =>
  t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27);

function rgbToLab([r8, g8, b8]: Rgb): Lab {
  const [r, g, b] = [toLinear(r8), toLinear(g8), toLinear(b8)];
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN;
  const fy = f(y);
  return [116 * fy - 16, 500 * (f(x) - fy), 200 * (fy - f(z))];
}

/** Lab → linear-light sRGB, unclamped (so the caller can see when it's out of gamut). */
function labToLinear([l, a, bb]: Lab): Rgb {
  const fy = (l + 16) / 116;
  const x = fInv(fy + a / 500) * XN;
  const y = fInv(fy);
  const z = fInv(fy - bb / 200) * ZN;
  return [
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * y + 0.041556 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** Lab → sRGB 0..255, chroma reduced (hue and L* held) until it fits. */
function labToRgb([l0, a0, b0]: Lab): Rgb {
  const l = Math.min(100, Math.max(0, l0));
  let [a, b] = [a0, b0];
  let lin = labToLinear([l, a, b]);
  for (let i = 0; i < 24 && !inGamut(lin); i++) {
    a *= 0.9;
    b *= 0.9;
    lin = labToLinear([l, a, b]);
  }
  return lin.map((v) =>
    Math.round(
      Math.min(255, Math.max(0, fromLinear(Math.min(1, Math.max(0, v)))))
    )
  ) as Rgb;
}

/** The lowest L* a darkening step may land on: below it the change is lost in the display's black. */
const DARK_FLOOR = 5;

/** `#rrggbb` moved `delta` L* away from the surface: darker on `'light'`, lighter on `'dark'`, the other way when there isn't room. */
function lightnessStep(
  color: string,
  surface: 'light' | 'dark',
  delta: number
): string {
  const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)) as Rgb;
  const [l, a, b] = rgbToLab(rgb);
  const away = surface === 'light' ? -1 : 1;
  const room = away < 0 ? l - DARK_FLOOR : 100 - l;
  const dir = room >= delta ? away : -away;
  return hex([...labToRgb([l + dir * delta, a, b]), 1]);
}

const luminance = (h: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(h.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
export const contrastRatio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** A light surface: L* 50 and up (luminance 0.184); below it a color steps lighter. */
const isLight = (surface: string) => luminance(surface) >= 0.184;

const solved = new Map<string, string>();

/** The solved color: `base` stepped away from `surface` by the fewest L* that reach `ratio`, 3:1 by default (hex in, hex out). */
export function solveStatusColor(
  base: string,
  surface: string,
  ratio = STATUS_CONTRAST
): string {
  const key = `${base}|${surface}|${ratio}`;
  const hit = solved.get(key);
  if (hit) {
    return hit;
  }
  const side = isLight(surface) ? 'light' : 'dark';
  let c = base;
  for (let d = 1; d <= 60 && contrastRatio(c, surface) < ratio; d++) {
    c = lightnessStep(base, side, d);
  }
  solved.set(key, c);
  return c;
}

/** The color of the nearest opaque surface `el` sits on, or null. */
export function surfaceOf(el: Element): string | null {
  for (let a = el.parentElement; a; a = a.parentElement) {
    const c = rgba(getComputedStyle(a).backgroundColor);
    if (c && c[3] >= 0.999) {
      return hex(c);
    }
  }
  return null;
}

const set = (el: HTMLElement, name: string, v: string | null) => {
  if (v == null) {
    el.style.removeProperty(name);
  } else if (el.style.getPropertyValue(name) !== v) {
    el.style.setProperty(name, v);
  }
};

const STATUSES: SolvedStatus[] = ['success', 'warning', 'error', 'info'];

/** What `solveSurface` reads from the page for one slider. */
interface SurfaceReading {
  el: HTMLElement;
  surface: string | null;
  supports: (string | null)[];
}

/** Reads `el`'s surface and the status tokens on it (no writes, so many reads share one style pass). */
function readSurface(el: HTMLElement): SurfaceReading {
  const surface = surfaceOf(el);
  const style = getComputedStyle(el);
  const supports = STATUSES.map((s) => {
    const c = rgba(style.getPropertyValue(`--cds-support-${s}`).trim());
    return c ? hex(c) : null;
  });
  return { el, surface, supports };
}

/** Writes a reading's surface and each status's solved color (`--cds-slider-<status>`). */
function writeSurface({ el, surface, supports }: SurfaceReading): void {
  set(el, '--cds-slider-surface', surface);
  STATUSES.forEach((s, i) => {
    const support = supports[i];
    const keep = s === 'warning' && surface && isLight(surface);
    set(
      el,
      `--cds-slider-${s}`,
      surface && support
        ? keep
          ? support
          : solveStatusColor(support, surface)
        : null
    );
  });
}

/** Measures `el`'s (a `.cds-slider`'s) surface and writes it on it, with each status's solved color
 *  (`--cds-slider-<status>`). All four, so a fill still showing the old status in a wipe has its own. */
export function solveSurface(el: HTMLElement): void {
  writeSurface(readSurface(el));
}

/** Every slider read first, then every one written: one style pass however many sliders a page has. */
function solveMany(els: Iterable<HTMLElement>): void {
  const readings = [...els].filter((el) => el.isConnected).map(readSurface);
  readings.forEach(writeSurface);
}

const sliders = new Set<HTMLElement>();
let frame = 0;
const solveAll = () => {
  frame = 0;
  solveMany(sliders);
};
const schedule = () => {
  if (!frame) {
    frame = requestAnimationFrame(solveAll);
  }
};

/** Sliders mounted in one commit, solved together just after it (before paint). */
const mounting = new Set<HTMLElement>();
const flushMounting = () => {
  const els = [...mounting];
  mounting.clear();
  solveMany(els);
};

/** Keeps `el`'s surface and status colors solved while it is mounted; returns its stop. A theme change
 *  round it, or a background under it easing to a new color, solves every slider in the next frame. */
export function watchSurface(el: HTMLElement): () => void {
  sliders.add(el);
  if (!mounting.size) {
    queueMicrotask(flushMounting);
  }
  mounting.add(el);
  const off = onThemeChange(el, schedule, { backgrounds: true });
  return () => {
    off();
    sliders.delete(el);
    mounting.delete(el);
    if (sliders.size) {
      return;
    }
    if (frame) {
      cancelAnimationFrame(frame);
    }
    frame = 0;
  };
}
