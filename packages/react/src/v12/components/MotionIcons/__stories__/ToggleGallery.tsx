/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Toggle page's cards: every toggle (one per family), grouped by kind,
 * each at the four sizes. The card is the control: a click anywhere on it
 * (or Enter / Space) moves every size to the next state together (the icons
 * take `disableToggle` and follow the card's `value`). Dev only (stories).
 */
import React, { useMemo, useState } from 'react';
import * as Lib from '../index';
import type { ToggleIconProps } from '../types';
import type { VariantProps } from '../utils/frameIcon';
import {
  TOGGLES,
  TOGGLE_KINDS,
  type ToggleRow,
} from '../icons/gallery.registry';
import { CardGrid, Empty, IconCard, Section, matches } from './galleryKit';

// Each toggle types its own state names; a mixed list erases them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyToggle = React.ComponentType<
  ToggleIconProps<any> & VariantProps<string>
> & { states?: readonly string[] };
const LIB = Lib as unknown as Record<string, AnyToggle>;
const KIND_LABEL = Object.fromEntries(TOGGLE_KINDS) as Record<string, string>;

/** The Toggle page's groups, in order. */
export const TOGGLE_GROUPS: readonly string[] = TOGGLE_KINDS.map(
  ([, label]) => label
);

export const TOGGLE_ENTRIES = TOGGLES.map((t) => ({
  ...t,
  group: KIND_LABEL[t.kind],
  component: LIB[t.toggle],
}));
export type ToggleEntry = ToggleRow & { group: string; component: AnyToggle };

/** One toggle's card. Exported for the icon pages. */
export function ToggleCard({ entry }: { entry: ToggleEntry }) {
  const Toggle = entry.component;
  const states = Toggle.states ?? [];
  const [value, setValue] = useState<string>(entry.start ?? states[0] ?? '');
  const next = () =>
    setValue((v) => states[(states.indexOf(v) + 1) % states.length] ?? v);
  const props = {
    value,
    filled: entry.filled,
    variant: entry.variant,
    'aria-label': entry.name,
  };
  return (
    <IconCard
      name={entry.name}
      exportName={entry.toggle}
      meta={<States states={states} value={value} />}
      icon={(s) => <Toggle size={s} {...props} disableToggle />}
      onActivate={states.length ? next : undefined}
      activateLabel={`${value}, click for ${states[(states.indexOf(value) + 1) % states.length] ?? value}`}
    />
  );
}

/** The current state's name, in a box as wide as the widest state's, so the name beside it doesn't rewrap (and the icons jump) as it changes. */
function States({
  states,
  value,
}: {
  states: readonly string[];
  value: string;
}) {
  return (
    <span className="mi-states">
      {(states.includes(value) ? states : [...states, value]).map((s) => (
        <span
          key={s}
          data-current={s === value ? '' : undefined}
          aria-hidden={s === value ? undefined : true}>
          {s}
        </span>
      ))}
    </span>
  );
}

export function ToggleGallery({
  query = '',
  group = '',
}: {
  query?: string;
  group?: string;
}) {
  const shown = useMemo(
    () =>
      TOGGLE_ENTRIES.filter(
        (e) =>
          (!group || e.group === group) &&
          matches(query, e.name, e.toggle, e.group)
      ),
    [query, group]
  );
  if (!shown.length) return <Empty what="toggle icons" query={query} />;
  return (
    <>
      {TOGGLE_GROUPS.map((g) => {
        const list = shown.filter((e) => e.group === g);
        if (!list.length) return null;
        return (
          <Section
            key={g}
            title={g}
            count={list.length}
            estimate={Math.ceil(list.length / 5) * 130}>
            <CardGrid min={220} one={220}>
              {list.map((e) => (
                <ToggleCard key={e.name} entry={e} />
              ))}
            </CardGrid>
          </Section>
        );
      })}
    </>
  );
}
