/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The text rewrites: import specifiers, the class prefix and the license
// header.

import { CODE, COMMENT, STRING, regions } from './regions.js';

const TS_IMPORT =
  /\b(import|export)(\s+type)?\s+(\{[^}]*\}|\*\s*as\s+[\w$]+|\*|[\w$]+(?:\s*,\s*(?:\{[^}]*\}|\*\s*as\s+[\w$]+))?)\s*from\s*(['"])([^'"\n]+)\4/g;
const TS_SIDE = /\bimport\s*(['"])([^'"\n]+)\1/g;
const TS_DYNAMIC = /\bimport\s*\(\s*(['"])([^'"\n]+)\1\s*\)/g;
const SCSS_IMPORT = /@(use|forward|import)\s+(['"])([^'"\n]+)\2/g;
// A file read beside the module (`new URL('./a.ts', import.meta.url)`): its
// path moves with the files, as an import's does.
const TS_URL =
  /\bnew\s+URL\s*\(\s*(['"])(\.{1,2}\/[^'"\n]+)\1\s*,\s*import\.meta\.url\s*\)/g;

/**
 * Escapes every character a regular expression treats specially, the
 * backslash among them, so a name matches as it is written.
 *
 * @param {string} text Text to match literally.
 * @returns {string} The text, safe inside a pattern.
 */
export function escapeRegExp(text) {
  return text.replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&');
}

/**
 * Every import in a source: its specifier, where the specifier sits and the
 * names it takes.
 *
 * @param {string} src The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @returns {{ spec: string, start: number, end: number, names: string[], typeOnly: boolean, form: string, wildcard?: boolean }[]} The imports, `wildcard` on an `export * from`.
 */
export function parseImports(src, lang) {
  const kind = regions(src, lang);
  const found = [];
  /**
   * Adds an import whose specifier ends at the match's quote.
   *
   * @param {RegExpExecArray} m The match.
   * @param {string} spec The specifier.
   * @param {string[]} names The names taken.
   * @param {boolean} typeOnly Whether it takes types only.
   * @param {string} form The kind of import.
   * @param {boolean} [wildcard] Whether it is an `export * from`.
   */
  function add(m, spec, names, typeOnly, form, wildcard = false) {
    if (kind[m.index] !== CODE) {
      return;
    }
    const start = m.index + m[0].lastIndexOf(spec);
    if (found.some((f) => f.start === start)) {
      return;
    }
    found.push({
      spec,
      start,
      end: start + spec.length,
      names,
      typeOnly,
      form,
      ...(wildcard ? { wildcard } : {}),
    });
  }
  if (lang === 'ts') {
    for (const m of src.matchAll(TS_IMPORT)) {
      add(
        m,
        m[5],
        namesOf(m[3]),
        Boolean(m[2]),
        m[1],
        m[1] === 'export' && m[3].trim() === '*'
      );
    }
    for (const m of src.matchAll(TS_DYNAMIC)) {
      add(m, m[2], ['*'], false, 'dynamic');
    }
    for (const m of src.matchAll(TS_SIDE)) {
      add(m, m[2], [], false, 'side-effect');
    }
    for (const m of src.matchAll(TS_URL)) {
      add(m, m[2], [], false, 'url');
    }
  } else if (lang === 'scss') {
    for (const m of src.matchAll(SCSS_IMPORT)) {
      add(m, m[3], [], false, m[1]);
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

/**
 * The names an import clause takes: `default`, `*`, or each named binding.
 *
 * @param {string} clause The clause between `import` and `from`.
 * @returns {string[]} The names.
 */
function namesOf(clause) {
  const names = [];
  const braces = /\{([^}]*)\}/.exec(clause);
  const head = clause.replace(/\{[^}]*\}/, '').trim();
  if (/^\*/.test(head) || /,\s*\*/.test(head)) {
    names.push('*');
  }
  const def = /^([\w$]+)/.exec(head);
  if (def) {
    names.push('default');
  }
  if (braces) {
    for (const part of braces[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim();
      if (name) {
        names.push(name);
      }
    }
  }
  return names;
}

/**
 * Replaces each import's specifier.
 *
 * @param {string} src The source.
 * @param {{ start: number, end: number, to?: string }[]} imports The imports, each with its new specifier.
 * @returns {string} The source.
 */
export function replaceSpecifiers(src, imports) {
  let out = src;
  for (const imp of [...imports].sort((a, b) => b.start - a.start)) {
    if (imp.to !== undefined && imp.to !== imp.spec) {
      out = out.slice(0, imp.start) + imp.to + out.slice(imp.end);
    }
  }
  return out;
}

/**
 * Rewrites the class prefix, counting each kind of rewrite: the prefix
 * variable, selectors, custom properties, data attributes, dataset keys,
 * class strings, comments and the rest.
 *
 * @param {string} src The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @param {{ from: string, to: string }} prefix The prefixes.
 * @returns {{ text: string, counts: Record<string, number> }} The source and the counts.
 */
export function rewritePrefix(src, lang, prefix) {
  const { from, to } = prefix;
  const counts = {};
  /**
   * Counts one rewrite.
   *
   * @param {string} k The kind.
   */
  function count(k) {
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const kind = regions(src, lang);
  const variable = new RegExp(
    `(\\$[\\w-]*prefix\\s*:\\s*)(['"]?)${from}\\2(?![\\w-])`,
    'g'
  );
  const dataset = new RegExp(`(\\bdataset\\s*\\.\\s*)${from}(?=[A-Z])`, 'g');
  const token = new RegExp(`(?<![\\w$-])(\\.|--|data-)?${from}-`, 'g');
  const edits = [];
  for (const m of src.matchAll(variable)) {
    edits.push({
      at: m.index + m[1].length + m[2].length,
      kind: 'prefix variable',
    });
  }
  if (lang === 'ts') {
    for (const m of src.matchAll(dataset)) {
      edits.push({ at: m.index + m[1].length, kind: 'dataset key' });
    }
  }
  for (const m of src.matchAll(token)) {
    const lead = m[1] ?? '';
    const where = kind[m.index];
    let k;
    if (where === COMMENT) {
      k = 'comment';
    } else if (lead === '.' || src[m.index - 1] === '.') {
      k = 'selector';
    } else if (lead === '--') {
      k = 'custom property';
    } else if (lead === 'data-') {
      k = 'data attribute';
    } else if (where === STRING || lang === 'other') {
      k = lang === 'other' ? 'doc text' : 'class string';
    } else {
      k = 'other';
    }
    edits.push({ at: m.index + lead.length, kind: k });
  }
  let out = src;
  for (const e of edits.sort((a, b) => b.at - a.at)) {
    out = out.slice(0, e.at) + to + out.slice(e.at + from.length);
    count(e.kind);
  }
  return { text: out, counts };
}

const HEADER = /^\s*(?:\/\*[\s\S]*?\*\/|(?:\/\/[^\n]*\n)+)/;
const LICENSED = /Copyright IBM Corp\.\s*(\d{4})/;

/**
 * Gives a source carbon-labs' license header, keeping its first year.
 *
 * @param {string} src The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @param {number} year The current year.
 * @returns {{ text: string, action: 'replaced' | 'added' | 'kept' | 'none' }} The source and what changed.
 */
export function licenseHeader(src, lang, year) {
  if (lang === 'other') {
    return { text: src, action: 'none' };
  }
  const head = HEADER.exec(src);
  const owned = head && LICENSED.exec(head[0]);
  const first = owned ? Number(owned[1]) : year;
  const years = first < year ? `${first}, ${year}` : `${year}`;
  const lines = [
    `Copyright IBM Corp. ${years}`,
    '',
    'This source code is licensed under the Apache-2.0 license found in the',
    'LICENSE file in the root directory of this source tree.',
  ];
  const header =
    lang === 'scss'
      ? `//\n${lines.map((l) => `// ${l}`.trimEnd()).join('\n')}\n//\n`
      : `/**\n${lines.map((l) => ` * ${l}`.trimEnd()).join('\n')}\n */\n`;
  if (owned) {
    const rest = src.slice(head[0].length).replace(/^\n*/, '');
    const text = `${header}\n${rest}`;
    return { text, action: text === src ? 'kept' : 'replaced' };
  }
  return { text: `${header}\n${src.replace(/^\n*/, '')}`, action: 'added' };
}

// A duration other than zero, or a curve.
const MOTION_VALUE =
  /(?<![\w.$-])(?!0*\.?0+m?s\b)\d*\.?\d+m?s\b|cubic-bezier\(/;

/**
 * A CSS value with its spacing made one: none around commas and parens, one
 * space elsewhere.
 *
 * @param {string} v The value.
 * @returns {string} The value, spaced as one.
 */
function cssValue(v) {
  return v
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .trim();
}

/**
 * The seam's token values, from carbon-motion's token CSS: each
 * `--cds-motion-*` property with the one value every rule gives it. A
 * property given two values (by a mode or a media query) has none here.
 *
 * @param {string | null} css The token CSS.
 * @returns {Map<string, string>} The values, by property.
 */
export function tokenValues(css) {
  const all = new Map();
  for (const m of (css ?? '').matchAll(
    /(--cds-motion-[\w-]+)\s*:\s*([^;]+);/g
  )) {
    const value = cssValue(m[2]);
    all.set(m[1], (all.get(m[1]) ?? new Set()).add(value));
  }
  const values = new Map();
  for (const [name, set] of all) {
    if (set.size === 1) {
      values.set(name, [...set][0]);
    }
  }
  return values;
}

/**
 * Drops each `var(--cds-motion-*, <fallback>)` fallback that is a duration
 * or an easing written out (what the literal check refuses) and equals the
 * token's own value: the page has the token (the seam's token layer), so the
 * fallback only repeats it. A fallback that differs stays, for the literal
 * check to find; other fallbacks (a distance, a zero) stay as they are.
 *
 * @param {string} src The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @param {Map<string, string>} tokens The token values.
 * @returns {{ text: string, dropped: number }} The source and how many it dropped.
 */
export function dropTokenFallbacks(src, lang, tokens) {
  if (!tokens.size || lang === 'other') {
    return { text: src, dropped: 0 };
  }
  const kind = regions(src, lang);
  const edits = [];
  for (const m of src.matchAll(/var\(\s*(--cds-motion-[\w-]+)\s*,/g)) {
    const value = tokens.get(m[1]);
    if (value === undefined || kind[m.index] === COMMENT) {
      continue;
    }
    // The fallback runs to the paren that closes this var().
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < src.length && depth; i += 1) {
      if (src[i] === '(') {
        depth += 1;
      } else if (src[i] === ')') {
        depth -= 1;
      }
    }
    if (depth) {
      continue;
    }
    const fallback = cssValue(src.slice(m.index + m[0].length, i - 1));
    // One inside another's dropped fallback goes with it.
    const last = edits[edits.length - 1];
    if (
      fallback === value &&
      MOTION_VALUE.test(fallback) &&
      !(last && m.index < last.end)
    ) {
      edits.push({ start: m.index, end: i, to: `var(${m[1]})` });
    }
  }
  let out = src;
  for (const e of edits.reverse()) {
    out = out.slice(0, e.start) + e.to + out.slice(e.end);
  }
  return { text: out, dropped: edits.length };
}
