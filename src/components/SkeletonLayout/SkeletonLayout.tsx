/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLayout — progressively-revealed skeleton placeholder.
 */

import React, { useRef } from 'react';
import cx from 'clsx';
import styles from './SkeletonLayout.module.css';
import type {
  SkeletonLayoutProps,
  SkeletonLayoutVariant,
  SkeletonBlockProps,
  SkeletonBlockVariant,
} from './SkeletonLayout.types';
import { useSkeletonAnimation } from '../../hooks/useSkeletonAnimation';

export type { SkeletonLayoutProps, SkeletonLayoutVariant, SkeletonBlockProps, SkeletonBlockVariant };

/** Ordered list of animation targets returned for use by the animation hook. */
export function getSkeletonBlocks(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-skeleton-block]')).sort(
    (a, b) => Number(a.dataset.order) - Number(b.dataset.order),
  );
}

// ── Block variant → CSS class map ────────────────────────────────────────────

const BLOCK_CLASS: Record<SkeletonBlockVariant, string> = {
  'line':        styles.sbLine,
  'line-short':  styles.sbLineShort,
  'title':       styles.sbTitle,
  'title-lg':    styles.sbTitleLg,
  'panel':       styles.sbPanel,
  'panel-hero':  styles.sbPanelHero,
  'panel-sm':    styles.sbPanelSm,
  'nav':         styles.sbNav,
  'breadcrumb':  styles.sbBreadcrumb,
  'card':        styles.sbCard,
  'table-row':   styles.sbTableRow,
};

/**
 * SkeletonBlock — an individually-animated skeleton placeholder primitive.
 *
 * Compose these inside a `<SkeletonLayout>` to build any custom page shape.
 * The parent's `useSkeletonAnimation` hook picks up every element that carries
 * `data-skeleton-block`, so blocks animate without any extra wiring.
 *
 * @example
 * ```tsx
 * <SkeletonLayout>
 *   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 *     <SkeletonBlock variant="nav"      order={0} zone="header" />
 *     <SkeletonBlock variant="title-lg" order={1} zone="hero"   ai />
 *     <SkeletonBlock variant="card"     order={2} zone="cards"  rounded />
 *   </div>
 * </SkeletonLayout>
 * ```
 */
export function SkeletonBlock({
  variant = 'line',
  order,
  zone,
  ai = false,
  rounded = false,
  className,
}: SkeletonBlockProps) {
  const variantClass = BLOCK_CLASS[variant] ?? styles.sbLine;
  const isTableRow   = variant === 'table-row';

  return (
    <div
      // table-row uses .blockBorder (no fill) — all others use .block
      className={cx(
        isTableRow ? styles.blockBorder : styles.block,
        variantClass,
        ai      && styles.sbAi,
        rounded && styles.sbRounded,
        className,
      )}
      data-skeleton-block
      data-order={String(order)}
      // Attach zone to block directly so zone containers aren't required
      // when using the compositional API — the story can still query
      // [data-fp-zone] if it wraps blocks in a zone div.
      {...(zone ? { 'data-fp-zone': zone } : {})}
      role="presentation"
      aria-hidden="true"
    />
  );
}

function HeroLayout() {
  return (
    <div className={styles.layoutHero}>
      <div
        className={cx(styles.block, styles.textBlock)}
        data-skeleton-block
        data-order="0"
        role="presentation"
        aria-hidden="true"
      />
      <div
        className={cx(styles.block, styles.panelBlockHero)}
        data-skeleton-block
        data-order="1"
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
}

function Cards3Layout() {
  return (
    <div className={styles.layoutCards3}>
      {[0, 1, 2].map((i) => (
        <article key={i} className={styles.card}>
          <div
            className={cx(styles.block, styles.textBlock)}
            data-skeleton-block
            data-order={String(2 + i * 2)}
            role="presentation"
            aria-hidden="true"
          />
          <div
            className={cx(styles.block, styles.panelBlock)}
            data-skeleton-block
            data-order={String(3 + i * 2)}
            role="presentation"
            aria-hidden="true"
          />
        </article>
      ))}
    </div>
  );
}

function Cards4Layout() {
  return (
    <div className={styles.layoutCards4}>
      {[0, 1, 2, 3].map((i) => (
        <article key={i} className={styles.card}>
          <div
            className={cx(styles.block, styles.textBlockShort)}
            data-skeleton-block
            data-order={String(8 + i * 2)}
            role="presentation"
            aria-hidden="true"
          />
          <div
            className={cx(styles.block, styles.panelBlockSmall)}
            data-skeleton-block
            data-order={String(9 + i * 2)}
            role="presentation"
            aria-hidden="true"
          />
        </article>
      ))}
    </div>
  );
}

// ── Zone order constants ─────────────────────────────────────────────────────
// Header: 0–1  |  Hero: 2–4  |  Cards: 5–8  |  Table: 9–12
// Total: 13 blocks — stagger window = 750 + 12×47 ≈ 1314ms
//
// Cards: one block per card (full surface height).
// Table: row wrappers are the animated elements so borders + cells fade as one unit.
export const FULL_PAGE_ZONES = {
  header: [0, 1],
  hero:   [2, 3, 4],
  cards:  [5, 6, 7, 8],
  table:  [9, 10, 11, 12],
} as const;

/**
 * Mixed-page layout — identical zone structure to full-page, but:
 *   • Hero zone carries data-zone-ai   → AI blue block fill via CSS
 *   • Cards zone carries data-zone-rounded → 8 px corner radius via CSS
 *
 * Zone-level variants are applied by data attributes picked up in CSS so
 * no extra component props are needed.
 */
function MixedPageLayout() {
  return (
    <div className={styles.layoutFullPage}>

      {/* ── Header zone (default) ──────────────────────────────────────── */}
      <div className={styles.fpHeader} data-fp-zone="header">
        <div
          className={cx(styles.block, styles.fpNavBar)}
          data-skeleton-block data-order="0"
          role="presentation" aria-hidden="true"
        />
        <div
          className={cx(styles.block, styles.fpBreadcrumb)}
          data-skeleton-block data-order="1"
          role="presentation" aria-hidden="true"
        />
      </div>

      {/* ── Hero zone (AI variant) ─────────────────────────────────────── */}
      <div className={styles.fpHero} data-fp-zone="hero" data-zone-ai="true">
        <div className={styles.fpHeroText}>
          <div
            className={cx(styles.block, styles.fpHeroTitleBlock)}
            data-skeleton-block data-order="2"
            role="presentation" aria-hidden="true"
          />
          <div
            className={cx(styles.block, styles.fpHeroSubBlock)}
            data-skeleton-block data-order="3"
            role="presentation" aria-hidden="true"
          />
        </div>
        <div
          className={cx(styles.block, styles.fpHeroPanel)}
          data-skeleton-block data-order="4"
          role="presentation" aria-hidden="true"
        />
      </div>

      {/* ── Cards zone (rounded corners) ──────────────────────────────── */}
      <div className={styles.fpCards} data-fp-zone="cards" data-zone-rounded="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cx(styles.block, styles.fpCardBlock)}
            data-skeleton-block data-order={String(5 + i)}
            role="presentation" aria-hidden="true"
          />
        ))}
      </div>

      {/* ── Table zone (default) ──────────────────────────────────────── */}
      <div className={styles.fpTable} data-fp-zone="table">
        <div
          className={cx(styles.blockBorder, styles.fpTableHeader)}
          data-skeleton-block data-order="9"
          role="presentation" aria-hidden="true"
        >
          <div className={styles.fpTableHeaderCell} />
          <div className={styles.fpTableHeaderCell} />
          <div className={styles.fpTableHeaderCell} />
        </div>
        {[10, 11, 12].map((order) => (
          <div
            key={order}
            className={cx(styles.blockBorder, styles.fpTableRow)}
            data-skeleton-block data-order={String(order)}
            role="presentation" aria-hidden="true"
          >
            <div className={styles.fpTableCell} />
            <div className={styles.fpTableCell} />
            <div className={styles.fpTableCell} />
          </div>
        ))}
      </div>

    </div>
  );
}

function FullPageLayout() {
  return (
    <div className={styles.layoutFullPage}>

      {/* ── Header zone ───────────────────────────────────────────── */}
      {/* div not header — skeleton zones are not real landmarks       */}
      <div className={styles.fpHeader} data-fp-zone="header">
        <div
          className={cx(styles.block, styles.fpNavBar)}
          data-skeleton-block data-order="0"
          role="presentation" aria-hidden="true"
        />
        <div
          className={cx(styles.block, styles.fpBreadcrumb)}
          data-skeleton-block data-order="1"
          role="presentation" aria-hidden="true"
        />
      </div>

      {/* ── Hero / KPI zone ───────────────────────────────────────── */}
      <div className={styles.fpHero} data-fp-zone="hero">
        <div className={styles.fpHeroText}>
          <div
            className={cx(styles.block, styles.fpHeroTitleBlock)}
            data-skeleton-block data-order="2"
            role="presentation" aria-hidden="true"
          />
          <div
            className={cx(styles.block, styles.fpHeroSubBlock)}
            data-skeleton-block data-order="3"
            role="presentation" aria-hidden="true"
          />
        </div>
        <div
          className={cx(styles.block, styles.fpHeroPanel)}
          data-skeleton-block data-order="4"
          role="presentation" aria-hidden="true"
        />
      </div>

      {/* ── Cards zone ────────────────────────────────────────────── */}
      {/* One block per card — full surface height matches content card */}
      <div className={styles.fpCards} data-fp-zone="cards">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cx(styles.block, styles.fpCardBlock)}
            data-skeleton-block data-order={String(5 + i)}
            role="presentation" aria-hidden="true"
          />
        ))}
      </div>

      {/* ── Table zone ────────────────────────────────────────────── */}
      {/* Row wrappers use .blockBorder (no background fill) so borders
          and cell stubs are the only visible elements per row.         */}
      <div className={styles.fpTable} data-fp-zone="table">
        {/* Header row */}
        <div
          className={cx(styles.blockBorder, styles.fpTableHeader)}
          data-skeleton-block data-order="9"
          role="presentation" aria-hidden="true"
        >
          <div className={styles.fpTableHeaderCell} />
          <div className={styles.fpTableHeaderCell} />
          <div className={styles.fpTableHeaderCell} />
        </div>
        {/* 3 data rows */}
        {[10, 11, 12].map((order) => (
          <div
            key={order}
            className={cx(styles.blockBorder, styles.fpTableRow)}
            data-skeleton-block data-order={String(order)}
            role="presentation" aria-hidden="true"
          >
            <div className={styles.fpTableCell} />
            <div className={styles.fpTableCell} />
            <div className={styles.fpTableCell} />
          </div>
        ))}
      </div>

    </div>
  );
}

const LAYOUTS: Record<string, () => React.ReactElement> = {
  hero: HeroLayout,
  'cards-3': Cards3Layout,
  'cards-4': Cards4Layout,
  'full-page': FullPageLayout,
  'mixed-page': MixedPageLayout,
};

/**
 * SkeletonLayout renders placeholder blocks that animate in progressively
 * while real content loads. Animation is applied externally via the
 * `useSkeletonAnimation` hook attached to the root ref.
 */
export function SkeletonLayout({
  layout = 'hero',
  children,
  aiVariant = false,
  cornerRadius = false,
  className,
}: SkeletonLayoutProps) {
  const LayoutComponent = LAYOUTS[layout] ?? HeroLayout;
  const rootRef = useRef<HTMLDivElement>(null);

  useSkeletonAnimation(rootRef);

  return (
    <div
      ref={rootRef}
      role="status"
      className={cx(
        styles.root,
        aiVariant && styles.aiVariant,
        cornerRadius && styles.rounded,
        className,
      )}
      aria-label="Loading"
    >
      {/* When children are provided they replace the built-in layout variant.
          The animation hook walks [data-skeleton-block] in the DOM so any
          SkeletonBlock children animate automatically. */}
      {children ?? <LayoutComponent />}
    </div>
  );
}

export default SkeletonLayout;
