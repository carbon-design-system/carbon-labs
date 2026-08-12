/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLayout — progressively-revealed skeleton placeholder.
 * Mirrors the layout variants from the Figma exploration and the
 * vanilla prototype at the repo root.
 */

import type { ReactNode } from 'react';

export type SkeletonLayoutVariant = 'hero' | 'cards-3' | 'cards-4' | 'full-page' | 'mixed-page';

/**
 * Block size variants for SkeletonBlock.
 *
 * | Variant        | Typical use                                     |
 * |----------------|-------------------------------------------------|
 * | `line`         | Single line of body text (~0.875 rem tall)      |
 * | `line-short`   | Short label or caption                          |
 * | `title`        | Page or section heading (1.5 rem tall)          |
 * | `title-lg`     | Large h1-style heading (2.25 rem tall)          |
 * | `panel`        | Medium content area (10 rem tall, max 15 rem)   |
 * | `panel-hero`   | Wide hero panel (10 rem tall, fills container)  |
 * | `panel-sm`     | Small card panel (7.5 rem tall, max 12.5 rem)   |
 * | `nav`          | Full-width navigation bar (3 rem tall)          |
 * | `breadcrumb`   | Single breadcrumb stub (0.875 rem tall, 8 rem)  |
 * | `card`         | Full-height card surface (7.5 rem, flex-fill)   |
 * | `table-row`    | Transparent row wrapper for table cells         |
 */
export type SkeletonBlockVariant =
  | 'line'
  | 'line-short'
  | 'title'
  | 'title-lg'
  | 'panel'
  | 'panel-hero'
  | 'panel-sm'
  | 'nav'
  | 'breadcrumb'
  | 'card'
  | 'table-row';

export interface SkeletonBlockProps {
  /**
   * Visual size / shape of this block.
   * @default 'line'
   */
  variant?: SkeletonBlockVariant;
  /**
   * Stagger order — lower numbers animate in first.
   * Must be unique within a single `<SkeletonLayout>`.
   */
  order: number;
  /**
   * Zone name for cross-fade orchestration. When you fade out a zone on
   * reveal, query `[data-fp-zone="<zone>"]` from the skeleton root.
   */
  zone?: string;
  /** Apply AI blue-tint (`--cmw-skeleton-ai-bg`) to this block. */
  ai?: boolean;
  /** Apply 8 px corner radius to this block. */
  rounded?: boolean;
  /** Additional class name */
  className?: string;
}

export interface SkeletonLayoutProps {
  /**
   * Built-in layout variant to render.
   * Ignored when `children` is provided.
   */
  layout?: SkeletonLayoutVariant;
  /**
   * Custom layout — compose with `<SkeletonBlock>` primitives.
   * When provided, the `layout` prop is ignored and the children are
   * rendered inside the animated root element directly.
   *
   * @example
   * ```tsx
   * <SkeletonLayout>
   *   <SkeletonBlock variant="nav"       order={0} zone="header" />
   *   <SkeletonBlock variant="title-lg"  order={1} zone="hero"   ai />
   *   <SkeletonBlock variant="card"      order={2} zone="cards"  rounded />
   * </SkeletonLayout>
   * ```
   */
  children?: ReactNode;
  /**
   * AI blue-tint variant — activates `--cmw-skeleton-ai-bg` on all blocks.
   * For zone-level AI styling, use `ai` on individual `<SkeletonBlock>`s.
   */
  aiVariant?: boolean;
  /**
   * Apply an 8 px corner radius to all skeleton blocks.
   * For per-block control, use `rounded` on individual `<SkeletonBlock>`s.
   */
  cornerRadius?: boolean;
  /** Additional class name applied to the root element */
  className?: string;
}
