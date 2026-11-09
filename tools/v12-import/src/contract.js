/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The motion contract, docs/v12/motion-contract.md: every export of the seam
// (@carbon-labs/v12-motion), where it comes from and which v12 folders use
// it, with the token statuses carbon-motion's package ships.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SEAM = 'packages/v12-motion';
const SEAM_NAME = '@carbon-labs/v12-motion';
const COMPONENTS = 'packages/react/src/v12/components';
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
 * The v12 folders that import each seam name, and those that use its Sass.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ names: Map<string, Set<string>>, sass: Set<string>, entries: Map<string, Set<string>> }} The users.
 */
function usersOf(labs) {
  const names = new Map();
  const entries = new Map();
  const sass = new Set();
  const root = path.join(labs, COMPONENTS);
  for (const folder of fs.readdirSync(root)) {
    const dir = path.join(root, folder);
    if (!fs.statSync(dir).isDirectory()) {
      continue;
    }
    for (const e of fs.readdirSync(dir, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (!e.isFile() || e.parentPath.includes('node_modules')) {
        continue;
      }
      const file = path.join(e.parentPath, e.name);
      const text = /\.(tsx?|scss)$/.test(e.name)
        ? fs.readFileSync(file, 'utf8')
        : '';
      if (e.name.endsWith('.scss')) {
        if (text.includes(`'${SEAM_NAME}/scss`)) {
          sass.add(folder);
        }
        continue;
      }
      const imports =
        /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'(@carbon-labs\/v12-motion(?:\/[\w-]+)?)'/g;
      for (const m of text.matchAll(imports)) {
        if (m[3] !== SEAM_NAME) {
          const at = entries.get(m[3]) ?? new Set();
          entries.set(m[3], at.add(folder));
          continue;
        }
        for (const part of m[2].split(',')) {
          const name = part
            .trim()
            .replace(/^type\s+/, '')
            .split(/\s+as\s+/)[0];
          if (name) {
            const at = names.get(name) ?? new Set();
            names.set(name, at.add(folder));
          }
        }
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
export async function buildContract(labs) {
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
