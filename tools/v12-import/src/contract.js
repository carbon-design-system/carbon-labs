/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The motion contract, docs/v12/motion-contract.md: every export of the seam
// (@carbon-labs/v12-motion), where it comes from and which v12 folders and
// tools use it, directly or through a lane package that re-exports it, with
// the token statuses carbon-motion's package ships.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SEAM = 'packages/v12-motion';
const SEAM_NAME = '@carbon-labs/v12-motion';
const COMPONENTS = 'packages/react/src/v12/components';
const TOOLS = 'tools';
const TOKENS = 'node_modules/@carbon-labs/motion-core/generated/tokens.js';
export const CONTRACT = 'docs/v12/motion-contract.md';

/**
 * A name's kind, read from how the seam exports it and how it is spelled.
 *
 * @param {string} name The exported name.
 * @param {{ type: boolean, namespace: boolean }} how How it is exported.
 * @returns {string} The kind.
 */
function kindOf(name, how) {
  if (how.namespace) {
    return 'namespace';
  }
  if (how.type) {
    return 'type';
  }
  if (/^use[A-Z]/.test(name)) {
    return 'hook';
  }
  if (/^[A-Z][A-Z0-9_]+$/.test(name)) {
    return 'constant';
  }
  if (/^[A-Z]/.test(name)) {
    return 'component';
  }
  return /Tokens$|^tokens$/.test(name) ? 'tokens' : 'function';
}

/**
 * Every export of a seam source file, in order.
 *
 * @param {string} text The file's source.
 * @param {string} entry The seam entry point the file is.
 * @returns {{ name: string, kind: string, from: string, entry: string }[]} The exports.
 */
export function seamExports(text, entry) {
  const out = [];
  const re =
    /export\s+(type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'|export\s+\*\s+as\s+(\w+)\s+from\s*'([^']+)'|export\s+\*\s+from\s*'([^']+)'/g;
  for (const m of text.matchAll(re)) {
    if (m[2] !== undefined) {
      for (const part of m[2].split(',')) {
        const spec = part.replace(/\/\/.*$/gm, '').trim();
        if (!spec) {
          continue;
        }
        const type = Boolean(m[1]) || /^type\s/.test(spec);
        const name = spec
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)
          .pop();
        out.push({ name, kind: kindOf(name, { type }), from: m[3], entry });
      }
    } else if (m[4]) {
      out.push({ name: m[4], kind: 'namespace', from: m[5], entry });
    } else {
      out.push({ name: '*', kind: 'module', from: m[6], entry });
    }
  }
  return out;
}

/**
 * Where the scan reads: every v12 component folder, as its folder name, and
 * every tool, as `tools/<name>`; each with its package name.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ user: string, dir: string, pkg: string | null }[]} The places.
 */
function placesOf(labs) {
  const places = [];
  for (const [base, label] of [
    [COMPONENTS, (d) => d],
    [TOOLS, (d) => `${TOOLS}/${d}`],
  ]) {
    const root = path.join(labs, base);
    for (const d of fs.existsSync(root) ? fs.readdirSync(root).sort() : []) {
      const dir = path.join(root, d);
      if (!fs.statSync(dir).isDirectory()) {
        continue;
      }
      const pkg = path.join(dir, 'package.json');
      places.push({
        user: label(d),
        dir,
        pkg: fs.existsSync(pkg)
          ? JSON.parse(fs.readFileSync(pkg, 'utf8')).name
          : null,
      });
    }
  }
  return places;
}

/**
 * The names in an import or export list, as `[imported, local]` pairs.
 *
 * @param {string} list The text between the braces.
 * @returns {[string, string][]} The pairs.
 */
const namesIn = (list) =>
  list
    .split(',')
    .map((part) =>
      part
        .replace(/\/\/.*$/gm, '')
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
    )
    .filter(([name]) => name)
    .map(([name, local]) => [name, local ?? name]);

/**
 * The v12 folders and tools that use each seam name, and those that use its
 * Sass. A folder that re-exports a seam name uses it, and so does every
 * folder or tool that imports that name from the folder's package.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ names: Map<string, Set<string>>, sass: Set<string>, entries: Map<string, Set<string>> }} The users.
 */
export function usersOf(labs) {
  const names = new Map();
  const entries = new Map();
  const sass = new Set();
  /**
   * Adds a user to a name's set.
   *
   * @param {Map<string, Set<string>>} map The names.
   * @param {string} key The name.
   * @param {string} user The folder or tool.
   * @returns {Map<string, Set<string>>} The names.
   */
  const add = (map, key, user) =>
    map.set(key, (map.get(key) ?? new Set()).add(user));
  // Seam names a lane package passes on, by package: exported name to seam name.
  const passed = new Map();
  // Names each place takes from a lane package.
  const taken = [];
  const lists =
    /\b(import|export)\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/g;
  const whole = /\bexport\s+\*\s+from\s*'(@carbon-labs\/v12-motion\/[\w-]+)'/g;
  for (const { user, dir, pkg } of placesOf(labs)) {
    for (const e of fs.readdirSync(dir, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (
        !e.isFile() ||
        !/\.(tsx?|scss)$/.test(e.name) ||
        /(^|[\\/])(node_modules|es|lib)([\\/]|$)/.test(
          path.relative(dir, e.parentPath)
        )
      ) {
        continue;
      }
      const text = fs.readFileSync(path.join(e.parentPath, e.name), 'utf8');
      if (e.name.endsWith('.scss')) {
        if (text.includes(`'${SEAM_NAME}/scss`)) {
          sass.add(user);
        }
        continue;
      }
      for (const [, verb, list, spec] of text.matchAll(lists)) {
        if (spec === SEAM_NAME) {
          for (const [name, local] of namesIn(list)) {
            add(names, name, user);
            if (verb === 'export' && pkg) {
              (passed.get(pkg) ?? passed.set(pkg, new Map()).get(pkg)).set(
                local,
                name
              );
            }
          }
        } else if (spec.startsWith(`${SEAM_NAME}/`)) {
          add(entries, spec, user);
        } else if (!spec.startsWith('.')) {
          taken.push({ user, from: spec, names: namesIn(list) });
        }
      }
      for (const [, spec] of text.matchAll(whole)) {
        add(entries, spec, user);
      }
    }
  }
  for (const { user, from, names: list } of taken) {
    for (const [name] of list) {
      const seamName = passed.get(from)?.get(name);
      if (seamName) {
        add(names, seamName, user);
      }
    }
  }
  return { names, sass, entries };
}

/**
 * The folders in a set, sorted, or a note that there are none.
 *
 * @param {Set<string> | undefined} set The folders.
 * @returns {string} The list.
 */
const list = (set) =>
  set && set.size ? [...set].sort().join(', ') : 'none yet';

/**
 * The contract's text.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {Promise<string>} The Markdown.
 */
async function buildContract(labs) {
  const seam = path.join(labs, SEAM, 'src');
  const exports = [
    ...seamExports(
      fs.readFileSync(path.join(seam, 'index.ts'), 'utf8'),
      SEAM_NAME
    ),
    ...seamExports(
      fs.readFileSync(path.join(seam, 'selection.ts'), 'utf8'),
      `${SEAM_NAME}/selection`
    ),
  ];
  const { names, sass, entries } = usersOf(labs);
  const { tokens } = await import(pathToFileURL(path.join(labs, TOKENS)).href);
  const byStatus = {};
  for (const t of Object.values(tokens)) {
    (byStatus[t.status] ??= []).push(t.name);
  }
  const version = JSON.parse(
    fs.readFileSync(
      path.join(labs, 'node_modules/@carbon-labs/motion-core/package.json'),
      'utf8'
    )
  ).version;

  const rows = exports.map((e) => {
    const name = e.name === '*' ? '(every export)' : `\`${e.name}\``;
    const where = e.entry === SEAM_NAME ? '' : ` (\`${e.entry}\`)`;
    const used =
      e.entry === SEAM_NAME ? names.get(e.name) : entries.get(e.entry);
    return `| ${name}${where} | ${e.kind} | \`${e.from}\` | ${list(used)} |`;
  });
  const statuses = ['promoted', 'approved', 'exploring']
    .filter((s) => byStatus[s])
    .map(
      (s) =>
        `- \`${s}\` (${byStatus[s].length}): ${byStatus[s]
          .sort()
          .map((n) => `\`${n}\``)
          .join(', ')}`
    );

  const text = `<!-- Generated by tools/v12-import (yarn workspace @carbon-labs/v12-import contract). Do not edit. -->

# The v12 motion contract

v12 components take their motion from \`${SEAM_NAME}\` only. It re-exports
carbon-motion's published packages, \`@carbon-labs/motion-core\` and
\`@carbon-labs/motion-react\` (${version}), item by item, so the seam's exports
are the whole of the motion a v12 component may use.

## What a motion item allows

| Motion item | Allowed in a component at |
|---|---|
| \`exploring\`, public | carbon-labs \`draft\` |
| \`approved\`, public | carbon-labs \`preview\` |
| \`promoted\` | anywhere; the seam reads it from \`@carbon/motion\` |

Every module carbon-motion publishes is \`exploring\` today, so every v12
component stays at \`labs.status: draft\`. Each token carries its own status:

${statuses.join('\n')}

## Reduced motion

Each component declares its reduced-motion behavior in its stories (a shorter
clock, or at once), and the workbench's Motion panel shows it. The page's
level comes from \`data-motion-level\` (\`full\`, \`reduced\`, \`none\`), which the
seam's \`tokens.css\` reads.

## The exports

| Export | Kind | From | Used by |
|---|---|---|---|
${rows.join('\n')}

The Sass module (\`${SEAM_NAME}/scss\`) keeps Carbon's \`$duration-*\` names and
\`motion()\` at carbon-motion's values. Used by: ${list(sass)}.
`;
  // As the repository's Prettier lays it out, so the format check passes.
  const prettier = await import('prettier');
  const filepath = path.join(labs, CONTRACT);
  const options = (await prettier.resolveConfig(filepath)) ?? {};
  return prettier.format(text, { ...options, filepath });
}

/**
 * Writes the contract, or with `check` says whether the committed one is current.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ check?: boolean }} [options] Options.
 * @returns {Promise<boolean>} Whether the file is current (always true when writing).
 */
export async function writeContract(labs, { check = false } = {}) {
  const file = path.join(labs, CONTRACT);
  const text = await buildContract(labs);
  if (check) {
    return fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return true;
}
