/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * One icon's own page (dev only: stories): Motion Icons › Icon, deep-linked
 * by the story's `name` arg (`?path=/story/motion-icons-icon--icon&args=name:Copy`).
 * Every card name in the gallery links here. It shows:
 *
 *  - the icon's names: its React export and its web component's tag;
 *  - every behaviour it has (each a link to the gallery on it), each with the
 *    gallery's card (the same controls);
 *  - its still drawing (as under reduced motion, or `animated={false}`)
 *    beside its animated rest, at the four sizes;
 *  - every prop it takes, React and web component side by side, with this
 *    icon's own values (its states, statuses, timing);
 *  - the code, both bindings.
 */
import React, { useMemo, useState } from 'react';
import { ComboBox } from '@carbon-labs/react-dropdown';
import * as Lib from '../index';
import { MotionIconProvider } from '../context/MotionIconProvider';
import type { AnimatedIconProps } from '../types';
import { HOVER_ICONS, TOGGLES } from '../icons/gallery.registry';
import {
  ApiRows,
  CardGrid,
  CopyButton,
  KIT_CSS,
  SIZES,
  displayName,
  snippet,
  type ApiRow,
} from './galleryKit';
import { PageHeader, ThemeField } from './GalleryPage';
import { BEHAVIOUR_ORDER, type Behaviour } from './behaviours';
import { HoverCard } from './HoverGallery';
import { ToggleCard, TOGGLE_ENTRIES } from './ToggleGallery';
import { NotificationCard, PipCard, ProcessCard } from './StatusGallery';
import { ACTION_ICONS, ActionCard } from './ActionGallery';
import {
  CHECKMARK_ICONS,
  NOTIFICATION_ICONS,
  PROCESS_ICONS,
} from '../icons/statusIcons';
import { useGalleryUI, useHostLink } from './statusControls';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LIB = Lib as unknown as Record<
  string,
  React.ComponentType<any> & {
    states?: readonly string[];
    status?: { statuses: readonly string[] };
    action?: { description: string; duration: number; cycle?: number };
  }
>;

/** Every icon with a page: the hover icons, the toggles and StatusPip. */
const ALL = [
  ...new Set([
    ...HOVER_ICONS.map(([, , k]) => k),
    ...TOGGLES.map((t) => t.toggle),
    'StatusPip',
  ]),
]
  .filter((k) => LIB[k])
  .map((k) => ({ id: k, text: `${displayName(k)} (${k})` }))
  .sort((a, b) => a.text.localeCompare(b.text));

/** `<clabs-motion-icon-…>`: the React name in kebab case (StatusPip is `clabs-motion-status-pip`). */
export const wcTag = (name: string) =>
  name === 'StatusPip'
    ? 'clabs-motion-status-pip'
    : `clabs-motion-icon-${name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()}`;

const C = ({ children }: { children: React.ReactNode }) => (
  <code>{children}</code>
);
const list = (xs: readonly string[]) => xs.map((x) => `'${x}'`).join(' | ');
const ms = (s: number) => `${Math.round(s * 1000)}ms`;

function behavioursOf(name: string): Behaviour[] {
  const I = LIB[name];
  const out: Behaviour[] = [];
  if (I?.states) out.push('Toggle');
  if (I?.status || name === 'StatusPip') out.push('Status');
  if (I?.action) out.push('Action');
  if (name !== 'StatusPip') out.push('Hover');
  return BEHAVIOUR_ORDER.filter((b) => out.includes(b));
}

function propRows(name: string): ApiRow[] {
  const I = LIB[name];
  const rows: ApiRow[] = [
    {
      react: <C>size</C>,
      wc: <C>size</C>,
      does: "16 | 20 | 24 | 32. Unset: 32 (a web component in a Carbon button's icon slot: 16).",
    },
    {
      react: <C>animated</C>,
      wc: <C>animated</C>,
      does: 'Unset follows prefers-reduced-motion; false draws the still drawing below.',
    },
    {
      react: <C>aria-label</C>,
      wc: <C>aria-label</C>,
      does: 'Names the icon (role img); unset, it is hidden from assistive tech.',
    },
    {
      react: <C>ref.play()</C>,
      wc: <C>el.play()</C>,
      does: 'Plays the hover once.',
    },
  ];
  if (I.states) {
    const entries = TOGGLE_ENTRIES.filter((e) => e.toggle === name);
    rows.push(
      {
        react: <C>value / initial</C>,
        wc: <C>value</C>,
        does: (
          <>
            States: <C>{list(I.states)}</C>. Starts on <C>{I.states[0]}</C>.
          </>
        ),
      },
      {
        react: <C>onChange</C>,
        wc: <C>clabs-motion-icon-beingchanged, clabs-motion-icon-changed</C>,
        does: "The icon's own click asks for the next state.",
      },
      {
        react: <C>toggled / onToggle</C>,
        wc: <C>toggled</C>,
        does:
          I.states.length === 2 ? (
            <>
              true is <C>{I.states[1]}</C>.
            </>
          ) : (
            'Two-state toggles only.'
          ),
      },
      {
        react: <C>asButton</C>,
        wc: <C>as-button</C>,
        does: 'A standalone icon becomes the button.',
      },
      {
        react: <C>disableToggle</C>,
        wc: <C>disable-toggle</C>,
        does: "Its clicks don't change it; hover still plays.",
      }
    );
    const filled = entries.some((e) => e.filled);
    const variants = [
      ...new Set(entries.map((e) => e.variant).filter(Boolean)),
    ] as string[];
    if (filled || variants.length)
      rows.push({
        react: <C>filled, variant</C>,
        wc: <C>filled, variant</C>,
        does: (
          <>
            {filled ? "filled: Carbon's filled drawings. " : ''}
            {variants.length ? (
              <>
                variant: <C>{list(['default', ...variants])}</C>.
              </>
            ) : (
              ''
            )}
          </>
        ),
      });
  }
  if (I.status) {
    rows.push({
      react: <C>status</C>,
      wc: <C>status</C>,
      does: <>{list(I.status.statuses)}; unset is the plain icon.</>,
    });
    if ((NOTIFICATION_ICONS as readonly string[]).includes(name))
      rows.push(
        {
          react: <C>count, max</C>,
          wc: <C>count, max</C>,
          does: 'A count in a pill (numbers at 32 only); max 9 or 99.',
        },
        {
          react: <C>countPlacement</C>,
          wc: <C>count-placement</C>,
          does: "'overhang' (default) or 'inside'.",
        }
      );
    rows.push({
      react: <C>tone</C>,
      wc: <C>tone</C>,
      does: 'true: each mark in its support color; or a named tone.',
    });
  }
  if (name === 'StatusPip')
    rows.push(
      {
        react: <C>count, max</C>,
        wc: <C>count, max</C>,
        does: 'The count; 99+ at 24 and 32, 9+ at 16 and 20 by default.',
      },
      {
        react: <C>tone</C>,
        wc: <C>tone</C>,
        does: "'error' | 'warning' | 'success' | 'info'; currentColor by default.",
      }
    );
  if (I.action)
    rows.push(
      {
        react: <C>ref.trigger(options)</C>,
        wc: <C>el.trigger(options)</C>,
        does: (
          <>
            Plays the action: {ms(I.action.duration)}
            {I.action.cycle ? `, looping ${ms(I.action.cycle)} a pass` : ''}.
            Options: loop, until, then, failed.
          </>
        ),
      },
      { react: <C>ref.stop()</C>, wc: <C>el.stop()</C>, does: 'Ends a loop.' },
      {
        react: <C>actionKey, actionOn, loop, actionThen</C>,
        wc: <C>action-key, action-on, loop, action-then</C>,
        does: 'The declarative forms.',
      }
    );
  return rows;
}

function Cards({ name, b }: { name: string; b: Behaviour }) {
  if (b === 'Toggle')
    return (
      <>
        {TOGGLE_ENTRIES.filter((e) => e.toggle === name).map((e) => (
          <ToggleCard key={e.name} entry={e} />
        ))}
      </>
    );
  if (b === 'Status') {
    if (name === 'StatusPip') return <PipCard tone={false} />;
    if ((NOTIFICATION_ICONS as readonly string[]).includes(name))
      return <NotificationCard name={name} tone={false} />;
    if (
      (PROCESS_ICONS as readonly string[]).includes(name) ||
      (CHECKMARK_ICONS as readonly string[]).includes(name)
    )
      return <ProcessCard name={name} tone={false} />;
    return null;
  }
  if (b === 'Action') {
    const a = ACTION_ICONS.find(([n]) => n === name);
    return a ? <ActionCard name={a[0]} Icon={a[1]} /> : null;
  }
  return (
    <HoverCard
      entry={{
        name: displayName(name),
        key: name,
        component: LIB[name] as React.ComponentType<AnimatedIconProps>,
      }}
    />
  );
}

export function IconPage() {
  const { urlState, galleryHref, webComponents } = useGalleryUI();
  const link = useHostLink();
  const [name, setName] = useState(() => {
    const n = urlState?.get('name');
    return n && LIB[n] ? n : 'Copy';
  });
  const pick = (n: string) => {
    setName(n);
    urlState?.set('name', n);
  };
  const behaviours = useMemo(() => behavioursOf(name), [name]);
  const Icon = LIB[name];
  const tag = wcTag(name);
  const wcModule =
    name === 'StatusPip'
      ? 'status-pip'
      : tag.replace(/^clabs-motion-icon-/, '');
  const restProps = name === 'StatusPip' ? { count: 3 } : {};
  return (
    <div className="mi-page">
      <style>{KIT_CSS}</style>
      <PageHeader
        lede={`One icon: each behavior it has, its still drawing, its props and its code, in React${webComponents ? ' and as a web component' : ''}.`}
      />

      <div className="mi-toolbar">
        <div style={{ width: 360 }}>
          <ComboBox
            id="mi-icon-pick"
            size="sm"
            titleText="icon"
            items={ALL}
            itemToString={(i: { text: string } | null) => i?.text ?? ''}
            selectedItem={ALL.find((i) => i.id === name) ?? null}
            onChange={({
              selectedItem,
            }: {
              selectedItem?: { id: string } | null;
            }) => selectedItem && pick(selectedItem.id)}
          />
        </div>
        <ThemeField />
      </div>

      <h2 className="mi-icon__title">
        {displayName(name)}
        <span className="mi-icon__names">
          <C>{`<${name}>`}</C>
          {webComponents && (
            <>
              {' · '}
              <C>{`<${tag}>`}</C>
            </>
          )}
        </span>
      </h2>
      <p className="mi-icon__behaviours">
        {behaviours.map((b, i) => (
          <React.Fragment key={b}>
            {i ? ' · ' : ''}
            {galleryHref ? (
              <a className="mi-name mi-icon__link" {...link(galleryHref(b))}>
                {b}
              </a>
            ) : (
              b
            )}
          </React.Fragment>
        ))}
      </p>

      {behaviours.map((b) => (
        <section className="mi-section" key={b}>
          <h3 className="mi-section__title">{b}</h3>
          <CardGrid min={b === 'Status' || b === 'Action' ? 440 : 260}>
            <Cards name={name} b={b} />
          </CardGrid>
        </section>
      ))}

      <section className="mi-section">
        <h3 className="mi-section__title">Still drawing</h3>
        <p className="mi-section__note">
          With reduced motion, or <C>animated={'{false}'}</C>, the icon draws
          Carbon's art, still. Top: animated, at rest. Bottom: still.
        </p>
        <div className="mi-still">
          {SIZES.map((s) => (
            <span key={s} className="mi-still__cell">
              <Icon size={s} {...restProps} />
              <MotionIconProvider animated={false}>
                <Icon size={s} {...restProps} />
              </MotionIconProvider>
              <span className="mi-still__size">{s}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="mi-section">
        <h3 className="mi-section__title">Props</h3>
        <ApiRows rows={propRows(name)} />
      </section>

      <section className="mi-section">
        <h3 className="mi-section__title">Code</h3>
        <div className="mi-code-pair">
          <CodeBlock
            title="React"
            text={snippet(name, {
              size: 24,
              ...restProps,
              'aria-label': displayName(name),
            })}
          />
          {webComponents && (
            <CodeBlock
              title="Web component"
              text={`import '@carbon-labs/wc-motion-icons/icons/${wcModule}';\n\n<${tag} size="24"${name === 'StatusPip' ? ' count="3"' : ''} aria-label="${displayName(name)}"></${tag}>`}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function CodeBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mi-codeblock">
      <div className="mi-codeblock__head">
        <span>{title}</span>
        <CopyButton text={text} label={title} />
      </div>
      <pre className="mi-code">{text}</pre>
    </div>
  );
}

/** The icon page's own styles (after KIT_CSS). */
export const ICON_PAGE_CSS = `
.mi-icon__title { font-size: 28px; font-weight: 400; line-height: 36px; margin: 0 0 4px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 16px; }
.mi-icon__names { font-size: 14px; color: var(--cds-text-secondary, #525252); }
.mi-icon__behaviours { margin: 0 0 32px; font-size: 14px; }
.mi-icon__link { font-size: 14px; }
.mi-still { display: flex; gap: 32px; align-items: flex-end; color: var(--cds-icon-primary, #161616); }
.mi-still__cell { display: grid; justify-items: center; gap: 12px; }
.mi-still__size { font-size: 12px; color: var(--cds-text-secondary, #525252); }
.mi-code-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 8px; }
.mi-codeblock { border-radius: 8px; background: var(--cds-layer-01, #f4f4f4); padding: 8px 8px 16px 16px; min-width: 0; }
.mi-codeblock__head { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--cds-text-secondary, #525252); }
.mi-code { margin: 0; white-space: pre-wrap; line-height: 18px; }
`;
