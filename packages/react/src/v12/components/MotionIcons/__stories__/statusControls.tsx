/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The one set of gallery controls (dev only: the gallery, the icon page and
 * the review page all use these, so every place reads the same). Process icons get
 * the status chips; notification icons get the notification chip and the
 * **count** controls (stepper and placement), which only they have: process
 * icons take no count. The generic pieces (`Field`, `Switcher`,
 * `GhostButton`) carry the other behaviours' controls: a toggle's state,
 * an action's trigger, loop and hand-off, a hover's play.
 *
 * By default every control is a Carbon v11 component by class name (small
 * content switchers, a small number input, ghost buttons), so it needs
 * Carbon's styles on the page: the review page inlines the same components'
 * CSS. No @carbon/react dependency. A host can swap in its own switcher and
 * button through `GalleryUIContext`: Storybook passes the kit's content
 * switcher and its rollover button, so the package never imports an app.
 */
import React, { createContext, useContext } from 'react';
import { PROCESS_STATUSES } from '../icons/statusIcons';
import type { CountPlacement, ProcessStatus, Tone } from '../utils/statusLayer';

/**
 * The old chip look as an inline style (Carbon tokens). Kept for callers that
 * still style their own buttons; the controls below use Carbon classes.
 */
export const chip = (on: boolean): React.CSSProperties => ({
  padding: '0 10px',
  height: 28,
  border: '1px solid var(--cds-border-strong-01, #8d8d8d)',
  marginLeft: -1,
  background: on
    ? 'var(--cds-layer-selected-inverse, #161616)'
    : 'var(--cds-layer-01, #f4f4f4)',
  color: on
    ? 'var(--cds-text-inverse, #fff)'
    : 'var(--cds-text-primary, #161616)',
  font: '13px var(--cds-font-family, "IBM Plex Sans", sans-serif)',
  cursor: 'pointer',
});

// A labelled field: Carbon label above its control.
const field: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  minWidth: 0,
  maxWidth: '100%',
  verticalAlign: 'top',
};
const fieldLabel: React.CSSProperties = { margin: 0, whiteSpace: 'nowrap' };
// Content switchers size to their options (Carbon's default is full width, equal segments); on a narrow screen a long one scrolls sideways, like Carbon tabs.
const switcher: React.CSSProperties = {
  display: 'flex',
  inlineSize: 'auto',
  maxInlineSize: '100%',
  overflowX: 'auto',
  scrollbarWidth: 'none',
};
const segment: React.CSSProperties = { inlineSize: 'auto', flex: '0 0 auto' };

/** The sizes a switcher comes in: `xs` (24px) in cards, `sm` (32px) in toolbars, `md` (40px) for page tabs. */
export type SwitcherSize = 'xs' | 'sm' | 'md';

/** Carbon's four themes, the page's theme switch. */
export const THEMES = ['white', 'g10', 'g90', 'g100'] as const;
export type Theme = (typeof THEMES)[number];

/** A host's own controls (all optional; the Carbon-class defaults stand in for any left out). */
export interface GalleryUI {
  /** One option on at a time, by index. */
  Switcher?: React.ComponentType<{
    labels: readonly string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    size: SwitcherSize;
    label: string;
  }>;
  /** A button that does something once; `icon` is a square one for an icon alone. */
  Button?: React.ComponentType<{
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    kind?: 'ghost' | 'icon';
    'aria-label'?: string;
  }>;
  /** The page theme, when the host can switch it. */
  theme?: { value: Theme; onChange: (t: Theme) => void };
  /** Page state the host keeps in its URL (Storybook: the story's args), read once and written on change. */
  urlState?: {
    get: (key: string) => string | undefined;
    set: (key: string, value: string | undefined) => void;
  };
  /** A link to an icon's detail page. */
  iconHref?: (exportName: string) => string;
  /** Whether the host has the web components: the pages then show their attributes and code beside React's. */
  webComponents?: boolean;
  /** A link to the gallery, open on a behaviour. */
  galleryHref?: (behaviour: string) => string;
  /**
   * Opens one of the host's own links in place (Storybook: the manager's
   * navigation, so the page doesn't reload); false leaves it to the link.
   */
  navigate?: (href: string) => boolean;
}
export const GalleryUIContext = createContext<GalleryUI>({});
export const useGalleryUI = () => useContext(GalleryUIContext);

/** A story decorator: the host's gallery controls, with the web components on (the package ships beside them). */
export function WithWebComponents(Story: React.ComponentType) {
  const ui = useGalleryUI();
  return (
    <GalleryUIContext.Provider value={{ ...ui, webComponents: true }}>
      <Story />
    </GalleryUIContext.Provider>
  );
}

/**
 * A link's props for a host page: its href (so it opens in a new tab as
 * usual) and, on a plain click, the host's in-place navigation.
 */
export function useHostLink() {
  const { navigate } = useGalleryUI();
  return (href: string) => ({
    href,
    target: '_top',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        !navigate
      )
        return;
      if (navigate(href)) e.preventDefault();
    },
  });
}

/** A labelled control: Carbon's label above it. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span style={field} role="group" aria-label={label}>
      <span className="cds--label" style={fieldLabel} aria-hidden="true">
        {label}
      </span>
      {children}
    </span>
  );
}

/** A content switcher: one option on at a time. The host's (GalleryUIContext), else a small Carbon one (pressed-button semantics). */
export function Switcher<T>({
  options,
  value,
  onChange,
  size = 'xs',
  label = '',
}: {
  options: ReadonlyArray<readonly [T, string]>;
  value: T;
  onChange: (v: T) => void;
  size?: SwitcherSize;
  label?: string;
}) {
  const { Switcher: Host } = useGalleryUI();
  if (Host) {
    return (
      <Host
        labels={options.map(([, l]) => l)}
        selectedIndex={Math.max(
          0,
          options.findIndex(([v]) => Object.is(v, value))
        )}
        onSelect={(i) => onChange(options[i][0])}
        size={size}
        label={label}
      />
    );
  }
  return (
    <span
      className="cds--content-switcher cds--content-switcher--sm cds--layout--size-sm"
      style={switcher}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={on}
            className={`cds--content-switcher-btn${on ? ' cds--content-switcher--selected' : ''}`}
            style={segment}
            onClick={() => onChange(v)}>
            <span className="cds--content-switcher__label">{l}</span>
          </button>
        );
      })}
    </span>
  );
}

/** status: none, success, warning, error, pending. */
export function StatusChips({
  value,
  onChange,
  statuses = PROCESS_STATUSES,
}: {
  value?: ProcessStatus;
  onChange: (s?: ProcessStatus) => void;
  statuses?: readonly ProcessStatus[];
}) {
  // An icon's own statuses (the checks take no success).
  const options = [undefined, ...statuses].map(
    (s) => [s, s ?? 'none'] as const
  );
  return (
    <Field label="status">
      <Switcher
        options={options}
        value={value}
        onChange={onChange}
        label="status"
      />
    </Field>
  );
}

/** status: notification (the pip, on or off). */
export function PipChip({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <Field label="status">
      <Switcher
        options={
          [
            [false, 'none'],
            [true, 'notification'],
          ] as const
        }
        value={on}
        onChange={onChange}
        label="status"
      />
    </Field>
  );
}

const SUBTRACT = 'M8 15H24V17H8z';
const ADD =
  'M17 15 17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z';
const Glyph = ({ d, className }: { d: string; className: string }) => (
  <svg
    focusable="false"
    fill="currentColor"
    width="16"
    height="16"
    viewBox="0 0 32 32"
    aria-hidden="true"
    className={className}>
    <path d={d} />
  </svg>
);
const ghost = 'cds--btn cds--btn--ghost cds--btn--sm cds--layout--size-sm';

/** A button that does something once (+5, Trigger): the host's (GalleryUIContext), else a small Carbon ghost button. */
export function GhostButton({
  children,
  onClick,
  disabled,
  title,
  kind = 'ghost',
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  kind?: 'ghost' | 'icon';
  'aria-label'?: string;
}) {
  const { Button: Host } = useGalleryUI();
  if (Host)
    return (
      <Host
        onClick={onClick}
        disabled={disabled}
        title={title}
        kind={kind}
        aria-label={ariaLabel}>
        {children}
      </Host>
    );
  return (
    <button
      type="button"
      className={ghost}
      style={{ paddingInline: kind === 'icon' ? 8 : 12 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      data-motion-icon-frame="">
      {children}
    </button>
  );
}

/**
 * count: − n + +5 0, and its placement (overhang, the default, or inside). Numbers show at 32px; smaller, a count is the pip.
 * Without `onPlacement` (StatusPip, which has no placement) only the count shows.
 */
export function CountControls({
  count,
  onCount,
  placement,
  onPlacement,
}: {
  count: number;
  onCount: (n: number) => void;
  placement?: CountPlacement;
  onPlacement?: (p: CountPlacement) => void;
}) {
  const id = React.useId();
  return (
    <>
      <Field label="count">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <div
            className="cds--form-item"
            style={{ flex: 'none', inlineSize: '8.5rem' }}>
            <div className="cds--number cds--number--nolabel cds--number--sm">
              <label htmlFor={id} className="cds--label cds--visually-hidden">
                count
              </label>
              <div className="cds--number__input-wrapper">
                <input
                  id={id}
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={count}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value, 10);
                    onCount(Number.isFinite(n) ? Math.max(0, n) : 0);
                  }}
                />
                <div className="cds--number__controls">
                  <button
                    type="button"
                    className="cds--number__control-btn down-icon"
                    aria-label="Count down"
                    title="Count down"
                    onClick={() => onCount(Math.max(0, count - 1))}>
                    <Glyph d={SUBTRACT} className="down-icon" />
                  </button>
                  <div className="cds--number__rule-divider" />
                  <button
                    type="button"
                    className="cds--number__control-btn up-icon"
                    aria-label="Count up"
                    title="Count up"
                    onClick={() => onCount(count + 1)}>
                    <Glyph d={ADD} className="up-icon" />
                  </button>
                  <div className="cds--number__rule-divider" />
                </div>
              </div>
            </div>
          </div>
          <GhostButton onClick={() => onCount(count + 5)}>+5</GhostButton>
          <GhostButton onClick={() => onCount(0)}>0</GhostButton>
        </span>
      </Field>
      {onPlacement && (
        <Field label="count placement">
          <Switcher
            options={
              [
                ['overhang', 'overhang'],
                ['inside', 'inside'],
              ] as const
            }
            value={placement ?? 'overhang'}
            onChange={onPlacement}
            label="count placement"
          />
        </Field>
      )}
    </>
  );
}

/** The tone a control picks: off (currentColor), each status its own colour (icons: `tone`), or one named tone. */
export type ToneChoice = false | true | Tone;
const TONES: readonly Tone[] = ['error', 'warning', 'success', 'info'];

/**
 * tone: current colour, (icons only) status colours, error, warning, success,
 * info. On an icon a named tone colours the pip and the count; process marks
 * keep their own colours. StatusPip takes only the named tones.
 */
export function ToneChips<T extends ToneChoice>({
  value,
  onChange,
  statusColours = true,
  size = 'xs',
}: {
  value: T;
  onChange: (t: T) => void;
  statusColours?: boolean;
  size?: SwitcherSize;
}) {
  const options: [ToneChoice, string][] = [
    [false, 'current color'],
    ...(statusColours
      ? ([[true, 'status colors']] as [ToneChoice, string][])
      : []),
    ...TONES.map((t) => [t, t] as [ToneChoice, string]),
  ];
  return (
    <Field label="tone">
      <Switcher
        options={options as [T, string][]}
        value={value}
        onChange={onChange}
        size={size}
        label="tone"
      />
    </Field>
  );
}
