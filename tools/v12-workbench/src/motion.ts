/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CONTENT_SWAP,
  DURATION_FLOOR_MS,
  LOADING_MOTION,
  SKELETON_WAVE,
  reducedClock,
} from '@carbon-labs/v12-motion';
import { BASE_DURATIONS, BASE_EASINGS, REGISTRY } from './baseline';
import type { ReducedBehaviour, V12Parameters } from './constants';

/** One line of the Motion panel: a token or a pattern parameter. */
export interface MotionRow {
  name: string;
  value: string;
  status?: string;
}

/** One motion item a story declares, described from the seam. */
export interface MotionEntry {
  item: string;
  /** The story's declared reduced behaviour, or null when it declares none. */
  reduced: ReducedBehaviour | null;
  rows: MotionRow[];
}

/** What the preview sends the Motion panel for a story. */
export interface MotionReport {
  storyId: string;
  /** False when the story has no `parameters.v12`. */
  declared: boolean;
  entries: MotionEntry[];
  states: string[];
  /** The share of the full duration a reduced fade runs at. */
  reducedClock: number;
  /** The shortest duration, ms: what "at once" lands on. */
  floorMs: number;
}

/** The seam's constants that carry a motion's clocks, by the name a story declares. */
const SEAM_CONSTANTS: Record<string, object> = {
  'content-swap': CONTENT_SWAP,
  'skeleton-wave': SKELETON_WAVE,
  loading: LOADING_MOTION,
};

const cubicBezier = (curve: readonly number[]) =>
  `cubic-bezier(${curve.join(', ')})`;

/**
 * A value as the panel shows it. A token name carries its value: `fast-01
 * (80ms)`, `exit-productive (cubic-bezier(...))`.
 *
 * @param value A leaf of a constant or a registry token.
 * @returns The text.
 */
function shown(value: unknown): string {
  if (typeof value === 'string') {
    if (value in BASE_DURATIONS) return `${value} (${BASE_DURATIONS[value]}ms)`;
    if (value in BASE_EASINGS) {
      return `${value} (${cubicBezier(BASE_EASINGS[value])})`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    const isCurve =
      value.length === 4 && value.every((n) => typeof n === 'number');
    return isCurve ? cubicBezier(value) : value.map(shown).join(', ');
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * An object as rows, one per leaf: `out.duration`, `out.easing`.
 *
 * @param prefix The path so far.
 * @param value The object or leaf.
 * @param rows Where the rows go.
 * @param status The registry status, when the value is a registry token's.
 */
function flatten(
  prefix: string,
  value: unknown,
  rows: MotionRow[],
  status?: string
): void {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(prefix ? `${prefix}.${key}` : key, child, rows, status);
    }
    return;
  }
  rows.push({ name: prefix, value: shown(value), status });
}

/**
 * The registry tokens a motion item owns: the token of that name, its
 * `pattern-*` parameters, and its own family (`snap-*`, `surface-*`).
 *
 * @param item The item's name.
 * @returns The tokens, in registry order.
 */
function registryTokens(item: string) {
  return Object.values(REGISTRY).filter(
    (t) =>
      t.name === item ||
      t.name.startsWith(`pattern-${item}`) ||
      t.name.startsWith(`${item}-`)
  );
}

/**
 * One motion item with its tokens and values, from the seam's exports and
 * carbon-motion's registry.
 *
 * @param item The name a story declares.
 * @param reduced The story's declared reduced behaviour for it.
 * @returns The entry.
 */
export function describeMotion(
  item: string,
  reduced?: ReducedBehaviour
): MotionEntry {
  const rows: MotionRow[] = [];
  if (item in SEAM_CONSTANTS) flatten('', SEAM_CONSTANTS[item], rows);
  for (const token of registryTokens(item)) {
    const leaf = token.value === null || typeof token.value !== 'object';
    if (leaf && token.css !== undefined) {
      rows.push({ name: token.name, value: token.css, status: token.status });
    } else {
      flatten(token.name, token.value, rows, token.status);
    }
  }
  return { item, reduced: reduced ?? null, rows };
}

/**
 * The report for a story.
 *
 * @param storyId The story.
 * @param params Its `parameters.v12`, if any.
 * @returns What the Motion panel shows.
 */
export function motionReport(
  storyId: string,
  params: V12Parameters | undefined
): MotionReport {
  return {
    storyId,
    declared: params !== undefined,
    entries: (params?.motion ?? []).map((item) =>
      describeMotion(item, params?.reduced?.[item])
    ),
    states: params?.states ?? [],
    reducedClock: reducedClock(true),
    floorMs: DURATION_FLOOR_MS,
  };
}
