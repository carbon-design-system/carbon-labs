/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Close } from '@carbon-labs/react-motion-icons';
import {
  IconButton,
  mergeRefs,
  type TooltipAlign,
} from '@carbon-labs/react-tooltip';
import { TAG_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { Tag, type TagProps } from './Tag';
import './tag.scss';

/* ============================================================================
 * DismissibleTag — Carbon v11's DismissibleTag: a tag the person can remove
 * (a filter in use, a chosen item), on the kit's Tag.
 *
 *   look      the Tag's: its fills, sizes and `corners`; the text in from the
 *             start as the Tag's, the close's glyph as far in from the end
 *             (a trailing control sits on the inset, as a field's clear
 *             button does). It hovers and
 *             presses as a circle on its glyph, the tag's height across,
 *             whatever the tag's corners
 *   close     the family's ghost IconButton with a motion-icons Close: the
 *             rollover on hover and press, its tooltip and accessible name
 *             v11's `title` ("Dismiss"; `dismissTooltipLabel`, "Dismiss
 *             tag", when the text is cut short). The tag is the Close's
 *             frame (`data-motion-icon-frame`): hovering anywhere on it plays
 *             the icon. The icon is in the tag's own ink
 *   keyboard  the close is the tab stop (v11). Enter or Space on it, or
 *             Delete or Backspace (v11's MultiSelect tags'), dismisses; focus
 *             then moves to the next dismissible tag beside it, or the
 *             previous one if it was the last
 *   focus     the neutral ring (no v11 blue): 2px in the tag's ink, inside
 *             the close
 *   disabled  the disabled tag (`$layer-02`, `$text-disabled`), the close
 *             disabled, no tooltip
 *   motion    a tag appearing in UI already on screen snaps in as the Tag
 *             does (`arrive`). In a TagSet, a dismissed tag leaves as one
 *             motion: it snaps out while the tags after it close the gap,
 *             on the clock of their travel (tag-set/TagSet.tsx)
 *
 * v11's props: `text`, `onClose`, `title` (the close's label, default
 * "Dismiss"), `dismissTooltipLabel` ("Dismiss tag"),
 * `dismissTooltipAlignment` (`bottom`), `size`, `type`, `disabled`,
 * `renderIcon`, `tagTitle` (the text's `title`, default the text),
 * `decorator`, `id`, `className`. The kit adds the Tag's `corners`,
 * `arrive`, `show` and `timeScale`.
 * ========================================================================== */

/** The props the DismissibleTag takes from the Tag (v11's `title` is the close's label). */
type FromTag = Omit<TagProps, 'children' | 'title' | 'onClose'>;

export interface DismissibleTagProps extends FromTag {
  /** The tag's text. */
  text?: ReactNode;
  /**
   * Called when the person dismisses the tag: the close pressed, or Delete
   * or Backspace on it. The host removes it. (A method, so a v11 handler
   * typed for the click alone still fits.)
   */
  onClose?(
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ): void;
  /** The close button's label and tooltip (v11). Default "Dismiss". */
  title?: string;
  /** The close's label and tooltip when the text is cut short (v11). Default "Dismiss tag". */
  dismissTooltipLabel?: string;
  /** Where the close's tooltip opens (v11). Default `bottom`. */
  dismissTooltipAlignment?: TooltipAlign;
  disabled?: boolean;
  /** An icon before the text (v11's `renderIcon`): 16px. */
  renderIcon?: ElementType;
  /** The text's `title` (v11). Default the text, when it's a string. */
  tagTitle?: string;
  /** A decorator after the text (v11's experimental `decorator`, an AI label). */
  decorator?: ReactNode;
}

/** A tag the person can remove: v11's DismissibleTag. */
export const DismissibleTag = forwardRef<HTMLSpanElement, DismissibleTagProps>(
  function DismissibleTag(
    {
      text,
      onClose,
      title = 'Dismiss',
      dismissTooltipLabel = 'Dismiss tag',
      dismissTooltipAlignment = 'bottom',
      disabled = false,
      renderIcon: Icon,
      tagTitle,
      decorator,
      size: sizeProp,
      corners: cornersProp,
      timeScale,
      className,
      ...rest
    },
    ref
  ) {
    // KitDefaults: the provider's size and corners, as the Tag reads them; the
    // close is sized from them.
    const { size = 'md', corners = 'full' } = useKitProps(
      { size: sizeProp, corners: cornersProp },
      TAG_KIT
    );
    const el = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const textId = `cds-dismissible-tag-${useId().replace(/:/g, '')}`;

    // v11: the close says "Dismiss tag" when the text is cut short.
    const [cut, setCut] = useState(false);
    useLayoutEffect(() => {
      const l = labelRef.current;
      if (l) setCut(l.scrollWidth > l.clientWidth + 0.5);
    }, [text, size]);
    const label = cut ? dismissTooltipLabel : title;

    const dismiss = (
      e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
    ) => {
      if (disabled || !onClose) return;
      e.stopPropagation();
      const tag = el.current;
      const group = tag?.parentElement;
      const hadFocus = !!tag && tag.contains(document.activeElement);
      const before = group ? closesIn(group) : [];
      const at = before.findIndex((b) => tag?.contains(b));
      onClose(e);
      // Focus to the tag now in its place (the next), or the one before it if
      // it was the last, once the host has removed it.
      if (!hadFocus || !group || at < 0) return;
      requestAnimationFrame(() => {
        if (tag?.isConnected && tag.contains(document.activeElement)) return;
        const after = closesIn(group);
        if (!after.length) return;
        const next = after[Math.min(at, after.length - 1)];
        next?.focus();
      });
    };

    return (
      <Tag
        {...rest}
        ref={mergeRefs(el, ref)}
        size={size}
        corners={corners}
        timeScale={timeScale}
        data-motion-icon-frame=""
        className={[
          'cds-dismissible-tag',
          disabled && 'cds-dismissible-tag--disabled',
          Icon && 'cds-dismissible-tag--icon',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {Icon && (
          <span className="cds-dismissible-tag__icon" aria-hidden="true">
            <Icon
              size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16}
              animated={false}
            />
          </span>
        )}
        <span
          ref={labelRef}
          id={textId}
          className="cds-dismissible-tag__text"
          title={tagTitle ?? (typeof text === 'string' ? text : undefined)}>
          {text}
        </span>
        {decorator && (
          <span className="cds-dismissible-tag__decorator">{decorator}</span>
        )}
        <IconButton
          frame="ghost"
          size="xs"
          corners="full"
          align={dismissTooltipAlignment}
          label={label}
          className="cds-dismissible-tag__close"
          iconFrame={false}
          disabled={disabled}
          timeScale={timeScale}
          aria-describedby={textId}
          onClick={(e) => dismiss(e as MouseEvent<HTMLButtonElement>)}
          onKeyDown={(e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              dismiss(e as KeyboardEvent<HTMLButtonElement>);
            }
          }}>
          <Close size={16} aria-hidden="true" />
        </IconButton>
      </Tag>
    );
  }
);
DismissibleTag.displayName = 'DismissibleTag';

/** The dismissible tags' closes in a group, as they stand (copies left by a reflow aside). */
function closesIn(group: Element): HTMLButtonElement[] {
  return Array.from(
    group.querySelectorAll<HTMLButtonElement>(
      ':scope > .cds-dismissible-tag:not([inert]) .cds-dismissible-tag__close:not(:disabled)'
    )
  );
}
