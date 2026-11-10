/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { distanceTokens } from '@carbon-labs/v12-motion';
import {
  attachRollover,
  DURATION_FLOOR_MS,
  durationStepForDistance,
  LOADING_MOTION,
  motionTokens,
  toEasing,
  reducedClock,
  cubicBezier,
} from '@carbon-labs/v12-motion';

import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { AISkeletonText } from './Skeleton';
import { SkeletonReveal } from './SkeletonReveal';
import { useSkeletonWaveContext } from './SkeletonWave';
import './skeleton.scss';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * AITextReveal — generated text, streamed in or revealed once complete
 * ============================================================================
 *
 *   lines     the AI skeleton is one block over the text's own lines, at
 *             the text's line height, so it stands where the text will be
 *   stream    each chunk (a sentence) fades up in place where it lands, at
 *             most one every 240ms (the page-load spec's AI sentences); on
 *             the same frame and clock, the block's lines under the text
 *             dissolve (a mask), so text never sits over the block
 *   rise      (`rise`) the first chunk also rises 4px on its fade's clock,
 *             entrance-productive; later chunks only fade. Reduced: no rise
 *   complete  the AI skeleton holds until the text is all there, then one
 *             reveal (`SkeletonReveal`)
 *   clamp     (default; a sized container) the part keeps its lines — the
 *             size the structure gave it; text past them streams in under
 *             a soft fade on the last line, nothing moving; complete, a
 *             Show more link fades in on the last line and opens the rest
 *             in place, growing the part once: the kit's disclosure, on
 *             the travel's step, entrance-productive, the clamp's fade
 *             carried on as the soft edge that closes over the last of
 *             the travel (`openTo`)
 *   grow      (in flow) the part grows a line at a time as lines land, each
 *             line one move on the text's clock (`fast-02`,
 *             standard-productive); what follows moves with it; a reader
 *             pinned to the bottom of the scroller stays there, one who has
 *             scrolled up is never moved
 *   again     a new generation: the old text dissolves in place, then the
 *             block fades up in its place — the same node, there from the
 *             first frame, no entrance of its own
 *
 * Text only ever dissolves in place. Every fade is linear.
 * ========================================================================== */

export type AITextMode = 'stream' | 'complete';

/**
 * What the part does with text past its lines: `clamp` (a sized container — a
 * dashboard tile, a card) keeps the size the structure gave it, the text
 * past its lines under a soft fade, and opens with Show more, once; `grow`
 * (in flow — a chat transcript, a side panel) grows a line at a time.
 */
export type AITextOverflow = 'clamp' | 'grow';

export interface AITextRevealProps {
  /** What has been generated so far, in order — sentences or chunks. */
  chunks: ReactNode[];
  /** Generation has finished. */
  done: boolean;
  /** `stream` (default): chunks fade in as they land; `complete`: one reveal when `done`. */
  mode?: AITextMode;
  /** The lines the part holds while the text arrives (the skeleton's lines). Default 3. */
  lineCount?: number;
  /** Streaming: at most one chunk this often, ms. Default 240. */
  chunkGap?: number;
  /** Text past the lines: `clamp` (default; a sized container) or `grow` (in flow). */
  overflow?: AITextOverflow;
  /** The text's class (its type style; its line height sets the skeleton's lines). */
  className?: string;
  /** Streaming: the first words rise as they land (a reply in a conversation). Default false. */
  rise?: boolean;
}

// Read when used, so a token draft reaches it.
const standard = () =>
  cubicBezier(toEasing({ name: 'standard', mode: 'productive' }));

/** The block's band from `from` to `to` (px from its top) dissolves under its mask; above `from`
 * is clear. A band still fading when the next lands clears at once. */
const bands = new WeakMap<HTMLElement, Animation>();
function coverLines(
  block: HTMLElement,
  from: number,
  to: number,
  duration: number
) {
  bands.get(block)?.cancel();
  block.style.setProperty('--fb-cover-from', `${from}px`);
  block.style.setProperty('--fb-cover-to', `${to}px`);
  const band = block.animate(
    [{ '--fb-cover-band': 1 }, { '--fb-cover-band': 0 }] as Keyframe[],
    {
      duration,
      easing: LOADING_MOTION.easing,
      fill: 'forwards',
    }
  );
  bands.set(block, band);
}

/** The text's line height, px, from its own computed style. */
function lineOf(el: HTMLElement | null): number {
  if (!el) return 20;
  const cs = getComputedStyle(el);
  const v = parseFloat(cs.lineHeight);
  return Number.isFinite(v) ? v : parseFloat(cs.fontSize) * 1.4;
}

/**
 * The part's height, settling once: from the lines it held to the text's
 * height, in one move timed by the distance (Carbon's steps,
 * standard-productive). Called after the holding style is dropped.
 */
function settleHeight(
  el: HTMLElement,
  from: number,
  timeScale: number,
  reduced: boolean
) {
  // A move under way gives way to this one, from where it is (`from`).
  el.getAnimations().forEach((a) => a.cancel());
  const to = el.getBoundingClientRect().height;
  const d = Math.abs(to - from);
  if (d < 0.5 || typeof el.animate !== 'function') return;
  el.animate([{ blockSize: `${from}px` }, { blockSize: `${to}px` }], {
    duration: reduced
      ? DURATION_FLOOR_MS
      : Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[durationStepForDistance(d)] * timeScale
        ),
    easing: standard(),
  });
}

/** One streamed chunk: fades up in place as it mounts. */
/** A stream mounted inside it with its text done shows that text still: a conversation's earlier replies. Kit-internal. */
export const AITextAtRest = createContext(false);

function Chunk({
  children,
  still = false,
}: {
  children: ReactNode;
  still?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { timeScale, reduced } = useFeedbackMotion();
  useLayoutEffect(() => {
    if (still) return;
    ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: Math.max(
        DURATION_FLOOR_MS,
        LOADING_MOTION.contentMs * timeScale * reducedClock(reduced)
      ),
      easing: LOADING_MOTION.easing,
      fill: 'backwards',
    });
    // Once, as it lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={ref} className="fb-ai-text__chunk">
      {children}{' '}
    </span>
  );
}

/** The nearest scroller (its own `overflow-y`), else the document's. */
function scrollerOf(el: HTMLElement): HTMLElement {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight)
      return n;
  }
  return (
    (el.ownerDocument.scrollingElement as HTMLElement) ??
    el.ownerDocument.documentElement
  );
}

/**
 * `grow`: the part takes `to` px, one line at a time — each line's height a
 * move on the text's clock (`fast-02`, standard-productive), from where it
 * is. A reader pinned to the bottom of the scroller stays there; one who
 * has scrolled up is never moved.
 */
function growTo(
  el: HTMLElement,
  to: number,
  line: number,
  timeScale: number,
  reduced: boolean
) {
  const from = el.getBoundingClientRect().height;
  el.getAnimations().forEach((a) => a.cancel());
  el.style.blockSize = `${to}px`;
  const d = to - from;
  if (Math.abs(d) < 0.5 || typeof el.animate !== 'function') return;
  const steps = Math.max(1, Math.round(Math.abs(d) / line));
  const stepMs = reduced
    ? DURATION_FLOOR_MS
    : Math.max(DURATION_FLOOR_MS, LOADING_MOTION.contentMs * timeScale);
  const frames: Keyframe[] = Array.from({ length: steps + 1 }, (_, i) => ({
    blockSize: `${from + (d * i) / steps}px`,
    offset: i / steps,
    easing: standard(),
  }));
  const sc = scrollerOf(el);
  const pinned =
    sc.scrollTop + sc.clientHeight >= sc.scrollHeight - Math.abs(d) - 2;
  const anim = el.animate(frames, { duration: stepMs * steps });
  if (!pinned) return;
  // Keep the newest line in view while the part grows.
  const follow = () => {
    sc.scrollTop = sc.scrollHeight;
    if (anim.playState === 'running') requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

/** `clamp`: the text past the held lines waits under a soft fade on the last line. */
function clampState(root: HTMLElement, text: HTMLElement, held: number) {
  root.toggleAttribute(
    'data-clamped',
    text.getBoundingClientRect().height > held + 0.5
  );
}

function ShowMore({
  onOpen,
  controls,
}: {
  onOpen: () => void;
  controls: string;
}) {
  return (
    <span className="fb-ai-text__more-row">
      <button
        type="button"
        className="fb-ai-text__more"
        aria-expanded="false"
        aria-controls={controls}
        onClick={onOpen}>
        Show more
      </button>
    </span>
  );
}

function Streamed({
  chunks,
  done,
  lineCount,
  chunkGap,
  overflow,
  className,
  rise,
}: Required<Omit<AITextRevealProps, 'mode' | 'className' | 'rise'>> & {
  className?: string;
  rise?: boolean;
}) {
  const { timeScale, reduced } = useFeedbackMotion();
  const rolloverReduced = useReducedGetter(reduced);
  const { busy } = useSkeletonWaveContext();
  const id = useId();
  // Mounted at rest with its text done: that text is there, still.
  const atRest = useContext(AITextAtRest);
  const [bornCount, setBornCount] = useState(() =>
    atRest && done ? chunks.length : 0
  );
  const firstStill = useRef(bornCount > 0);
  // The chunks on screen (kept through a return, when the host's are gone).
  const [shownChunks, setShownChunks] = useState<ReactNode[]>(() =>
    chunks.slice(0, bornCount)
  );
  const [returning, setReturning] = useState(false);
  const [open, setOpen] = useState(false);
  const lastAt = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const skRef = useRef<HTMLDivElement>(null);
  const k = timeScale * reducedClock(reduced);
  const fadeMs = (base: number) => Math.max(DURATION_FLOOR_MS, base * k);

  // A new generation (fewer chunks than shown): the old text returns into the skeleton.
  const count = chunks.length;
  const [prevCount, setPrevCount] = useState(count);
  if (prevCount !== count) {
    setPrevCount(count);
    if (count < shownChunks.length && !returning) {
      setReturning(true);
      setOpen(false);
    }
    // A new generation: none of its chunks were there at mount, so every one fades.
    if (count < shownChunks.length && bornCount) setBornCount(0);
  }

  // The pace: whatever has landed, at most one chunk every `chunkGap`.
  useEffect(() => {
    if (returning || shownChunks.length >= count) return;
    const gap = chunkGap * timeScale;
    const wait =
      shownChunks.length === 0
        ? 0
        : Math.max(0, lastAt.current + gap - performance.now());
    const t = window.setTimeout(() => {
      lastAt.current = performance.now();
      setShownChunks((s) =>
        s.length < chunks.length ? [...s, chunks[s.length]] : s
      );
    }, wait);
    return () => window.clearTimeout(t);
  }, [shownChunks.length, count, chunks, chunkGap, timeScale, returning]);

  const complete =
    done && !returning && shownChunks.length >= count && count > 0;

  // The first words rise as they land: the text holds only them, so the text moves (a span can't).
  const shownCount = shownChunks.length;
  useLayoutEffect(() => {
    const text = textRef.current;
    if (
      !rise ||
      reduced ||
      shownCount !== 1 ||
      bornCount > 0 ||
      !text ||
      typeof text.animate !== 'function'
    )
      return;
    text.animate(
      [
        { transform: `translateY(${distanceTokens.xs}px)` },
        { transform: 'none' },
      ],
      {
        duration: Math.max(
          DURATION_FLOOR_MS,
          LOADING_MOTION.contentMs * timeScale
        ),
        easing: cubicBezier(toEasing({ name: 'entrance', mode: 'productive' })),
      }
    );
    // As the first chunk lands only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownCount]);

  // Once the text is complete and the last lines have dissolved, the
  // skeleton leaves the DOM (the standard: no blocks once loaded); a new
  // generation mounts it again, its lines fading up where they were.
  const [linesGone, setLinesGone] = useState(bornCount > 0);
  if (!complete && linesGone) setLinesGone(false);
  useEffect(() => {
    if (!complete) return;
    const t = window.setTimeout(
      () => setLinesGone(true),
      fadeMs(LOADING_MOTION.contentMs)
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);
  const showLines = !complete || returning || !linesGone;

  // The skeleton's lines are the text's lines.
  useLayoutEffect(() => {
    rootRef.current?.style.setProperty(
      '--fb-ai-line',
      `${lineOf(textRef.current)}px`
    );
  });

  // The block's lines the text now covers dissolve on the chunk's own frame and clock; at the end, the rest.
  useLayoutEffect(() => {
    const text = textRef.current;
    const block = skRef.current?.querySelector<HTMLElement>('[data-skeleton]');
    if (!text || !block || returning) return;
    const line = lineOf(text);
    const covered = complete
      ? lineCount
      : Math.min(
          lineCount,
          Math.ceil(text.getBoundingClientRect().height / line - 0.01)
        );
    const was = Number(block.dataset.covered ?? 0);
    if (covered <= was) return;
    block.dataset.covered = String(covered);
    coverLines(
      block,
      was * line,
      covered * line,
      fadeMs(LOADING_MOTION.contentMs)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownChunks.length, complete, returning]);

  // The part's height. `clamp`: it keeps its lines (the size the structure
  // gave it), the text past them under a soft fade, until Show more opens
  // it — once. `grow`: it grows a line at a time as the text lands. A new
  // generation: back to its lines in one move, after the old text has gone.
  useLayoutEffect(() => {
    const el = rootRef.current;
    const text = textRef.current;
    if (!el || !text) return;
    const line = lineOf(text);
    const held = lineCount * line;
    const textH = text.getBoundingClientRect().height;
    if (returning) return;
    if (overflow === 'grow') {
      const to = complete ? Math.max(textH, 0) || held : Math.max(held, textH);
      if (firstStill.current) {
        firstStill.current = false;
        el.style.blockSize = `${to}px`;
        return;
      }
      // Against the height it's moving to, not the one it's at mid-move.
      if (Math.abs(parseFloat(el.style.blockSize || '0') - to) > 0.5)
        growTo(el, to, line, timeScale, reduced);
      return;
    }
    if (open) {
      openTo(el, textH, timeScale, reduced);
      return;
    }
    if (el.style.blockSize !== `${held}px`)
      settleTo(el, held, timeScale, reduced);
    clampState(el, text, held);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownChunks.length, complete, returning, open, overflow]);

  // `grow`, complete: the part follows its text when the text reflows — the
  // column narrowing as a side panel or a second chat opens beside it —
  // at once, with no motion (stillness: a resize is not news). Without it
  // the part would keep the height it grew to, and a line pushed past it
  // would be cut off (as in the chat shell's split screen).
  useEffect(() => {
    const el = rootRef.current;
    const text = textRef.current;
    if (!el || !text || overflow !== 'grow' || !complete || returning) return;
    const ro = new ResizeObserver(() => {
      if (el.getAnimations().length) return;
      const h = text.getBoundingClientRect().height;
      if (h > 0 && Math.abs(parseFloat(el.style.blockSize || '0') - h) > 0.5)
        el.style.blockSize = `${h}px`;
    });
    ro.observe(text);
    return () => ro.disconnect();
  }, [overflow, complete, returning]);

  // A return: the text dissolves, then the lines fade up where they were.
  useLayoutEffect(() => {
    if (!returning) return;
    const textMs = fadeMs(LOADING_MOTION.contentMs);
    const lineMs = fadeMs(LOADING_MOTION.overlayMs);
    textRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: textMs,
      easing: LOADING_MOTION.easing,
      fill: 'forwards',
    });
    skRef.current
      ?.querySelectorAll<HTMLElement>('[data-skeleton]')
      .forEach((el) => {
        el.getAnimations().forEach((a) => a.cancel());
        delete el.dataset.covered;
        el.style.removeProperty('--fb-cover-from');
        el.style.removeProperty('--fb-cover-to');
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: lineMs,
          delay: textMs,
          easing: LOADING_MOTION.easing,
          fill: 'backwards',
        });
      });
    const t = window.setTimeout(() => {
      textRef.current?.getAnimations().forEach((a) => a.cancel());
      rootRef.current?.removeAttribute('data-clamped');
      setShownChunks([]);
      setReturning(false);
    }, textMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returning]);

  // The Show more link: the kit's text link (the rollover in its letters).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return attachRollover(el, {
      selector: '.fb-ai-text__more',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  // The page's busy state, until the text is complete.
  const self = useRef({});
  useLayoutEffect(() => {
    busy?.(self.current, !complete);
  }, [busy, complete]);
  useEffect(() => {
    const part = self.current;
    return () => busy?.(part, false);
  }, [busy]);

  return (
    <div
      ref={rootRef}
      className="fb-ai-text"
      data-mode="stream"
      data-overflow={overflow}
      data-complete={complete ? '' : undefined}
      data-open={open ? '' : undefined}
      style={{ '--fb-ai-lines': lineCount } as CSSProperties}
      aria-busy={!complete || undefined}>
      <p
        ref={textRef}
        id={id}
        className={['fb-ai-text__text', className].filter(Boolean).join(' ')}
        tabIndex={-1}>
        {shownChunks.map((c, i) => (
          <Chunk key={i} still={i < bornCount}>
            {c}
          </Chunk>
        ))}
      </p>
      {/* There from the first frame: its lines dissolve as the text covers them, it leaves once all have, and comes back with a new generation. */}
      {showLines && (
        <div ref={skRef} className="fb-ai-text__skeleton" aria-hidden="true">
          <AISkeletonText
            paragraph
            lineCount={lineCount}
            lineHeight="var(--fb-ai-line, 20px)"
          />
        </div>
      )}
      {overflow === 'clamp' && complete && !open && (
        <ShowMore
          controls={id}
          onOpen={() => {
            setOpen(true);
            textRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}

/**
 * Show more: the part opens to its text as the kit's disclosure — on the
 * travel's step, entrance-productive, its bottom under a soft edge that
 * starts as the clamp's fade (its last line, so nothing pops as the clamp
 * goes) and closes over the last of the travel, `min(fade, H − h)`
 * (skeleton.scss, `[data-opening]`). The text is already there, so it is
 * uncovered in place (no 8px lead: CodeSnippet's Show more). Reduced: at
 * once.
 */
function openTo(
  el: HTMLElement,
  to: number,
  timeScale: number,
  reduced: boolean
) {
  const from = el.getBoundingClientRect().height;
  el.getAnimations().forEach((a) => a.cancel());
  el.style.blockSize = `${to}px`;
  el.removeAttribute('data-clamped');
  const d = Math.abs(to - from);
  if (d < 0.5 || typeof el.animate !== 'function') return;
  el.style.setProperty('--fb-ai-open', `${to}px`);
  el.setAttribute('data-opening', '');
  const anim = el.animate(
    [{ blockSize: `${from}px` }, { blockSize: `${to}px` }],
    {
      duration: reduced
        ? DURATION_FLOOR_MS
        : Math.max(
            DURATION_FLOOR_MS,
            motionTokens.duration[durationStepForDistance(d)] * timeScale
          ),
      easing: cubicBezier(toEasing({ name: 'entrance', mode: 'productive' })),
    }
  );
  const done = () => {
    el.removeAttribute('data-opening');
    el.style.removeProperty('--fb-ai-open');
  };
  anim.finished.then(done, done);
}

/** One move of the part's height, from where it is, timed by the distance. */
function settleTo(
  el: HTMLElement,
  to: number,
  timeScale: number,
  reduced: boolean
) {
  const from = el.getBoundingClientRect().height;
  el.style.blockSize = `${to}px`;
  settleHeight(el, from, timeScale, reduced);
}

function Completed({
  chunks,
  done,
  lineCount,
  overflow,
  className,
}: {
  chunks: ReactNode[];
  done: boolean;
  lineCount: number;
  overflow: AITextOverflow;
  className?: string;
}) {
  const { timeScale, reduced } = useFeedbackMotion();
  const rolloverReduced = useReducedGetter(reduced);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState(false);
  // Back to loading: the part holds its lines again.
  const [prevDone, setPrevDone] = useState(done);
  if (prevDone !== done) {
    setPrevDone(done);
    if (!done) {
      setRevealed(false);
      setOpen(false);
    }
  }
  useLayoutEffect(() => {
    rootRef.current?.style.setProperty(
      '--fb-ai-line',
      `${lineOf(probeRef.current ?? rootRef.current)}px`
    );
  });
  // The part's height: its lines until the reveal; then `grow` takes the
  // text's height in one move, and `clamp` keeps its lines (Show more opens
  // the rest, once).
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const line = lineOf(probeRef.current);
    const held = lineCount * line;
    const text = textRef.current;
    if (!revealed || !text) {
      settleTo(el, held, timeScale, reduced);
      el.removeAttribute('data-clamped');
      return;
    }
    const textH = text.getBoundingClientRect().height;
    if (open) {
      openTo(el, textH, timeScale, reduced);
      return;
    }
    if (overflow === 'grow') {
      settleTo(el, textH, timeScale, reduced);
      el.removeAttribute('data-clamped');
      return;
    }
    clampState(el, text, held);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, open, overflow]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return attachRollover(el, {
      selector: '.fb-ai-text__more',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);
  const clamped = overflow === 'clamp' && revealed && !open;
  return (
    <div
      ref={rootRef}
      className="fb-ai-text"
      data-mode="complete"
      data-overflow={overflow}
      style={{ '--fb-ai-lines': lineCount } as CSSProperties}
      aria-busy={!done || undefined}>
      {/* A probe of the text's type, so the skeleton's lines are its lines before the text exists. */}
      <p
        ref={probeRef}
        className={['fb-ai-text__probe', className].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <SkeletonReveal
        loading={!done}
        skeleton={
          <AISkeletonText
            paragraph
            lineCount={lineCount}
            lineHeight="var(--fb-ai-line, 20px)"
          />
        }
        onReveal={() => setRevealed(true)}>
        <p
          ref={textRef}
          id={id}
          className={['fb-ai-text__text', className].filter(Boolean).join(' ')}
          tabIndex={-1}>
          {chunks.map((c, i) => (
            <span key={i} className="fb-ai-text__chunk">
              {c}{' '}
            </span>
          ))}
        </p>
      </SkeletonReveal>
      {clamped && (
        <ShowMore
          controls={id}
          onOpen={() => {
            setOpen(true);
            textRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}

/** Generated text on the AI skeleton: streamed in chunk by chunk, or revealed once complete. */
export function AITextReveal({
  chunks,
  done,
  mode = 'stream',
  lineCount = 3,
  chunkGap = 240,
  overflow = 'clamp',
  className,
  rise = false,
}: AITextRevealProps) {
  if (mode === 'stream')
    return (
      <Streamed
        chunks={chunks}
        done={done}
        lineCount={lineCount}
        chunkGap={chunkGap}
        overflow={overflow}
        className={className}
        rise={rise}
      />
    );
  return (
    <Completed
      chunks={chunks}
      done={done}
      lineCount={lineCount}
      overflow={overflow}
      className={className}
    />
  );
}
