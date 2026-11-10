/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@carbon/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  openPlace,
  shutPlace,
  useDisclosureBody,
  useDisclosureMoves,
} from '../index';
import type { DisclosureMoves } from '../index';
import mdx from './Disclosure.mdx';

export default {
  title: 'V12/Disclosure',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'open',
        'shut',
        'content-arrival',
        'one-motion',
        'swap',
        'soft-edge',
        'turn',
        'place-open',
        'place-shut',
      ],
      reduced: {
        open: 'at-once',
        shut: 'at-once',
        'content-arrival': 'shorter-clock',
        'one-motion': 'at-once',
        swap: 'at-once',
        'soft-edge': 'at-once',
        turn: 'at-once',
        'place-open': 'shorter-clock',
        'place-shut': 'at-once',
      },
      states: ['shut', 'opening', 'open', 'shutting'],
    },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['multiple', 'single'],
      description:
        'The demo: `multiple` opens each section on its own; `single` keeps one open, so opening one shuts the other (a swap).',
    },
  },
};

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: 'Summary',
    body: <p>A short note: the body travels a little, on a quick step.</p>,
  },
  {
    title: 'Details',
    body: (
      <>
        <p>
          A longer body travels farther, so it takes a longer step. The content
          waits 8px above and comes down into place as the body opens.
        </p>
        <p>
          The body lands first; the content is the last thing to settle. On the
          way out the content holds still and the edge closes over it.
        </p>
      </>
    ),
  },
  {
    title: 'History',
    body: (
      <ul style={{ margin: 0, paddingInlineStart: 20 }}>
        {[
          'Created the project',
          'Added two members',
          'Renamed the project',
          'Changed the owner',
          'Archived the old plan',
          'Published the report',
          'Moved the project to a new team',
          'Turned on notifications',
        ].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    ),
  },
];

/** One section: a heading button and the body it discloses. */
function Section({
  id,
  title,
  open,
  onToggle,
  moves,
  reduced,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  moves: DisclosureMoves;
  reduced: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { bodyProps } = useDisclosureBody(ref, open, moves, reduced);
  return (
    <div style={{ borderBlockEnd: '1px solid var(--cds-border-subtle)' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        style={{
          display: 'block',
          inlineSize: '100%',
          padding: '12px 16px',
          border: 0,
          background: 'none',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'start',
          cursor: 'pointer',
        }}>
        {title}
      </button>
      <div ref={ref} id={id} className="cds-disclosure__body" {...bodyProps}>
        <div className="cds-disclosure__clip">
          <div
            className="cds-disclosure__content"
            style={{ padding: '0 16px 16px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionsProps {
  mode?: 'multiple' | 'single';
  /** Show the expand all and collapse all buttons. */
  all?: boolean;
}

/** Three sections under one root: what changes in one commit moves as one motion. */
function Sections({ mode = 'multiple', all = false }: SectionsProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const moves = useDisclosureMoves(root);
  const [open, setOpen] = useState<boolean[]>(() => SECTIONS.map(() => false));
  const toggle = (i: number) =>
    setOpen((prev) =>
      prev.map((o, j) => (j === i ? !o : mode === 'single' ? false : o))
    );
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      {all && (
        <div style={row}>
          <Button
            size="sm"
            kind="tertiary"
            onClick={() => setOpen(SECTIONS.map(() => true))}>
            Expand all
          </Button>
          <Button
            size="sm"
            kind="tertiary"
            onClick={() => setOpen(SECTIONS.map(() => false))}>
            Collapse all
          </Button>
        </div>
      )}
      <div
        ref={root}
        style={{ borderBlockStart: '1px solid var(--cds-border-subtle)' }}>
        {SECTIONS.map((s, i) => (
          <Section
            key={s.title}
            id={`disclosure-story-${mode}-${all ? 'all' : 'one'}-${i}`}
            title={s.title}
            open={open[i] ?? false}
            onToggle={() => toggle(i)}
            moves={moves}
            reduced={reduced}>
            {s.body}
          </Section>
        ))}
      </div>
    </div>
  );
}

/**
 * Each heading opens or shuts its body. The step follows the travel, so the
 * short body is quicker than the long one. Press again mid-move and it turns
 * from where it is.
 */
export const Default = {
  args: { mode: 'multiple' },
  render: (args: SectionsProps) => <Sections {...args} />,
};

/** One open at a time: opening one shuts the other, as one motion on standard-productive. */
export const Swap = {
  args: { mode: 'single' },
  render: (args: SectionsProps) => <Sections {...args} />,
};

/** Expand all and collapse all: every body is one motion, never slower than moderate-02 (220ms), shutting a step faster. */
export const ExpandAll = {
  args: { mode: 'multiple' },
  render: (args: SectionsProps) => <Sections {...args} all />,
};

/** A row's place in a list: it opens as the row arrives, and shuts as it leaves. */
export const ListPlace = {
  render: function ListPlaceStory() {
    const root = useRef<HTMLUListElement>(null);
    const reduced = usePrefersReducedMotion();
    const [rows, setRows] = useState([3, 2, 1]);
    const next = useRef(4);
    const arriving = useRef<number | null>(null);
    const leaving = useRef(new Set<number>());
    const els = useRef(new Map<number, HTMLLIElement>());

    useLayoutEffect(() => {
      const id = arriving.current;
      arriving.current = null;
      const el = id == null ? undefined : els.current.get(id);
      if (root.current && el) {
        openPlace(root.current, el, { reduced });
      }
    }, [rows, reduced]);

    const add = () => {
      const id = next.current++;
      arriving.current = id;
      setRows((r) => [id, ...r]);
    };
    const remove = () => {
      const id = [...rows].reverse().find((r) => !leaving.current.has(r));
      const el = id == null ? undefined : els.current.get(id);
      if (id == null || !el || !root.current) {
        return;
      }
      leaving.current.add(id);
      shutPlace(root.current, el, { reduced }).then(() => {
        leaving.current.delete(id);
        setRows((r) => r.filter((x) => x !== id));
      });
    };

    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
        <div style={row}>
          <Button size="sm" kind="tertiary" onClick={add}>
            Add an event
          </Button>
          <Button size="sm" kind="tertiary" onClick={remove}>
            Remove the oldest
          </Button>
        </div>
        <ul ref={root} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {rows.map((id) => (
            <li
              key={id}
              ref={(el) => {
                if (el) {
                  els.current.set(id, el);
                } else {
                  els.current.delete(id);
                }
              }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderBlockEnd: '1px solid var(--cds-border-subtle)',
                }}>
                Event {id}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  },
};
