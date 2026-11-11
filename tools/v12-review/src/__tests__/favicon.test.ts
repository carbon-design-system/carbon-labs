/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { FAVICON_THEMES, faviconSvg, iconSecondaryOf } from '../favicon';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** A mark as the header draws it: an inline icon with its own attributes. */
function mark() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('width', '20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'icon');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M4 4h24v24H4z');
  svg.appendChild(path);
  return svg;
}

describe('the favicon', () => {
  it("is the mark's drawing in the light tone, and the dark tone under a dark scheme", () => {
    const svg = faviconSvg(mark(), '#525252', '#c6c6c6');
    expect(svg).toContain('d="M4 4h24v24H4z"');
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toMatch(/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toContain('svg{color:#525252;fill:#525252}');
    expect(svg).toContain(
      '@media (prefers-color-scheme:dark){svg{color:#c6c6c6;fill:#c6c6c6}}'
    );
  });

  it("leaves the page's own attributes behind, and the mark as it was", () => {
    const m = mark();
    const svg = faviconSvg(m, '#525252', '#c6c6c6');
    expect(svg).not.toContain('aria-hidden');
    expect(svg).not.toContain('class=');
    expect(svg).toContain('width="32"');
    expect(m.getAttribute('class')).toBe('icon');
  });
});

describe("the favicon's tones", () => {
  it('reads each tone from a v12 zone, the only zones the page defines', () => {
    expect(FAVICON_THEMES).toEqual({ light: 'v12-light', dark: 'v12-dark' });
  });

  it("reads a zone's own icon-secondary, not the page's", () => {
    const style = document.createElement('style');
    style.textContent =
      ':root{--cds-icon-secondary:#000000}' +
      '.cds--v12-light{--cds-icon-secondary:#525252}' +
      '.cds--v12-dark{--cds-icon-secondary:#c6c6c6}';
    document.head.appendChild(style);
    try {
      expect(iconSecondaryOf(FAVICON_THEMES.light)).toBe('#525252');
      expect(iconSecondaryOf(FAVICON_THEMES.dark)).toBe('#c6c6c6');
    } finally {
      style.remove();
    }
  });
});
