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
 *                 class and Carbon's tokens: white and g100, or, on a page in
 *                 a v12 theme, v12 light and v12 dark (`themeOf`)
 *   page          the page's own: no zone of its own
 *   inverse       the opposite of the theme round it (light ↔ dark), in the
 *                 same pair: the side nav beside a light workspace, the
 *                 inverse contextual bar, the high-contrast popover. Read from
 *                 the DOM round it
 *
 * The one place a zone's Carbon class is written (`writeZone`), so every zone
 * reads alike and the surfaces (styles/_surface.scss) follow it. The DOM
 * keeps Carbon's names (`cds--g100`, `cds--v12-dark`); `data-cds-theme` says
 * the kit's.
 * ========================================================================== */

/** The kit's two themes. */
export type KitTheme = 'light' | 'dark';
/** The Carbon theme each draws in: v11's white and g100, or v12's light and dark. */
export type CarbonThemeName = 'white' | 'g100' | 'v12-light' | 'v12-dark';
/** An area's theme: one of the two, the page's own, or the opposite of the theme round it. */
export type ZoneTheme = KitTheme | 'page' | 'inverse';

/** The v11 Carbon theme each kit theme draws in. */
export const CARBON_THEME: Record<KitTheme, CarbonThemeName> = {
  light: 'white',
  dark: 'g100',
};
/** The v12 Carbon theme each kit theme draws in. */
export const V12_THEME: Record<KitTheme, CarbonThemeName> = {
  light: 'v12-light',
  dark: 'v12-dark',
};
export const KIT_THEME: Record<CarbonThemeName, KitTheme> = {
  white: 'light',
  g100: 'dark',
  'v12-light': 'light',
  'v12-dark': 'dark',
};
/** The v11 Carbon theme a v12 one is built on, for Carbon's `Theme`, which knows only its own. */
export const BASE_THEME: Record<CarbonThemeName, 'white' | 'g100'> = {
  white: 'white',
  g100: 'g100',
  'v12-light': 'white',
  'v12-dark': 'g100',
};

const NAMES = Object.keys(KIT_THEME) as CarbonThemeName[];
const CLASSES = NAMES.map((name) => `cds--${name}`);
const ZONE = [...CLASSES.map((c) => `.${c}`), '[data-carbon-theme]'].join(', ');

const isName = (value: unknown): value is CarbonThemeName =>
  NAMES.includes(value as CarbonThemeName);

/** Whether a theme is one of v12's (v12 light, v12 dark). */
export function isV12Theme(theme: CarbonThemeName | null | undefined): boolean {
  return theme === 'v12-light' || theme === 'v12-dark';
}

/** The Carbon theme a kit theme draws in, in the pair of the theme round it: v12's when that is a v12 theme, else v11's. */
export function themeOf(
  kit: KitTheme,
  round: CarbonThemeName | null | undefined
): CarbonThemeName {
  return (isV12Theme(round) ? V12_THEME : CARBON_THEME)[kit];
}

/** A zone's Carbon class, for a JSX `className`: `cds--white`, `cds--v12-dark`; none for no zone. */
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
  const named = NAMES.find((name) => zone.classList.contains(`cds--${name}`));
  if (named) {
    return named;
  }
  const attr = zone.getAttribute('data-carbon-theme');
  return isName(attr) ? attr : null;
}

/** The opposite of a Carbon theme, in its pair (white ↔ g100, v12 light ↔ v12 dark); no theme is white's. */
export function inverseTheme(
  theme: CarbonThemeName | null | undefined
): CarbonThemeName {
  const kit = theme ? KIT_THEME[theme] : 'light';
  return themeOf(kit === 'dark' ? 'light' : 'dark', theme);
}

/** The Carbon theme an area at `el` draws in: null for `page`; for `inverse`, the opposite of the zone round it;
 * for `light` and `dark`, that theme in the pair round it. */
export function resolveZone(
  theme: ZoneTheme,
  el: Element | null | undefined
): CarbonThemeName | null {
  if (theme === 'page') {
    return null;
  }
  const round = themeZoneAt(el?.parentElement);
  if (theme === 'inverse') {
    return inverseTheme(round);
  }
  return themeOf(theme, round);
}

/** Makes `el` a zone in `theme` (null: none): its Carbon class and `data-cds-theme`, only what changes
 * (a class change is a theme change to every watcher). Returns whether anything changed. */
export function writeZone(
  el: HTMLElement,
  theme: CarbonThemeName | null
): boolean {
  const want = zoneClass(theme) ?? null;
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
