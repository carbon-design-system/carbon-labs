/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Server output without Lit SSR: an icon element as HTML with a declarative
 * shadow root holding its resting drawing, so the icon paints with the page
 * (no pop, no shift) and upgrades in place when its module loads.
 *
 *   renderIconHTML(ClabsMotionIconNotification, { size: 24, count: 3, 'aria-label': 'Notifications, 3 new' })
 *   → <clabs-motion-icon-notification size="24" count="3" aria-label="…" role="img">
 *       <template shadowrootmode="open"><style>…</style><svg part="svg" …><g data-mc-ink>…</g></svg></template>
 *     </clabs-motion-icon-notification>
 *
 * Pure string work: no DOM, no Lit SSR, nothing browser-only at import, so it
 * runs in Node, an AEM (Java) build step via a Node sidecar, or at build time
 * into a static fragment. The drawing is the element's first painted frame:
 * the rest frame, or with `animated="false"` its still (Carbon's art).
 *
 * The host gets `role="img"` (labelled) or `aria-hidden="true"` as markup,
 * since ElementInternals isn't there before upgrade.
 */
import {
  PipEngine,
  shapesMarkup,
  stillShapes,
  type DrawingSpec,
  type IconSpec,
  type StatusIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import { DEV } from '@carbon-labs/motion-icons-core/dev';
import type { Still } from '@carbon-labs/motion-icons-core/static/index';
import type { Tone } from '@carbon-labs/motion-icons-core/status';
import { iconStyles, sizeOf as drawSizeOf } from './base/motion-icon-element';
import { countMax } from './base/count';
import { engineSpec, restShapesOf, stillSVG } from './base/stills';

type Attrs = Record<string, string | number | boolean | undefined | null>;

/** An element class: its tag, and its icon (none for the status pip). */
type IconClass = { is: string; spec?: IconSpec | StatusIconSpec };

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const on = (v: Attrs[string]) =>
  v !== undefined && v !== null && v !== false && v !== 'false';

/** The size the element draws at (16 in a Carbon icon slot with no size of its own; a size it doesn't draw at is the default, as the element). */
const sizeOf = (attrs: Attrs) =>
  drawSizeOf(attrs.size) ?? (attrs.slot === 'icon' ? 16 : 32);

/** An attribute name the server writes as is (letters, digits, `-`, `_`, `:`, `.`; anything else is dropped). */
const NAME = /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/;

/** A toggle element's drawing and state, from its attributes. */
function toggleState(
  spec: IconSpec,
  attrs: Attrs
): { drawing: DrawingSpec; state: string } {
  // `filled` is three-way: unset is the icon's default, "false" the outline.
  const filled =
    attrs.filled === undefined || attrs.filled === null
      ? undefined
      : on(attrs.filled);
  const drawing = (
    spec.kind === 'variant'
      ? spec.pick({ filled, variant: attrs.variant as string | undefined })
      : spec
  ) as DrawingSpec;
  const states =
    drawing.kind === 'hover' ? ['rest'] : (drawing.states as readonly string[]);
  const renamed =
    drawing.kind === 'state'
      ? (drawing.renamed as Record<string, string> | undefined)
      : undefined;
  const value = ((v) => (v !== undefined && renamed?.[v]) || v)(
    attrs.value as string | undefined
  );
  const toggledState =
    drawing.kind === 'state'
      ? (drawing.toggledState as string | undefined)
      : states.length === 2
        ? states[1]
        : undefined;
  const muteState =
    drawing.kind === 'state'
      ? (drawing.muteState as string | undefined)
      : undefined;
  const state =
    muteState && on(attrs.muted)
      ? muteState
      : value && states.includes(value)
        ? value
        : on(attrs.toggled) && toggledState
          ? toggledState
          : states[0];
  return { drawing, state };
}

/** An `as-button` toggle's pressed state (as the element's `aria-pressed`), or undefined when it isn't one. */
function buttonState(
  Ctor: IconClass,
  attrs: Attrs
): { pressed: string } | undefined {
  const spec = Ctor.spec;
  const asButton = attrs['as-button'];
  if (
    !spec ||
    'statuses' in spec ||
    spec.kind === 'hover' ||
    asButton === undefined ||
    asButton === null ||
    asButton === false
  ) {
    return undefined;
  }
  const { drawing, state } = toggleState(spec as IconSpec, attrs);
  if (drawing.kind === 'hover') {
    return undefined;
  }
  const s = engineSpec(drawing);
  return {
    pressed: String(s.pressed ? s.pressed(state) : state !== s.states[0]),
  };
}

/** The still an element draws with these attributes (only with `animated="false"`), if any. */
export function restStill(Ctor: IconClass, attrs: Attrs): Still | undefined {
  const spec = Ctor.spec;
  if (attrs.animated !== false && attrs.animated !== 'false') {
    return undefined;
  }
  if (!spec) {
    return undefined;
  }
  if ('kind' in spec && spec.kind === 'hover') {
    return spec.static;
  }
  if ('statuses' in spec) {
    const base = (spec as { base?: IconSpec }).base;
    const marked =
      (attrs.status !== undefined &&
        (spec.statuses as readonly string[]).includes(String(attrs.status))) ||
      (!!spec.count && Number(attrs.count ?? 0) > 0);
    return !marked && base?.kind === 'hover' ? base.static : undefined;
  }
  const { drawing, state } = toggleState(spec as IconSpec, attrs);
  if (drawing.kind === 'toggle') {
    return drawing.statics[state === drawing.states[1] ? 1 : 0];
  }
  if (drawing.kind === 'state') {
    return (drawing.statics as Record<string, Still>)[state];
  }
  return undefined;
}

/** The resting drawing an element with these attributes paints first. */
export function restShapes(Ctor: IconClass, attrs: Attrs) {
  const size = sizeOf(attrs);
  const spec = Ctor.spec;
  if (!spec) {
    // The status pip.
    return new PipEngine(() => undefined, size, {
      count: Number(attrs.count ?? 0),
      max: countMax(attrs.max),
      tone: attrs.tone as Tone | undefined,
    }).shapes();
  }
  if ('statuses' in spec) {
    return stillShapes(
      spec as StatusIconSpec,
      {
        status: attrs.status as string | undefined,
        count: attrs.count === undefined ? undefined : Number(attrs.count),
        max: countMax(attrs.max),
        countPlacement: attrs['count-placement'] as
          | 'overhang'
          | 'inside'
          | undefined,
        tone: on(attrs.tone),
      },
      size
    );
  }
  const { drawing, state } = toggleState(spec as IconSpec, attrs);
  return restShapesOf(drawing, size, state);
}

export function renderIconHTML(Ctor: IconClass, attrs: Attrs = {}): string {
  const size = sizeOf(attrs);
  // An accessible name of its own (as the element reads it): role="img"; none: hidden from assistive tech.
  const label = ['aria-label', 'aria-labelledby', 'title'].some(
    (k) => !!attrs[k]
  );
  const given = (k: string) =>
    attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== false;
  let host = '';
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) {
      continue;
    }
    if (!NAME.test(k)) {
      // Dropped in production too; only the warning is development-only.
      if (DEV) {
        console.warn(
          `[motion-icons] renderIconHTML: "${k}" isn't an attribute name; dropped.`
        );
      }
      continue;
    }
    host += v === true ? ` ${k}` : ` ${k}="${esc(String(v))}"`;
  }
  // The semantics the element gives itself on upgrade, where the author set none: an as-button toggle is a button.
  const button = buttonState(Ctor, attrs);
  const own: [string, string | null][] = button
    ? [
        ['role', 'button'],
        ['tabindex', given('disabled') ? null : '0'],
        ['aria-pressed', button.pressed],
        ['aria-disabled', given('disabled') ? 'true' : null],
      ]
    : [
        ['role', label ? 'img' : null],
        ['aria-hidden', label ? null : 'true'],
      ];
  for (const [k, v] of own) {
    if (v !== null && !given(k)) {
      host += ` ${k}="${v}"`;
    }
  }
  const still = restStill(Ctor, attrs);
  const svg = still
    ? stillSVG(still, size)
    : `<svg part="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false"><g data-mc-ink>${shapesMarkup(restShapes(Ctor, attrs))}</g></svg>`;
  return `<${Ctor.is}${host}><template shadowrootmode="open"><style>${iconStyles.cssText}</style>${svg}</template></${Ctor.is}>`;
}
