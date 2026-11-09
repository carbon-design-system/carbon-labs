/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The props an icon passes through to what it renders, as @carbon/icons-react
 * does: everything that isn't one of the package's own props (`id`,
 * `title`, `aria-labelledby`, `aria-describedby`, `data-*`, `tabIndex`,
 * handlers, …). They go on the `<svg>`, or on the button with `asButton`.
 */
const OWN = new Set([
  'ref',
  'children',
  'size',
  'animated',
  'className',
  'style',
  'aria-label',
  'onClick',
  'value',
  'onChange',
  'toggled',
  'onToggle',
  'initial',
  'asButton',
  'disableToggle',
  'disabled',
  'filled',
  'variant',
  'muted',
  'status',
  'tone',
  'count',
  'max',
  'countPlacement',
  'actionKey',
  'actionOn',
  'loop',
  'actionThen',
  'press',
  'track',
  'action',
  // The adapters' own (inner components).
  'svgRef',
  'still',
  'attrs',
  'ownControl',
]);

export type PassThrough = Record<string, unknown>;

export function passThrough(props: object): PassThrough {
  const out: PassThrough = {};
  for (const [k, v] of Object.entries(props)) {
    if (!OWN.has(k) && v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * The `aria-label` for Carbon's art (the stills), which names an icon only by
 * `aria-label` or `aria-labelledby`, as @carbon/icons-react: a `title` alone
 * becomes its label, so the still is named as the animated icon is.
 */
export const stillLabel = (
  ariaLabel: string | undefined,
  attrs: PassThrough
): string | undefined =>
  ariaLabel ??
  (attrs['aria-labelledby'] ? undefined : (attrs.title as string | undefined));

/** Whether the props name the element (`aria-label`, `aria-labelledby` or `title`): it is then an image, not hidden. */
export const isNamed = (ariaLabel: unknown, attrs?: PassThrough): boolean =>
  !!(ariaLabel || attrs?.['aria-labelledby'] || attrs?.title);
