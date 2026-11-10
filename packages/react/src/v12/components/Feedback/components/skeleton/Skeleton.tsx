/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { useSkeletonBlocks } from './SkeletonWave';
import './skeleton.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * SkeletonText, SkeletonPlaceholder, SkeletonIcon — and the AI skeletons
 * ============================================================================
 *
 * Carbon v11's skeletons (`@carbon/react` SkeletonText, SkeletonPlaceholder,
 * SkeletonIcon, and `preview__AiSkeletonText` / `-Placeholder` / `-Icon`):
 * the same props, markup and sizes, re-implemented. Every block is a
 * motion-core skeleton-wave block (`[data-skeleton]`, the app's
 * `skeleton-block` mixin), so every block on a page pulses on one wave: a
 * `SkeletonWave` above it owns the pulse, and without one each skeleton
 * attaches its own on the document's sweep (`useSkeletonBlocks`).
 *
 * Differs from v11:
 * - No shimmer of its own. v11 runs a 3000ms scaleX shimmer per block (AI:
 *   a 1250ms gradient), each on its own clock, so a page of them is out of
 *   step; here one wave crosses the page, and a block that mounts later
 *   lands in step with it.
 * - A paragraph is one block the lines' height at `width`, not a bar per
 *   ragged line: fewer shapes.
 * - Corners: one rule for every block, v12's 4px (`enable-v12-release`) —
 *   AI is a tint, never a shape, so v11's AI corners (16px text, 8px
 *   placeholder, 2px icon) are dropped.
 * - Contrast: each block's opacity is solved against its own backdrop for a
 *   gentle, even L* difference on every theme (the wave's `contrast`).
 * - Blocks are `aria-hidden` (v11's carry no ARIA, which leaves empty
 *   paragraphs in the reading order).
 * - Reduced motion: still at the fill's peak, as v11 (v11's AI shimmer
 *   rule comes after its reduced-motion rule, at the same specificity).
 * ========================================================================== */

export interface SkeletonTextProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'children'
> {
  /** Specify an optional className to be applied to the container node (v11 puts it on every line). */
  className?: string;
  /** Generates skeleton text at a larger size. */
  heading?: boolean;
  /** The number of lines shown if paragraph is true. Default 3. */
  lineCount?: number;
  /** Will generate multiple lines of text. */
  paragraph?: boolean;
  /** Width (in px or %) of a single line of text, or of the paragraph's block. Default `100%`. */
  width?: string;
  /**
   * The line height of the text it stands for (a CSS length).
   * Each line then takes exactly that text line's box — no gap below — and
   * the bar sits inside it, so the text that replaces it takes the same
   * space and nothing moves.
   */
  lineHeight?: string;
}

function SkeletonTextBase({
  paragraph = false,
  lineCount = 3,
  width = '100%',
  heading = false,
  className = '',
  style,
  lineHeight,
  ai,
  bar,
  ...rest
}: SkeletonTextProps & { ai?: boolean; bar?: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  // A paragraph is one block, `lineCount` lines high; one line is a bar.
  const lines = paragraph ? Math.max(0, lineCount) : 1;
  useSkeletonBlocks(ref, lines > 0);
  if (lines === 0) return null;
  // A bar inside phrasing content (a label, a button, a heading) is a span; a standalone line is a paragraph.
  const Line = bar ? 'span' : 'p';
  return (
    <Line
      ref={(el: HTMLElement | null) => void (ref.current = el)}
      className={cx(
        'fb-skeleton',
        'fb-skeleton__text',
        heading && 'fb-skeleton__heading',
        lineHeight && 'fb-skeleton__text--line',
        lines > 1 && 'fb-skeleton__text--block',
        ai && 'fb-skeleton--ai fb-skeleton__text--ai',
        className
      )}
      data-skeleton=""
      aria-hidden="true"
      {...(rest as HTMLAttributes<HTMLElement>)}
      style={
        {
          ...style,
          width,
          '--skeleton-lines': lines,
          ...(lineHeight ? { '--skeleton-line': lineHeight } : null),
        } as CSSProperties
      }
    />
  );
}

/** v11's SkeletonText: one line, a heading, or a paragraph of `lineCount` lines as one block. */
export function SkeletonText(props: SkeletonTextProps) {
  return <SkeletonTextBase {...props} />;
}

/** SkeletonText as a span, for a bar inside phrasing content. The kit's own; not exported from the family. */
export function SkeletonBar(props: SkeletonTextProps) {
  return <SkeletonTextBase {...props} bar />;
}

export interface SkeletonRunProps {
  /**
   * The parts on the line, in their own markup and type: printed unseen,
   * they size the run (its width and line box) exactly as the loaded line.
   */
  children: ReactNode;
  /**
   * Room before the run that the bar also covers, as a CSS length: the
   * leading slot (an icon and its gap) on the same line, so the slot and
   * its label are one bar. The slot keeps its own box, unseen.
   */
  lead?: string;
  className?: string;
}

/**
 * The merge rule (fewer, larger blocks): the
 * data parts on one line that sit within 8px of each other — an icon and its
 * label, a label and a short value, a row of small controls — are ONE bar,
 * from the first part's start to the last part's end. The parts stay in the
 * markup unseen, so the bar is their union box in the loaded layout and
 * nothing moves when they arrive; the bar sits in the line box as a
 * SkeletonText line's (`lineHeight`), whatever the parts' own heights.
 */
export function SkeletonRun({ children, lead, className }: SkeletonRunProps) {
  return (
    <span
      className={cx('fb-skeleton-run', className)}
      style={
        lead ? ({ '--fb-skeleton-run-lead': lead } as CSSProperties) : undefined
      }
      aria-hidden="true">
      {children}
      <SkeletonBar
        lineHeight="100%"
        width="auto"
        className="fb-skeleton-run__bar"
      />
    </span>
  );
}

export interface SkeletonPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a custom class to the component to set the height and width. */
  className?: string;
}

function SkeletonPlaceholderBase({
  className,
  ai,
  ...other
}: SkeletonPlaceholderProps & { ai?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSkeletonBlocks(ref);
  return (
    <div
      ref={ref}
      className={cx(
        'fb-skeleton',
        'fb-skeleton__placeholder',
        ai && 'fb-skeleton--ai fb-skeleton__placeholder--ai',
        className
      )}
      data-skeleton=""
      aria-hidden="true"
      {...other}
    />
  );
}

/** v11's SkeletonPlaceholder: a 100 × 100 block, sized by its class. */
export function SkeletonPlaceholder(props: SkeletonPlaceholderProps) {
  return <SkeletonPlaceholderBase {...props} />;
}

export interface SkeletonIconProps extends HTMLAttributes<HTMLDivElement> {
  /** Specify an optional className to add. */
  className?: string;
}

function SkeletonIconBase({
  className,
  ai,
  ...other
}: SkeletonIconProps & { ai?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSkeletonBlocks(ref);
  return (
    <div
      ref={ref}
      className={cx(
        className,
        'fb-skeleton',
        'fb-skeleton__icon',
        ai && 'fb-skeleton--ai fb-skeleton__icon--ai'
      )}
      data-skeleton=""
      aria-hidden="true"
      {...other}
    />
  );
}

/** v11's SkeletonIcon: a 16 × 16 block, inline. */
export function SkeletonIcon(props: SkeletonIconProps) {
  return <SkeletonIconBase {...props} />;
}

/* ── The AI skeletons (v11's `preview__AiSkeleton*`) ──────────────────── */

export type AISkeletonTextProps = SkeletonTextProps;
export type AISkeletonPlaceholderProps = SkeletonPlaceholderProps;
export type AISkeletonIconProps = SkeletonIconProps;

/** v11's AISkeletonText: SkeletonText on the AI tint (Blue 10 / Blue 50), pill corners. */
export function AISkeletonText(props: AISkeletonTextProps) {
  return <SkeletonTextBase {...props} ai />;
}

/** v11's AISkeletonPlaceholder: SkeletonPlaceholder on the AI tint, 8px corners. */
export function AISkeletonPlaceholder(props: AISkeletonPlaceholderProps) {
  return <SkeletonPlaceholderBase {...props} ai />;
}

/** v11's AISkeletonIcon: SkeletonIcon on the AI tint, 2px corners. */
export function AISkeletonIcon(props: AISkeletonIconProps) {
  return <SkeletonIconBase {...props} ai />;
}
