/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Colour values as the snapshot carries them: an sRGB hex and an alpha, and
// for an OKLCH value its components and whether sRGB can show it. A design
// file stores colour as sRGB floats, so the hex is what is compared; the
// OKLCH value rides along.

// How far outside [0, 1] a linear channel may be and still count as inside
// sRGB: OKLCH values written to four decimals land a hair outside.
const GAMUT_EPSILON = 0.0005;

/**
 * OKLCH to linear sRGB (Ottosson's OKLab matrices).
 *
 * @param {number} l Lightness, 0 to 1.
 * @param {number} c Chroma.
 * @param {number} h Hue, degrees.
 * @returns {[number, number, number]} Linear sRGB.
 */
function oklchToLinearSrgb(l, c, h) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1,
  ];
}

/**
 * Whether an OKLCH colour is inside sRGB.
 *
 * @param {[number, number, number]} lch OKLCH.
 * @returns {'srgb' | 'outside-srgb'} The gamut.
 */
export function gamutOf([l, c, h]) {
  const inside = oklchToLinearSrgb(l, c, h).every(
    (v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON
  );
  return inside ? 'srgb' : 'outside-srgb';
}

/**
 * An OKLCH string's components: `oklch(0.454 0.2742 262.72)`,
 * `oklch(45% 0.27 262deg / 0.5)`.
 *
 * @param {string} text The string.
 * @returns {{ oklch: [number, number, number], alpha: number } | null} The value.
 */
export function parseOklch(text) {
  const m =
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i.exec(
      text.trim()
    );
  if (!m) {
    return null;
  }
  const l = Number(m[1]) / (m[2] ? 100 : 1);
  let alpha = m[5] === undefined ? 1 : Number(m[5]);
  if (m[6]) {
    alpha /= 100;
  }
  return { oklch: [l, Number(m[3]), Number(m[4])], alpha };
}

/**
 * A CSS colour that is static (`#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`,
 * `rgba()`) as a lower-case six-digit hex and an alpha.
 *
 * @param {string} text The colour.
 * @returns {{ hex: string, alpha: number } | null} The value, or null.
 */
export function parseColor(text) {
  const s = text.trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) {
    return { hex: `#${[...m[1]].map((d) => d + d).join('')}`, alpha: 1 };
  }
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(s);
  if (m) {
    const alpha = m[2]
      ? Math.round((parseInt(m[2], 16) / 255) * 1000) / 1000
      : 1;
    return { hex: `#${m[1]}`, alpha };
  }
  m =
    /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+)(%?))?\s*\)$/.exec(
      s
    );
  if (m) {
    const hex = `#${[m[1], m[2], m[3]]
      .map((v) => Number(v).toString(16).padStart(2, '0'))
      .join('')}`;
    let alpha = m[4] === undefined ? 1 : Number(m[4]);
    if (m[5]) {
      alpha /= 100;
    }
    return { hex, alpha };
  }
  return null;
}
