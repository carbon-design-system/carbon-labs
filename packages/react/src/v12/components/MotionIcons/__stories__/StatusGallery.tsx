/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Status page's cards: the status-capable icons, each at the four sizes
 * with the shared status controls (statusControls.tsx): status chips on the
 * process icons; the notification chip and the count controls on the
 * notification icons (numbers show at 32 only; smaller, the count is the
 * pip); and StatusPip, a count on its own. Dev only (stories), not part of
 * the package's exports.
 */
import React, { useMemo, useState } from 'react';
import { StatusPip } from '../index';
import {
  CHECKMARK_ICONS,
  NOTIFICATION_ICONS,
  PROCESS_ICONS,
  STATUS_ALIASES,
  STATUS_ICONS,
} from '../icons/statusIcons';
import {
  CountControls,
  PipChip,
  StatusChips,
  ToneChips,
  type ToneChoice,
} from './statusControls';
import {
  CardGrid,
  Empty,
  IconCard,
  Section,
  displayName,
  matches,
} from './galleryKit';
import type { CountPlacement, ProcessStatus } from '../utils/statusLayer';

// Each icon types its own statuses; a mixed list erases them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONS = STATUS_ICONS as unknown as Record<
  string,
  React.ComponentType<any>
>;

/** The Status page's groups, in order. */
export const STATUS_GROUPS = [
  'Process',
  'Status checkmarks',
  'Notification',
  'Status pip',
] as const;
type Group = (typeof STATUS_GROUPS)[number];

const PROCESS = PROCESS_ICONS.filter(
  (n) => !(CHECKMARK_ICONS as readonly string[]).includes(n)
);
const LISTS: Record<Group, readonly string[]> = {
  Process: PROCESS,
  'Status checkmarks': CHECKMARK_ICONS,
  Notification: NOTIFICATION_ICONS,
  'Status pip': ['StatusPip'],
};

const NOTES: Record<Group, React.ReactNode> = {
  Process:
    'Success, warning, error and pending, in the bottom-right slot. Pending is the loading spinner: an arc of about half a circle, turning once a second and growing and shrinking a little as it turns, in step with the other spinners on the page. With reduced motion it is three still dots.',
  'Status checkmarks': (
    <>
      Carbon has warning and error versions of these four icons, and at rest
      each draws Carbon's version exactly. The two checkmarks don't take
      success: they already mean it. Carbon's names for the fixed versions work
      too:{' '}
      {Object.keys(STATUS_ALIASES).map((n, i) => (
        <React.Fragment key={n}>
          {i ? ', ' : ''}
          <code>{n}</code>
        </React.Fragment>
      ))}
      .
    </>
  ),
  Notification:
    "A dot, or a count in a pill, top right. Counts hang off the icon's corner by default; numbers show at size 32 only.",
  'Status pip':
    'A count on its own, not on an icon (so no placement): 99+ at 24 and 32, 9+ at 16 and 20.',
};

/** One process icon's card. Exported for the icon pages. */
export function ProcessCard({
  name,
  tone,
}: {
  name: string;
  tone: ToneChoice;
}) {
  const Icon = ICONS[name];
  const [status, setStatus] = useState<ProcessStatus | undefined>(undefined);
  const statuses = (
    Icon as unknown as { status: { statuses: readonly ProcessStatus[] } }
  ).status.statuses;
  return (
    <IconCard
      name={displayName(name)}
      exportName={name}
      icon={(s) => (
        <Icon
          size={s}
          status={status}
          tone={tone}
          aria-label={displayName(name)}
        />
      )}
      controls={
        <StatusChips value={status} onChange={setStatus} statuses={statuses} />
      }
    />
  );
}

/** One notification icon's card. Exported for the icon pages. */
export function NotificationCard({
  name,
  tone,
}: {
  name: string;
  tone: ToneChoice;
}) {
  const Icon = ICONS[name];
  const [pip, setPip] = useState(false);
  const [count, setCount] = useState(0);
  const [placement, setPlacement] = useState<CountPlacement>('overhang');
  return (
    <IconCard
      name={displayName(name)}
      exportName={name}
      icon={(s) => (
        <Icon
          size={s}
          status={pip ? 'notification' : undefined}
          count={count}
          countPlacement={placement}
          tone={tone}
          aria-label={displayName(name)}
        />
      )}
      controls={
        <>
          <PipChip on={pip} onChange={setPip} />
          <CountControls
            count={count}
            onCount={setCount}
            placement={placement}
            onPlacement={setPlacement}
          />
        </>
      }
    />
  );
}

/** StatusPip's card. Exported for the icon pages. */
export function PipCard({ tone }: { tone: ToneChoice }) {
  const [count, setCount] = useState(1);
  const t = tone === false || tone === true ? undefined : tone;
  return (
    <IconCard
      name="Status pip"
      exportName="StatusPip"
      icon={(s) => (
        <StatusPip
          count={count}
          size={s}
          tone={t}
          aria-label={`${count} new`}
        />
      )}
      controls={<CountControls count={count} onCount={setCount} />}
    />
  );
}

/**
 * The status cards. `tone` comes from the page's toolbar; without it (the
 * review page) the gallery shows its own tone control.
 */
export function StatusGallery({
  query = '',
  group = '',
  tone: pageTone,
}: {
  query?: string;
  group?: string;
  tone?: ToneChoice;
}) {
  const [ownTone, setOwnTone] = useState<ToneChoice>(false);
  const tone = pageTone ?? ownTone;
  const shown = useMemo(
    () =>
      STATUS_GROUPS.filter((g) => !group || g === group).map(
        (g) =>
          [
            g,
            LISTS[g].filter((n) => matches(query, n, displayName(n), g)),
          ] as const
      ),
    [query, group]
  );
  const any = shown.some(([, list]) => list.length);
  return (
    <>
      {pageTone === undefined && (
        <div style={{ marginBottom: 32 }}>
          <ToneChips value={ownTone} onChange={setOwnTone} />
        </div>
      )}
      {!any && <Empty what="status icons" query={query} />}
      {shown.map(([g, list]) =>
        list.length ? (
          <Section
            key={g}
            title={g}
            count={list.length}
            note={NOTES[g]}
            estimate={Math.ceil(list.length / 3) * 170}>
            <CardGrid
              min={g === 'Notification' ? 440 : 340}
              one={g === 'Notification' ? 440 : 310}>
              {list.map((n) =>
                g === 'Notification' ? (
                  <NotificationCard key={n} name={n} tone={tone} />
                ) : g === 'Status pip' ? (
                  <PipCard key={n} tone={tone} />
                ) : (
                  <ProcessCard key={n} name={n} tone={tone} />
                )
              )}
            </CardGrid>
          </Section>
        ) : null
      )}
    </>
  );
}
