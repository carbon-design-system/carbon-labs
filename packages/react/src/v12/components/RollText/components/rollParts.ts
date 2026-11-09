/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * Which parts of a text stay still when it changes (RollText): on a small
 * word change (change → changes) only the new characters roll in or out.
 *
 * An inflection keeps what it shares; a conceptual change rolls the whole
 * text (Disagree → Agree, or a negation: 1 item selected → 1 item not
 * selected), as opposed to pluralizing a word.
 *
 *   words    the texts are compared word by word (a word, a number, or one
 *            other character: a space, a "%")
 *   keeps    part of the text stays still only when every change is one of:
 *            - an inflection: a word gains or loses an ending, the rest
 *              matching exactly, case included (change → changes, item →
 *              items, start → started, Low → Lower): the stem stays, the
 *              ending rolls in or out
 *            - a number: 1 → 2, 9 → 10. Its digits stay by place only when
 *              the two have as many (12 → 13 and 10 → 20 keep the 1 and the
 *              0); otherwise the number rolls whole (9 → 10)
 *            - words only added or removed, none swapped: the words shared
 *              at the start and the end stay (exactly, case included)
 *   rolls    anything else is a conceptual change, and the whole text rolls:
 *   whole    - a negation added or removed: not, no, never, none, without,
 *              cannot, or an n't (1 item selected → 1 item not selected,
 *              can → can't, is → isn't)
 *            - any other word swapped: a prefix (Selected → Unselected,
 *              Disagree → Agree, do → undo), an antonym or any other word
 *              (on → off, Low → High, Start now → Stop now), a change of
 *              case (Agree → agree), another ending (started → starting).
 *              So antonyms and prefixes need no list, and a word is never
 *              split where it reads oddly
 *   enough   at least half of the longer text stays still, or the whole text
 *            rolls: a change that is mostly new is a new value, and reads as
 *            one
 * ========================================================================== */

/** A part of the changed text: one that stays (`still`), or one that changes `from` → `to` (either may be empty). */
export type RollPart = { still: string } | { from: string; to: string };

const WORDS = /\p{L}+|\p{N}+|[^\p{L}\p{N}]/gu;
const NUMBER = /^\p{N}+$/u;
const LETTERS = /^\p{L}+$/u;
/** A negation: one of a few words, or an n't. */
const NEGATION =
  /(?<!\p{L})(?:not|no|never|none|without|cannot)(?!\p{L})|n['’]t(?!\p{L})/giu;

/** The parts of `a` → `b`: the still ones, and the ones that change. A conceptual change is one part that changes. */
export function rollParts(a: string, b: string): RollPart[] {
  const whole = [{ from: a, to: b }];
  if (negations(a) !== negations(b)) {
    return whole;
  }
  const x = a.match(WORDS) ?? [];
  const y = b.match(WORDS) ?? [];
  let parts: RollPart[] = [];
  if (x.length === y.length) {
    for (let i = 0; i < x.length; i++) {
      const word = wordParts(x[i], y[i]);
      if (!word) {
        return whole;
      }
      parts.push(...word);
    }
  } else {
    let start = 0;
    while (start < x.length && start < y.length && x[start] === y[start]) {
      start++;
    }
    let end = 0;
    while (
      end < x.length - start &&
      end < y.length - start &&
      x[x.length - 1 - end] === y[y.length - 1 - end]
    ) {
      end++;
    }
    const from = x.slice(start, x.length - end).join('');
    const to = y.slice(start, y.length - end).join('');
    // Words swapped, not only added or removed.
    if (from && to) {
      return whole;
    }
    parts = [
      { still: x.slice(0, start).join('') },
      { from, to },
      { still: x.slice(x.length - end).join('') },
    ];
  }
  parts = tidy(parts);
  const still = parts.reduce(
    (n, p) => n + ('still' in p ? p.still.length : 0),
    0
  );
  return still * 2 >= Math.max(a.length, b.length) && still > 0 ? parts : whole;
}

/** The text's negations, in order, in lower case. */
function negations(s: string) {
  return (s.match(NEGATION) ?? []).join(' ').toLowerCase().replace(/’/g, "'");
}

/** One word meeting another: still if it's the same, its stem and ending, or a number by place; null for a conceptual change. */
function wordParts(x: string, y: string): RollPart[] | null {
  if (x === y) {
    return [{ still: x }];
  }
  const numbers = NUMBER.test(x) && NUMBER.test(y);
  if (numbers && x.length !== y.length) {
    return [{ from: x, to: y }];
  }
  if (!numbers && !isInflected(x, y)) {
    return null;
  }
  const n = Math.min(x.length, y.length);
  let start = 0;
  while (start < n && x[start] === y[start]) {
    start++;
  }
  let end = 0;
  while (end < n - start && x[x.length - 1 - end] === y[y.length - 1 - end]) {
    end++;
  }
  return [
    { still: x.slice(0, start) },
    {
      from: x.slice(start, x.length - end),
      to: y.slice(start, y.length - end),
    },
    { still: x.slice(x.length - end) },
  ];
}

/** One word is the other plus an ending, exactly, case included (an inflection): items, started. */
function isInflected(x: string, y: string) {
  if (!LETTERS.test(x) || !LETTERS.test(y)) {
    return false;
  }
  const [short, long] = x.length < y.length ? [x, y] : [y, x];
  return long.startsWith(short);
}

/** Drops empty parts and joins neighbours of a kind. */
function tidy(parts: RollPart[]): RollPart[] {
  const out: RollPart[] = [];
  for (const p of parts) {
    if ('still' in p ? !p.still : !p.from && !p.to) {
      continue;
    }
    const last = out[out.length - 1];
    if (last && 'still' in last && 'still' in p) {
      last.still += p.still;
    } else if (last && 'from' in last && 'from' in p) {
      last.from += p.from;
      last.to += p.to;
    } else {
      out.push({ ...p });
    }
  }
  return out;
}
