/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Writes the Explorations panel's map: every `@carbon-explore` and
// `@carbon-proposal` mark in the v12 components' sources, and every line of a
// component's `proposals/README.md`, keyed by the component's story title
// (`V12/<Name>`). The panel runs in the browser and cannot read the sources,
// so it reads this map. `--check` writes nothing and exits 1 when the
// committed map is out of date.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// A path string, not `new URL()`: under the tests' jsdom, `URL` is jsdom's.
const SELF = fileURLToPath(import.meta.url);
const HERE = dirname(SELF);

/** The repository's root. */
export const ROOT = resolve(HERE, '../../..');

/** Where the components are, from the root. */
export const COMPONENTS = 'packages/react/src/v12/components';

/** Where the map is written. */
export const MAP_PATH = resolve(HERE, '../src/explorations.json');

const SOURCE = /\.(scss|css|ts|tsx|js|jsx)$/;
// Skipped at any depth.
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', '__tests__']);
// A component's build output, at its folder's top level: copies of its sources.
const BUILD = new Set(['es', 'lib', 'scss']);
const MARK = /@carbon-(explore|proposal)\s+(.+)$/;
const TITLE = /title:\s*['"`](V12\/[^'"`]+)['"`]/g;

/**
 * Every file under a folder, skipping build output and tests.
 *
 * @param {string} dir The folder.
 * @param {boolean} [top] Whether it is a component's folder.
 * @returns {string[]} The files' absolute paths, sorted.
 */
function walk(dir, top = false) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );
  for (const entry of entries) {
    if (SKIP.has(entry.name)) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (top && BUILD.has(entry.name)) {
        continue;
      }
      out.push(...walk(path));
    } else if (entry.isFile()) {
      out.push(path);
    }
  }
  return out;
}

/**
 * The marks in one source file's text.
 *
 * @param {string} text The file's text.
 * @param {string} file Its path from the root.
 * @returns {{ kind: 'explore' | 'proposal', file: string, line: number, text: string }[]} The marks.
 */
export function marksIn(text, file) {
  const marks = [];
  text.split('\n').forEach((source, i) => {
    const match = MARK.exec(source);
    if (match) {
      const body = match[2].replace(/\s*\*\/\s*$/, '').trim();
      marks.push({ kind: match[1], file, line: i + 1, text: body });
    }
  });
  return marks;
}

/**
 * The proposals in a component's `proposals/README.md`: one per list item,
 * with an item's wrapped lines joined. The line is the item's first.
 *
 * @param {string} text The README's text.
 * @param {string} file Its path from the root.
 * @returns {{ kind: 'proposal', file: string, line: number, text: string }[]} The proposals.
 */
export function proposalsIn(text, file) {
  /** @type {{ kind: 'proposal', file: string, line: number, text: string }[]} */
  const marks = [];
  /** @type {{ kind: 'proposal', file: string, line: number, text: string } | null} */
  let open = null;
  text.split('\n').forEach((source, i) => {
    const item = /^[-*]\s+(.+)$/.exec(source);
    if (item) {
      open = { kind: 'proposal', file, line: i + 1, text: item[1].trim() };
      marks.push(open);
    } else if (open && /^\s+\S/.test(source)) {
      open.text = `${open.text} ${source.trim()}`;
    } else {
      open = null;
    }
  });
  return marks;
}

/**
 * Scans the components and builds the map: each story title that has a mark,
 * sorted, to its marks in file and line order. A folder with marks and no
 * `V12/` story title is keyed `V12/<folder>`.
 *
 * @param {string} [root] The repository's root.
 * @returns {Record<string, { kind: 'explore' | 'proposal', file: string, line: number, text: string }[]>} The map.
 */
export function buildMap(root = ROOT) {
  const base = join(root, COMPONENTS);
  /** @type {Record<string, { kind: 'explore' | 'proposal', file: string, line: number, text: string }[]>} */
  const map = {};
  const folders = readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const folder of folders) {
    const files = walk(join(base, folder), true);
    const marks = [];
    const titles = new Set();
    for (const path of files) {
      const file = relative(root, path).split(sep).join('/');
      const inFolder = relative(join(base, folder), path).split(sep);
      if (inFolder[0] === '__stories__') {
        if (/\.stories\./.test(path)) {
          for (const match of readFileSync(path, 'utf8').matchAll(TITLE)) {
            titles.add(match[1]);
          }
        }
      } else if (inFolder[0] === 'proposals' && inFolder[1] === 'README.md') {
        marks.push(...proposalsIn(readFileSync(path, 'utf8'), file));
      } else if (SOURCE.test(path)) {
        marks.push(...marksIn(readFileSync(path, 'utf8'), file));
      }
    }
    if (marks.length === 0) {
      continue;
    }
    const keys = titles.size > 0 ? [...titles].sort() : [`V12/${folder}`];
    for (const key of keys) {
      map[key] = marks;
    }
  }
  return Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );
}

/**
 * The map as the file holds it.
 *
 * @param {ReturnType<typeof buildMap>} map The map.
 * @returns {string} The JSON, with a final newline.
 */
export function serialize(map) {
  return `${JSON.stringify(map, null, 2)}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const next = serialize(buildMap());
  if (process.argv.includes('--check')) {
    const current = readFileSync(MAP_PATH, 'utf8');
    if (current !== next) {
      console.error(
        'src/explorations.json is out of date. Run `yarn workspace @carbon-labs/v12-workbench explorations`.'
      );
      process.exit(1);
    }
  } else {
    writeFileSync(MAP_PATH, next);
    console.log(`Wrote ${relative(ROOT, MAP_PATH)}.`);
  }
}
