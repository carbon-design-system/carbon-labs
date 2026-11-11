/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { ThemeZone } from './components/ThemeZone';
export type { ThemeZoneProps } from './components/ThemeZone';
export { useThemeZone, zoneAttrs } from './components/useThemeZone';
export {
  BASE_THEME,
  CARBON_THEME,
  KIT_THEME,
  V12_THEME,
  inverseTheme,
  isV12Theme,
  resolveZone,
  themeOf,
  themeZoneAt,
  writeZone,
  zoneClass,
} from './components/zone';
export type { CarbonThemeName, KitTheme, ZoneTheme } from './components/zone';
