/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The behaviour pages' shared parts (dev only: stories, not the package's
 * exports). Every behaviour (Toggle, Status, Action, Hover) draws its icons
 * with the same card:
 *
 *   head      the name (a link to the icon's own page) and an optional
 *             note
 *   icons     at 32, 24, 20 and 16, or the one size the page's density
 *             picks. The whole card is the hover frame
 *             (`data-motion-icon-frame`), so pointing at or tabbing to it
 *             plays every size's hover together
 *   controls  the behaviour's own, from statusControls.tsx, or none: a
 *             toggle card is itself the control (`onActivate`: a click
 *             anywhere on it, or Enter / Space)
 *
 * Cards sit in sections with the same heading and count; a section mounts
 * its icons only when it nears the viewport (append `&eager` to the iframe
 * URL to mount everything, e.g. for a full-page screenshot). The host's
 * controls, theme and URL state come in through `GalleryUIContext`
 * (statusControls.tsx); its look (in Storybook, the kit's tiles and
 * rollover) overrides `KIT_CSS`, the plain fallback.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Copy } from '../index';
import type { MotionIconHandle } from '../types';
import { HOVER_ICONS } from '../icons/gallery.registry';
import { GhostButton, useGalleryUI, useHostLink } from './statusControls';

/** The sizes every card shows, Carbon's four. */
export const SIZES = [32, 24, 20, 16] as const;
export type Size = (typeof SIZES)[number];

/** The page's density: every card at all four sizes, or at one. */
export const PageOptions = createContext<{ sizes: readonly Size[] }>({
  sizes: SIZES,
});

const NAMES = new Map(HOVER_ICONS.map(([name, , key]) => [key, name]));
/** An export's display name: the gallery registry's (Carbon's, sentence case), else its words split. */
export function displayName(exportName: string): string {
  return (
    NAMES.get(exportName) ??
    exportName
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/ ([A-Z])(?=[a-z])/g, (_, c: string) => ` ${c.toLowerCase()}`)
  );
}

/** Case-insensitive match of a search query against any of the fields. */
export function matches(
  query: string,
  ...fields: Array<string | undefined>
): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
}

type PropValue = string | number | boolean | undefined | null | { raw: string };
/**
 * The JSX for an icon with these props, after its import: strings quoted,
 * `true` bare, numbers and `{ raw }` in braces; unset and false ones left out.
 * `after` adds lines below (a ref call).
 */
export function snippet(
  exportName: string,
  props: Record<string, PropValue> = {},
  after = ''
): string {
  const attrs = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) =>
      v === true
        ? k
        : typeof v === 'string'
          ? `${k}="${v}"`
          : typeof v === 'number'
            ? `${k}={${v}}`
            : `${k}={${(v as { raw: string }).raw}}`
    );
  return `import { ${exportName} } from '@carbon-labs/react-motion-icons';\n\n<${[exportName, ...attrs].join(' ')} />${after ? `\n${after}` : ''}`;
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  fallbackCopy(text);
  return Promise.resolve();
}
function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    ta.remove();
  }
}

/** Copy: the text to the clipboard, and the Copy icon acts it out, handing off to success. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const icon = useRef<MotionIconHandle>(null);
  return (
    <GhostButton
      kind="icon"
      aria-label={`Copy the code for ${label}`}
      title={`Copy:\n${text}`}
      onClick={() => {
        void copyText(text);
        void icon.current?.trigger({ then: { status: 'success', for: 1200 } });
      }}>
      <Copy ref={icon} size={16} />
    </GhostButton>
  );
}

/** The card's name: a link to the icon's page where the host has one. */
function Name({ name, exportName }: { name: string; exportName?: string }) {
  const { iconHref } = useGalleryUI();
  const link = useHostLink();
  if (!exportName || !iconHref)
    return (
      <span className="mi-name mi-name--static" title={exportName}>
        {name}
      </span>
    );
  return (
    <a
      className="mi-name"
      {...link(iconHref(exportName))}
      title={`${exportName}: open its page`}>
      {name}
    </a>
  );
}

export interface IconCardProps {
  /** The display name (sentence case). */
  name: string;
  /** The export, for the link and the tooltip. */
  exportName?: string;
  /** A short note on the right of the name (a timing, a state count). */
  meta?: React.ReactNode;
  /** One icon at a size; called for each size the page shows, with its index in `SIZES` (`larger` sizes follow them). */
  icon: (size: Size, index: number) => React.ReactNode;
  /** Sizes above Carbon's, drawn first whatever the page's size switch says (a preview of larger sizes). */
  larger?: readonly number[];
  /** A longer description under the icons. */
  description?: React.ReactNode;
  /** The behaviour's controls, under everything. */
  controls?: React.ReactNode;
  /** The card is the control: a click anywhere on it (but its links and buttons), or Enter / Space. */
  onActivate?: () => void;
  /** With `onActivate`: what the card is now, for its accessible name ("off"). */
  activateLabel?: string;
}

const INTERACTIVE =
  'a, button, input, select, textarea, [role="tab"], [role="tablist"]';

/**
 * One icon, at Carbon's four sizes (or the page's one), the whole card its
 * hover frame (`data-motion-icon-frame`): pointing at or tabbing to it plays
 * every size's hover together. A card that is the control (`onActivate`) is a
 * press frame too (`"press"`): holding it presses its icons, as an `asButton`
 * toggle presses.
 */
export function IconCard({
  name,
  exportName,
  meta,
  icon,
  larger = [],
  description,
  controls,
  onActivate,
  activateLabel,
}: IconCardProps) {
  const { sizes } = useContext(PageOptions);
  const activate = onActivate
    ? {
        role: 'button',
        'aria-label': activateLabel ? `${name}, ${activateLabel}` : name,
        onClick: (e: React.MouseEvent) => {
          if (!(e.target as Element).closest(INTERACTIVE)) onActivate();
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (
            e.target !== e.currentTarget ||
            (e.key !== 'Enter' && e.key !== ' ')
          )
            return;
          e.preventDefault();
          onActivate();
        },
      }
    : { role: 'group', 'aria-label': name };
  return (
    <div
      className="mi-card"
      data-clickable={onActivate ? '' : undefined}
      data-motion-icon-frame={onActivate ? 'press' : ''}
      tabIndex={0}
      {...activate}>
      <div className="mi-card__head">
        <Name name={name} exportName={exportName} />
        {meta != null && <span className="mi-card__meta">{meta}</span>}
      </div>
      <div className="mi-frame">
        {larger.map((s, i) => (
          <span key={s} className="mi-frame__icon">
            {icon(s as Size, SIZES.length + i)}
          </span>
        ))}
        {SIZES.map((s, i) =>
          sizes.includes(s) ? (
            <span key={s} className="mi-frame__icon">
              {icon(s, i)}
            </span>
          ) : null
        )}
      </div>
      {description != null && <p className="mi-card__desc">{description}</p>}
      {controls != null && <div className="mi-card__controls">{controls}</div>}
    </div>
  );
}

/**
 * Cards in a responsive grid; `min` is the narrowest a card gets at all four
 * sizes, `one` at one size (32 by default): a card sized to one icon and its
 * controls.
 */
export function CardGrid({
  min = 220,
  one = Math.min(min, 180),
  children,
}: {
  min?: number;
  one?: number;
  children: React.ReactNode;
}) {
  const { sizes } = useContext(PageOptions);
  const width = sizes.length === 1 ? one : min;
  return (
    <div
      className="mi-grid"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${width}px), 1fr))`,
      }}>
      {children}
    </div>
  );
}

const EAGER =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).has('eager');

/**
 * A group of cards under a heading with its count. Its children mount when it
 * comes within a screen of the viewport, then stay (800+ animated icons on one
 * page otherwise mount at once).
 */
export function Section({
  title,
  count,
  note,
  estimate = 400,
  children,
}: {
  title: string;
  count: number;
  note?: React.ReactNode;
  estimate?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(
    EAGER || typeof IntersectionObserver === 'undefined'
  );
  // On screen as it mounts (a page's first sections): its cards before the first paint, not a frame of placeholder.
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (
      !shown &&
      r &&
      r.height > 0 &&
      r.top < 2 * innerHeight &&
      r.bottom > -innerHeight
    )
      setShown(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (shown || !ref.current) return;
    // Rooted at the document's own viewport: in an iframe (Storybook) the
    // implicit root is the top window's, and the margin never reaches past
    // the iframe's edge, so sections mounted only as they scrolled into view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { root: document, rootMargin: '100% 0px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  return (
    <section ref={ref} className="mi-section">
      <h2 className="mi-section__title">
        {title} <span className="mi-section__count">{count}</span>
      </h2>
      {note != null && <p className="mi-section__note">{note}</p>}
      {shown ? children : <div style={{ minHeight: estimate }} />}
    </section>
  );
}

/** The same empty state on every page. */
export function Empty({ what, query }: { what: string; query: string }) {
  return (
    <p className="mi-empty">
      No {what} match “{query.trim()}”.
    </p>
  );
}

/** A row of a behaviour's API table: the React prop or method, the web component's attribute or method, and what it does. */
export interface ApiRow {
  react: React.ReactNode;
  wc: React.ReactNode;
  does: React.ReactNode;
}

const API_OPEN_KEY = 'mi-api-open';
function readApiOpen(): boolean {
  try {
    return localStorage.getItem(API_OPEN_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Whether the API tables are open: open by default, and the page remembers a viewer closing them. One state for every behaviour's table. */
export function useApiOpen(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(readApiOpen);
  const set = (o: boolean) => {
    setOpen(o);
    try {
      localStorage.setItem(API_OPEN_KEY, o ? '1' : '0');
    } catch {
      /* private window: not remembered */
    }
  };
  return [open, set];
}

/** The API table, the same columns for every behaviour; `open` / `onOpenChange` share one state between tables. */
export function ApiTable({
  rows,
  caption,
  open,
  onOpenChange,
}: {
  rows: readonly ApiRow[];
  caption?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { webComponents } = useGalleryUI();
  return (
    <details
      className="mi-api-details"
      open={open}
      onToggle={(e) => {
        const o = (e.currentTarget as HTMLDetailsElement).open;
        if (o !== open) onOpenChange(o);
      }}>
      <summary>
        {webComponents ? 'API: React and web components' : 'API: React'}
      </summary>
      <ApiRows rows={rows} caption={caption} />
    </details>
  );
}

export function ApiRows({
  rows,
  caption,
}: {
  rows: readonly ApiRow[];
  caption?: React.ReactNode;
}) {
  const { webComponents } = useGalleryUI();
  return (
    <table className="mi-api">
      {caption != null && <caption>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">React</th>
          {webComponents && <th scope="col">Web component</th>}
          <th scope="col">What it does</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.react}</td>
            {webComponents && <td>{r.wc}</td>}
            <td>{r.does}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The pages' plain styles, in one place (a host's stylesheet restyles them:
 * Storybook's carbon-next.scss). Pointer focus draws no ring (the click
 * already says where you are); keyboard focus (`:focus-visible`) draws Carbon's.
 */
export const KIT_CSS = `
.mi-page { max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; font-family: var(--cds-font-family, 'IBM Plex Sans', sans-serif);
  color: var(--cds-text-primary, #161616); }
.mi-header { margin-bottom: 32px; }
.mi-header__title { font-size: 42px; font-weight: 300; line-height: 50px; margin: 0 0 16px; }
.mi-header__accent { color: var(--cds-border-interactive, #0f62fe); }
.mi-header__lede { font-size: 16px; line-height: 24px; color: var(--cds-text-secondary, #525252); max-width: 640px; margin: 0; }
.mi-behaviours { margin-bottom: 32px; }
.mi-panels { position: relative; }
.mi-panel[data-off] { position: absolute; inset: 0 0 auto; content-visibility: hidden; }
.mi-panel[data-off][data-leaving] { content-visibility: visible; pointer-events: none; }
.mi-intro { max-width: 760px; margin-bottom: 24px; }
.mi-intro__what { font-size: 16px; line-height: 24px; margin: 0 0 8px; }
.mi-intro__when { font-size: 14px; line-height: 20px; margin: 0; color: var(--cds-text-secondary, #525252); }
.mi-intro__when strong { font-weight: 600; color: var(--cds-text-primary, #161616); }
.mi-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px 24px; margin-bottom: 32px; }
.mi-toolbar__search { flex: 1 1 280px; min-width: 0; }
.mi-toolbar__group { width: 240px; }
.mi-toolbar__break { flex-basis: 100%; height: 0; }
.mi-section { margin-bottom: 48px; content-visibility: auto; contain-intrinsic-size: auto 600px; }
.mi-section__title { font-size: 20px; font-weight: 400; line-height: 28px; margin: 0 0 16px; }
.mi-section__count { font-size: 14px; color: var(--cds-text-secondary, #525252); margin-left: 4px; }
.mi-section__note { font-size: 14px; line-height: 20px; color: var(--cds-text-secondary, #525252); max-width: 720px; margin: -8px 0 16px; }
.mi-grid { display: grid; gap: 8px; }
.mi-card { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 8px 8px 16px 16px; min-width: 0;
  border-radius: 8px; background: var(--cds-layer-01, #f4f4f4); }
.mi-card[data-clickable] { cursor: pointer; }
.mi-card__head { display: flex; align-items: baseline; gap: 8px; min-height: 32px; padding-top: 8px; }
.mi-name { font-size: 12px; line-height: 16px; color: var(--cds-text-secondary, #525252); text-decoration: none;
  overflow-wrap: anywhere; min-width: 0; margin-right: auto; }
.mi-card__meta { font-size: 12px; line-height: 16px; color: var(--cds-text-helper, #6f6f6f); white-space: nowrap; flex: none; }
.mi-states { display: inline-grid; }
.mi-states > * { grid-area: 1 / 1; visibility: hidden; }
.mi-states > [data-current] { visibility: visible; }
.mi-frame { display: flex; align-items: center; gap: 20px; min-height: 40px; padding-right: 8px; color: var(--cds-icon-primary, #161616); }
.mi-frame__icon { display: inline-flex; }
.mi-card__desc { font-size: 12px; line-height: 16px; margin: 0; padding-right: 8px; color: var(--cds-text-secondary, #525252); }
.mi-card__controls { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px 12px; margin-top: auto; padding-top: 4px; }
.mi-empty { padding: 48px 0; text-align: center; color: var(--cds-text-secondary, #525252); }
.mi-api-details { margin: 0 0 32px; max-width: 960px; }
.mi-api-details > summary { cursor: pointer; font-size: 14px; line-height: 20px; color: var(--cds-text-secondary, #525252); margin-bottom: 8px; width: fit-content; }
.mi-api { border-collapse: collapse; width: 100%; font-size: 13px; line-height: 18px; margin: 0; }
.mi-api caption { text-align: left; font-size: 12px; color: var(--cds-text-secondary, #525252); caption-side: bottom; padding-top: 8px; }
.mi-api th { text-align: left; font-weight: 600; font-size: 12px; color: var(--cds-text-secondary, #525252); padding: 8px 16px 8px 0; border-bottom: 1px solid var(--cds-border-subtle, #e0e0e0); }
.mi-api td { vertical-align: top; padding: 8px 16px 8px 0; border-bottom: 1px solid var(--cds-border-subtle, #e0e0e0); }
.mi-api td:nth-child(-n+2) { white-space: nowrap; }
.mi-api code, .mi-intro code, .mi-section__note code, .mi-code { font-family: var(--cds-code-02-font-family, 'IBM Plex Mono', monospace); font-size: 12px; }
.mi-card:focus, .mi-name:focus, .mi-api-details > summary:focus { outline: none; }
.mi-card:focus-visible { outline: 2px solid var(--cds-focus, #0f62fe); outline-offset: -2px; z-index: 1; }
.mi-name:focus-visible, .mi-api-details > summary:focus-visible { outline: 2px solid var(--cds-focus, #0f62fe); outline-offset: 2px; }
`;
