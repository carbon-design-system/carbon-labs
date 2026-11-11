/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The Explorations panel's data: the marks `scripts/explorations.js` writes
// into `explorations.json`, keyed by story title.

import map from './explorations.json';

/** A mark's kind: `@carbon-explore` or `@carbon-proposal`. */
export type MarkKind = 'explore' | 'proposal';

/** One mark: where it is and what it says. */
export interface Mark {
  kind: MarkKind;
  /** Its file, from the repository's root. */
  file: string;
  line: number;
  /** The mark's text after `@carbon-explore` or `@carbon-proposal`. */
  text: string;
}

/** The marks of a kind, under the heading the panel gives them. */
export interface MarkGroup {
  kind: MarkKind;
  heading: string;
  marks: Mark[];
}

export type ExplorationsMap = Record<string, Mark[]>;

/** The committed map. */
const explorationsMap = map as ExplorationsMap;

const HEADINGS: Record<MarkKind, string> = {
  explore: 'Explorations',
  proposal: 'Proposals',
};

/** The folder every mark's file is under, dropped from what the panel shows. */
const COMPONENTS_DIR = 'packages/react/src/v12/components/';

/**
 * A story's marks grouped by kind, explorations first. A kind with no marks
 * is left out, so a story with none gets an empty list.
 *
 * @param title The story's title (`V12/Button`).
 * @param source The map to read.
 * @returns The groups.
 */
export function explorationsFor(
  title: string | undefined,
  source: ExplorationsMap = explorationsMap
): MarkGroup[] {
  const marks = (title && source[title]) || [];
  return (Object.keys(HEADINGS) as MarkKind[])
    .map((kind) => ({
      kind,
      heading: HEADINGS[kind],
      marks: marks.filter((mark) => mark.kind === kind),
    }))
    .filter((group) => group.marks.length > 0);
}

/**
 * Where a mark is, as the panel shows it: its file from the components
 * folder, and its line.
 *
 * @param mark The mark.
 * @returns `Button/components/button.scss:254`.
 */
export function markPlace(mark: Mark): string {
  const file = mark.file.startsWith(COMPONENTS_DIR)
    ? mark.file.slice(COMPONENTS_DIR.length)
    : mark.file;
  return `${file}:${mark.line}`;
}
