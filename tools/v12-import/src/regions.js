/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Which characters of a source are code, string or comment. A scanner, not a
// parser: regular expression literals and JSX text are read as code.

export const CODE = 0;
export const STRING = 1;
export const COMMENT = 2;

/**
 * The language a file is read as.
 *
 * @param {string} path The file.
 * @returns {'ts' | 'scss' | 'other'} The language.
 */
export function langOf(path) {
  if (/\.(m?[jt]sx?)$/.test(path)) {
    return 'ts';
  }
  if (/\.s?css$/.test(path)) {
    return 'scss';
  }
  return 'other';
}

/**
 * Marks each character of a source as code, string or comment.
 *
 * @param {string} src The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @returns {Uint8Array} One kind per character.
 */
export function regions(src, lang) {
  const kind = new Uint8Array(src.length);
  if (lang === 'other') {
    return kind;
  }
  // Template literals nest: each entry is the brace depth at which a `${`
  // opened, so its closing brace returns to the template.
  const templates = [];
  let depth = 0;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      kind.fill(COMMENT, i, stop);
      i = stop;
    } else if (
      c === '/' &&
      next === '/' &&
      !(lang === 'scss' && src[i - 1] === ':')
    ) {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? src.length : end;
      kind.fill(COMMENT, i, stop);
      i = stop;
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') {
        j += src[j] === '\\' ? 2 : 1;
      }
      kind.fill(STRING, i, j + 1);
      i = j + 1;
    } else if (c === '`' && lang === 'ts') {
      i = scanTemplate(src, i + 1, kind);
      if (src[i - 2] === '$' && src[i - 1] === '{') {
        templates.push(depth);
        depth += 1;
      }
    } else if (c === '{') {
      depth += 1;
      i += 1;
    } else if (c === '}') {
      depth -= 1;
      if (templates.length && templates[templates.length - 1] === depth) {
        templates.pop();
        kind[i] = STRING;
        i = scanTemplate(src, i + 1, kind);
        if (src[i - 2] === '$' && src[i - 1] === '{') {
          templates.push(depth);
          depth += 1;
        }
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  return kind;
}

/**
 * Marks a template literal's text as string up to its end or its next `${`.
 *
 * @param {string} src The source.
 * @param {number} start Just after the backtick or the closing brace.
 * @param {Uint8Array} kind The marks.
 * @returns {number} Just after the closing backtick or the `${`.
 */
function scanTemplate(src, start, kind) {
  let j = start;
  while (j < src.length) {
    if (src[j] === '\\') {
      j += 2;
    } else if (src[j] === '`') {
      kind.fill(STRING, start - 1, j + 1);
      return j + 1;
    } else if (src[j] === '$' && src[j + 1] === '{') {
      kind.fill(STRING, start - 1, j + 2);
      return j + 2;
    } else {
      j += 1;
    }
  }
  kind.fill(STRING, start - 1, src.length);
  return src.length;
}

/**
 * The source with its comments blanked, line breaks kept.
 *
 * @param {string} src The source.
 * @param {Uint8Array} kind The marks from `regions`.
 * @returns {string} The source without comments.
 */
export function withoutComments(src, kind) {
  let out = '';
  for (let i = 0; i < src.length; i += 1) {
    out += kind[i] === COMMENT && src[i] !== '\n' ? ' ' : src[i];
  }
  return out;
}

/**
 * The 1-based line of an offset.
 *
 * @param {string} src The source.
 * @param {number} index The offset.
 * @returns {number} The line.
 */
export function lineOf(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i += 1) {
    if (src[i] === '\n') {
      line += 1;
    }
  }
  return line;
}
