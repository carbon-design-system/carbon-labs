/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Action page's cards: the icons with an action (the pilot five, batch 1,
 * and Bee), each at
 * the four sizes with its timing and what it acts out, and the same three
 * controls: Trigger, loop (off or on: on loops until it's turned off, then
 * hands off), and then (the status it hands off to, on the icons that take
 * one). Dev only (stories).
 */
import React, { useMemo, useRef, useState } from 'react';
import {
  Add,
  Bee,
  Copy,
  Download,
  Earth,
  EarthFilled,
  Email,
  Launch,
  Notification,
  PiggyBankSlot,
  Printer,
  Redo,
  Renew,
  Restart,
  Rocket,
  Save,
  Send,
  Share,
  TrashCan,
  Undo,
  Upload,
  VolumeDown,
  VolumeDownFilled,
  VolumeUp,
  VolumeUpFilled,
} from '../index';
import type { MotionIconHandle } from '../types';
import {
  CardGrid,
  Empty,
  IconCard,
  Section,
  displayName,
  matches,
} from './galleryKit';
import { Field, GhostButton, Switcher } from './statusControls';

type ActionIcon = React.ComponentType<Record<string, unknown>> & {
  action?: {
    description: string;
    duration: number;
    cycle?: number;
    loops?: false;
  };
  status?: { statuses: readonly string[] };
};
const PILOT: [string, ActionIcon][] = [
  ['Copy', Copy as unknown as ActionIcon],
  ['Send', Send as unknown as ActionIcon],
  ['TrashCan', TrashCan as unknown as ActionIcon],
  ['Notification', Notification as unknown as ActionIcon],
  ['Renew', Renew as unknown as ActionIcon],
];
/** Batch 1 (branch icons/actions-batch1): frequently used icons with a clear verb. */
const BATCH1: [string, ActionIcon][] = (
  [
    ['Download', Download],
    ['Upload', Upload],
    ['Save', Save],
    ['Share', Share],
    ['Add', Add],
    ['Launch', Launch],
    ['Undo', Undo],
    ['Redo', Redo],
    ['Restart', Restart],
    ['Printer', Printer],
    ['Email', Email],
    ['Rocket', Rocket],
    ['PiggyBankSlot', PiggyBankSlot],
    ['Earth', Earth],
    ['EarthFilled', EarthFilled],
    ['VolumeUp', VolumeUp],
    ['VolumeUpFilled', VolumeUpFilled],
    ['VolumeDown', VolumeDown],
    ['VolumeDownFilled', VolumeDownFilled],
  ] as const
).map(([n, I]) => [n, I as unknown as ActionIcon]);
/** Brand: Bee (from its motion reference). */
const BRAND: [string, ActionIcon][] = [['Bee', Bee as unknown as ActionIcon]];
export const ACTION_ICONS: [string, ActionIcon][] = [
  ...PILOT,
  ...BATCH1,
  ...BRAND,
];

/** The Action page's groups. */
export const ACTION_GROUPS = ['Essentials', 'More actions', 'Brand'] as const;

/** How long a hand-off status shows. */
const HANDOFF_MS = 1500;
const ms = (s: number) => `${Math.round(s * 1000)}ms`;

/** One action icon's card. Exported for the icon pages. */
export function ActionCard({ name, Icon }: { name: string; Icon: ActionIcon }) {
  const refs = useRef<(MotionIconHandle | null)[]>([]);
  const [looping, setLooping] = useState(false);
  // The statuses it can hand off to (pending is a process, not a result).
  const statuses = Icon.status?.statuses ?? [];
  const [then, setThen] = useState<string | undefined>(undefined);
  const handoff = then ? { status: then, for: HANDOFF_MS } : undefined;
  const act = Icon.action;
  const label = displayName(name);
  return (
    <IconCard
      name={label}
      exportName={name}
      meta={
        act &&
        `${ms(act.duration)}${act.cycle ? `, loop ${ms(act.cycle)} a pass` : ''}`
      }
      icon={(s, i) => (
        <Icon
          size={s}
          ref={(h: MotionIconHandle | null) => {
            refs.current[i] = h;
          }}
          loop={looping}
          actionThen={handoff}
          aria-label={label}
        />
      )}
      description={act?.description}
      controls={
        <>
          <GhostButton
            onClick={() =>
              refs.current.forEach(
                (h) => void h?.trigger(handoff ? { then: handoff } : undefined)
              )
            }>
            Trigger
          </GhostButton>
          {act?.loops !== false && (
            <Field label="loop">
              <Switcher
                options={
                  [
                    [false, 'off'],
                    [true, 'on'],
                  ] as const
                }
                value={looping}
                onChange={setLooping}
              />
            </Field>
          )}
          {statuses.length > 0 && (
            <Field label="then">
              <Switcher
                options={[
                  [undefined, 'none'],
                  ...statuses
                    .filter((s) => s !== 'pending')
                    .map((s) => [s, s] as const),
                ]}
                value={then}
                onChange={setThen}
              />
            </Field>
          )}
        </>
      }
    />
  );
}

export function ActionGallery({
  query = '',
  group = '',
}: {
  query?: string;
  group?: string;
}) {
  const filter = (icons: [string, ActionIcon][], g: string) =>
    icons.filter(
      ([n]) => (!group || group === g) && matches(query, n, displayName(n))
    );
  const [pilot, batch1, brand] = useMemo(
    () => [
      filter(PILOT, 'Essentials'),
      filter(BATCH1, 'More actions'),
      filter(BRAND, 'Brand'),
    ],
    [query, group]
  ); // eslint-disable-line react-hooks/exhaustive-deps
  if (!pilot.length && !batch1.length && !brand.length)
    return <Empty what="action icons" query={query} />;
  return (
    <>
      {pilot.length > 0 && (
        <Section
          title="Essentials"
          count={pilot.length}
          note="Copy, send, delete, notify and sync: the actions most products need first."
          estimate={600}>
          <CardGrid min={340} one={300}>
            {pilot.map(([n, I]) => (
              <ActionCard key={n} name={n} Icon={I} />
            ))}
          </CardGrid>
        </Section>
      )}
      {batch1.length > 0 && (
        <Section
          title="More actions"
          count={batch1.length}
          note="Common commands that confirm what just happened."
          estimate={1400}>
          <CardGrid min={340} one={300}>
            {batch1.map(([n, I]) => (
              <ActionCard key={n} name={n} Icon={I} />
            ))}
          </CardGrid>
        </Section>
      )}
      {brand.length > 0 && (
        <Section
          title="Brand"
          count={brand.length}
          note="For fun: Bee buzzes."
          estimate={200}>
          <CardGrid min={340} one={300}>
            {brand.map(([n, I]) => (
              <ActionCard key={n} name={n} Icon={I} />
            ))}
          </CardGrid>
        </Section>
      )}
    </>
  );
}
