/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Hover page's cards: every icon, grouped into Carbon's sets, each at the
 * four sizes. Pointing at or tabbing to a card is the interaction: every size
 * plays its hover together. Paired icons show once: an outline ⇄ filled pair
 * by its outline icon, an on ⇄ off pair by its off icon (the other end is on
 * the Toggle page). Dev only (stories).
 */
import React, { useMemo } from 'react';
import * as Lib from '../index';
import type { AnimatedIconProps } from '../types';
import { HOVER_ICONS, ICON_SETS, TOGGLES } from '../icons/gallery.registry';
import { CardGrid, Empty, IconCard, Section, matches } from './galleryKit';

const LIB = Lib as unknown as Record<
  string,
  React.ComponentType<AnimatedIconProps>
>;

// The end of each pair the gallery folds away: the filled end of an
// outline ⇄ filled toggle, the on end of an on ⇄ off toggle (filled drawings included).
const FOLDED = new Set(
  TOGGLES.filter((t) => t.kind === 'fill' || t.kind === 'off').map((t) =>
    t.kind === 'fill' ? t.ends[1] : t.ends[0]
  )
);
export const HOVER_ENTRIES = HOVER_ICONS.filter(
  ([, , key]) => !FOLDED.has(key)
).map(([name, group, key]) => ({ name, group, key, component: LIB[key] }));
type Entry = (typeof HOVER_ENTRIES)[number];

/** The Hover page's groups: Carbon's sets. */
export const HOVER_GROUPS: readonly string[] = ICON_SETS;

/** One icon's hover card. Exported for the icon pages. */
export function HoverCard({
  entry,
}: {
  entry: {
    name: string;
    key: string;
    component: React.ComponentType<AnimatedIconProps>;
  };
}) {
  const Icon = entry.component;
  return (
    <IconCard
      name={entry.name}
      exportName={entry.key}
      icon={(s) => <Icon size={s} />}
    />
  );
}

export function HoverGallery({
  query = '',
  group = '',
}: {
  query?: string;
  group?: string;
}) {
  const shown = useMemo(
    () =>
      HOVER_ENTRIES.filter(
        (e) =>
          (!group || e.group === group) &&
          matches(query, e.name, e.key, e.group)
      ),
    [query, group]
  );
  if (!shown.length) return <Empty what="icons" query={query} />;
  return (
    <>
      {HOVER_GROUPS.map((g) => {
        const list = shown.filter((e: Entry) => e.group === g);
        if (!list.length) return null;
        return (
          <Section
            key={g}
            title={g}
            count={list.length}
            estimate={Math.ceil(list.length / 5) * 110}>
            <CardGrid min={200} one={148}>
              {list.map((e) => (
                <HoverCard key={e.key} entry={e} />
              ))}
            </CardGrid>
          </Section>
        );
      })}
    </>
  );
}
