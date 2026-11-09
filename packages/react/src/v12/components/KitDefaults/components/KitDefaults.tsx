/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CastElevation } from '@carbon-labs/v12-motion';
import '@carbon-labs/v12-styles/scss/_brand.scss';

/* ============================================================================
 * KitDefaults — the defaults for a subtree: `density`, `corners`,
 * `variant`, the `brand`, the `frame` and the `shadow`. A component reads them only for a prop it isn't given, so its
 * own prop always wins; with no provider, every component keeps its own
 * defaults. Providers nest: an inner one overrides only what it sets.
 *
 *   density   compact · default · spacious, mapped onto each component's
 *             own size scale (controls sm 32 · md 40 · lg 48; rows, the side
 *             nav's and the tree's, sm 26 · md 32 · lg 40; the table
 *             sm · md · lg; Tag sm 18 · md 20 · lg 32). The maps are below
 *   corners   full · rounded · square, the kit's corners vocabulary
 *             (`rounded` is each component's own radius). The containers
 *             (DataTable, Accordion, ContainedList, StructuredList) take
 *             `square` and `rounded` from it too
 *   containerCorners  square · rounded: the containers' alone, so a rounded
 *             Region rounds the tables and lists inside without rounding a
 *             pill button or a tag (a Region sets it from its radius: square
 *             at 0, else rounded); `corners` square or rounded sets it as
 *             well. No provider: square (v11)
 *   variant   a treatment; a component takes it when it is one of its own
 *             variants (the fields and the loaders: neutral · hero;
 *             MenuButton's menu, its `menuVariant`: inverse · tonal ·
 *             outlined · hero) and ignores it otherwise. Never a button's own
 *             treatment: outlined and tonal are a choice per button, not per
 *             region (and a busy button's spinner stays the button's colour)
 *   frame     inset · ghost: what the selection and navigation components
 *             inside stand on. A Region sets it from its
 *             surface (page: inset; quiet or raised: ghost); a component
 *             takes it only when it has that frame (TabList's line, the
 *             content switcher's inset, the menus' floating never change)
 *   brand     the hue `variant="hero"` draws in, a brand colour: blue
 *             (default) · purple ·
 *             magenta · cyan · teal (never red, yellow or green: IBM's
 *             status colours keep their meaning). Unlike the others it is
 *             CSS: the provider draws a brand zone (a `display: contents`
 *             wrapper with `data-cds-brand`), which points `--cds-hero` at
 *             the hue's Carbon grades for each theme
 *             (styles/_brand.scss). Every hero reads it: the selection
 *             kit's (and Menu's), the slider's, the toggle's, the fields'
 *             and the loaders'
 *   shadow    the cast shadow on the kit's surfaces: `false` (the default,
 *             KIT_SHADOW)
 *             · `true` (the `floating` elevation) · an elevation. The
 *             floating surfaces (Menu and what opens one, the Dropdown
 *             family's list, Popover and Toggletip, the DatePicker's
 *             calendar, Modal, NotificationsPanel, ContextualBar, a floating
 *             SidePanel, the toast deck), a clickable Card and SideNav's
 *             ghost container. Without it a floating surface stands on its
 *             fill and hairline (`--cds-surface`, `--cds-surface-divider`)
 *
 * A component's own parts (a field's clear button, the pagination's
 * buttons, the side panel's close) are given their size and corners by the
 * component, so a provider reaches only the controls a page puts in.
 * ========================================================================== */

export type KitDensity = 'compact' | 'default' | 'spacious';
export type KitCorners = 'full' | 'rounded' | 'square';
/**
 * A container's corners (DataTable, Accordion, ContainedList,
 * StructuredList; PageHeader's `corners` is the same shape): `square` on the
 * page and attached to an edge
 * (v11), `rounded` (8px, the inner parts concentric) inside a card or a
 * rounded region.
 */
export type ContainerCorners = 'square' | 'rounded';
/** The treatments. */
export type KitVariant = 'inverse' | 'tonal' | 'outlined' | 'hero' | 'neutral';
/** The frames a context can default. */
export type KitFrame = 'inset' | 'ghost';

/** The hues a brand can be: Carbon's tag hues, less the grays (the gray is neutral). */
export const KIT_BRANDS = [
  'blue',
  'purple',
  'magenta',
  'cyan',
  'teal',
] as const;
export type KitBrand = (typeof KIT_BRANDS)[number];

/**
 * A surface's cast shadow, as the floating surfaces' `shadow` prop takes it
 * (carbon-motion's `SurfaceShadowOption`): `true` is the `floating`
 * elevation, an elevation names one, `false` none.
 */
export type KitShadow = boolean | CastElevation;
/** The kit's default cast shadow: none. */
export const KIT_SHADOW: KitShadow = false;

export interface KitDefaultsValue {
  density?: KitDensity;
  corners?: KitCorners;
  variant?: KitVariant;
  /** The hero hue for the subtree. Default (no provider): IBM blue. */
  brand?: KitBrand;
  /**
   * The default frame of the selection and navigation components inside
   * (the select list, vertical tabs, the side nav, a toolbar's exclusive
   * groups): `inset` on the page, `ghost` in a framed region. A Region sets
   * it from its surface; a component's own `frame` wins, and a component
   * takes it only when it has that frame.
   */
  frame?: KitFrame;
  /** The containers' corners for the subtree (a Region sets it from its radius). */
  containerCorners?: ContainerCorners;
  /**
   * The cast shadow on the kit's surfaces: `true` (the `floating`
   * elevation), an elevation, or `false`. Default (no provider): `false`,
   * `KIT_SHADOW`.
   */
  shadow?: KitShadow;
}

export interface KitDefaultsProps extends KitDefaultsValue {
  children?: ReactNode;
}

const KitDefaultsContext = createContext<KitDefaultsValue>({});

/** Defaults for the subtree. An inner provider overrides only what it sets. */
export function KitDefaults({
  density,
  corners,
  variant,
  brand,
  frame,
  containerCorners,
  shadow,
  children,
}: KitDefaultsProps) {
  const outer = useContext(KitDefaultsContext);
  const value = useMemo<KitDefaultsValue>(
    () => ({
      density: density ?? outer.density,
      corners: corners ?? outer.corners,
      variant: variant ?? outer.variant,
      brand: brand ?? outer.brand,
      frame: frame ?? outer.frame,
      // `corners` square or rounded reaches the containers too; `full` doesn't.
      containerCorners:
        containerCorners ??
        (corners === 'full' ? undefined : corners) ??
        outer.containerCorners,
      shadow: shadow ?? outer.shadow,
    }),
    [density, corners, variant, brand, frame, containerCorners, shadow, outer]
  );
  return (
    <KitDefaultsContext.Provider value={value}>
      {brand ? <BrandZone brand={brand}>{children}</BrandZone> : children}
    </KitDefaultsContext.Provider>
  );
}
KitDefaults.displayName = 'KitDefaults';

/**
 * A brand zone: `--cds-hero` from `brand`'s grades for
 * everything inside, in every theme (styles/_brand.scss). No box of its own.
 */
export function BrandZone({
  brand,
  children,
}: {
  brand: KitBrand;
  children?: ReactNode;
}) {
  return (
    <div
      className="cds-brand-zone"
      data-cds-brand={brand}
      style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
BrandZone.displayName = 'BrandZone';

/** The enclosing providers' defaults, merged; a field no provider sets is undefined. */
export function useKitDefaults(): KitDefaultsValue {
  return useContext(KitDefaultsContext);
}

/**
 * A selection or navigation component's frame: its own `frame` if given,
 * else the provider's (a Region's: `inset` on the page, `ghost` in a framed
 * region) when it is one of `own`, else `fallback`.
 */
export function resolveFrame<F extends string>(
  frame: F | undefined,
  own: readonly F[],
  kitFrame: KitFrame | undefined,
  fallback: F
): F {
  if (frame !== undefined) return frame;
  if (kitFrame && (own as readonly string[]).includes(kitFrame))
    return kitFrame as unknown as F;
  return fallback;
}

/** `resolveFrame` under the enclosing providers. */
export function useDefaultFrame<F extends string>(
  frame: F | undefined,
  own: readonly F[],
  fallback: F
): F {
  return resolveFrame(frame, own, useKitDefaults().frame, fallback);
}

/** A container's corners: its own `corners` if given, else the provider's, else `square` (v11). */
export function resolveContainerCorners(
  corners: ContainerCorners | undefined,
  kit: KitDefaultsValue
): ContainerCorners {
  return corners ?? kit.containerCorners ?? 'square';
}

/** `resolveContainerCorners` under the enclosing providers. */
export function useContainerCorners(
  corners: ContainerCorners | undefined
): ContainerCorners {
  return resolveContainerCorners(corners, useKitDefaults());
}

/**
 * A surface's cast shadow: its own `shadow` if given, else the provider's,
 * else `KIT_SHADOW` (none). `true` is the `floating` elevation; null is none.
 */
export function resolveShadow(
  shadow: KitShadow | undefined,
  kit: KitDefaultsValue
): CastElevation | null {
  const s = shadow ?? kit.shadow ?? KIT_SHADOW;
  return s === true ? 'floating' : s || null;
}

/** `resolveShadow` under the enclosing providers. */
export function useSurfaceShadow(
  shadow: KitShadow | undefined
): CastElevation | null {
  return resolveShadow(shadow, useKitDefaults());
}

/** A density, as one component's size. */
export type DensityMap<S extends string> = Readonly<Record<KitDensity, S>>;

/** Buttons, IconButton, MenuButton, the fields, the Dropdown family, Search: sm 32 · md 40 · lg 48. */
export const CONTROL_SIZES: DensityMap<'sm' | 'md' | 'lg'> = {
  compact: 'sm',
  default: 'md',
  spacious: 'lg',
};
/** DataTable (and its skeletons) and Pagination: v11's sm · md · lg (32 · 40 · 48 rows). */
export const TABLE_SIZES: DensityMap<'sm' | 'md' | 'lg'> = {
  compact: 'sm',
  default: 'md',
  spacious: 'lg',
};
/**
 * The row components on the kit's row scale (xs 20 · sm 26 · md 32 · lg 40):
 * SideNav and TreeView, sm 26 · md 32 · lg 40, the density's rows.
 */
export const ROW_SIZES: DensityMap<'sm' | 'md' | 'lg'> = {
  compact: 'sm',
  default: 'md',
  spacious: 'lg',
};
/** Tag and TagSet, on the tag's own scale: sm 18 · md 20 · lg 32, step for step. */
export const TAG_SIZES: DensityMap<'sm' | 'md' | 'lg'> = {
  compact: 'sm',
  default: 'md',
  spacious: 'lg',
};

/** The size: the prop if it's given, else the provider's density through `map`, else `fallback`. */
export function resolveSize<S extends string>(
  size: S | undefined,
  map: DensityMap<S>,
  density: KitDensity | undefined,
  fallback?: S
): S | undefined {
  return size ?? (density ? map[density] : undefined) ?? fallback;
}

/** `resolveSize` under the enclosing providers. */
export function useDefaultSize<S extends string>(
  size: S | undefined,
  map: DensityMap<S>
): S | undefined;
export function useDefaultSize<S extends string>(
  size: S | undefined,
  map: DensityMap<S>,
  fallback: S
): S;
export function useDefaultSize<S extends string>(
  size: S | undefined,
  map: DensityMap<S>,
  fallback?: S
): S | undefined {
  return resolveSize(size, map, useKitDefaults().density, fallback);
}

/** Which of the provider's defaults a component takes. */
export interface KitPropsSpec<S extends string, V extends string> {
  /** Its density map (it has a size). */
  size?: DensityMap<S>;
  /** It takes `corners`. */
  corners?: boolean;
  /** Its own variants: the provider's `variant` applies only when it is one of these. */
  variants?: readonly V[];
}

export interface KitPropsGiven<
  S extends string,
  C extends KitCorners,
  V extends string,
> {
  size?: S;
  corners?: C;
  variant?: V;
}

/**
 * A component's `size`, `corners` and `variant` as given, else the
 * provider's (as `spec` says it takes them), else undefined, so the
 * component's own defaults follow:
 *
 *   const { size = 'md', corners = 'rounded' } = useKitProps({ size: sizeProp, corners: cornersProp }, FIELD);
 */
export function resolveKitProps<
  S extends string,
  C extends KitCorners,
  V extends string,
>(
  given: KitPropsGiven<S, C, V>,
  spec: KitPropsSpec<S, V>,
  kit: KitDefaultsValue
): KitPropsGiven<S, C, V> {
  const variant =
    given.variant ??
    (spec.variants &&
    kit.variant &&
    (spec.variants as readonly string[]).includes(kit.variant)
      ? (kit.variant as unknown as V)
      : undefined);
  return {
    size: spec.size
      ? resolveSize(given.size, spec.size, kit.density)
      : given.size,
    corners:
      given.corners ??
      (spec.corners ? (kit.corners as C | undefined) : undefined),
    variant,
  };
}

/** `resolveKitProps` under the enclosing providers: one call per component. */
export function useKitProps<
  S extends string,
  C extends KitCorners,
  V extends string,
>(
  given: KitPropsGiven<S, C, V>,
  spec: KitPropsSpec<S, V>
): KitPropsGiven<S, C, V> {
  return resolveKitProps(given, spec, useKitDefaults());
}

/* The specs the kit's components use. */
export const FIELD_VARIANTS = ['neutral', 'hero'] as const;
export const MENU_VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;
/** TextInput, PasswordInput, NumberInput, Select. */
export const FIELD_KIT = {
  size: CONTROL_SIZES,
  corners: true,
  variants: FIELD_VARIANTS,
} as const;
/** The loaders' treatments: `neutral` (every loader's default) · `hero`. */
export const LOADER_VARIANTS = ['neutral', 'hero'] as const;
/** Spinner, Loading, InlineLoading, ProgressRing, ProgressBar: the provider's `variant` alone. */
export const LOADER_KIT = { variants: LOADER_VARIANTS } as const;
/** Button, IconButton, the Dropdown family, Search. */
export const CONTROL_KIT = { size: CONTROL_SIZES, corners: true } as const;
/** MenuButton: its size, its corners and its menu's variant. */
export const MENU_BUTTON_KIT = {
  size: CONTROL_SIZES,
  corners: true,
  variants: MENU_VARIANTS,
} as const;
/** Tag. */
export const TAG_KIT = { size: TAG_SIZES, corners: true } as const;
/** DatePickerInput, TimePicker: the fields' map, for their size, and their corners. */
export const PICKER_KIT = { size: CONTROL_SIZES, corners: true } as const;
/** SideNav, TreeView: the row scale, for their size. */
export const ROW_KIT = { size: ROW_SIZES } as const;
