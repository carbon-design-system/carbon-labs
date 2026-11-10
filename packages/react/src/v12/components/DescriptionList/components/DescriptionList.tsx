/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { CopyButton } from '@carbon-labs/react-copy-button';
import { SkeletonReveal, SkeletonText } from '@carbon-labs/react-feedback';
import './description-list.scss';

/* ============================================================================
 * DescriptionList: terms and their values for a details page.
 *
 *   columns   one, two, or by width: two from the medium size class
 *   values    any node, an InlineEdit included, its text lined up with the
 *             rest; copyable values take the kit's CopyButton
 *   loading   the terms drawn, each value a bar of its line that hands off
 *             to the value in place
 *   reduced   the hand-off is the skeleton's own
 *
 * API: new; terms and values are the HTML description list's.
 * ========================================================================== */

export type DescriptionListSize = 'sm' | 'md' | 'lg';
export type DescriptionListColumns = 1 | 2 | 'auto';
export type DescriptionListLayout = 'stacked' | 'inline';
export const DescriptionListSizes: readonly DescriptionListSize[] = [
  'sm',
  'md',
  'lg',
];

export interface DescriptionListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** sm, md or lg: the type and the space between pairs. Default md. */
  size?: DescriptionListSize;
  /** One, two, or auto: two from the medium size class. Default auto. */
  columns?: DescriptionListColumns;
  /** The term above its value, or beside it. Default stacked. */
  layout?: DescriptionListLayout;
  /** The values are loading: a bar where each will be. */
  loading?: boolean;
  /** The list's name for assistive technology. */
  'aria-label'?: string;
  children?: ReactNode;
}

export interface DescriptionListItemProps {
  /** The term. */
  term: ReactNode;
  /** The value: text or any node. */
  children?: ReactNode;
  /** A copy button beside the value. */
  copyable?: boolean;
  /** What the copy button copies. Default the value's text. */
  copyText?: string;
  /** The copy button's words. Default "Copy" and the term. */
  copyLabel?: string;
  /** Across every column. */
  span?: boolean;
  /** The loading bar's width. Default 60%. */
  skeletonWidth?: string;
  className?: string;
}

const ListContext = createContext<{ loading: boolean }>({ loading: false });

export function DescriptionList({
  size = 'md',
  columns = 'auto',
  layout = 'stacked',
  loading = false,
  className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: DescriptionListProps) {
  return (
    <div
      {...rest}
      className={[
        'cds-description-list',
        `cds-description-list--${size}`,
        `cds-description-list--${layout}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-columns={columns}
      aria-busy={loading || undefined}>
      <dl className="cds-description-list__items" aria-label={ariaLabel}>
        <ListContext.Provider value={{ loading }}>
          {children}
        </ListContext.Provider>
      </dl>
    </div>
  );
}
DescriptionList.displayName = 'DescriptionList';

/** What a reader sees as the value: its text, without its controls' labels or live-region words. */
const NOT_VALUE =
  'button, input, textarea, select, [role="status"], [role="alert"], [aria-live], [aria-hidden="true"]';
function valueText(el: HTMLElement | null): string {
  if (!el) return '';
  const copy = el.cloneNode(true) as HTMLElement;
  copy.querySelectorAll(NOT_VALUE).forEach((n) => n.remove());
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function DescriptionListItem({
  term,
  children,
  copyable = false,
  copyText,
  copyLabel,
  span = false,
  skeletonWidth = '60%',
  className,
}: DescriptionListItemProps) {
  const { loading } = useContext(ListContext);
  const valueRef = useRef<HTMLDivElement>(null);
  const copy = () => {
    const text = copyText ?? valueText(valueRef.current);
    void navigator.clipboard?.writeText(text).catch(() => {});
  };
  return (
    <div
      className={[
        'cds-description-list__item',
        span && 'cds-description-list__item--span',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      <dt className="cds-description-list__term">{term}</dt>
      <dd className="cds-description-list__value">
        <SkeletonReveal
          loading={loading}
          className="cds-description-list__reveal"
          skeleton={
            <SkeletonText lineHeight="var(--dl-lh)" width={skeletonWidth} />
          }>
          <div className="cds-description-list__content">
            <div ref={valueRef} className="cds-description-list__text">
              {children}
            </div>
            {copyable && (
              <span className="cds-description-list__copy">
                <CopyButton
                  size="xs"
                  iconDescription={
                    copyLabel ??
                    (typeof term === 'string'
                      ? `Copy ${term.toLowerCase()}`
                      : 'Copy')
                  }
                  onClick={copy}
                />
              </span>
            )}
          </div>
        </SkeletonReveal>
      </dd>
    </div>
  );
}
DescriptionListItem.displayName = 'DescriptionListItem';
