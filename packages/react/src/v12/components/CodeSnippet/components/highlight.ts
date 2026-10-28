/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** The roles a syntax colour is given to. Each one is a class and a token. */
export type CodeSnippetTokenKind =
  | 'keyword'
  | 'variable'
  | 'function'
  | 'string'
  | 'number'
  | 'comment'
  | 'punctuation'
  | 'plain';

export interface CodeSnippetToken {
  text: string;
  kind: CodeSnippetTokenKind;
}

/**
 * Turns code into tokens. Pass your own (Prism, Shiki, a language server) for
 * anything the built-in one gets wrong; return `[{ text: code, kind: 'plain' }]`
 * to show code uncoloured.
 */
export type CodeSnippetHighlighter = (
  code: string,
  language?: string
) => CodeSnippetToken[];

const keywords = new Set([
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'def',
  'default',
  'delete',
  'do',
  'elif',
  'else',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'interface',
  'let',
  'new',
  'None',
  'null',
  'of',
  'pass',
  'return',
  'static',
  'switch',
  'this',
  'throw',
  'true',
  'True',
  'False',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

// One pass, in priority order: comments, strings, numbers, words, space, and
// everything else is punctuation. A word followed by `(` is a call.
const pattern =
  /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*(?:e[+-]?\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?|(\s+)|([^\sA-Za-z0-9_$'"`])/g;

/**
 * The built-in highlighter: a lexer for the C-family and Python shapes an
 * agent writes most (comments, strings, numbers, keywords, calls). It does not
 * parse, so it never fails; it only colours less precisely than a grammar.
 *
 * @param {string} code The code.
 * @returns {CodeSnippetToken[]} Its tokens, in order, covering every character.
 */
export const highlight: CodeSnippetHighlighter = (code) => {
  const tokens: CodeSnippetToken[] = [];
  /**
   * Appends text, joining it to the last token when the kind repeats.
   *
   * @param {string} text The characters.
   * @param {CodeSnippetTokenKind} kind Their role.
   */
  const push = (text: string, kind: CodeSnippetTokenKind) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) {
      last.text += text;
    } else {
      tokens.push({ text, kind });
    }
  };
  let end = 0;
  for (const match of code.matchAll(pattern)) {
    const [whole, comment, string, number, word, call, space] = match;
    const index = match.index ?? 0;
    if (index > end) {
      push(code.slice(end, index), 'plain');
    }
    if (comment) {
      push(comment, 'comment');
    } else if (string) {
      push(string, 'string');
    } else if (number) {
      push(number, 'number');
    } else if (word) {
      if (keywords.has(word)) {
        push(word, 'keyword');
      } else {
        push(word, call ? 'function' : 'variable');
      }
      if (call) {
        push(call, 'punctuation');
      }
    } else if (space) {
      push(space, 'plain');
    } else {
      push(whole, 'punctuation');
    }
    end = index + whole.length;
  }
  if (end < code.length) {
    push(code.slice(end), 'plain');
  }
  return tokens;
};
