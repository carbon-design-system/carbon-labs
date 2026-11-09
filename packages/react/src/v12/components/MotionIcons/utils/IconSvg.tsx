/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { isNamed, type PassThrough } from './passThrough';

export interface IconSvgProps {
  size: number;
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  children?: React.ReactNode;
  /** The author's other props (passThrough): on the svg; an accessible name among them makes it an image. */
  attrs?: PassThrough;
}

/**
 * The root `<svg>` every icon renders: size, labelling, and `fill` as the
 * only paint attribute (see the ink rule in `utils/ink.ts`). Overflow is
 * visible so hover states that reach past the 32-unit frame (a lifting lid,
 * a lengthening line) aren't clipped; a caller's `style` can override it.
 * Pass the `useInk()` ref for a static icon, or `useHover()`'s ref for an
 * animated one.
 */
export const IconSvg = forwardRef<SVGSVGElement, IconSvgProps>(function IconSvg(
  {
    size,
    viewBox = '0 0 32 32',
    className,
    style,
    ariaLabel,
    onClick,
    children,
    attrs,
  },
  ref
) {
  // Named (aria-label, aria-labelledby or title): an image; otherwise hidden. An author's own role or aria-hidden wins.
  const named = isNamed(ariaLabel, attrs);
  // As @carbon/icons-react: a tab stop only on a named icon (then `focusable`).
  const { tabIndex, ...rest } = attrs ?? {};
  const focus =
    named && tabIndex !== undefined
      ? { tabIndex: Number(tabIndex), focusable: 'true' as const }
      : {};
  // The author's attributes first, ours after in their usual order (an icon given none renders as it always has).
  return (
    <svg
      {...rest}
      {...focus}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible', ...style }}
      aria-label={ariaLabel}
      role={
        (rest.role as string | undefined) ?? (named ? 'img' : 'presentation')
      }
      aria-hidden={
        (rest['aria-hidden'] as boolean | 'true' | 'false' | undefined) ??
        (named ? undefined : true)
      }
      onClick={onClick}
      fill={(rest.fill as string | undefined) ?? 'currentColor'}>
      {children}
    </svg>
  );
});
