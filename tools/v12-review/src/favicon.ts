/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The page's favicon: the header's Carbon mark, in the lower-contrast tone it
// has there (the theme's `icon-secondary`). An SVG that follows the browser's
// color scheme: the light theme's tone, the dark theme's under a dark scheme.

import { useEffect } from 'react';
import type { RefObject } from 'react';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * A theme's `icon-secondary`, read from its class.
 * @param {string} theme The theme's name: `white`, `g100`.
 */
export function iconSecondaryOf(theme: string): string {
  const probe = document.createElement('div');
  probe.className = `cds--${theme}`;
  probe.hidden = true;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)
    .getPropertyValue('--cds-icon-secondary')
    .trim();
  probe.remove();
  return value;
}

/**
 * The favicon's SVG: the mark's drawing in `light`, and in `dark` under a dark color scheme.
 * @param {SVGSVGElement} mark The mark as the page draws it (left as it is).
 * @param {string} light Its color under a light color scheme, and where there's no scheme.
 * @param {string} dark Its color under a dark color scheme.
 */
export function faviconSvg(mark: SVGSVGElement, light: string, dark: string) {
  const svg = mark.cloneNode(true) as SVGSVGElement;
  for (const name of ['class', 'style', 'aria-hidden', 'focusable', 'role']) {
    svg.removeAttribute(name);
  }
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent =
    `svg{color:${light};fill:${light}}` +
    `@media (prefers-color-scheme:dark){svg{color:${dark};fill:${dark}}}`;
  svg.insertBefore(style, svg.firstChild);
  return new XMLSerializer().serializeToString(svg);
}

/**
 * Sets the page's favicon to the mark in `ref` (its first `svg`), once it has drawn.
 * @param {RefObject<HTMLElement | null>} ref What holds the mark.
 */
export function useMarkFavicon(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const mark = ref.current?.querySelector('svg');
    if (!mark) {
      return;
    }
    const light = iconSecondaryOf('white');
    const dark = iconSecondaryOf('g100');
    if (!light || !dark) {
      return;
    }
    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"][data-v12-review]'
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.setAttribute('data-v12-review', '');
      document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg(mark, light, dark))}`;
  }, [ref]);
}
