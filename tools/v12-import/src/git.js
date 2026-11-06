/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Reads the source at a commit, never its working tree.

import { execFileSync } from 'node:child_process';

/**
 * Runs git in a repository and returns its output.
 *
 * @param {string} repo The repository.
 * @param {string[]} args The git arguments.
 * @returns {string} The output.
 */
function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/**
 * The full sha a ref names, or null when it names no commit.
 *
 * @param {string} repo The repository.
 * @param {string} ref The ref.
 * @returns {string | null} The sha.
 */
export function resolveRef(repo, ref) {
  try {
    return git(repo, ['rev-parse', '--verify', `${ref}^{commit}`]).trim();
  } catch {
    return null;
  }
}

/**
 * Every file under a path at a commit, as repository paths.
 *
 * @param {string} repo The repository.
 * @param {string} sha The commit.
 * @param {string} dir The path.
 * @returns {string[]} The files.
 */
export function listFiles(repo, sha, dir) {
  const out = git(repo, ['ls-tree', '-r', '--name-only', sha, '--', dir]);
  return out.split('\n').filter(Boolean);
}

/**
 * The names directly under a directory at a commit.
 *
 * @param {string} repo The repository.
 * @param {string} sha The commit.
 * @param {string} dir The directory.
 * @returns {string[]} The names, folders ending in a slash.
 */
export function listDir(repo, sha, dir) {
  const out = git(repo, ['ls-tree', sha, '--', `${dir}/`]);
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [meta, path] = line.split('\t');
      const name = path.slice(dir.length + 1);
      return meta.includes(' tree ') ? `${name}/` : name;
    });
}

/**
 * A file's content at a commit, or null when it isn't there.
 *
 * @param {string} repo The repository.
 * @param {string} sha The commit.
 * @param {string} path The file.
 * @returns {string | null} The content.
 */
export function readAt(repo, sha, path) {
  try {
    return git(repo, ['show', `${sha}:${path}`]);
  } catch {
    return null;
  }
}

/**
 * The last commit at or before a commit that changed a path.
 *
 * @param {string} repo The repository.
 * @param {string} sha The commit.
 * @param {string} path The path.
 * @returns {string | null} The commit.
 */
export function lastChange(repo, sha, path) {
  const out = git(repo, ['log', '-1', '--format=%H', sha, '--', path]).trim();
  return out || null;
}

/**
 * Moves a line number from one commit to another through the diff of a
 * file: null when the line itself changed.
 *
 * @param {string} repo The repository.
 * @param {string} a The commit the line number is from.
 * @param {string} b The commit to move it to.
 * @param {string} path The file.
 * @param {number} line The 1-based line at `a`.
 * @returns {number | null} The line at `b`.
 */
export function moveLine(repo, a, b, path, line) {
  if (a === b) {
    return line;
  }
  const out = git(repo, ['diff', '-U0', a, b, '--', path]);
  let delta = 0;
  for (const m of out.matchAll(
    /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm
  )) {
    const oldStart = Number(m[1]);
    const oldCount = m[2] === undefined ? 1 : Number(m[2]);
    const newCount = m[4] === undefined ? 1 : Number(m[4]);
    const before =
      oldCount === 0 ? oldStart < line : oldStart + oldCount - 1 < line;
    if (before) {
      delta += newCount - oldCount;
    } else if (oldCount > 0 && line >= oldStart) {
      return null;
    }
  }
  return line + delta;
}

/**
 * The files under a path at a commit whose text matches a pattern.
 *
 * @param {string} repo The repository.
 * @param {string} sha The commit.
 * @param {string} pattern An extended regular expression.
 * @param {string} dir The path.
 * @returns {string[]} The files, relative to the repository.
 */
export function grepFiles(repo, sha, pattern, dir) {
  try {
    const out = git(repo, ['grep', '-l', '-E', pattern, sha, '--', dir]);
    return out
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(sha.length + 1));
  } catch {
    // git grep exits 1 when nothing matches.
    return [];
  }
}
