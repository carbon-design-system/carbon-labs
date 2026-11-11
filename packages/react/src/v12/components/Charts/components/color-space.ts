/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The color math the skin and the palette share: OKLCH to sRGB, a CSS color
// read back as sRGB, and WCAG 2.x contrast. Colors are stored in OKLCH, as
// the v12 themes write them; the plot draws in sRGB, since its canvas takes
// sRGB strings and can't blend `oklch()`.

/** A color in OKLCH: lightness 0 to 1, chroma, hue in degrees. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** An sRGB color, each channel 0 to 1. */
type Rgb = [number, number, number];

const toLinear = (v: number): number =>
  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const toGamma = (v: number): number =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * OKLCH to sRGB, unclamped.
 *
 * @param color The color.
 * @returns Its sRGB channels, which may fall outside 0 to 1.
 */
function rawSrgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    toGamma(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    toGamma(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    toGamma(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  ];
}

const inGamut = (rgb: Rgb): boolean =>
  rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/**
 * OKLCH to sRGB. A color outside sRGB keeps its lightness and hue and loses
 * chroma until it fits.
 *
 * @param color The color.
 * @returns Its sRGB channels, 0 to 1.
 */
export function oklchToSrgb(color: Oklch): Rgb {
  let rgb = rawSrgb(color);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(rawSrgb({ ...color, c: mid }))) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    rgb = rawSrgb({ ...color, c: lo });
  }
  return rgb.map(clamp01) as Rgb;
}

/**
 * sRGB to OKLCH.
 *
 * @param rgb The sRGB channels, 0 to 1.
 * @returns The color.
 */
function srgbToOklch(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(toLinear);
  const L = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const M = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const S = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const l = 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S;
  const a = 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S;
  const bb = 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S;
  const h = (Math.atan2(bb, a) * 180) / Math.PI;
  return { l, c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h };
}

const hex2 = (v: number): string =>
  Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, '0');

const rgbHex = (rgb: Rgb): string => `#${rgb.map(hex2).join('')}`;

/**
 * An OKLCH color as sRGB hex, for the plot.
 *
 * @param color The color.
 * @returns `#rrggbb`.
 */
export function oklchToHex(color: Oklch): string {
  return rgbHex(oklchToSrgb(color));
}

/**
 * An OKLCH color as CSS, written as the v12 themes write it.
 *
 * @param color The color.
 * @returns `oklch(L% C Hdeg)`.
 */
export function formatOklch({ l, c, h }: Oklch): string {
  const r = (n: number, d: number) => Number(n.toFixed(d));
  return `oklch(${r(l * 100, 2)}% ${r(c, 4)} ${r(h, 2)}deg)`;
}

const NUMBER = String.raw`([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)`;
const OKLCH = new RegExp(
  String.raw`^oklch\(\s*${NUMBER}(%?)\s+${NUMBER}(%?)\s+${NUMBER}(deg)?\s*(?:/\s*[\d.]+%?\s*)?\)$`,
  'i'
);
const RGB = new RegExp(
  String.raw`^rgba?\(\s*${NUMBER}\s*[,\s]\s*${NUMBER}\s*[,\s]\s*${NUMBER}\s*(?:[,/]\s*[\d.]+%?\s*)?\)$`,
  'i'
);
const SRGB = new RegExp(
  String.raw`^color\(\s*srgb\s+${NUMBER}\s+${NUMBER}\s+${NUMBER}\s*(?:/\s*[\d.]+%?\s*)?\)$`,
  'i'
);
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})(?:[0-9a-f]{2})?$/i;

/**
 * A CSS color as the theme serves it (`#hex`, `rgb()`, `color(srgb …)` or
 * `oklch()`), read as sRGB. Alpha is dropped: the skin's roles are opaque.
 *
 * @param css The color, as a computed custom property returns it.
 * @returns `#rrggbb`, or null when it can't be read.
 */
export function cssColorToHex(css: string): string | null {
  const s = css.trim();
  let m = HEX.exec(s);
  if (m) {
    const d = m[1].length === 3 ? [...m[1]].map((x) => x + x) : [m[1]];
    return `#${d.join('').toLowerCase()}`;
  }
  m = OKLCH.exec(s);
  if (m) {
    const l = Number(m[1]) / (m[2] ? 100 : 1);
    const c = m[4] ? (Number(m[3]) / 100) * 0.4 : Number(m[3]);
    return oklchToHex({ l, c, h: Number(m[5]) });
  }
  m = RGB.exec(s);
  if (m) {
    return rgbHex([m[1], m[2], m[3]].map((v) => Number(v) / 255) as Rgb);
  }
  m = SRGB.exec(s);
  if (m) {
    return rgbHex([m[1], m[2], m[3]].map(Number) as Rgb);
  }
  return null;
}

/**
 * An sRGB hex color in OKLCH.
 *
 * @param hex `#rrggbb` or `#rgb`.
 * @returns The color, or null when it isn't hex.
 */
export function hexToOklch(hex: string): Oklch | null {
  const norm = cssColorToHex(hex);
  if (!norm || !hex.trim().startsWith('#')) {
    return null;
  }
  const rgb = [1, 3, 5].map(
    (i) => parseInt(norm.slice(i, i + 2), 16) / 255
  ) as Rgb;
  return srgbToOklch(rgb);
}

/**
 * The WCAG 2.x relative luminance of an sRGB hex color.
 *
 * @param hex `#rrggbb`.
 * @returns 0 (black) to 1 (white).
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) =>
    toLinear(parseInt(hex.slice(i, i + 2), 16) / 255)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The WCAG 2.x contrast ratio between two colors, as the plot draws them.
 *
 * @param a A color: `#rrggbb`, or OKLCH.
 * @param b The other.
 * @returns 1 to 21.
 */
export function contrastRatio(a: string | Oklch, b: string | Oklch): number {
  const y = (c: string | Oklch) =>
    relativeLuminance(typeof c === 'string' ? c : oklchToHex(c));
  const [hi, lo] = [y(a), y(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}
