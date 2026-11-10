/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, type ButtonProps } from '@carbon-labs/react-button';
import { useKitDefaults, type KitFrame } from '@carbon-labs/react-kit-defaults';
import { Link, type LinkProps } from '@carbon-labs/react-link';
import { EmptyStateArt } from './illustrations';

import './empty-state.scss';

/* ============================================================================
 * EmptyState — what a region shows when it has nothing to show: first use,
 * no results, an error, no access.
 *
 * Carbon for IBM Products' EmptyState: `title` (required), `subtitle`,
 * `action` (the kit Button's props plus `text`), `link` (the kit Link's
 * props plus `text`), `size` (`sm` · `lg`), `illustrationPosition` (`top` ·
 * `end` · `bottom` · `start`), `illustration` (an image's src) with
 * `illustrationDescription`, and `headingAs`. No words of its own: the
 * region writes them. The kit adds:
 *
 *   kind      Products' presets as one prop: `error` · `no-data` · `no-tags`
 *             · `not-found` · `notifications` · `unauthorized`. A kind sets
 *             only the illustration: placeholder line drawings in the Full
 *             page error's isometric tiles (illustrations/), inline SVG in the
 *             theme's tokens, decorative. No kind: text only, or your own visual
 *   context   the region it sits in: `page` · `table` · `panel` · `tile`.
 *             Given none, it is what it sits on says (KitDefaults' `frame`,
 *             which a Region and the framed surfaces set): `panel` on a
 *             framed surface (a quiet or raised Region, a SidePanel's,
 *             Tearsheet's, Card's or Modal's body), else `page`; a table's
 *             place and a tile are given. It sets the default size and the
 *             alignment, by Carbon's
 *             empty-states pattern: start aligned everywhere; on a page and
 *             in a table's place, with a wide start margin (one column of
 *             the 2x Grid); compact in a panel or a tile, and in a tile the
 *             visual centred over the text
 *   icon      a still 32px icon (motion-icons) in place of the illustration
 *   look      the quiet look: no surface of its own; it sits in its region
 *   motion    none of its own: it is simply there. A swap to or from it is
 *             its region's content swap (out, then in), not this component's
 * ========================================================================== */

export const EmptyStateKinds = [
  'error',
  'no-data',
  'no-tags',
  'not-found',
  'notifications',
  'unauthorized',
] as const;
export type EmptyStateKind = (typeof EmptyStateKinds)[number];

export const EmptyStateContexts = ['page', 'table', 'panel', 'tile'] as const;
export type EmptyStateContext = (typeof EmptyStateContexts)[number];

export type EmptyStateSize = 'sm' | 'lg';
export type EmptyStateIllustrationPosition = 'top' | 'end' | 'bottom' | 'start';

/** The action button: the kit Button's props, with its label as `text`. */
export interface EmptyStateAction extends Omit<ButtonProps, 'children'> {
  text: ReactNode;
}

/** The link: the kit Link's props, with its label as `text`. */
export interface EmptyStateLink extends Omit<LinkProps, 'children'> {
  text: ReactNode;
}

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** The action under the text: the kit Button's props and its `text`. Its `variant` defaults to outlined (Products' tertiary); `variant="filled"` for a filled action. */
  action?: EmptyStateAction;
  className?: string;
  /** The region it sits in: sets the default size and the alignment. Default: what it sits on, `panel` on a framed surface (KitDefaults' `frame="ghost"`: a quiet or raised Region, a SidePanel, Tearsheet, Card or Modal), else `page`. */
  context?: EmptyStateContext;
  /** The heading element. Default `h2` on a page, `h3` elsewhere. */
  headingAs?: ElementType;
  /** A still 32px icon in place of the illustration: an icon component, as motion-icons'. */
  icon?: ElementType;
  /** Your own image's src, in place of the kind's illustration. Pass the one for the theme. */
  illustration?: string;
  /** The image's alt text. Default: none, as it's decorative. */
  illustrationDescription?: string;
  /** Where the visual sits beside the text; `start` and `end` mirror right to left. Default `top`. */
  illustrationPosition?: EmptyStateIllustrationPosition;
  /** Products' preset, as its illustration (placeholder line art in the theme's tokens). None: no illustration. */
  kind?: EmptyStateKind;
  /** A link after the action (documentation, a way out). The kit Link's props and its `text`. */
  link?: EmptyStateLink;
  /** `sm` (a panel, a tile) or `lg` (a page, a table): the illustration 64 or 80px, and the type. Default: the context's. */
  size?: EmptyStateSize;
  /** The text under the title: why it's empty, or what to do next. */
  subtitle?: ReactNode;
  /** Multiplies the action's and the link's rollover clock (a lab's slow motion). Default 1. */
  timeScale?: number;
  /** The title: short, and positive where it can be. Required: there are no default words. */
  title: ReactNode;
}

const CONTEXT_SIZE: Record<EmptyStateContext, EmptyStateSize> = {
  page: 'lg',
  table: 'lg',
  panel: 'sm',
  tile: 'sm',
};

/**
 * The context: its own if given, else what it sits on (the provider's
 * `frame`): a framed surface (`ghost`) is a panel, anything else the page.
 */
export function resolveEmptyStateContext(
  context: EmptyStateContext | undefined,
  kitFrame: KitFrame | undefined
): EmptyStateContext {
  return context ?? (kitFrame === 'ghost' ? 'panel' : 'page');
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      action,
      className,
      context: contextProp,
      headingAs,
      icon: Icon,
      illustration,
      illustrationDescription,
      illustrationPosition = 'top',
      kind,
      link,
      size,
      subtitle,
      timeScale = 1,
      title,
      ...rest
    },
    ref
  ) {
    const context = resolveEmptyStateContext(
      contextProp,
      useKitDefaults().frame
    );
    const s = size ?? CONTEXT_SIZE[context];
    const Heading: ElementType =
      headingAs ?? (context === 'page' ? 'h2' : 'h3');
    const alt = illustrationDescription ?? '';

    // Your own image, then an icon, then the kind's illustration (one inline
    // drawing, coloured by the theme's tokens).
    let visual: ReactNode = null;
    if (illustration) {
      visual = (
        <img
          className="cds-empty-state__illustration"
          src={illustration}
          alt={alt}
        />
      );
    } else if (Icon) {
      visual = <Icon size={32} animated={false} aria-hidden="true" />;
    } else if (kind) {
      visual = (
        <EmptyStateArt kind={kind} className="cds-empty-state__illustration" />
      );
    }

    return (
      <div
        {...rest}
        ref={ref}
        data-kind={kind}
        className={[
          'cds-empty-state',
          `cds-empty-state--${s}`,
          `cds-empty-state--${context}`,
          visual ? `cds-empty-state--${illustrationPosition}` : null,
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        <div className="cds-empty-state__block">
          {visual && <div className="cds-empty-state__visual">{visual}</div>}
          <div className="cds-empty-state__content">
            <Heading className="cds-empty-state__title">{title}</Heading>
            {subtitle != null &&
              (typeof subtitle === 'string' ? (
                <p className="cds-empty-state__subtitle">{subtitle}</p>
              ) : (
                <div className="cds-empty-state__subtitle">{subtitle}</div>
              ))}
            {(action || link) && (
              <div className="cds-empty-state__actions">
                {action && (
                  <EmptyStateButton
                    action={action}
                    size={s}
                    timeScale={timeScale}
                  />
                )}
                {link && (
                  <EmptyStateLinkPart
                    link={link}
                    size={s}
                    timeScale={timeScale}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

function EmptyStateButton({
  action,
  size,
  timeScale,
}: {
  action: EmptyStateAction;
  size: EmptyStateSize;
  timeScale: number;
}) {
  // Its own default treatment is outlined (Products' tertiary); kind and frame keep the kit's.
  const {
    text,
    variant = 'outlined',
    size: buttonSize,
    timeScale: own,
    ...props
  } = action;
  return (
    <Button
      {...props}
      variant={variant}
      size={buttonSize ?? (size === 'lg' ? 'md' : 'sm')}
      timeScale={own ?? timeScale}>
      {text}
    </Button>
  );
}

function EmptyStateLinkPart({
  link,
  size,
  timeScale,
}: {
  link: EmptyStateLink;
  size: EmptyStateSize;
  timeScale: number;
}) {
  const { text, size: linkSize, timeScale: own, ...props } = link;
  return (
    <Link
      {...props}
      size={linkSize ?? (size === 'lg' ? 'lg' : 'md')}
      timeScale={own ?? timeScale}>
      {text}
    </Link>
  );
}
