/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createElement, forwardRef } from 'react';
import {
  attrValue,
  pickDrawing,
  svgAttributes,
  type Attrs,
  type IconDescriptor,
  type IconNode,
} from './svg';

/** Props of a static Carbon icon: those of an `@carbon/icons-react` icon. */
export interface CarbonStaticIconProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  'ref' | 'tabIndex'
> {
  /** 16, 20, 24 or 32 (Carbon's artboards; any other size scales the 32 drawing). Default 16, as Carbon's. */
  size?: number | string;
  title?: string;
  tabIndex?: number | string;
}

export type CarbonStaticIcon = React.ForwardRefExoticComponent<
  CarbonStaticIconProps & React.RefAttributes<SVGSVGElement>
>;

// React's names ⇄ the DOM names svgAttributes speaks.
const TO_DOM: Record<string, string> = {
  className: 'class',
  tabIndex: 'tabindex',
};
const TO_REACT: Record<string, string> = {
  class: 'className',
  tabindex: 'tabIndex',
};

function renamed(attrs: Attrs, names: Record<string, string>): Attrs {
  const out: Attrs = {};
  for (const k in attrs) {
    out[names[k] ?? k] = attrs[k];
  }
  return out;
}

// Descriptor attributes are SVG's own (`fill-rule`, `clip-rule`, `stroke-width`): React wants them camelCased.
const reactName = (k: string) =>
  k.startsWith('data-') || k.startsWith('aria-')
    ? k
    : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function element(node: IconNode): React.ReactElement {
  const props: Attrs = {};
  for (const k in node.attrs) {
    props[reactName(k)] = attrValue(node.attrs[k]);
  }
  return createElement(node.elem, props, ...(node.content ?? []).map(element));
}

/**
 * A React component for one Carbon icon, from its `@carbon/icons`
 * descriptors: the 32 drawing plus any artboard Carbon draws separately
 * (e.g. `carbonIcon(warning16, warning32)`). It renders what the
 * `@carbon/icons-react` icon of the same name renders, attribute for
 * attribute, and takes the same props (`size`, `aria-label`, `title`,
 * `className`, `style`, `tabIndex`, handlers, children, a ref).
 */
/* @__NO_SIDE_EFFECTS__ */
export function carbonIcon(...drawings: IconDescriptor[]): CarbonStaticIcon {
  const Icon = forwardRef<SVGSVGElement, CarbonStaticIconProps>(
    function CarbonIcon({ children, size = 16, ...props }, ref) {
      const drawing = pickDrawing(drawings, size);
      const attrs = renamed(
        svgAttributes(drawing, size, renamed(props, TO_DOM)),
        TO_REACT
      );
      return createElement(
        'svg',
        { ...attrs, ref },
        ...(drawing.content ?? []).map(element),
        children
      );
    }
  );
  Icon.displayName = drawings[0]?.name;
  return Icon;
}
