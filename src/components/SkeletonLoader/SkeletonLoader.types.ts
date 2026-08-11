/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLoader — progressively-revealed skeleton placeholder.
 * Mirrors the layout variants from the Figma exploration and the
 * vanilla prototype at the repo root.
 */

export type SkeletonLayout = 'hero' | 'cards-3' | 'cards-4';
export type SkeletonThemeVariant = 'default' | 'ai';

export interface SkeletonLoaderProps {
  /** Layout variant to render */
  layout?: SkeletonLayout;
  /**
   * AI blue-tint variant — activates the g10-ai token overrides.
   * Set `data-carbon-theme="g10-ai"` on the wrapper element.
   */
  aiVariant?: boolean;
  /**
   * Apply an 8 px corner radius to all skeleton blocks.
   * Maps to --cmw-skeleton-radius.
   */
  cornerRadius?: boolean;
  /** Additional class name applied to the root element */
  className?: string;
}
