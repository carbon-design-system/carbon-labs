/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The home page: its header, then every component by category, each a card
// (the card is the link) with its name,
// the first sentence of its summary and tags for what it has (motion, its
// reduced motion, accessibility notes, tests), and a search that narrows them
// by name and summary.

import React, { useState } from 'react';
import { Search } from '@carbon-labs/react-search';
import { ArrowRight } from '@carbon-labs/react-motion-icons';
import { Tag } from '@carbon-labs/react-tag';
import { firstSentence, groupsOf, hrefOf, tagsOf } from './model';
import type { Entry } from './model';
import { inline } from './markdown';
import { PageTop } from './PageTop';

export function Home({ groups }: { groups: ReturnType<typeof groupsOf> }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = (e: Entry) =>
    !q ||
    e.name.toLowerCase().includes(q) ||
    e.title.toLowerCase().includes(q) ||
    (e.text?.summary ?? '').toLowerCase().includes(q);
  const shown = groups
    .map((g) => ({ ...g, entries: g.entries.filter(matches) }))
    .filter((g) => g.entries.length);
  const count = shown.reduce((n, g) => n + g.entries.length, 0);

  return (
    <div className="v12r-page">
      <PageTop
        title="Components"
        subtitle="Every v12 component by category, each with its examples, its settings, its motion and its props. The picks in the header apply to all of them."
      />
      <div className="v12r-page__body">
        <div className="v12r-home-search">
          <Search
            id="v12r-search"
            labelText="Search components"
            placeholder="Search"
            size="md"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
          />
        </div>
        <p className="v12r-count" aria-live="polite">
          {count === 1 ? '1 component' : `${count} components`}
        </p>
        {shown.map((g) => (
          <section
            key={g.id}
            className="v12r-category"
            aria-labelledby={`v12r-cat-${g.id}`}>
            <h2 id={`v12r-cat-${g.id}`} className="v12r-category__title">
              {g.title}
            </h2>
            <p className="v12r-category__summary">{g.summary}</p>
            <ul className="v12r-cards">
              {g.entries.map((e) => (
                <li key={e.name}>
                  <Card entry={e} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Card({ entry }: { entry: Entry }) {
  const tags = tagsOf(entry.text);
  return (
    <a
      className="v12r-card"
      href={hrefOf({ page: 'component', slug: entry.slug })}>
      <span className="v12r-card__title">{entry.title}</span>
      <span className="v12r-card__summary">
        {entry.text?.summary ? inline(firstSentence(entry.text.summary)) : null}
      </span>
      <span className="v12r-card__foot">
        <span className="v12r-card__tags">
          {tags.map((t) => (
            <Tag key={t} size="sm" type="gray">
              {t}
            </Tag>
          ))}
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </a>
  );
}
