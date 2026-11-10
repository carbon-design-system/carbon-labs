/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
} from 'react';
import {
  playContentSwap,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { User } from '@carbon-labs/react-motion-icons';
import { Tooltip } from '@carbon-labs/react-tooltip';
import type {
  TooltipAlign,
  TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import './user-avatar.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * UserAvatar — Carbon for IBM Products' UserAvatar, prop for prop, on the
 * kit's look and motion.
 *
 *   look      a circle in one of twelve colors, the person's initials in it
 *             (the first and last name's, or a single name's first two
 *             letters), or their image, or an icon (`renderIcon`, else the
 *             User icon). sm 24 / md 32 / lg 40 / xl 48px. The colors follow
 *             the Carbon theme it sits in (light on white, dark on
 *             g100); `theme` names one outright
 *   static    nothing about it moves on its own: no hover, no press. It
 *             isn't a control
 *   tooltip   `tooltipText`: the avatar is a tooltip trigger (a button, so
 *             the keyboard reaches it) and the kit's Tooltip names it. It
 *             snaps in from the pointer; in a run of avatars only the first
 *             tooltip snaps, the next ones blink on and off (stillness)
 *   image     the initials (or the icon) show until the image loads, then
 *             swap to it: the content swap, out then in, never overlapping
 *             (the initials leave up, the image comes up from below,
 *             clipped by the circle). An image already loaded when the
 *             avatar first paints is simply there. A broken image keeps the
 *             initials
 *   reduced   the swap is a snap
 *
 * Carbon for IBM Products' props: `name`, `image`, `imageDescription`,
 * `renderIcon`, `size`, `backgroundColor`, `theme`, `tooltipText`,
 * `tooltipAlignment`, `className`. The kit adds `timeScale`.
 * ========================================================================== */

export type UserAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type UserAvatarBackgroundColor =
  | 'order-1-cyan'
  | 'order-2-gray'
  | 'order-3-green'
  | 'order-4-magenta'
  | 'order-5-purple'
  | 'order-6-teal'
  | 'order-7-cyan'
  | 'order-8-gray'
  | 'order-9-green'
  | 'order-10-magenta'
  | 'order-11-purple'
  | 'order-12-teal';

const ICON_SIZE: Record<UserAvatarSize, 16 | 20 | 24> = {
  sm: 16,
  md: 16,
  lg: 20,
  xl: 24,
};

/** The initials: a first and last name's first letters, or a single name's first two. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const first = [...parts[0]!];
  if (parts.length === 1) return first.slice(0, 2).join('').toUpperCase();
  const last = [...parts.at(-1)!];
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export interface UserAvatarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** The person's name: their initials show, and it names the avatar. */
  name?: string;
  /** An image of them (a URL). Shown once it has loaded. */
  image?: string;
  /** The image's description (its `alt`). Default the name. */
  imageDescription?: string;
  /** An icon in place of the initials. Default, with no name, the User icon. */
  renderIcon?: ElementType;
  /** sm 24, md 32 (default), lg 40, xl 48px. */
  size?: UserAvatarSize;
  /** One of the twelve colors. Default `order-1-cyan`. */
  backgroundColor?: UserAvatarBackgroundColor;
  /** The colors for a light or dark page. Default: the Carbon theme it sits in. */
  theme?: 'light' | 'dark';
  /** A tooltip naming the avatar; it becomes a tooltip trigger. */
  tooltipText?: string;
  /** Where the tooltip sits (v11's tooltip alignments). Default `bottom`. */
  tooltipAlignment?: TooltipAlign | TooltipAlignDeprecated;
  /** Slow motion for the image swap. Default 1. */
  timeScale?: number;
}

export function UserAvatar({
  name,
  image,
  imageDescription,
  renderIcon: Icon,
  size = 'md',
  backgroundColor = 'order-1-cyan',
  theme,
  tooltipText,
  tooltipAlignment = 'bottom',
  timeScale = 1,
  className,
  ...rest
}: UserAvatarProps) {
  const reduced = usePrefersReducedMotion();
  const fallbackRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Which image is showing (its URL), once it has loaded.
  const [shown, setShown] = useState<string | null>(null);
  const showing = !!image && shown === image;

  // An image already there on the first paint (cached) is simply there; a
  // new image starts from the fallback again.
  const painted = useRef(false);
  useLayoutEffect(() => {
    // A new image: the fallback is back until it loads (the last swap held it out).
    fallbackRef.current?.getAnimations().forEach((a) => a.cancel());
    const img = imgRef.current;
    if (image && img?.complete && img.naturalWidth > 0 && !painted.current)
      setShown(image);
    painted.current = true;
  }, [image]);

  const onLoad = () => {
    const img = imgRef.current;
    if (!image || !img || shown === image) return;
    if (!painted.current) {
      setShown(image);
      return;
    }
    // Out, then in: the initials leave, then the image comes in, clipped by the circle.
    playContentSwap({
      out: fallbackRef.current,
      in: img,
      axis: 'y',
      direction: 1,
      timeScale,
      reduced,
    });
    setShown(image);
  };

  const initials = name ? initialsOf(name) : '';
  const label = imageDescription ?? name;
  const fallback = Icon ? (
    <Icon size={ICON_SIZE[size]} aria-hidden="true" />
  ) : initials ? (
    <span className="cds-avatar__initials">{initials}</span>
  ) : (
    <User size={ICON_SIZE[size]} aria-hidden="true" />
  );

  const avatar = (
    <span
      {...(tooltipText ? null : rest)}
      role={tooltipText ? undefined : 'img'}
      aria-label={tooltipText ? undefined : (label ?? 'User')}
      aria-hidden={tooltipText ? true : undefined}
      className={cx(
        'cds-avatar',
        `cds-avatar--${size}`,
        `cds-avatar--${backgroundColor}`,
        theme && `cds-avatar--${theme}`,
        showing && 'cds-avatar--image',
        !tooltipText && className
      )}>
      <span
        ref={fallbackRef}
        className="cds-avatar__fallback"
        aria-hidden="true">
        {fallback}
      </span>
      {image && (
        <img
          // A new image is a new element: it loads, then swaps in.
          key={image}
          ref={imgRef}
          className="cds-avatar__image"
          src={image}
          alt=""
          aria-hidden="true"
          draggable={false}
          onLoad={onLoad}
        />
      )}
    </span>
  );

  if (!tooltipText) return avatar;
  return (
    <Tooltip
      align={tooltipAlignment}
      label={tooltipText}
      className={cx('cds-avatar-tooltip', className)}>
      <button
        type="button"
        className="cds-avatar__trigger"
        {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        {avatar}
      </button>
    </Tooltip>
  );
}
UserAvatar.displayName = 'UserAvatar';
