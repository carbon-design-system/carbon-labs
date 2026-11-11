/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The colours a browser mixes: every `color-mix()` in a row's styles, with
// the selector and property it sets and the state that implies. A design
// file cannot evaluate `color-mix()`, so it needs the resolved colour per
// state and theme. Resolving it needs the cascade (custom properties,
// `currentColor`, the theme), which only a browser render has: each value
// is a placeholder, `{ pending: 'browser-render' }`, until a render writes
// `figma-sync/state-colors.resolved.json`. The snapshot takes a resolved
// value from there only while the expression it was rendered from is
// unchanged; otherwise it is pending again and marked stale.

import fs from 'node:fs';
import path from 'node:path';
import { SOURCES, THEME_MODES } from './config.js';

// A component's build output, at its folder's top level, and what is not
// the component's own styles.
const SKIP_TOP = new Set([
  'es',
  'lib',
  'scss',
  'node_modules',
  '__stories__',
  '__tests__',
]);

const STATES = [
  ['press', /press|active/],
  ['hover', /hover/],
  ['disabled', /disabled/],
  ['focus', /focus/],
  ['selected', /selected|checked|current/],
  ['rest', /\brest\b|-rest\b/],
];

/** The placeholder for a value no render has resolved yet. */
export const PENDING = Object.freeze({ pending: 'browser-render' });

/**
 * The state a declaration styles, from its property, else its selector.
 *
 * @param {string} property The property.
 * @param {string[]} selectors The selectors round it, outermost first.
 * @returns {string | null} The state, or null when nothing says.
 */
export function stateOf(property, selectors) {
  for (const [state, re] of STATES) {
    if (re.test(property)) {
      return state;
    }
  }
  for (const selector of [...selectors].reverse()) {
    for (const [state, re] of STATES) {
      if (re.test(selector)) {
        return state;
      }
    }
  }
  return null;
}

/**
 * The declarations in a stylesheet whose value mixes a colour.
 *
 * @param {string} text The SCSS.
 * @returns {{ selectors: string[], property: string, expression: string, line: number }[]} The declarations.
 */
export function colorMixesIn(text) {
  const out = [];
  const stack = [];
  let buf = '';
  let start = -1;
  let line = 1;
  /**
   * Ends a statement: records it when it mixes a colour.
   */
  const flush = () => {
    const statement = buf.replace(/\s+/g, ' ').trim();
    if (statement.includes('color-mix(')) {
      const include = /^@include\s+([\w.-]+)/.exec(statement);
      const decl = /^([\w$#{}().-]+)\s*:\s*([\s\S]+)$/.exec(statement);
      if (include || decl) {
        out.push({
          selectors: [...stack],
          property: include ? `@include ${include[1]}` : decl[1],
          expression: include
            ? statement.slice(include[0].length).trim()
            : decl[2].replace(/\s*!default$/, ''),
          line: start,
        });
      }
    }
    buf = '';
    start = -1;
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      i = end === -1 ? text.length : end;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      line += (text.slice(i, stop).match(/\n/g) ?? []).length;
      i = stop;
      continue;
    }
    if (c === '\n') {
      line += 1;
      buf += ' ';
      i += 1;
      continue;
    }
    if (start === -1 && /\S/.test(c)) {
      start = line;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) {
        j += text[j] === '\\' ? 2 : 1;
      }
      buf += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === '#' && next === '{') {
      // Interpolation: part of the text, not a block.
      let depth = 0;
      let j = i + 1;
      for (; j < text.length; j += 1) {
        if (text[j] === '{') {
          depth += 1;
        } else if (text[j] === '}') {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
      }
      buf += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === '{') {
      stack.push(buf.replace(/\s+/g, ' ').trim());
      buf = '';
      start = -1;
    } else if (c === '}') {
      flush();
      stack.pop();
    } else if (c === ';') {
      flush();
    } else {
      buf += c;
    }
    i += 1;
  }
  return out;
}

/**
 * The stylesheets of a manifest row.
 *
 * @param {string} root The repository's root.
 * @param {string} rel The row's path.
 * @returns {string[]} The files, from the root, sorted.
 */
function stylesheetsOf(root, rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    return [];
  }
  if (fs.statSync(abs).isFile()) {
    return /\.scss$/.test(rel) ? [rel] : [];
  }
  const out = [];
  /**
   * Collects the stylesheets under a folder.
   *
   * @param {string} dir The folder, from the root.
   * @param {boolean} top Whether it is the row's own folder.
   */
  const visit = (dir, top) => {
    const entries = fs
      .readdirSync(path.join(root, dir), { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of entries) {
      if ((top && SKIP_TOP.has(e.name)) || e.name === 'node_modules') {
        continue;
      }
      const child = `${dir}/${e.name}`;
      if (e.isDirectory()) {
        visit(child, false);
      } else if (/\.scss$/.test(e.name)) {
        out.push(child);
      }
    }
  };
  visit(rel, true);
  return out;
}

/**
 * The resolved values a browser render wrote, if any.
 *
 * @param {string} root The repository's root.
 * @returns {Map<string, { expression: string, values: Record<string, object> }>} By entry key.
 */
export function readResolved(root) {
  const file = path.join(root, SOURCES.resolvedStateColors);
  const out = new Map();
  if (!fs.existsSync(file)) {
    return out;
  }
  const { entries = [] } = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const e of entries) {
    out.set(entryKey(e.row, e), {
      expression: e.expression,
      values: e.values ?? {},
    });
  }
  return out;
}

/**
 * The key an entry is matched by between the snapshot and a render.
 *
 * @param {string} row The manifest row's id.
 * @param {{ file: string, selector: string, property: string, occurrence?: number }} e The entry.
 * @returns {string} The key.
 */
export function entryKey(row, e) {
  return [row, e.file, e.selector, e.property, e.occurrence ?? 1].join(
    '\u0000'
  );
}

/**
 * A row's mixed colours, each with a value per theme: resolved by a render,
 * or the placeholder.
 *
 * @param {string} root The repository's root.
 * @param {{ id: string, path?: string }} row The manifest row.
 * @param {Map<string, object>} resolved What a render resolved.
 * @returns {object[]} The entries.
 */
export function stateColorsOf(root, row, resolved) {
  if (!row.path) {
    return [];
  }
  const out = [];
  for (const file of stylesheetsOf(root, row.path)) {
    const seen = new Map();
    for (const d of colorMixesIn(
      fs.readFileSync(path.join(root, file), 'utf8')
    )) {
      const selector = d.selectors.join(' ');
      const id = `${selector}\u0000${d.property}`;
      const occurrence = (seen.get(id) ?? 0) + 1;
      seen.set(id, occurrence);
      const spaces = [
        ...new Set(
          [...d.expression.matchAll(/color-mix\(\s*in\s+([\w-]+)/g)].map(
            (m) => m[1]
          )
        ),
      ];
      const entry = {
        file,
        selector,
        property: d.property,
        ...(occurrence > 1 ? { occurrence } : {}),
        state: stateOf(d.property, d.selectors),
        spaces,
        expression: d.expression,
      };
      const known = resolved.get(entryKey(row.id, entry));
      const fresh = known && known.expression === entry.expression;
      entry.values = Object.fromEntries(
        THEME_MODES.map((mode) => [
          mode,
          fresh && known.values[mode]
            ? known.values[mode]
            : known && !fresh
              ? { ...PENDING, stale: true }
              : PENDING,
        ])
      );
      out.push(entry);
    }
  }
  return out;
}
