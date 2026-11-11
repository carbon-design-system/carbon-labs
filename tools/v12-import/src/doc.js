/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The component doc: which sections travel, the leak scan over what travels,
// the story's motion parameters, and the MDX page.

/**
 * Splits a doc into its title, its opening text and its level-2 sections.
 *
 * @param {string} md The doc.
 * @returns {{ title: string, sections: { heading: string, body: string }[] }} The parts; the opening text is the "Summary" section.
 */
export function parseDoc(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  const sections = [];
  let cur = { heading: 'Summary', body: [] };
  let fence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      fence = !fence;
    }
    const h1 = !fence && /^#\s+(.+)$/.exec(line);
    const h2 = !fence && /^##\s+(.+)$/.exec(line);
    if (h1 && !title) {
      title = h1[1].trim();
    } else if (h2) {
      sections.push(cur);
      cur = { heading: h2[1].trim(), body: [] };
    } else {
      cur.body.push(line);
    }
  }
  sections.push(cur);
  return {
    title,
    sections: sections
      .map((s) => ({ heading: s.heading, body: s.body.join('\n').trim() }))
      .filter((s) => s.heading !== 'Summary' || s.body),
  };
}

/**
 * Sorts a doc's sections into kept and dropped.
 *
 * @param {{ heading: string, body: string }[]} sections The sections.
 * @param {{ keep: string[], drop: string[] }} rule Which headings travel.
 * @returns {{ kept: object[], dropped: { heading: string, why: string }[] }} The sorted sections.
 */
export function sortSections(sections, rule) {
  /**
   * Whether a heading starts with one of these names.
   *
   * @param {string} heading The heading.
   * @param {string[]} names The names.
   * @returns {boolean} Whether it does.
   */
  function starts(heading, names) {
    return names.some((n) => heading.toLowerCase().startsWith(n.toLowerCase()));
  }
  const kept = [];
  const dropped = [];
  for (const s of sections) {
    if (starts(s.heading, rule.drop)) {
      dropped.push({ heading: s.heading, why: 'dropped by rule' });
    } else if (starts(s.heading, rule.keep)) {
      kept.push(s);
    } else {
      dropped.push({ heading: s.heading, why: 'not in the keep list' });
    }
  }
  return { kept, dropped };
}

/**
 * Removes the opening text's sentences that point into the source repo
 * ("Page: …", "Code: …").
 *
 * @param {string} text The opening text.
 * @param {string[]} words The pointer words.
 * @returns {{ text: string, removed: string[] }} The text and the sentences removed.
 */
export function stripPointers(text, words) {
  const re = new RegExp(`^(?:${words.join('|')}):`);
  const removed = [];
  // Fenced code keeps its lines; only the prose around it is read as
  // sentences.
  const parts = text.split(/(^```[^\n]*\n[\s\S]*?^```[^\n]*$)/m);
  const out = parts.map((part, i) =>
    i % 2 ? part : sentencesWithout(part, re, removed)
  );
  return {
    text: out
      .map((p) => p.trim())
      .filter(Boolean)
      .join('\n\n'),
    removed,
  };
}

/**
 * Prose without the sentences that point into the source repo, each
 * paragraph on one line.
 *
 * @param {string} text The prose.
 * @param {RegExp} re What starts a pointer sentence.
 * @param {string[]} removed The sentences removed, added to.
 * @returns {string} The prose.
 */
function sentencesWithout(text, re, removed) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => {
    const sentences = p
      .replace(/\s*\n\s*/g, ' ')
      .split(/(?<=\.)\s+(?=[A-Z`[])/);
    const keep = sentences.filter((s) => {
      if (re.test(s.trim())) {
        removed.push(s.trim());
        return false;
      }
      return true;
    });
    return keep.join(' ').trim();
  });
  return paragraphs.filter(Boolean).join('\n\n');
}

/**
 * Turns links to other repository files into their label: they don't exist
 * in the lane.
 *
 * @param {string} text The text.
 * @returns {{ text: string, count: number }} The text and how many links went.
 */
export function flattenLinks(text) {
  let count = 0;
  const out = text.replace(
    /\[([^\]]+)\]\((?!https?:)([^)]+)\)/g,
    (m, label) => {
      count += 1;
      return label;
    }
  );
  return { text: out, count };
}

const INTERNAL_URL =
  /\b(?:[\w.-]*github\.ibm\.com|[\w.-]*\.w3[\w-]*\.ibm\.com|w3\.ibm\.com|ibm\.box\.com|[\w-]+\.slack\.com|(?:www\.)?figma\.com\/(?:file|design|proto|board)|localhost:\d+)\S*/gi;

/**
 * A script's comments, everything else blanked to spaces (line breaks kept,
 * so line numbers hold). Strings and template literals are code, not prose.
 *
 * @param {string} src The script.
 * @returns {string} The comments, in place.
 */
export function commentsOnly(src) {
  let out = '';
  let i = 0;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === '/' && next === '/') {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? src.length : end;
      out += src.slice(i, stop);
      i = stop;
    } else if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop);
      i = stop;
    } else if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) {
        j += src[j] === '\\' ? 2 : 1;
      }
      out += blank(src.slice(i, j + 1));
      i = j + 1;
    } else {
      out += c === '\n' ? '\n' : ' ';
      i += 1;
    }
  }
  return out;
}

/**
 * What in a text must not go public: names, dates, task and question ids,
 * review rounds, internal URLs and queue files. In a script (`code`), a date
 * counts only in its comments: a date in a string is data, as a date
 * picker's tests need.
 *
 * @param {string} text The text.
 * @param {string[]} names The names that never go in.
 * @param {{ code?: boolean }} [opts] Whether the text is a script.
 * @returns {{ kind: string, match: string, line: number }[]} The leaks.
 */
export function scanLeaks(text, names, { code = false } = {}) {
  const patterns = [
    ['date', /\b20\d\d-[01]\d-[0-3]\d\b/g],
    ['id', /\b(?:TASK|OQ)-\d+\b/g],
    ['round', /\bround \d+\b/gi],
    ['internal URL', INTERNAL_URL],
    [
      'process file',
      /\b(?:WORK-QUEUE|OPEN-QUESTIONS|SESSION-STATE)(?:\.md)?\b/g,
    ],
  ];
  if (names.length) {
    const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    patterns.push(['name', new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'g')]);
  }
  const leaks = [];
  const prose = code ? commentsOnly(text) : text;
  for (const [kind, re] of patterns) {
    for (const m of (kind === 'date' ? prose : text).matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length;
      leaks.push({ kind, match: m[0], line });
    }
  }
  return leaks.sort((a, b) => a.line - b.line);
}

// A design file's node id: two numbers joined by a colon, an instance's
// chained with semicolons. A contrast ratio (`4.5:1`) is not one.
const NODE_ID = /(?<![\w.:-])I?\d+:\d+(?:;\d+:\d+)*(?![\w:])/g;
const RATIO = /^\d+:1$/;
// A design file's key: a run of mixed-case letters and digits as long as a
// key, that is not a camelCase or PascalCase name.
const FILE_KEY =
  /(?<![\w-])(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[a-z])(?=[A-Za-z0-9]*[A-Z])[A-Za-z0-9]{22,26}(?![\w-])/g;
const NAME_LIKE = /^[A-Z]?[a-z]{2,}(?:[A-Z][a-z]{2,})*\d*$/;
// A link's node parameter, and the names the private id map uses.
const ID_FIELD =
  /node-id=|\b(?:fileKey|file_key|nodeId|node_id|componentKey|component_key|figma-ids\.json|VariableID|VariableCollectionId)\b/g;

/**
 * What in a design-sync file identifies a design file: node ids, file keys
 * and the id map's own field names. The sync's public files hold logical
 * keys only; ids live in a private id map. Scoped to those files: a colon
 * between numbers elsewhere is a time or a ratio.
 *
 * @param {string} text The text.
 * @returns {{ kind: string, match: string, line: number }[]} The leaks.
 */
export function scanDesignIds(text) {
  const leaks = [];
  /**
   * Records a leak.
   *
   * @param {string} kind What it is.
   * @param {RegExpMatchArray} m The match.
   */
  const add = (kind, m) =>
    leaks.push({
      kind,
      match: m[0],
      line: text.slice(0, m.index).split('\n').length,
    });
  for (const m of text.matchAll(NODE_ID)) {
    if (!RATIO.test(m[0])) {
      add('design node id', m);
    }
  }
  for (const m of text.matchAll(FILE_KEY)) {
    if (!NAME_LIKE.test(m[0])) {
      add('design file key', m);
    }
  }
  for (const m of text.matchAll(ID_FIELD)) {
    add('design id field', m);
  }
  return leaks.sort((a, b) => a.line - b.line);
}

/**
 * The rows of the first markdown table in a text.
 *
 * @param {string} text The text.
 * @returns {string[][]} The rows after the header, as cells.
 */
function tableRows(text) {
  const rows = text
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim())
    );
  return rows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));
}

/**
 * A pattern's name as a story parameter: kebab case, no code marks.
 *
 * @param {string} s The pattern's name.
 * @returns {string} The parameter name.
 */
function kebab(s) {
  return s
    .replace(/`/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * The story's `parameters.v12` as far as the doc tells it: the motion
 * patterns from the Motion table, and each one's reduced behaviour when one
 * clause of the reduced-motion text names it alone.
 *
 * @param {{ heading: string, body: string }[]} sections The doc's sections.
 * @returns {{ motion: string[], reduced: Record<string, string>, todo: string[] }} The parameters and what the doc doesn't settle.
 */
export function motionParams(sections) {
  const todo = [];
  const motionSection = sections.find((s) => /^motion$/i.test(s.heading));
  const reducedSection = sections.find((s) =>
    /^reduced motion$/i.test(s.heading)
  );
  const motion = [];
  let reducedText = reducedSection ? reducedSection.body : '';
  if (motionSection) {
    for (const row of tableRows(motionSection.body)) {
      if (/^reduced motion$/i.test(row[0].replace(/`/g, ''))) {
        reducedText = reducedText || row[row.length - 1];
      } else if (row[0]) {
        motion.push(kebab(row[0]));
      }
    }
  } else {
    todo.push('motion: the doc has no Motion section');
  }
  const reduced = {};
  if (!reducedText) {
    todo.push('reduced: the doc states no reduced-motion behaviour');
  }
  const clauses = reducedText
    .split(/[;.]\s*/)
    .map((c) => c.toLowerCase())
    .filter(Boolean);
  for (const pattern of motion) {
    const words = pattern.split('-').filter((w) => w.length > 2 && w !== 'and');
    const naming = clauses.filter((c) => words.some((w) => c.includes(w)));
    const kinds = new Set(
      naming
        .map((c) => {
          if (/at once/.test(c)) {
            return 'at-once';
          }
          if (/shorter/.test(c)) {
            return 'shorter-clock';
          }
          return null;
        })
        .filter(Boolean)
    );
    if (naming.length === 1 && kinds.size === 1) {
      reduced[pattern] = [...kinds][0];
    } else if (reducedText) {
      todo.push(`reduced: ${pattern}`);
    }
  }
  todo.push('states: the doc does not list them');
  return { motion, reduced, todo };
}

/**
 * Escapes text for MDX outside code: braces and angle brackets.
 *
 * @param {string} text The markdown.
 * @returns {string} The MDX-safe markdown.
 */
export function escapeMdx(text) {
  let fence = false;
  return text
    .split('\n')
    .map((line) => {
      if (/^```/.test(line)) {
        fence = !fence;
        return line;
      }
      if (fence) {
        return line;
      }
      return line
        .split(/(`[^`]*`)/)
        .map((part) =>
          part.startsWith('`')
            ? part
            : part.replace(/[{}]/g, (c) => `\\${c}`).replace(/</g, '&lt;')
        )
        .join('');
    })
    .join('\n');
}
