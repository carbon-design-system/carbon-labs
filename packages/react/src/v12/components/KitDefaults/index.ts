/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  BrandZone,
  KIT_BRANDS,
  KitDefaults,
  useKitDefaults,
  useDefaultFrame,
  resolveFrame,
  useDefaultSize,
  useKitProps,
  resolveSize,
  resolveKitProps,
  resolveContainerCorners,
  useContainerCorners,
  KIT_SHADOW,
  resolveShadow,
  useSurfaceShadow,
  CONTROL_SIZES,
  ROW_SIZES,
  TABLE_SIZES,
  TAG_SIZES,
  type ContainerCorners,
  type DensityMap,
  type KitBrand,
  type KitCorners,
  type KitDefaultsProps,
  type KitDefaultsValue,
  type KitDensity,
  type KitFrame,
  type KitShadow,
  type KitPropsGiven,
  type KitPropsSpec,
  type KitVariant,
} from './components/KitDefaults';
export { KitPortal, type KitPortalProps } from './components/KitPortal';

// The names other v12 packages take from this package's files.
export {
  CONTROL_KIT,
  FIELD_KIT,
  LOADER_KIT,
  MENU_BUTTON_KIT,
  PICKER_KIT,
  ROW_KIT,
  TAG_KIT,
} from './components/KitDefaults';
export { usePortalBrand } from './components/KitPortal';
