/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Gives each relative import in es/ its file, after tsc: `./x` is `./x.js`,
// or `./x/index.js` for a folder. Declarations too, so their types resolve
// the same way.

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'es');
const SPEC =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;

/**
 * Every file under a folder.
 *
 * @param {string} dir The folder.
 * @returns {string[]} The files.
 */
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
    );
}

/**
 * A relative specifier with its file named, or as it is when it names one.
 *
 * @param {string} file The importing file.
 * @param {string} spec The specifier.
 * @returns {string} The specifier.
 */
function named(file, spec) {
  if (/\.(js|json|css)$/.test(spec)) {
    return spec;
  }
  const at = path.resolve(path.dirname(file), spec);
  if (fs.existsSync(`${at}.js`)) {
    return `${spec}.js`;
  }
  if (fs.existsSync(path.join(at, 'index.js'))) {
    return `${spec}/index.js`;
  }
  throw new Error(`${path.relative(root, file)}: no module for ${spec}`);
}

let changed = 0;
for (const file of walk(root).filter((f) => /\.(js|d\.ts)$/.test(f))) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(SPEC, (m, lead, q, spec) => {
    const to = named(file, spec);
    return to === spec ? m : `${lead}${q}${to}${q}`;
  });
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed += 1;
  }
}
console.log(`extensions: ${changed} files`);
