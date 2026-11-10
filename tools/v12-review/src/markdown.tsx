/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The docs pages' Markdown, as the review app draws it: paragraphs, bullet
// lists, `###` headings, tables, and inline bold, italics, code and links. A
// quote reads as its own text. Anything else stays as text.

import React, { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@carbon-labs/react-link';

/** A block of a page's text. */
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] };

/** A table row's cells: `| a | b |` → `['a', 'b']`. */
function cellsOf(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

/**
 * The blocks of a Markdown text. A list item runs on over its indented
 * lines; a blank line ends a paragraph.
 *
 * @param text the Markdown
 */
export function blocks(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let table: string[][] | null = null;
  const endPara = () => {
    if (para.length) out.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  const endList = () => {
    if (list) out.push({ kind: 'ul', items: list });
    list = null;
  };
  // The first row is the head; the `---` row under it is dropped.
  const endTable = () => {
    if (table) {
      const [head = [], ...rows] = table;
      out.push({ kind: 'table', head, rows });
    }
    table = null;
  };
  for (const raw of text.split('\n')) {
    // A quote (`> **Problem statement:** …`) is drawn as its text.
    const line = raw.trimEnd().replace(/^>\s?/, '');
    const item = /^\s*[-*]\s+(.*)$/.exec(line);
    const heading = /^#{3,6}\s+(.*)$/.exec(line);
    if (/^\s*\|.*\|\s*$/.test(line)) {
      endPara();
      endList();
      table = table ?? [];
      if (!/^[\s|:-]+$/.test(line)) table.push(cellsOf(line));
      continue;
    }
    endTable();
    if (!line.trim()) {
      endPara();
      endList();
    } else if (heading) {
      endPara();
      endList();
      out.push({ kind: 'h', text: heading[1] });
    } else if (item) {
      endPara();
      list = list ?? [];
      list.push(item[1]);
    } else if (list && /^\s+\S/.test(line)) {
      list[list.length - 1] += ` ${line.trim()}`;
    } else {
      endList();
      para.push(line.trim());
    }
  }
  endPara();
  endList();
  endTable();
  return out;
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|_[^_\s][^_]*_)/g;

/**
 * A line's inline marks: bold, code, links and italics.
 *
 * @param text the line
 */
export function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{inline(part.slice(2, -2))}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <Link
          key={i}
          inline
          href={link[2]}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {link[1]}
        </Link>
      );
    }
    if (/^_[^_]+_$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** A Markdown text, drawn. */
export function Markdown({ text }: { text: string }) {
  return <Blocks items={blocks(text)} />;
}

/** A text's blocks, drawn. */
export function Blocks({ items }: { items: Block[] }) {
  return (
    <>
      {items.map((b, i) =>
        b.kind === 'p' ? (
          <p key={i}>{inline(b.text)}</p>
        ) : b.kind === 'h' ? (
          <h4 key={i}>{inline(b.text)}</h4>
        ) : b.kind === 'table' ? (
          <div key={i} className="v12r-table-wrap">
            <table className="v12r-table">
              <thead>
                <tr>
                  {b.head.map((h, j) => (
                    <th key={j} scope="col">
                      {inline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j}>
                    {r.map((c, k) => (
                      <td key={k}>{inline(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
