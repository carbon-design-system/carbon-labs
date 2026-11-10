/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type AriaAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  attachRollover,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { OverflowMenuHorizontal } from '@carbon-labs/react-motion-icons';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { reflowKey, useListReflow } from '@carbon-labs/react-list-reflow';
import type { OverflowMenuProps } from '@carbon-labs/react-menu';
import './breadcrumb.scss';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Breadcrumb — Carbon v11's Breadcrumb and BreadcrumbItem, on the kit's link
 * rollover and the list reflow.
 * ============================================================================
 *
 * v11's props: Breadcrumb `aria-label` (default "Breadcrumb"), `noTrailingSlash`,
 * `size` (`sm` · `md`), `className` (on the nav); BreadcrumbItem `href`,
 * `isCurrentPage`, `aria-current`, a string, a link element or an
 * OverflowMenu as its child. A nav holding an ordered list; the current page
 * is `aria-current`.
 *
 * The kit adds:
 *
 *   links      the kit's link rollover (`@mixin rollover-link`, motion-core
 *              `attachRollover`): the glow in the letters, the press and the
 *              release circle; the underline fades in on hover, as v11's
 *   current    primary text, no rollover
 *   overflow   a BreadcrumbItem holding the kit's OverflowMenu: its trigger
 *              takes the horizontal overflow icon at the breadcrumb's size,
 *              and its menu opens on the kit's Menu (the snap, floating)
 *   trail      when the trail changes, it reflows as one change (the list
 *              reflow, `sequence`): a crumb that leaves fades out first
 *              (fast-01), then the crumbs that stay slide to their new places
 *              (duration by travel), then a new crumb snaps in (no fade),
 *              sliding from the trail's side; a trail that only loses crumbs
 *              plays together: the crumb fades out as the others close the gap
 *   slash      with `noTrailingSlash`, the last crumb's slash fades out, and
 *              a crumb that stops being last fades its slash in
 *   reduced    no slides: out (on the reduced clock), then in at once
 * ========================================================================== */

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** The nav's name. Default "Breadcrumb". */
  'aria-label'?: string;
  /** BreadcrumbItems. Keyed children reflow by key when the trail changes. */
  children?: ReactNode;
  /** On the nav (v11). */
  className?: string;
  /** No slash after the last crumb. */
  noTrailingSlash?: boolean;
  /** `md` (default, body-compact-01) or `sm` (label-01). */
  size?: 'sm' | 'md';
  /** Multiplies the reflow's durations (slow motion). Default 1. */
  timeScale?: number;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      'aria-label': ariaLabel,
      children,
      className,
      noTrailingSlash,
      size = 'md',
      timeScale = 1,
      ...rest
    },
    ref
  ) {
    const navRef = useRef<HTMLElement | null>(null);
    const setRef = useMemo(() => mergeRefs<HTMLElement>(navRef, ref), [ref]);
    const reduced = usePrefersReducedMotion();
    const rolloverReduced = useReducedGetter();

    // Each crumb, marked with its key for the reflow; the last one knows it is.
    const crumbs = Children.toArray(children).filter(
      isValidElement
    ) as ReactElement<BreadcrumbItemProps & Record<string, unknown>>[];
    const keys = crumbs.map((c, i) => String(c.key ?? i));
    const items = crumbs.map((c, i) =>
      cloneElement(c, {
        ...reflowKey(keys[i]!),
        'data-last': i === crumbs.length - 1 ? '' : undefined,
        'data-size': size,
        // Its slow motion, for a crumb's OverflowMenu, whether or not its caller passes it.
        'data-time-scale': timeScale,
      })
    );

    useListReflow(navRef, {
      key: keys.join('|'),
      mode: 'sequence',
      enterFrom: -1,
      // A crumb snaps in (the slide stays) and fades out quickly: items in a component, not a container (docs).
      enter: 'snap',
      exitToken: 'fast-01',
      timeScale,
      reduced,
      reason: 'breadcrumb',
    });

    // The link rollover on every crumb that is a link (not the current page).
    useEffect(() => {
      const el = navRef.current;
      if (!el) return;
      return attachRollover(el, {
        selector: '.cds-breadcrumb__link',
        timeScale,
        reduced: rolloverReduced,
      });
    }, [timeScale, rolloverReduced]);

    return (
      <nav
        {...rest}
        ref={setRef}
        aria-label={ariaLabel ?? 'Breadcrumb'}
        className={[
          'cds-breadcrumb',
          `cds-breadcrumb--${size}`,
          noTrailingSlash && 'cds-breadcrumb--no-trailing-slash',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        <ol className="cds-breadcrumb__list">{items}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export interface BreadcrumbItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  'aria-current'?: AriaAttributes['aria-current'];
  /** A string (a link with `href`, else text), a link element, or an OverflowMenu. */
  children?: ReactNode;
  className?: string;
  href?: string;
  /** The current page: primary text, `aria-current`. */
  isCurrentPage?: boolean;
}

const isOverflowMenu = (el: ReactElement) => {
  const t = el.type as { displayName?: string } | string;
  return typeof t !== 'string' && !!t?.displayName?.includes('OverflowMenu');
};

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem(
    {
      'aria-current': ariaCurrent,
      children,
      className,
      href,
      isCurrentPage,
      ...rest
    },
    ref
  ) {
    const {
      'data-size': size,
      'data-time-scale': timeScale,
      ...li
    } = rest as typeof rest & {
      'data-size'?: 'sm' | 'md';
      'data-time-scale'?: number;
    };
    const current = isCurrentPage || (!!ariaCurrent && ariaCurrent !== 'false');
    const classes = [
      'cds-breadcrumb__item',
      isCurrentPage &&
        ariaCurrent !== 'page' &&
        'cds-breadcrumb__item--current',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const sep = (
      <span className="cds-breadcrumb__sep" aria-hidden="true">
        /
      </span>
    );
    const child = isValidElement(children)
      ? (children as ReactElement<Record<string, unknown>>)
      : null;

    // An OverflowMenu: the collapsed crumbs, on the kit's Menu.
    if (child && isOverflowMenu(child)) {
      const p = child.props as Partial<OverflowMenuProps>;
      return (
        <li
          {...li}
          ref={ref}
          className={`${classes} cds-breadcrumb__item--overflow`}>
          {cloneElement(child, {
            renderIcon: p.renderIcon ?? OverflowMenuHorizontal,
            size: p.size ?? 'xs',
            menuSize: p.menuSize ?? (size === 'sm' ? 'sm' : 'md'),
            timeScale: p.timeScale ?? timeScale,
            className: ['cds-breadcrumb__overflow', p.className]
              .filter(Boolean)
              .join(' '),
          } as Partial<OverflowMenuProps>)}
          {sep}
        </li>
      );
    }

    const aria = (ariaCurrent ??
      (isCurrentPage ? true : undefined)) as AriaAttributes['aria-current'];
    let content: ReactNode;
    if (typeof children === 'string' || typeof children === 'number') {
      content = href ? (
        <a
          href={href}
          className={
            current ? 'cds-breadcrumb__current' : 'cds-breadcrumb__link'
          }
          aria-current={aria}>
          {children}
        </a>
      ) : (
        <span
          className={
            current ? 'cds-breadcrumb__current' : 'cds-breadcrumb__text'
          }
          aria-current={aria}>
          {children}
        </span>
      );
    } else if (child) {
      const own = (child.props.className as string | undefined) ?? '';
      content = cloneElement(child, {
        'aria-current': ariaCurrent,
        className: [
          current ? 'cds-breadcrumb__current' : 'cds-breadcrumb__link',
          own,
        ]
          .filter(Boolean)
          .join(' '),
      });
    } else content = children;

    return (
      <li {...li} ref={ref} className={classes}>
        {content}
        {sep}
      </li>
    );
  }
);
BreadcrumbItem.displayName = 'BreadcrumbItem';
