/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * Theme zones: an area of the page in a theme of its own.
 *
 *   light, dark   the kit's two themes; each draws in a Carbon theme, its
 *                 class and Carbon's tokens (`CARBON_THEME`: white, g100)
 *   page          the page's own: no zone of its own
 *   inverse       the opposite of the theme round it (light ↔ dark): the side
 *                 nav beside a light workspace, the inverse contextual bar,
 *                 the high-contrast popover. Read from the DOM round it
 *
 * The one place a zone's Carbon class is written (`writeZone`), so every zone
 * reads alike and the surfaces (styles/_surface.scss) follow it. The DOM
 * keeps Carbon's names; `data-cds-theme` says the kit's.
 * ========================================================================== */

// @carbon-explore theme-names — The themes are named `light` and `dark`, drawn in Carbon's `white` and `g100`, while the DOM keeps Carbon's classes. TBD
/** The kit's two themes. */
export type KitTheme = 'light' | 'dark';
/** The Carbon theme each draws in. */
export type CarbonThemeName = 'white' | 'g100';
/** An area's theme: one of the two, the page's own, or the opposite of the theme round it. */
export type ZoneTheme = KitTheme | 'page' | 'inverse';

export const CARBON_THEME: Record<KitTheme, CarbonThemeName> = {
  light: 'white',
  dark: 'g100',
};
export const KIT_THEME: Record<CarbonThemeName, KitTheme> = {
  white: 'light',
  g100: 'dark',
};

const CLASSES = ['cds--white', 'cds--g100'] as const;
const ZONE = '.cds--white, .cds--g100, [data-carbon-theme]';

/** A zone's Carbon class, for a JSX `className`: `cds--white`, `cds--g100`; none for no zone. */
export function zoneClass(
  theme: CarbonThemeName | null | undefined
): string | undefined {
  return theme ? `cds--${theme}` : undefined;
}

/** The Carbon theme an element is in (its nearest zone, or the page's `data-carbon-theme`); null when none names one (Carbon's white). */
export function themeZoneAt(
  el: Element | null | undefined
): CarbonThemeName | null {
  const zone = el?.closest(ZONE);
  if (!zone) {
    return null;
  }
  if (zone.classList.contains('cds--g100')) {
    return 'g100';
  }
  if (zone.classList.contains('cds--white')) {
    return 'white';
  }
  const attr = zone.getAttribute('data-carbon-theme');
  return attr === 'white' || attr === 'g100' ? attr : null;
}

/** The opposite of a Carbon theme (white ↔ g100); no theme is white's. */
export function inverseTheme(
  theme: CarbonThemeName | null | undefined
): CarbonThemeName {
  return theme === 'g100' ? 'white' : 'g100';
}

/** The Carbon theme an area at `el` draws in: null for `page`; for `inverse`, the opposite of the zone round it. */
export function resolveZone(
  theme: ZoneTheme,
  el: Element | null | undefined
): CarbonThemeName | null {
  if (theme === 'page') {
    return null;
  }
  if (theme === 'inverse') {
    return inverseTheme(themeZoneAt(el?.parentElement));
  }
  return CARBON_THEME[theme];
}

/** Makes `el` a zone in `theme` (null: none): its Carbon class and `data-cds-theme`, only what changes
 * (a class change is a theme change to every watcher). Returns whether anything changed. */
export function writeZone(
  el: HTMLElement,
  theme: CarbonThemeName | null
): boolean {
  const want = theme ? `cds--${theme}` : null;
  let changed = false;
  for (const c of CLASSES) {
    if (c !== want && el.classList.contains(c)) {
      el.classList.remove(c);
      changed = true;
    }
  }
  if (want && !el.classList.contains(want)) {
    el.classList.add(want);
    changed = true;
  }
  const kit = theme ? KIT_THEME[theme] : null;
  if (kit && el.dataset.cdsTheme !== kit) {
    el.dataset.cdsTheme = kit;
  } else if (!kit && el.dataset.cdsTheme) {
    delete el.dataset.cdsTheme;
  }
  return changed;
}
