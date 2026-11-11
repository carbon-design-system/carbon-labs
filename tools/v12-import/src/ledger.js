/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The departures, and their marks. An import reads the source's ledger: each
// row that names a file of the component becomes an `@carbon-explore` or
// `@carbon-proposal` mark above the line it names. The lane's own registry,
// departures.json, holds every departure as data, and its `appliesTo` places
// the marks over the whole lane: an API departure's on each declaration of
// its props, any other's above the first line that uses what it names.

import fs from 'node:fs';
import path from 'node:path';
import { COMMENT, langOf, regions } from './regions.js';
import { componentOf, isOwn, laneProgram } from './vocab.js';

/**
 * Splits a markdown table row into cells, ignoring pipes inside code spans.
 *
 * @param {string} row The row.
 * @returns {string[]} The cells.
 */
function cells(row) {
  const out = [];
  let cur = '';
  let code = false;
  for (const c of row.trim().replace(/^\||\|$/g, '')) {
    if (c === '`') {
      code = !code;
    }
    if (c === '|' && !code) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/**
 * A reader of one row's cells by the start of their column's name.
 *
 * @param {string[]} header The column names, lower case.
 * @param {string[]} row The row's cells.
 * @returns {function(string): string} The reader.
 */
function cellsBy(header, row) {
  return (name) => row[header.findIndex((h) => h.startsWith(name))] ?? '';
}

/**
 * The ledger's entries, keyed by its table's column names.
 *
 * @param {string} md The ledger.
 * @returns {{ name: string, kind: string, domain: string, what: string, ours: string, fallback: string, usedIn: string }[]} The entries.
 */
export function parseLedger(md) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => /^##\s+Entries\b/.test(l));
  if (start === -1) {
    return [];
  }
  let header = null;
  const entries = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) {
      break;
    }
    if (!line.trim().startsWith('|')) {
      continue;
    }
    const row = cells(line);
    if (!header) {
      header = row.map((h) => h.toLowerCase());
      continue;
    }
    if (row.every((c) => /^:?-+:?$/.test(c))) {
      continue;
    }
    const col = cellsBy(header, row);
    entries.push({
      name: col('name').replace(/`/g, ''),
      kind: col('kind').toLowerCase(),
      domain: col('domain').toLowerCase(),
      what: col('what'),
      ours: col('our value'),
      fallback: col('carbon fallback'),
      usedIn: col('used in'),
    });
  }
  return entries;
}

/**
 * The places a "used in" cell names: a path, and each line range when it
 * gives lines.
 *
 * @param {string} cell The cell.
 * @returns {{ path: string, lines: { start: number, end: number }[] }[]} The places.
 */
export function placesIn(cell) {
  const places = [];
  for (const raw of cell.split(/;|,\s+(?=\D)/)) {
    const item = raw
      .replace(/`/g, '')
      .replace(/\band \d+ more( files)?\b/, '')
      .trim();
    if (!item) {
      continue;
    }
    const m = /^([\w./-]+?)(?::([\d,\s-]+))?$/.exec(item);
    if (!m) {
      continue;
    }
    const lines = (m[2] ?? '')
      .split(',')
      .map((r) => r.split('-').map((n) => Number.parseInt(n, 10)))
      .filter(([a]) => Number.isFinite(a))
      .map(([a, b]) => ({ start: a, end: Number.isFinite(b) ? b : a }));
    places.push({ path: m[1], lines });
  }
  return places;
}

/**
 * The marks the ledger asks for in one component.
 *
 * @param {ReturnType<typeof parseLedger>} entries The ledger.
 * @param {string} id The component's folder name.
 * @param {string[]} files The component's files, relative to its folder.
 * @returns {{ placements: { entry: object, file: string, start: number, end: number }[], unplaced: { entry: object, place: string, reason: string }[], api: object[] }} What to mark where.
 */
export function marksFor(entries, id, files) {
  const placements = [];
  const unplaced = [];
  const api = [];
  for (const entry of entries) {
    const mine = placesIn(entry.usedIn).filter(
      (p) => p.path.split('/')[0] === id
    );
    if (!mine.length) {
      continue;
    }
    const isApi = entry.domain === 'api' && entry.kind === 'proposal';
    if (isApi) {
      api.push(entry);
    }
    for (const place of mine) {
      const rel = place.path.slice(id.length + 1);
      const file = files.find((f) => f.toLowerCase() === rel.toLowerCase());
      if (!rel || rel.endsWith('/')) {
        if (!isApi) {
          unplaced.push({
            entry,
            place: place.path,
            reason: 'names the folder, not a line',
          });
        }
      } else if (!file) {
        unplaced.push({ entry, place: place.path, reason: 'no such file' });
      } else if (!place.lines.length) {
        if (!isApi) {
          unplaced.push({
            entry,
            place: place.path,
            reason: 'names the file, not a line',
          });
        }
      } else {
        for (const range of place.lines) {
          placements.push({ entry, file, ...range });
        }
      }
    }
  }
  return { placements, unplaced, api };
}

/**
 * The mark's comment text, in the ledger's form.
 *
 * @param {object} entry The ledger entry.
 * @returns {string} The text after `// `.
 */
export function markText(entry) {
  const reason = entry.what.replace(/\.\s*$/, '');
  if (entry.kind === 'proposal') {
    const what = entry.domain === 'api' ? 'api' : 'token';
    const replaces =
      what === 'token' && entry.fallback
        ? ` replaces: ${entry.fallback.replace(/;.*$/, '').trim()}.`
        : '';
    return `@carbon-proposal ${what}: ${entry.name} — ${reason}.${replaces} TBD`;
  }
  return `@carbon-explore ${entry.name} — ${reason}. TBD`;
}

/**
 * What ties a line to an entry: the code names in its value and fallback
 * (worth two) and the longer words of its name (worth one).
 *
 * @param {object} entry The ledger entry.
 * @returns {{ text: string, weight: number }[]} The hints.
 */
function hintsFor(entry) {
  const hints = [];
  for (const m of `${entry.ours} ${entry.fallback}`.matchAll(/`([^`]+)`/g)) {
    for (const part of m[1].split(/[\s,]+/)) {
      if (part.length > 3) {
        hints.push({ text: part, weight: 2 });
      }
    }
  }
  for (const word of entry.name.split('-')) {
    if (word.length > 4) {
      hints.push({ text: word, weight: 1 });
    }
  }
  return hints;
}

const WINDOW = 6;

/**
 * Inserts marks above the lines they name. The ledger's line numbers are a
 * guide: the mark goes on the code line near the range that best matches
 * the entry, nearest the range on a tie, and is left out when nothing near
 * matches. Inserted from the bottom up so the line numbers hold.
 *
 * @param {string} src The source.
 * @param {Uint8Array} kinds The source's regions, to skip comment lines.
 * @param {{ entry: object, start: number, end: number }[]} marks The marks for this file.
 * @returns {{ text: string, placed: { name: string, line: number, stated: number }[], unplaced: { name: string, line: number, reason: string }[] }} The source and what was placed.
 */
export function applyMarks(src, kinds, marks) {
  const lines = src.split('\n');
  const offsets = [];
  let at = 0;
  for (const l of lines) {
    offsets.push(at);
    at += l.length + 1;
  }
  /**
   * Whether a line holds code that a mark can stand above.
   *
   * @param {number} n The 1-based line.
   * @returns {boolean} Whether it does.
   */
  function markable(n) {
    const text = lines[n - 1];
    if (text === undefined) {
      return false;
    }
    const bare = text.trim();
    if (!bare || /^[{}()\]]+[;,]?$/.test(bare) || /^[<{)]/.test(bare)) {
      return false;
    }
    const lead = offsets[n - 1] + text.indexOf(bare[0]);
    return kinds[lead] !== 2;
  }
  const placed = [];
  const unplaced = [];
  const chosen = [];
  for (const { entry, start, end } of marks) {
    const hints = hintsFor(entry);
    let best = null;
    for (let n = Math.max(1, start - WINDOW); n <= end + WINDOW; n += 1) {
      if (!markable(n)) {
        continue;
      }
      const score = hints.reduce(
        (sum, h) => sum + (lines[n - 1].includes(h.text) ? h.weight : 0),
        0
      );
      const distance = n < start ? start - n : n > end ? n - end : 0;
      if (
        score > 0 &&
        (!best ||
          score > best.score ||
          (score === best.score && distance < best.distance))
      ) {
        best = { n, score, distance };
      }
    }
    if (!best) {
      unplaced.push({
        name: entry.name,
        line: start,
        reason: `nothing within ${WINDOW} lines matches the entry`,
      });
    } else {
      chosen.push({ entry, line: best.n, stated: start });
    }
  }
  for (const { entry, line, stated } of chosen.sort(
    (a, b) => b.line - a.line
  )) {
    const text = markText(entry);
    if ((lines[line - 2] ?? '').includes(text)) {
      continue;
    }
    const indent = /^\s*/.exec(lines[line - 1])[0];
    lines.splice(line - 1, 0, `${indent}// ${text}`);
    placed.push({ name: entry.name, line, stated });
  }
  return { text: lines.join('\n'), placed: placed.reverse(), unplaced };
}

/** The lane's registry of departures, from the repository root. */
export const REGISTRY = 'packages/react/src/v12/departures.json';
const COMPONENTS = 'packages/react/src/v12/components';
const EXPLORATIONS = 'packages/react/src/v12/explorations/explorations.json';
const AXES = new Set([
  'color',
  'shape',
  'space',
  'type',
  'elevation',
  'api',
  'other',
]);
// The statuses whose entries are marked in source.
const MARKED = new Set(['explore', 'proposal']);
// Built output and dependencies, and tests and stories, which carry no marks.
const SKIP_SOURCE =
  /(^|\/)(node_modules|es|lib|dist|scss|storybook-static|__tests__|__stories__)(\/|$)|\.(test|stories)\.[jt]sx?$|\.d\.ts$/;
// A mark: a comment that starts with one.
const MARK =
  /^\s*(?:\/\/|\/\*|\{\s*\/\*)\s*@carbon-(proposal|explore)\s+(?:(\w+):\s*)?([\w-]+)/;

/**
 * The registry's entries.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ id: string, axis: string, status: string, what: string, replaces: string, appliesTo: { in: string, props?: string[], uses?: string[] }[] }[]} The entries, none when there is no registry.
 */
export function readRegistry(labs) {
  const file = path.join(labs, REGISTRY);
  if (!fs.existsSync(file)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')).departures ?? [];
}

/**
 * The mark a line starts, if it starts one.
 *
 * @param {string} line The line.
 * @returns {{ kind: 'proposal' | 'explore', sub: string | null, name: string } | null} The mark.
 */
export function markOn(line) {
  const m = MARK.exec(line);
  return m ? { kind: m[1], sub: m[2] ?? null, name: m[3] } : null;
}

/**
 * A registry entry's mark, after `// `.
 *
 * @param {object} entry The entry.
 * @returns {string} The mark.
 */
export function registryMarkText(entry) {
  const what = entry.what.replace(/\.\s*$/, '');
  if (entry.status !== 'proposal') {
    return `@carbon-explore ${entry.id} — ${what}. TBD`;
  }
  if (entry.axis === 'api') {
    return `@carbon-proposal api: ${entry.id} — ${what}. TBD`;
  }
  const replaces = entry.replaces
    ? ` replaces: ${entry.replaces.replace(/\.\s*$/, '')}.`
    : '';
  return `@carbon-proposal token: ${entry.id} — ${what}.${replaces} TBD`;
}

/**
 * Where a place is, from the repository root: a component folder by its
 * name, or a path.
 *
 * @param {{ in: string }} place The place.
 * @returns {string} The folder or file.
 */
export function placeRoot(place) {
  return place.in.includes('/') ? place.in : `${COMPONENTS}/${place.in}`;
}

/**
 * The source files under a folder, or the file itself, from the repository
 * root, in order.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string} root The folder or file.
 * @returns {string[]} The files.
 */
function sourcesIn(labs, root) {
  const abs = path.join(labs, root);
  if (!fs.existsSync(abs)) {
    return [];
  }
  if (fs.statSync(abs).isFile()) {
    return [root];
  }
  return fs
    .readdirSync(abs, { recursive: true })
    .map((f) => f.split(path.sep).join('/'))
    .filter(
      (f) =>
        /\.(scss|[jt]sx?)$/.test(f) &&
        !SKIP_SOURCE.test(f) &&
        fs.statSync(path.join(abs, f)).isFile()
    )
    .sort()
    .map((f) => `${root}/${f}`);
}

/**
 * Every mark in the lane: in each component folder and each v12 package's
 * sources.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ kind: string, sub: string | null, name: string, file: string, line: number }[]} The marks.
 */
export function laneMarks(labs) {
  const roots = [];
  const components = path.join(labs, COMPONENTS);
  for (const d of fs.existsSync(components)
    ? fs.readdirSync(components).sort()
    : []) {
    roots.push(`${COMPONENTS}/${d}`);
  }
  const packages = path.join(labs, 'packages');
  for (const d of fs.existsSync(packages)
    ? fs.readdirSync(packages).sort()
    : []) {
    if (d.startsWith('v12-')) {
      roots.push(`packages/${d}/src`);
    }
  }
  const out = [];
  for (const root of roots) {
    for (const file of sourcesIn(labs, root)) {
      const lines = fs.readFileSync(path.join(labs, file), 'utf8').split('\n');
      lines.forEach((l, k) => {
        const mark = markOn(l);
        if (mark) {
          out.push({ ...mark, file, line: k + 1 });
        }
      });
    }
  }
  return out;
}

/**
 * Which lines of a source start with code.
 *
 * @param {string} text The source.
 * @param {string} file Its path, for its language.
 * @returns {boolean[]} One per line.
 */
function codeLines(text, file) {
  const kinds = regions(text, langOf(file));
  let at = 0;
  return text.split('\n').map((l) => {
    const lead = l.search(/\S/);
    const code = lead >= 0 && kinds[at + lead] !== COMMENT;
    at += l.length + 1;
    return code;
  });
}

/**
 * Whether the comments right above a line hold an entry's mark.
 *
 * @param {string[]} lines The source's lines.
 * @param {number} line The line, from 1.
 * @param {string} id The entry.
 * @returns {boolean} Whether they do.
 */
function markedAbove(lines, line, id) {
  for (let k = line - 2; k >= 0; k -= 1) {
    const bare = lines[k].trim();
    if (!/^(\/\/|\/\*|\*|\{\s*\/\*)/.test(bare)) {
      return false;
    }
    if (markOn(lines[k])?.name === id) {
      return true;
    }
  }
  return false;
}

/**
 * Every prop declaration of every component a lane folder exports, once,
 * where the lane declares it.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {ReturnType<typeof laneProgram>} [lane] The program, when already made.
 * @returns {{ prop: string, file: string, line: number, start: number }[]} The declarations: the line of the prop, and of its doc comment when it has one.
 */
export function propDeclarations(labs, lane = laneProgram(labs)) {
  const { ts, program, checker, folders } = lane;
  const seen = new Map();
  for (const f of folders) {
    const sf = program.getSourceFile(f.index);
    const module = sf && checker.getSymbolAtLocation(sf);
    if (!module) {
      continue;
    }
    for (const symbol of checker.getExportsOfModule(module)) {
      const component = componentOf(ts, checker, symbol);
      for (const p of component?.props ?? []) {
        for (const decl of p.declarations ?? []) {
          if (
            !(ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) ||
            !isOwn(labs, decl)
          ) {
            continue;
          }
          const file = decl.getSourceFile();
          const rel = path
            .relative(labs, file.fileName)
            .split(path.sep)
            .join('/');
          /**
           * The line of an offset in the file.
           *
           * @param {number} pos The offset.
           * @returns {number} The line, from 1.
           */
          const at = (pos) => file.getLineAndCharacterOfPosition(pos).line + 1;
          const line = at(decl.getStart(file));
          const key = `${rel}:${line}`;
          if (!seen.has(key)) {
            seen.set(key, {
              prop: p.getName(),
              file: rel,
              line,
              start: at(decl.getStart(file, true)),
            });
          }
        }
      }
    }
  }
  return [...seen.values()];
}

/**
 * Where the registry's marks go and which are missing: one above every
 * declaration of a place's props (above its doc comment), and one above the
 * first code line that holds any of a place's `uses`, when the place has
 * none. What can't be placed is listed with why.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ entries?: object[], lane?: ReturnType<typeof laneProgram> }} [options]
 *   The entries, when not the registry's; the program, when already made.
 * @returns {{ placements: { entry: object, file: string, line: number }[], missing: { entry: object, place: string, reason: string }[] }} The plan.
 */
export function planDepartures(
  labs,
  { entries = readRegistry(labs), lane } = {}
) {
  const placements = [];
  const missing = [];
  const texts = new Map();
  /**
   * A source's lines and which start with code, read once.
   *
   * @param {string} file The file.
   * @returns {{ lines: string[], code: boolean[] }} Them.
   */
  const read = (file) => {
    if (!texts.has(file)) {
      const text = fs.readFileSync(path.join(labs, file), 'utf8');
      texts.set(file, { lines: text.split('\n'), code: codeLines(text, file) });
    }
    return texts.get(file);
  };
  let decls = null;
  for (const entry of entries) {
    if (!MARKED.has(entry.status)) {
      continue;
    }
    if (!entry.appliesTo?.length) {
      missing.push({ entry, place: REGISTRY, reason: 'it applies to nothing' });
    }
    for (const place of entry.appliesTo ?? []) {
      const root = placeRoot(place);
      const files = sourcesIn(labs, root);
      if (!files.length) {
        missing.push({ entry, place: root, reason: 'no source there' });
        continue;
      }
      if (place.props?.length) {
        decls ??= propDeclarations(labs, lane);
        const mine = decls.filter(
          (d) =>
            place.props.includes(d.prop) &&
            (d.file === root || d.file.startsWith(`${root}/`))
        );
        if (!mine.length) {
          missing.push({
            entry,
            place: root,
            reason: `no exported component declares ${place.props.join(' or ')} there`,
          });
        }
        for (const d of mine) {
          if (!markedAbove(read(d.file).lines, d.line, entry.id)) {
            placements.push({ entry, file: d.file, line: d.start });
          }
        }
      }
      if (place.uses?.length) {
        const marked = files.some((f) =>
          read(f).lines.some((l) => markOn(l)?.name === entry.id)
        );
        if (marked) {
          continue;
        }
        let found = null;
        for (const file of files) {
          const { lines, code } = read(file);
          const k = lines.findIndex(
            (l, i) => code[i] && place.uses.some((u) => l.includes(u))
          );
          if (k >= 0) {
            // In a script, above the declaration's doc comment, as a prop's.
            let at = k;
            if (
              langOf(file) === 'ts' &&
              /^\s*(\/\*\*|\*)/.test(lines[k - 1] ?? '') &&
              /\*\/\s*$/.test(lines[k - 1])
            ) {
              let j = k - 1;
              while (j > 0 && !/^\s*\/\*\*/.test(lines[j])) {
                j = /^\s*\*/.test(lines[j]) ? j - 1 : -1;
              }
              at = j >= 0 && /^\s*\/\*\*/.test(lines[j]) ? j : k;
            }
            found = { file, line: at + 1 };
            break;
          }
        }
        if (found) {
          placements.push({ entry, ...found });
        } else {
          missing.push({
            entry,
            place: root,
            reason: `no code line holds ${place.uses.map((u) => `"${u}"`).join(' or ')}`,
          });
        }
      }
    }
  }
  return { placements, missing };
}

/**
 * Writes the planned marks, each above its line at the line's indent, in the
 * registry's order where several share a line.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ entry: object, file: string, line: number }[]} placements The plan's placements.
 * @returns {string[]} The files written.
 */
export function writeDepartures(labs, placements) {
  const byFile = new Map();
  placements.forEach((p, order) => {
    byFile.set(p.file, [...(byFile.get(p.file) ?? []), { ...p, order }]);
  });
  for (const [file, marks] of byFile) {
    const abs = path.join(labs, file);
    const lines = fs.readFileSync(abs, 'utf8').split('\n');
    marks.sort((a, b) => b.line - a.line || b.order - a.order);
    for (const { entry, line } of marks) {
      const indent = /^\s*/.exec(lines[line - 1])[0];
      lines.splice(line - 1, 0, `${indent}// ${registryMarkText(entry)}`);
    }
    fs.writeFileSync(abs, lines.join('\n'));
  }
  return [...byFile.keys()];
}

/**
 * The names a component folder's own proposals record: its tokens.json's
 * tokens (their path joined with hyphens) and the `<kind>: <name>` lines of
 * its README.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string} root The folder.
 * @returns {Set<string>} The names.
 */
function proposalNames(labs, root) {
  const names = new Set();
  const dir = path.join(labs, root, 'proposals');
  const tokens = path.join(dir, 'tokens.json');
  /**
   * Adds every token under a group.
   *
   * @param {object} node The group.
   * @param {string[]} at Its path.
   */
  const walk = (node, at) => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if ('$value' in node || '$type' in node) {
      names.add(at.join('-'));
    }
    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith('$')) {
        walk(v, [...at, k]);
      }
    }
  };
  if (fs.existsSync(tokens)) {
    walk(JSON.parse(fs.readFileSync(tokens, 'utf8')), []);
  }
  const readme = path.join(dir, 'README.md');
  if (fs.existsSync(readme)) {
    for (const m of fs
      .readFileSync(readme, 'utf8')
      .matchAll(/\b(?:api|token|mixin|flag|icon):\s*([\w-]+)/g)) {
      names.add(m[1]);
    }
  }
  return names;
}

/**
 * The departure rule's findings: an entry that is not valid, a mark the
 * registry asks for that is not there, an entry with nothing to mark, a mark
 * of an entry outside its places or of the other kind, and a mark no
 * registry records. A mark is recorded by departures.json, the lane's
 * explorations.json, or its own folder's proposals.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ entries?: object[], lane?: ReturnType<typeof laneProgram> }} [options]
 *   The entries, when not the registry's; the program, when already made.
 * @returns {{ kind: string, at: string, match: string }[]} The findings.
 */
export function departureFindings(
  labs,
  { entries = readRegistry(labs), lane } = {}
) {
  const out = [];
  const ids = new Set();
  for (const e of entries) {
    const bad = [
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id ?? '') && 'id',
      ids.has(e.id) && 'a second id',
      !AXES.has(e.axis) && 'axis',
      !MARKED.has(e.status) && 'status',
      !e.what && 'what',
      !e.replaces && 'replaces',
    ].filter(Boolean);
    ids.add(e.id);
    if (bad.length) {
      out.push({
        kind: 'departure: bad entry',
        at: REGISTRY,
        match: `${e.id}: ${bad.join(', ')}`,
      });
    }
  }
  const { placements, missing } = planDepartures(labs, { entries, lane });
  for (const p of placements) {
    out.push({
      kind: 'departure: no mark',
      at: `${p.file}:${p.line}`,
      match: p.entry.id,
    });
  }
  for (const m of missing) {
    out.push({
      kind: 'departure: nothing to mark',
      at: m.place,
      match: `${m.entry.id}: ${m.reason}`,
    });
  }
  const byId = new Map(entries.map((e) => [e.id, e]));
  const shared = new Set();
  const explorations = path.join(labs, EXPLORATIONS);
  if (fs.existsSync(explorations)) {
    for (const e of JSON.parse(fs.readFileSync(explorations, 'utf8'))
      .explorations ?? []) {
      shared.add(e.name);
    }
  }
  const local = new Map();
  for (const mark of laneMarks(labs)) {
    const at = `${mark.file}:${mark.line}`;
    const entry = byId.get(mark.name);
    if (entry) {
      const roots = (entry.appliesTo ?? []).map(placeRoot);
      if (
        !roots.some((r) => mark.file === r || mark.file.startsWith(`${r}/`))
      ) {
        out.push({
          kind: 'departure: mark off its places',
          at,
          match: mark.name,
        });
      }
      if (MARKED.has(entry.status) && mark.kind !== entry.status) {
        out.push({
          kind: 'departure: mark of the other kind',
          at,
          match: `${mark.name}: ${mark.kind}, the entry's ${entry.status}`,
        });
      }
      continue;
    }
    const folder = mark.file.startsWith(`${COMPONENTS}/`)
      ? mark.file.split('/').slice(0, 6).join('/')
      : null;
    if (folder && !local.has(folder)) {
      local.set(folder, proposalNames(labs, folder));
    }
    if (!shared.has(mark.name) && !local.get(folder)?.has(mark.name)) {
      out.push({
        kind: 'departure: mark without an entry',
        at,
        match: mark.name,
      });
    }
  }
  return out;
}
