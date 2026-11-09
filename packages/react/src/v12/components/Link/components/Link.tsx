/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useContext,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { iconSizeFor } from '@carbon-labs/react-props';
import './link.scss';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Link — Carbon v11's Link on the kit's look and motion.
 * ============================================================================
 *
 * v11's API, prop for prop (`@carbon/react` Link): `as`, `children`,
 * `className`, `disabled`, `href`, `inline`, `renderIcon`, `size` (sm · md ·
 * lg), `target`, `visited`, the ref. v11's markup and a11y: an `<a>` (or
 * `as`); `rel="noopener"` with `target="_blank"`; disabled drops the `href`
 * and takes `role="link"` + `aria-disabled`, and its clicks do nothing; the
 * icon only on a standalone link, after the text.
 *
 * The kit's look and motion:
 *
 *   hover     the rollover's text standard (`@mixin rollover-link`): a glow
 *             painted into the letters under the pointer, the text dimming
 *             toward the background (fast-02 in, fast-01 out), by matched
 *             lightness in the link blue's own hue
 *   press     dimmer still, flat; nothing moves or scales
 *   release   the default circle, through the letters
 *   underline standalone: fades in on hover; inline: always (a real text
 *             decoration, painted through the letters with them)
 *   visited   `visited` + `:visited`: the rest is `link-visited`; on hover
 *             the link takes the link blue's rollover (v11 hovers a visited
 *             link in the hover blue too)
 *   focus     the family's keyboard ring: 2px in the link's own colour,
 *             2px outside the text
 *   icon      a motion icon plays on the link's hover or focus
 *             (`data-motion-icon-frame`); it dims with the text, flatly
 *   reduced   the press still shows; the release and the hover's return
 *             take 1ms
 * ========================================================================== */

export const LinkSizes = ['sm', 'md', 'lg'] as const;
export type LinkSize = (typeof LinkSizes)[number];

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the root as this element or component (v11). */
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  /** No `href`, `role="link"` and `aria-disabled`; clicks do nothing (v11). */
  disabled?: boolean;
  href?: string;
  /** A link inside a sentence: underlined, no icon (v11). */
  inline?: boolean;
  /** An icon after the text, on a standalone link (v11). A motion icon plays on hover. */
  renderIcon?: ElementType;
  /** v11's sizes: sm (helper-text-01), md (body-compact-01, default), lg (body-compact-02). */
  size?: LinkSize;
  target?: string;
  /** Show the visited colour once the browser has the link as visited (v11). */
  visited?: boolean;
  /** Multiplies the release circle's clock (slow motion). Default 1. */
  timeScale?: number;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    as,
    children,
    className,
    disabled = false,
    href,
    inline = false,
    renderIcon: Icon,
    size,
    target,
    visited = false,
    timeScale = 1,
    onClick,
    ...rest
  },
  ref
) {
  const elRef = useRef<HTMLElement | null>(null);
  const rolloverReduced = useReducedGetter(
    useContext(TooltipMotionContext).reduced
  );
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      elRef.current = el;
      if (typeof ref === 'function') ref(el as HTMLAnchorElement | null);
      else if (ref) ref.current = el as HTMLAnchorElement | null;
    },
    [ref]
  );

  // The rollover in the letters: glow, flat press, release circle.
  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled) return;
    const detach = attachRollover(el, {
      selector: '.cds-link',
      timeScale,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      el.style.removeProperty('--cds-motion-rollover-hover-color');
      el.style.removeProperty('--cds-motion-rollover-press-color');
      el.style.removeProperty('--cds-motion-rollover-color');
    };
  }, [disabled, timeScale, inline, visited, rolloverReduced]);

  const showIcon = Boolean(Icon) && !inline;
  const classes = [
    'cds-link',
    disabled && 'cds-link--disabled',
    inline && 'cds-link--inline',
    visited && 'cds-link--visited',
    size && `cds-link--${size}`,
    showIcon && 'cds-link--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    } else onClick?.(event);
  };

  const Root: ElementType = as ?? 'a';
  return (
    <Root
      ref={setRef}
      className={classes}
      rel={target === '_blank' ? 'noopener' : undefined}
      target={target}
      {...(disabled ? { role: 'link', 'aria-disabled': true } : { href })}
      {...(showIcon ? { 'data-motion-icon-frame': '' } : null)}
      {...rest}
      onClick={handleClick}>
      {children}
      {showIcon && Icon ? (
        <span className="cds-link__icon">
          <Icon size={iconSizeFor(size ?? 'md')} aria-hidden="true" />
        </span>
      ) : null}
    </Root>
  );
});
Link.displayName = 'Link';
