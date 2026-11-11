/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  attachRollover,
  clamp01,
  type CubicBezier,
} from '@carbon-labs/v12-motion';
import { MultiFieldInput } from '@carbon-labs/react-text-input';
import './easing-graph.scss';
import { inlineKey, useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * EasingGraph — a cubic-bezier as a graph: progress (up) over time (across),
 * on a light quarter grid with the linear diagonal for reference, the plot
 * a field (the kit's field fill, the grid in a field's hairline). With
 * `onChange`, the two handles drag (or take the arrow keys) and the four
 * numbers edit (the kit's MultiFieldInput: one field, four segments, each
 * flagging a value outside 0–1; to two decimal places; one row of four at
 * any width, each segment dropping its name when narrow); handles stay
 * inside the unit box (0–1 both ways), so a curve never overshoots — no
 * spring-like curves. `reference` draws a second curve dotted behind (a
 * baseline, the curve it started from).
 *
 *   lines    each its own weight and pattern, so they tell apart at a glance:
 *            the curve 3px solid, the reference 3px
 *            dotted, the handles' arms 2px dashed, the linear diagonal 1px
 *            in sparse dashes
 *   handles  HTML over the plot, on the house rollover's hover, press and
 *            release, and the keyboard: a 2px ring round the plot's
 *            fill, which fills it in every state. The ring steps
 *            up in contrast from rest to hover to press and settles back on
 *            release; pressed, the handle grows to 18px and its arm turns
 *            solid in the press color. The pointer is captured, so the press
 *            holds while the handle follows it
 *   keys     arrows move a handle 0.01 (Shift, 0.1): left and right its x,
 *            up and down its y
 * ========================================================================== */

export interface EasingGraphProps {
  value: CubicBezier;
  /** Editable when given: drag the handles or type the numbers. */
  onChange?: (value: CubicBezier) => void;
  /** A curve drawn dotted behind, to compare. */
  reference?: CubicBezier | null;
  /** Its accessible name (the token's name). */
  label: string;
  /** Hide the four numbers. Default false. */
  hideNumbers?: boolean;
  className?: string;
}

const W = 160;
const H = 100;
// The plot's inset, a 20th of its width: the numbers under it take the same (easing-graph.scss).
const PAD = 8;
const X = (x: number) => PAD + x * (W - PAD * 2);
const Y = (y: number) => H - PAD - y * (H - PAD * 2);
/** Two decimal places, as the tokens are written. */
const round = (n: number) => Math.round(n * 100) / 100;
const path = ([x1, y1, x2, y2]: CubicBezier) =>
  `M${X(0)} ${Y(0)} C${X(x1)} ${Y(y1)} ${X(x2)} ${Y(y2)} ${X(1)} ${Y(1)}`;
const GRID = [0.25, 0.5, 0.75];
const NAMES = ['x1', 'y1', 'x2', 'y2'] as const;
/** Reads as a number in 0–1. */
const inUnit = (text: string) => {
  const n = parseFloat(text);
  return text.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 1;
};

export function EasingGraph({
  value,
  onChange,
  reference,
  label,
  hideNumbers = false,
  className,
}: EasingGraphProps) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<0 | 1 | null>(null);
  const [x1, y1, x2, y2] = value;
  const editable = !!onChange;
  const id = useId();
  // The four numbers as typed, while a field is being edited.
  const [drafts, setDrafts] = useState<(string | undefined)[]>([]);
  const setDraft = (i: number, text: string | undefined) =>
    setDrafts((d) => Object.assign([...d], { [i]: text }));
  const rolloverReduced = useReducedGetter();

  // The house rollover on the handles.
  useEffect(() => {
    const el = root.current;
    if (!el || !editable) return;
    return attachRollover(el, {
      selector: '.cds-easing-graph__handle',
      // Its own colors, all the plot's fill: the fill never brightens (easing-graph.scss).
      colors: 'tokens',
      reduced: rolloverReduced,
    });
  }, [editable, rolloverReduced]);

  const set = (handle: 0 | 1, x: number, y: number) => {
    const next = [...value] as CubicBezier;
    next[handle * 2] = round(clamp01(x));
    next[handle * 2 + 1] = round(clamp01(y));
    onChange?.(next);
  };

  const grab = (handle: 0 | 1) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!editable || e.button !== 0) return;
    // Captured on the handle: the press holds (no slide-off) while it follows the pointer.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer has nothing to capture; the drag still follows the plot.
    }
    setDragging(handle);
  };
  const move = (handle: 0 | 1) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragging !== handle || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const vy = ((e.clientY - r.top) / r.height) * H;
    set(handle, (vx - PAD) / (W - PAD * 2), (H - PAD - vy) / (H - PAD * 2));
  };
  const release = () => setDragging(null);
  const key = (handle: 0 | 1) => (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    const by = e.shiftKey ? 0.1 : 0.01;
    const [hx, hy] = [value[handle * 2]!, value[handle * 2 + 1]!];
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-by, 0],
      ArrowRight: [by, 0],
      ArrowDown: [0, -by],
      ArrowUp: [0, by],
    };
    // The handles stand at their inline offset, so right to left ← moves x on.
    const step = d[inlineKey(e.key, e.currentTarget)];
    if (!step) return;
    e.preventDefault();
    set(handle, hx + step[0], hy + step[1]);
  };
  const setNumber = (i: number, n: number) => {
    const next = [...value] as CubicBezier;
    next[i] = clamp01(n);
    onChange?.(next);
  };

  return (
    <div
      ref={root}
      className={[
        'cds-easing-graph',
        editable && 'cds-easing-graph--editable',
        dragging !== null && 'cds-easing-graph--dragging',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      <div className="cds-easing-graph__stage">
        <svg
          ref={svg}
          className="cds-easing-graph__plot"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${label}: cubic-bezier(${value.join(', ')})`}>
          {/* The plot: the field fill under the grid. */}
          <rect
            className="cds-easing-graph__box"
            x={X(0)}
            y={Y(1)}
            width={X(1) - X(0)}
            height={Y(0) - Y(1)}
          />
          {GRID.map((g) => (
            <g key={g} className="cds-easing-graph__grid">
              <line x1={X(g)} y1={Y(0)} x2={X(g)} y2={Y(1)} />
              <line x1={X(0)} y1={Y(g)} x2={X(1)} y2={Y(g)} />
            </g>
          ))}
          <line
            className="cds-easing-graph__linear"
            x1={X(0)}
            y1={Y(0)}
            x2={X(1)}
            y2={Y(1)}
          />
          {reference && (
            <path className="cds-easing-graph__reference" d={path(reference)} />
          )}
          <line
            className="cds-easing-graph__arm"
            data-active={dragging === 0 || undefined}
            x1={X(0)}
            y1={Y(0)}
            x2={X(x1)}
            y2={Y(y1)}
          />
          <line
            className="cds-easing-graph__arm"
            data-active={dragging === 1 || undefined}
            x1={X(1)}
            y1={Y(1)}
            x2={X(x2)}
            y2={Y(y2)}
          />
          <path className="cds-easing-graph__curve" d={path(value)} />
        </svg>
        {[
          [x1, y1],
          [x2, y2],
        ].map(([hx, hy], i) => {
          const h = i as 0 | 1;
          const at = {
            insetInlineStart: `${(X(hx!) / W) * 100}%`,
            insetBlockStart: `${(Y(hy!) / H) * 100}%`,
          };
          return editable ? (
            <span
              key={h}
              className="cds-easing-graph__handle"
              data-dragging={dragging === h || undefined}
              // A rollover around the graph leaves the handle's press to it.
              data-rollover-nested=""
              style={at}
              role="slider"
              tabIndex={0}
              aria-label={`${label}, handle ${h + 1}`}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={hx}
              aria-valuetext={`x ${hx}, y ${hy}`}
              onPointerDown={grab(h)}
              onPointerMove={move(h)}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              onKeyDown={key(h)}
            />
          ) : (
            <span
              key={h}
              className="cds-easing-graph__handle cds-easing-graph__handle--static"
              style={at}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {!hideNumbers &&
        (editable ? (
          <MultiFieldInput
            id={`${id}-numbers`}
            className="cds-easing-graph__numbers cds-multi-field--one-row"
            size="sm"
            labelText={`${label}, cubic-bezier`}
            hideLabel
            messagePlacement="flow"
            segments={NAMES.map((name, i) => {
              // What's typed, while it doesn't read as a number in 0–1; the value otherwise.
              const draft = drafts[i];
              const bad = draft !== undefined && !inUnit(draft);
              return {
                label: name,
                value: draft ?? String(value[i]),
                invalid: bad,
                invalidText: bad
                  ? `${name} is a number from 0 to 1.`
                  : undefined,
                inputProps: {
                  inputMode: 'decimal',
                  autoComplete: 'off',
                  onBlur: () => setDraft(i, undefined),
                },
                onChange: (text) => {
                  setDraft(i, text);
                  if (inUnit(text)) setNumber(i, round(parseFloat(text)));
                },
              };
            })}
          />
        ) : (
          // Read only: the curve as it's written, on one line.
          <code className="cds-easing-graph__css">
            [{value.map(round).join(', ')}]
          </code>
        ))}
    </div>
  );
}
