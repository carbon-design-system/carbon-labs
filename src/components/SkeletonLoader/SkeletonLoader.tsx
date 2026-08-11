/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLoader — progressively-revealed skeleton placeholder.
 */

import React, { useRef } from 'react';
import cx from 'clsx';
import styles from './SkeletonLoader.module.css';
import type { SkeletonLoaderProps, SkeletonLayout } from './SkeletonLoader.types';
import { useSkeletonAnimation } from '../../hooks/useSkeletonAnimation';

export type { SkeletonLoaderProps, SkeletonLayout };

/** Ordered list of animation targets returned for use by the animation hook. */
export function getSkeletonBlocks(
  root: HTMLElement,
): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-skeleton-block]')).sort(
    (a, b) => Number(a.dataset.order) - Number(b.dataset.order),
  );
}

function HeroLayout() {
  return (
    <section className={styles.layoutHero} aria-label="Loading content">
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
    </section>
  );
}

function Cards3Layout() {
  return (
    <section className={styles.layoutCards3} aria-label="Loading content">
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
    </section>
  );
}

function Cards4Layout() {
  return (
    <section className={styles.layoutCards4} aria-label="Loading content">
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
    </section>
  );
}

const LAYOUTS: Record<string, () => React.ReactElement> = {
  hero: HeroLayout,
  'cards-3': Cards3Layout,
  'cards-4': Cards4Layout,
};

/**
 * SkeletonLoader renders placeholder blocks that animate in progressively
 * while real content loads. Animation is applied externally via the
 * `useSkeletonAnimation` hook attached to the root ref.
 */
export function SkeletonLoader({
  layout = 'hero',
  aiVariant = false,
  cornerRadius = false,
  className,
}: SkeletonLoaderProps) {
  const LayoutComponent = LAYOUTS[layout] ?? HeroLayout;
  const rootRef = useRef<HTMLDivElement>(null);

  useSkeletonAnimation(rootRef);

  return (
    <div
      ref={rootRef}
      className={cx(
        styles.root,
        aiVariant && styles.aiVariant,
        cornerRadius && styles.rounded,
        className,
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
    >
      <LayoutComponent />
    </div>
  );
}

export default SkeletonLoader;
