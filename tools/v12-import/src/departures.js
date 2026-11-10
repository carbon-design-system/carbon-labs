/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The departures, and their marks. The lane's registry, departures.json,
// holds every departure as data, and its `appliesTo` places an
// `@carbon-explore` or `@carbon-proposal` mark over the whole lane: an API
// departure's on each declaration of its props, any other's above the first
// line that uses what it names. An import places the marks of the folder it
// brings in from the same registry.

import fs from 'node:fs';
import path from 'node:path';
import { COMMENT, langOf, regions } from './regions.js';
import { componentOf, isOwn, laneProgram } from './vocab.js';

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
 * The line a mark goes above for a declaration on a line: in a script, above
 * the declaration's doc comment when it has one.
 *
 * @param {string[]} lines The source's lines.
 * @param {number} k The declaration's 0-based line.
 * @param {string} file Its path, for its language.
 * @returns {number} The 1-based line the mark goes above.
 */
function markAt(lines, k, file) {
  if (
    langOf(file) === 'ts' &&
    /^\s*(\/\*\*|\*)/.test(lines[k - 1] ?? '') &&
    /\*\/\s*$/.test(lines[k - 1])
  ) {
    let j = k - 1;
    while (j > 0 && !/^\s*\/\*\*/.test(lines[j])) {
      j = /^\s*\*/.test(lines[j]) ? j - 1 : -1;
    }
    if (j >= 0 && /^\s*\/\*\*/.test(lines[j])) {
      return j + 1;
    }
  }
  return k + 1;
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
            found = { file, line: markAt(lines, k, file) };
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
 * The marks of the registry's entries that apply to one component folder,
 * for sources about to be written: an entry's props are found by their
 * declaration (a line that starts with the name), its `uses` as in
 * `planDepartures`. What can't be placed is listed with why.
 *
 * @param {{ file: string, text: string }[]} sources The component's source files, relative to its folder.
 * @param {object[]} entries The registry's entries.
 * @param {string} folder The component's folder name in the lane.
 * @returns {{ placements: { entry: object, file: string, line: number }[], missing: { entry: object, place: string, reason: string }[] }} The plan.
 */
export function importPlacements(sources, entries, folder) {
  const placements = [];
  const missing = [];
  const read = sources
    .filter((s) => /\.(scss|[jt]sx?)$/.test(s.file))
    .map((s) => {
      const lines = s.text.split('\n');
      return { file: s.file, lines, code: codeLines(s.text, s.file) };
    });
  for (const entry of entries) {
    if (!MARKED.has(entry.status)) {
      continue;
    }
    for (const place of (entry.appliesTo ?? []).filter(
      (p) => p.in === folder
    )) {
      for (const prop of place.props ?? []) {
        const decl = new RegExp(`^\\s*(?:readonly\\s+)?${prop}\\??\\s*:`);
        let found = false;
        for (const { file, lines, code } of read) {
          if (langOf(file) !== 'ts') {
            continue;
          }
          lines.forEach((l, k) => {
            if (code[k] && decl.test(l)) {
              found = true;
              placements.push({ entry, file, line: markAt(lines, k, file) });
            }
          });
        }
        if (!found) {
          missing.push({
            entry,
            place: folder,
            reason: `no declaration of ${prop}`,
          });
        }
      }
      if (place.uses?.length) {
        let found = null;
        for (const { file, lines, code } of read) {
          const k = lines.findIndex(
            (l, i) => code[i] && place.uses.some((u) => l.includes(u))
          );
          if (k >= 0) {
            found = { file, line: markAt(lines, k, file) };
            break;
          }
        }
        if (found) {
          placements.push({ entry, ...found });
        } else {
          missing.push({
            entry,
            place: folder,
            reason: `no code line holds ${place.uses.map((u) => `"${u}"`).join(' or ')}`,
          });
        }
      }
    }
  }
  return { placements, missing };
}

/**
 * Inserts marks above their lines, at the line's indent, from the bottom up
 * so the line numbers hold.
 *
 * @param {string} text The source.
 * @param {{ entry: object, line: number }[]} marks The marks for this file.
 * @returns {string} The source with the marks in.
 */
export function insertMarks(text, marks) {
  const lines = text.split('\n');
  const ordered = marks.map((m, order) => ({ ...m, order }));
  ordered.sort((a, b) => b.line - a.line || b.order - a.order);
  for (const { entry, line } of ordered) {
    const indent = /^\s*/.exec(lines[line - 1])[0];
    lines.splice(line - 1, 0, `${indent}// ${registryMarkText(entry)}`);
  }
  return lines.join('\n');
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
  for (const p of placements) {
    byFile.set(p.file, [...(byFile.get(p.file) ?? []), p]);
  }
  for (const [file, marks] of byFile) {
    const abs = path.join(labs, file);
    fs.writeFileSync(abs, insertMarks(fs.readFileSync(abs, 'utf8'), marks));
  }
  return [...byFile.keys()];
}

/**
 * The departure rule's findings: an entry that is not valid, a mark the
 * registry asks for that is not there, an entry with nothing to mark, a mark
 * of an entry outside its places or of the other kind, and a mark no
 * registry records, and an exploration of explorations.json with no mark.
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
  const marks = laneMarks(labs);
  for (const mark of marks) {
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
    out.push({
      kind: 'departure: mark without an entry',
      at,
      match: mark.name,
    });
  }
  // An exploration's value is tried in some style: some mark must say so.
  const explorations = path.join(labs, EXPLORATIONS);
  if (fs.existsSync(explorations)) {
    const marked = new Set(marks.map((m) => m.name));
    for (const e of JSON.parse(fs.readFileSync(explorations, 'utf8'))
      .explorations ?? []) {
      if (!marked.has(e.name)) {
        out.push({
          kind: 'departure: exploration without a mark',
          at: EXPLORATIONS,
          match: e.name,
        });
      }
    }
  }
  return out;
}
