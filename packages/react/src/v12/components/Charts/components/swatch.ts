/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A series key as a small SVG, drawn as its mark looks: a line, a dashed
// line, a band, a bar, a pill, a texture sample or a solid band with dotted
// edges. Legends and tooltips write it into their rows. 14 by 8 px.

/** What a key draws. */
export type SwatchKind =
  | 'solid'
  | 'dashed'
  | 'band'
  | 'bar'
  | 'dots'
  | 'pill'
  | 'none'
  | 'solidBand';

/** A key's options. */
export interface SwatchOptions {
  /** A dashed line's dash, as `stroke-dasharray` takes it. */
  dash?: string;
  /** A line's stroke, px. */
  width?: number;
  opacity?: number;
  /** A texture sample's mark, px: a dot's diameter or a cell's side. */
  mark?: number;
  /** A texture sample's pitch, px. */
  pitch?: number;
  /** Square cells in place of dots. */
  cells?: boolean;
  /** A texture sample's footprint: the bar key's 8 by 8, or the band key's 14 by 6. */
  area?: 'bar' | 'band';
  /** A wash of the color under the marks, at this alpha. */
  tint?: number;
  /** A solid band's body color, in place of the color at `opacity`. */
  fill?: string;
}

const OPEN =
  '<svg width="14" height="8" aria-hidden="true" style="vertical-align:middle;margin:0 6px 2px 0">';

/**
 * A number for SVG, at three places at most.
 *
 * @param n The number.
 * @returns It, rounded.
 */
const num = (n: number): number => +n.toFixed(3);

/**
 * A fill of a color at an alpha.
 *
 * @param color The color.
 * @param alpha The alpha.
 * @returns The `fill` and `fill-opacity` attributes.
 */
const filled = (color: string, alpha: number): string =>
  `fill="${color}"${alpha < 1 ? ` fill-opacity="${num(alpha)}"` : ''}`;

/**
 * A series key.
 *
 * @param kind What it draws.
 * @param color Its color.
 * @param opts Its options.
 * @returns The SVG.
 */
export function swatchSvg(
  kind: SwatchKind,
  color: string,
  opts: SwatchOptions = {}
): string {
  if (kind === 'solidBand') {
    const mark = num(opts.mark ?? 2);
    const pitch = num(Math.max(opts.pitch ?? 3, mark));
    const r = mark / 2;
    const edge = (y: number) =>
      `<line x1="${r}" y1="${y}" x2="${14 - r}" y2="${y}" stroke="${color}" stroke-width="${mark}" stroke-dasharray="0 ${pitch}" stroke-linecap="round" />`;
    const body = opts.fill
      ? `fill="${opts.fill}"`
      : filled(color, opts.opacity ?? 0.3);
    return `${OPEN}<rect x="0" y="${num(1 + r)}" width="14" height="${num(6 - mark)}" ${body} />${edge(num(1 + r))}${edge(num(7 - r))}</svg>`;
  }
  if (kind === 'dots' || kind === 'pill' || kind === 'none') {
    let body = '';
    if (kind === 'pill') {
      body = `<rect x="1" y="1" width="12" height="6" rx="3" fill="${color}" />`;
    }
    if (kind === 'dots') {
      const mark = opts.mark ?? 2;
      const pitch = Math.max(opts.pitch ?? 3, mark);
      const [x0, x1, y0, y1] =
        opts.area === 'band' ? [0, 14, 1, 7] : [3, 11, 0, 8];
      // Whole marks only, centered in the footprint on the lattice's pitch.
      const nx = Math.max(1, Math.floor((x1 - x0 - mark) / pitch) + 1);
      const ny = Math.max(1, Math.floor((y1 - y0 - mark) / pitch) + 1);
      const ox = x0 + (x1 - x0 - (nx - 1) * pitch) / 2;
      const oy = y0 + (y1 - y0 - (ny - 1) * pitch) / 2;
      const r = num(mark / 2);
      const marks: string[] = [];
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const cx = num(ox + i * pitch);
          const cy = num(oy + j * pitch);
          marks.push(
            opts.cells
              ? `<rect x="${num(cx - r)}" y="${num(cy - r)}" width="${num(mark)}" height="${num(mark)}" />`
              : `<circle cx="${cx}" cy="${cy}" r="${r}" />`
          );
        }
      }
      const tint = opts.tint
        ? `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" ${filled(color, opts.tint)} />`
        : '';
      body = `${tint}<g ${filled(color, opts.opacity ?? 1)}>${marks.join('')}</g>`;
    }
    return `${OPEN}${body}</svg>`;
  }
  const shape =
    kind === 'band'
      ? `<rect x="0" y="1" width="14" height="6" ${filled(color, 0.22)} />`
      : kind === 'bar'
        ? `<rect x="3" y="0" width="8" height="8" fill="${color}" />`
        : `<line x1="0" y1="4" x2="14" y2="4" stroke="${color}" stroke-width="${opts.width ?? 2}"` +
          (kind === 'dashed'
            ? ` stroke-dasharray="${opts.dash ?? '4 2'}"`
            : '') +
          (opts.opacity != null ? ` stroke-opacity="${opts.opacity}"` : '') +
          ' />';
  return `${OPEN}${shape}</svg>`;
}
