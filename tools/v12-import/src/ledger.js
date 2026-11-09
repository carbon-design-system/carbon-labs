/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The departures ledger: each row that names a file of the component becomes
// an `@carbon-explore` or `@carbon-proposal` mark above the line it names.

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
