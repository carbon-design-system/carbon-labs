/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  attachRollover,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { CopyButton, useCopyFeedback } from '@carbon-labs/react-copy-button';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { SkeletonText, useSkeletonReveal } from '@carbon-labs/react-feedback';
import { RollText } from '@carbon-labs/react-roll-text';
import { Scroller } from '@carbon-labs/react-scroller';
import type { TooltipAlignDeprecated } from '@carbon-labs/react-selection-kit';
import {
  mergeRefs,
  useStillTrigger,
  useTooltipTrigger,
  type TooltipAlign,
} from '@carbon-labs/react-tooltip';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import './code-snippet.scss';
import { TOOLTIP_LEAVE_LABEL_MS } from '@carbon-labs/react-tooltip';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * CodeSnippet — Carbon v11's CodeSnippet (single, inline, multi) on the
 * kit's look and motion.
 * ============================================================================
 *
 * v11's API, prop for prop: `type` (single · inline · multi), `children`,
 * `align` (bottom), `autoAlign`, `aria-label` ("Copy to clipboard") and the
 * deprecated `ariaLabel`, `copyButtonDescription`, `copyText`, `disabled`,
 * `feedback`, `feedbackTimeout`, `hideCopyButton`, `light` (deprecated,
 * accepted), `maxCollapsedNumberOfRows` (15), `maxExpandedNumberOfRows` (0),
 * `minCollapsedNumberOfRows` (3), `minExpandedNumberOfRows` (16),
 * `onClick`, `showLessText` / `showMoreText`, `wrapText`. v11's markup and
 * a11y: single and multi are a read-only `role="textbox"` (multi-line for
 * multi) you can tab to, with the copy button after it; inline is one
 * button round the `<code>`, labelled by its tooltip and described by the
 * code. The copy writes `copyText`, or the code's text, to the clipboard
 * and calls `onClick`. Rows are 16px (code-01's line).
 *
 * The kit adds:
 *
 *   surface   the code's well: `--cds-snippet-fill` (the kit's
 *             `--cds-surface-code`, a quiet step below the page), no
 *             outline, 8px corners; the copy button's
 *             fill 4px in, full round (an icon on its own); the Show
 *             more button 4px in, at 4px corners
 *             (concentric). Inline: the same fill, 4px corners, the rollover
 *   copy      the kit's CopyButton (single, multi): the Copy icon's action
 *             and "Copied" in its tooltip. Inline: the same feedback, the
 *             whole snippet the trigger
 *   show more multi, longer than `maxCollapsedNumberOfRows`: the kit's
 *             disclosure module opens the rest of the code (the travel's
 *             clock, shut one step faster; one layout transaction; the 16px
 *             soft edge at the bottom of the collapsed code, closing as it
 *             lands open). The code doesn't move: it is already in place,
 *             and the body uncovers it. The label rolls (Show more → Show
 *             less, a change of meaning: whole); the chevron is the
 *             disclosure's motion icon
 *   edges     a 16px soft edge where code runs past the end (v11's fade,
 *             on the kit's soft-edge token), gone while it has focus
 *   scroll    the kit's Scroller (its pill); on multi the down track starts
 *             below the copy button's 40px box (the Scroller's `insets`)
 *   loading   `loading` (the kit's) and `CodeSnippetSkeleton` (v11): the
 *             snippet's own frame with its code lines as skeleton blocks
 *             (one; multi `minCollapsedNumberOfRows`), the copy button real
 *             and disabled; the handoff is the loading standard's
 *   reduced   the body is open or shut at once; labels swap at once
 * ========================================================================== */

export const CodeSnippetTypes = ['single', 'inline', 'multi'] as const;
export type CodeSnippetType = (typeof CodeSnippetTypes)[number];

/** v11's row: code-01's 16px line. */
const ROW = 16;
/** Multi's container padding, above the code ($spacing-05). */
const PAD = 16;
/** The copy button's box (single, multi): 40px, its ghost fill 4px in. */
const COPY = 40;

export interface CodeSnippetProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'onClick'
> {
  /** The tooltip's side and alignment (v11). Default `bottom`. */
  align?: TooltipAlign | TooltipAlignDeprecated;
  /** Flip the tooltip to stay in view (v11, experimental). */
  autoAlign?: boolean;
  /** The snippet's (or the inline button's) accessible name (v11). Default "Copy to clipboard". */
  'aria-label'?: string;
  /** @deprecated v11: use `aria-label`. */
  ariaLabel?: string;
  /** The code. */
  children?: ReactNode;
  className?: string;
  /** The copy button's tooltip and name (v11). Default "Copy to clipboard". */
  copyButtonDescription?: string;
  /** What the copy writes, instead of the code's text (v11). */
  copyText?: string;
  disabled?: boolean;
  /** The tooltip's text after a copy (v11). Default "Copied". */
  feedback?: string;
  /** How long the feedback shows, ms (v11). Default 2000. */
  feedbackTimeout?: number;
  /** No copy button (v11). */
  hideCopyButton?: boolean;
  /** @deprecated v11: accepted, not drawn (use a Layer). */
  light?: boolean;
  /** Multi, collapsed: at most this many rows (v11). Default 15; 0: no limit. */
  maxCollapsedNumberOfRows?: number;
  /** Multi, expanded: at most this many rows, then it scrolls (v11). Default 0: no limit. */
  maxExpandedNumberOfRows?: number;
  /** Multi, collapsed: at least this many rows (v11). Default 3. */
  minCollapsedNumberOfRows?: number;
  /** Multi, expanded: at least this many rows (v11). Default 16. */
  minExpandedNumberOfRows?: number;
  /** After a copy (v11). */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Multi's expand button, expanded (v11). Default "Show less". */
  showLessText?: string;
  /** Multi's expand button, collapsed (v11). Default "Show more". */
  showMoreText?: string;
  /** v11's three types. Default `single`. */
  type?: CodeSnippetType;
  /** Multi: wrap long lines instead of scrolling (v11). */
  wrapText?: boolean;
  /** The code is on its way (the loading standard). Single and multi. */
  loading?: boolean;
  /** Loading: how many lines stand in for the code. Default 1 (single), `minCollapsedNumberOfRows` (multi). */
  skeletonLines?: number;
}

/* ── the clipboard ────────────────────────────────────────────────────────── */

/** The old way, for a page without the async clipboard (or without permission). */
function copyByCommand(text: string) {
  const back = document.activeElement as HTMLElement | null;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText =
    'position:fixed;inset-block-start:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    /* nothing more to try */
  }
  ta.remove();
  back?.focus?.({ preventScroll: true });
}

function writeClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => copyByCommand(text));
  } else copyByCommand(text);
}

/* ── the expand button's chevron ──────────────────────────────────────────── */

const ExpandedContext = createContext(false);

/** The disclosure's chevron (the Accordion's), down collapsed, up expanded. A stable component for Button's `renderIcon`. */
function SnippetChevron(props: { className?: string; size?: 16 | 20 }) {
  const open = useContext(ExpandedContext);
  return (
    <ChevronDownUpToggle
      {...props}
      size={16}
      toggled={open}
      disableToggle
      aria-hidden="true"
    />
  );
}

/* ── inline ───────────────────────────────────────────────────────────────── */

function InlineSnippet({
  align = 'bottom',
  autoAlign = false,
  label,
  className,
  disabled,
  feedback,
  feedbackTimeout,
  onCopy,
  children,
  codeRef,
  rest,
}: {
  align?: TooltipAlign | TooltipAlignDeprecated;
  autoAlign?: boolean;
  label: string;
  className: string;
  disabled?: boolean;
  feedback: string;
  feedbackTimeout: number;
  onCopy: (e: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  codeRef: React.RefObject<HTMLElement | null>;
  rest: HTMLAttributes<HTMLElement>;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const codeId = useId();
  const fb = useCopyFeedback(btnRef, {
    feedback,
    description: label,
    feedbackTimeout,
  });
  const { props: trigger, tooltip } = useTooltipTrigger({
    label: fb.label,
    align,
    autoAlign,
    enterDelayMs: 100,
    leaveDelayMs: TOOLTIP_LEAVE_LABEL_MS,
    closeOnActivation: false,
    disabled,
  });
  // A snippet that comes under a resting pointer shows no tooltip until it moves.
  const gated = useStillTrigger(trigger);
  const { timeScale, reduced: tipReduced } = useContext(TooltipMotionContext);
  const rolloverReduced = useReducedGetter(tipReduced);

  // The rollover on the snippet's surface.
  useEffect(() => {
    const el = btnRef.current;
    if (!el || disabled) return;
    const detach = attachRollover(el, {
      selector: '.cds-snippet--inline',
      timeScale,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      el.style.removeProperty('--cds-motion-rollover-hover-color');
      el.style.removeProperty('--cds-motion-rollover-press-color');
      el.style.removeProperty('--cds-motion-rollover-color');
    };
  }, [disabled, timeScale, rolloverReduced]);

  type H = (e: never) => void;
  const both =
    (ours: H, theirs: H) =>
    (e: never): void => {
      ours(e);
      theirs(e);
    };
  return (
    <span className="cds-tooltip cds-snippet-inline">
      <button
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
        type="button"
        ref={mergeRefs<HTMLButtonElement>(btnRef, trigger.ref as never)}
        className={className}
        disabled={disabled}
        aria-labelledby={trigger['aria-labelledby']}
        aria-describedby={codeId}
        data-tooltip-trigger={trigger['data-tooltip-trigger']}
        onPointerEnter={both(
          gated.onPointerEnter as H,
          fb.handlers.onPointerEnter as H
        )}
        onPointerLeave={both(
          gated.onPointerLeave as H,
          fb.handlers.onPointerLeave as H
        )}
        onFocus={both(trigger.onFocus as H, fb.handlers.onFocus as H)}
        onBlur={both(trigger.onBlur as H, fb.handlers.onBlur as H)}
        onKeyDown={trigger.onKeyDown}
        onClick={(e) => {
          trigger.onClick(e);
          onCopy(e);
          fb.copy();
        }}>
        <code id={codeId} ref={codeRef as React.RefObject<HTMLElement>}>
          {children}
        </code>
      </button>
      {tooltip}
      <span className="cds-snippet__status" role="status" aria-live="polite">
        {fb.announcement}
      </span>
    </span>
  );
}

/* ── the snippet ──────────────────────────────────────────────────────────── */

export function CodeSnippet({
  align = 'bottom',
  autoAlign = false,
  className,
  type = 'single',
  children,
  disabled = false,
  feedback = 'Copied',
  feedbackTimeout = 2000,
  onClick,
  'aria-label': ariaLabelProp = 'Copy to clipboard',
  ariaLabel: deprecatedAriaLabel,
  copyText,
  copyButtonDescription,
  light: _light,
  showMoreText = 'Show more',
  showLessText = 'Show less',
  hideCopyButton = false,
  wrapText = false,
  maxCollapsedNumberOfRows = 15,
  maxExpandedNumberOfRows = 0,
  minCollapsedNumberOfRows = 3,
  minExpandedNumberOfRows = 16,
  loading = false,
  skeletonLines,
  style,
  ...rest
}: CodeSnippetProps) {
  const ariaLabel = deprecatedAriaLabel || ariaLabelProp;
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const innerCodeRef = useRef<HTMLElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const bodyId = useId();
  const reduced = usePrefersReducedMotion();
  const { timeScale } = useContext(TooltipMotionContext);

  const isMulti = type === 'multi';
  const { phase, overlayRef, contentRef, overlayProps } = useSkeletonReveal(
    type === 'inline' ? false : loading
  );
  const busy = phase === 'loading' || phase === 'unload';
  const live = !disabled && !busy;

  const handleCopy = useCallback(
    (evt: MouseEvent<HTMLButtonElement>) => {
      const text = copyText ?? innerCodeRef.current?.innerText ?? '';
      if (copyText != null || innerCodeRef.current) writeClipboard(text);
      onClick?.(evt);
    },
    [copyText, onClick]
  );

  // Multi: whether the code runs past its collapsed rows (v11's rule), and
  // its full height (the open height the soft edge reads).
  useLayoutEffect(() => {
    if (!isMulti) return;
    const code = innerCodeRef.current;
    const pre = preRef.current;
    if (!code || !pre) return;
    const measure = () => {
      const { height } = code.getBoundingClientRect();
      const more =
        maxCollapsedNumberOfRows > 0 &&
        (maxExpandedNumberOfRows <= 0 ||
          maxExpandedNumberOfRows > maxCollapsedNumberOfRows) &&
        height > maxCollapsedNumberOfRows * ROW;
      setShowMoreButton(more);
      // The container's (the disclosure's content) height, padding and all.
      setFullHeight((pre.parentElement ?? pre).offsetHeight);
      // v11: expanded and now no taller than the expanded minimum, it collapses.
      if (
        minExpandedNumberOfRows > 0 &&
        height <= minExpandedNumberOfRows * ROW
      ) {
        setExpanded((x) => (x && !more ? false : x));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(code);
    return () => ro.disconnect();
  }, [
    isMulti,
    maxCollapsedNumberOfRows,
    maxExpandedNumberOfRows,
    minExpandedNumberOfRows,
    phase,
  ]);

  // The first measure lands as it is (a first paint: no motion).
  const [still, setStill] = useState(true);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setStill(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  // The disclosure: open when expanded, or when there is nothing more to show.
  const open = !showMoreButton || expanded;
  const moves = useDisclosureMoves(rootRef, {
    reason: open ? 'expand' : 'collapse',
    timeScale,
  });
  const body = useDisclosureBody(bodyRef, open, moves, reduced, still);

  const classes = (extra?: string) =>
    [
      'cds-snippet',
      `cds-snippet--${type}`,
      type !== 'inline' && disabled && 'cds-snippet--disabled',
      expanded && 'cds-snippet--expand',
      hideCopyButton && 'cds-snippet--no-copy',
      wrapText && 'cds-snippet--wraptext',
      isMulti && showMoreButton && 'cds-snippet--has-more',
      busy && 'cds-snippet--loading',
      extra,
      className,
    ]
      .filter(Boolean)
      .join(' ');

  if (type === 'inline') {
    if (hideCopyButton) {
      return (
        <span {...rest} className={classes()}>
          <code ref={innerCodeRef as React.RefObject<HTMLElement>}>
            {children}
          </code>
        </span>
      );
    }
    return (
      <InlineSnippet
        align={align}
        autoAlign={autoAlign}
        label={ariaLabel}
        className={classes()}
        disabled={disabled}
        feedback={feedback}
        feedbackTimeout={feedbackTimeout}
        onCopy={handleCopy}
        codeRef={innerCodeRef}
        rest={rest}>
        {children}
      </InlineSnippet>
    );
  }

  // Rows: collapsed between the minimum and the maximum; expanded from its
  // own minimum, and scrolling past its maximum (v11's). The scroll is the
  // container's (the Scroller's viewport): its rows and its padding.
  const preStyle: CSSProperties = {};
  const containerStyle: CSSProperties = {};
  if (isMulti) {
    if (expanded) {
      if (minExpandedNumberOfRows > 0)
        preStyle.minBlockSize = minExpandedNumberOfRows * ROW;
      if (maxExpandedNumberOfRows > 0)
        containerStyle.maxBlockSize =
          maxExpandedNumberOfRows * ROW + PAD + (showMoreButton ? 0 : PAD);
    } else if (minCollapsedNumberOfRows > 0) {
      preStyle.minBlockSize = minCollapsedNumberOfRows * ROW;
    }
  }
  // Collapsed: the container's top padding and the rows (the soft edge over the last).
  const shut =
    isMulti && showMoreButton ? PAD + maxCollapsedNumberOfRows * ROW : 0;
  const lines =
    skeletonLines ?? (isMulti ? Math.max(1, minCollapsedNumberOfRows) : 1);

  const code =
    phase !== 'loading' ? (
      <pre
        ref={mergeRefs<HTMLPreElement>(preRef, contentRef as never)}
        className="cds-snippet__pre"
        style={preStyle}>
        <code ref={innerCodeRef as React.RefObject<HTMLElement>}>
          {children}
        </code>
      </pre>
    ) : null;
  const skeleton =
    phase !== 'loaded' ? (
      <span
        ref={overlayRef as React.RefObject<HTMLSpanElement>}
        {...overlayProps}
        className="cds-snippet__skeleton"
        aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonText
            key={i}
            lineHeight={`${ROW}px`}
            width={['100%', '85%', '95%'][i % 3]}
          />
        ))}
      </span>
    ) : null;

  // The scroller and the textbox: the kit's Scroller (its pill; the soft
  // edge stays the container's), its viewport the textbox, holding the code
  // or its skeleton. Multi scrolls down too, past `maxExpandedNumberOfRows`;
  // its copy button lies over the top end, so the down track starts below
  // the button's box (an overlaid control insets the track: the pill never
  // runs under it). Single's button sits beside the code, outside the track.
  const container = (
    <Scroller
      axis={isMulti ? 'both' : 'x'}
      insets={isMulti && !hideCopyButton ? { top: COPY } : undefined}
      className={['cds-snippet__scroller', isMulti && 'cds-disclosure__content']
        .filter(Boolean)
        .join(' ')}
      viewportClassName="cds-snippet__container"
      viewportProps={{
        role: 'textbox',
        tabIndex: !disabled && !busy ? 0 : undefined,
        'aria-label': ariaLabel || 'code-snippet',
        'aria-readonly': true,
        'aria-multiline': isMulti || undefined,
        'aria-busy': busy || undefined,
        style: containerStyle,
      }}
      timeScale={timeScale}>
      {code}
      {skeleton}
    </Scroller>
  );

  return (
    <div
      {...(rest as HTMLAttributes<HTMLDivElement>)}
      ref={rootRef}
      className={classes()}
      style={style}
      aria-busy={busy || undefined}>
      {isMulti ? (
        <div
          ref={bodyRef}
          id={bodyId}
          className="cds-disclosure__body cds-snippet__body"
          data-open={body.bodyProps['data-open']}
          data-unclipped={body.bodyProps['data-unclipped']}
          data-reduced={body.bodyProps['data-reduced']}
          data-still={still || undefined}
          style={
            {
              '--cds-disclosure-shut': `${shut}px`,
              '--cds-disclosure-open': `${fullHeight}px`,
            } as CSSProperties
          }>
          <div className="cds-disclosure__clip cds-snippet__clip">
            {container}
          </div>
        </div>
      ) : (
        container
      )}
      {!hideCopyButton && (
        <CopyButton
          wrapperClasses="cds-snippet__copy"
          align={align}
          autoAlign={autoAlign}
          size="md"
          corners="full"
          disabled={!live}
          onClick={handleCopy}
          feedback={feedback}
          feedbackTimeout={feedbackTimeout}
          iconDescription={copyButtonDescription}
        />
      )}
      {isMulti && showMoreButton && !busy ? (
        <ExpandedContext.Provider value={expanded}>
          <Button
            frame="ghost"
            size="sm"
            corners="rounded"
            className="cds-snippet__expand"
            disabled={disabled}
            renderIcon={SnippetChevron}
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((x) => !x)}>
            {reduced ? (
              expanded ? (
                showLessText
              ) : (
                showMoreText
              )
            ) : (
              <RollText
                text={expanded ? showLessText : showMoreText}
                order={expanded ? 1 : 0}
                timeScale={timeScale}
              />
            )}
          </Button>
        </ExpandedContext.Provider>
      ) : null}
    </div>
  );
}
CodeSnippet.displayName = 'CodeSnippet';

/* ── the skeleton ─────────────────────────────────────────────────────────── */

export interface CodeSnippetSkeletonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  className?: string;
  /** v11's: single (default) or multi. */
  type?: 'single' | 'multi';
  /** How many lines stand in for the code (multi). Default 3. */
  skeletonLines?: number;
}

/** v11's CodeSnippetSkeleton: the snippet itself, loading (the loading standard). */
export function CodeSnippetSkeleton({
  type = 'single',
  ...rest
}: CodeSnippetSkeletonProps) {
  return <CodeSnippet {...rest} type={type} loading />;
}
