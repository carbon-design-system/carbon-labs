/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Loading, Tooltip, usePrefix } from '@carbon/react';
import { MegaButton } from '@carbon-labs/react-mega-button';
import {
  CheckmarkFilled,
  Close,
  Csv,
  Doc,
  Document,
  ErrorFilled,
  Image,
  Json,
  Pdf,
  Ppt,
  Txt,
  Video,
  VideoFilled,
  Xls,
  Zip,
} from '@carbon/icons-react';

export const fileChipKinds = ['file', 'image', 'video'] as const;

export type FileChipKind = (typeof fileChipKinds)[number];

export const fileChipStatuses = [
  'idle',
  'uploading',
  'error',
  'complete',
] as const;

export type FileChipStatus = (typeof fileChipStatuses)[number];

export interface FileChipStatusDescriptions {
  uploading?: string;
  error?: string;
  complete?: string;
}

const defaultStatusDescriptions: Required<FileChipStatusDescriptions> = {
  uploading: 'Uploading',
  error: 'Upload failed',
  complete: 'Uploaded',
};

// Carbon's text glyphs, by extension. Anything else falls back to Document,
// and `renderIcon` overrides the map.
const iconsByExtension: Record<string, ElementType> = {
  pdf: Pdf,
  doc: Doc,
  docx: Doc,
  txt: Txt,
  csv: Csv,
  zip: Zip,
  xls: Xls,
  xlsx: Xls,
  ppt: Ppt,
  pptx: Ppt,
  json: Json,
};

// How many characters before the extension stay visible when a long name is
// cut in the middle, so "report-final-2026.pdf" keeps "2026.pdf".
const tailLength = 4;

/**
 * Splits a file name for middle truncation: the start shrinks with an
 * ellipsis, the end (the last few characters and the extension) never does.
 *
 * @param {string} name The full file name.
 * @returns {[string, string]} The start and the end.
 */
export function splitFileName(name: string): [string, string] {
  const dot = name.lastIndexOf('.');
  const extensionAt = dot > 0 ? dot : name.length;
  const endAt = Math.max(0, extensionAt - tailLength);
  return [name.slice(0, endAt), name.slice(endAt)];
}

/**
 * The kind a MIME type implies: an image or a video gets a thumbnail, and
 * everything else is a file.
 *
 * @param {string} [mimeType] The file's MIME type.
 * @returns {FileChipKind} The kind.
 */
export function kindFromMimeType(mimeType?: string): FileChipKind {
  if (mimeType?.startsWith('image/')) {
    return 'image';
  }
  if (mimeType?.startsWith('video/')) {
    return 'video';
  }
  return 'file';
}

function iconForName(name: string): ElementType {
  const dot = name.lastIndexOf('.');
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
  return iconsByExtension[extension] ?? Document;
}

function prefersReducedMotion(): boolean {
  // jsdom has no matchMedia: treat it as reduced, so nothing waits on an
  // animation that will never run.
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface FileChipProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * A second line under the name, for something other than an error (a
   * size, say). An error's message always takes this line.
   */
  description?: ReactNode;

  /**
   * Why the upload failed. Shown on the second line when `status` is
   * `error`; a failure is never explained by colour or an icon alone.
   */
  errorMessage?: ReactNode;

  /**
   * `file` shows a file-type glyph; `image` and `video` show a thumbnail.
   * Defaults to what `mimeType` implies.
   */
  kind?: FileChipKind;

  /**
   * The file's MIME type, used to choose the kind when `kind` is not set.
   */
  mimeType?: string;

  /**
   * The full file name. It is always the chip's accessible name, even when a
   * thumbnail-only chip does not show it.
   */
  name: string;

  /**
   * Called when the person removes the file. The chip plays its exit first
   * (none under reduced motion); moving focus afterwards is the parent's job.
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Called when the `complete` check has finished fading and the chip has
   * settled back to idle.
   */
  onSuccessEnd?: () => void;

  /**
   * The Remove button's label and tooltip. Defaults to "Remove <name>", so
   * the full name is reachable even when it is truncated.
   */
  removeLabel?: string;

  /**
   * A file-type icon from `@carbon/icons-react`, in place of the one the
   * extension chooses. Only a `file` chip shows it.
   */
  renderIcon?: ElementType;

  /**
   * Show the name beside an image or video thumbnail. A `file` chip, and any
   * chip in error, always shows it.
   */
  showName?: boolean;

  /**
   * The upload state. `complete` is momentary: the check holds for
   * `successDelay`, fades, and the chip returns to idle.
   */
  status?: FileChipStatus;

  /**
   * How long the pointer rests on a truncated name before its tooltip shows
   * the full name, in milliseconds. A long hover, so the tooltip never fires
   * while the pointer crosses a row of chips.
   */
  nameTooltipDelay?: number;

  /**
   * What each status icon announces, for translation.
   */
  statusDescriptions?: FileChipStatusDescriptions;

  /**
   * How long the `complete` check holds before it fades, in milliseconds.
   * The same default as Carbon's InlineLoading. `Infinity` holds it.
   */
  successDelay?: number;

  /**
   * The preview for an `image` or `video` chip. Without it the chip shows the
   * kind's glyph in the thumbnail's place.
   */
  thumbnailSrc?: string;
}

export const FileChip = forwardRef<HTMLDivElement, FileChipProps>(
  function FileChip(
    {
      className,
      description,
      errorMessage,
      kind: kindProp,
      mimeType,
      name,
      nameTooltipDelay = 1000,
      onRemove,
      onSuccessEnd,
      removeLabel,
      renderIcon,
      showName = false,
      status = 'idle',
      statusDescriptions,
      successDelay = 1500,
      thumbnailSrc,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--file-chip`;
    const kind = kindProp ?? kindFromMimeType(mimeType);
    const isMedia = kind !== 'file';
    const isError = status === 'error';
    const descriptions = {
      ...defaultStatusDescriptions,
      ...statusDescriptions,
    };

    // `complete` shows its check, holds, fades, and then the chip is idle.
    const [successPhase, setSuccessPhase] = useState<
      'showing' | 'fading' | 'done'
    >('showing');
    const [isLeaving, setIsLeaving] = useState(false);

    // The full-name tooltip exists only while the name is actually cut, so a
    // name that fits never grows a second copy of itself on hover.
    const textRef = useRef<HTMLSpanElement | null>(null);
    const [isTruncated, setIsTruncated] = useState(false);
    useEffect(() => {
      const text = textRef.current;
      if (!text) {
        setIsTruncated(false);
        return undefined;
      }
      // Wrapping the name in the Tooltip re-mounts it, so the stable text
      // block is observed and the live name is queried on every measure; a
      // reference held across the wrap would measure a detached node as 0.
      const measure = () => {
        const start = text.querySelector<HTMLElement>(
          `.${prefix}--file-chip__name-start`
        );
        setIsTruncated(Boolean(start && start.scrollWidth > start.clientWidth));
      };
      measure();
      if (typeof ResizeObserver === 'undefined') {
        return undefined;
      }
      const observer = new ResizeObserver(measure);
      observer.observe(text);
      return () => observer.disconnect();
    }, [name, prefix, isMedia, isError, showName]);
    const pendingRemove = useRef<MouseEvent<HTMLButtonElement> | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    function setRefs(node: HTMLDivElement | null) {
      rootRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }
    const onSuccessEndRef = useRef(onSuccessEnd);
    onSuccessEndRef.current = onSuccessEnd;

    useEffect(() => {
      setSuccessPhase('showing');
      // An infinite delay holds the check; setTimeout would overflow and fire
      // at once past 2^31 - 1 ms.
      if (status !== 'complete' || !Number.isFinite(successDelay)) {
        return undefined;
      }
      const timer = setTimeout(() => {
        if (prefersReducedMotion()) {
          setSuccessPhase('done');
          onSuccessEndRef.current?.();
        } else {
          setSuccessPhase('fading');
        }
      }, successDelay);
      return () => clearTimeout(timer);
    }, [status, successDelay]);

    function handleStatusAnimationEnd() {
      if (successPhase === 'fading') {
        setSuccessPhase('done');
        onSuccessEndRef.current?.();
      }
    }

    function handleRemove(event: MouseEvent<HTMLButtonElement>) {
      if (prefersReducedMotion()) {
        onRemove?.(event);
        return;
      }
      pendingRemove.current = event;
      setIsLeaving(true);
    }

    // Called once, by whichever comes first: the exit's animationend, or a
    // timer for the exit's own computed duration (a background tab never
    // runs the animation, and the removal must not hang on it).
    function finishRemove() {
      const removeEvent = pendingRemove.current;
      pendingRemove.current = null;
      if (removeEvent) {
        onRemove?.(removeEvent);
      }
    }

    useEffect(() => {
      if (!isLeaving || !rootRef.current) {
        return undefined;
      }
      const duration =
        parseFloat(getComputedStyle(rootRef.current).animationDuration) * 1000;
      const timer = setTimeout(finishRemove, duration || 0);
      return () => clearTimeout(timer);
      // finishRemove reads refs only; the timer starts once per exit.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLeaving]);

    function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
      // Only the chip's own exit, not the status icon's fade bubbling up.
      if (event.target === event.currentTarget && isLeaving) {
        finishRemove();
      }
    }

    const nameShown = !isMedia || showName || isError;
    const secondLine = isError ? errorMessage : description;
    const [nameStart, nameEnd] = splitFileName(name);
    const FileIcon = renderIcon ?? iconForName(name);
    const PlaceholderIcon = kind === 'video' ? Video : Image;
    const nameNode = (
      <span className={`${block}__name`}>
        <span className={`${block}__name-start`}>{nameStart}</span>
        <span className={`${block}__name-end`}>{nameEnd}</span>
      </span>
    );

    let statusNode: ReactNode = null;
    if (status === 'uploading') {
      statusNode = (
        <Loading
          small
          withOverlay={false}
          description={descriptions.uploading}
          className={`${block}__status`}
        />
      );
    } else if (isError) {
      statusNode = (
        <ErrorFilled
          size={16}
          aria-label={descriptions.error}
          className={cx(`${block}__status`, `${block}__status--error`)}
        />
      );
    } else if (status === 'complete' && successPhase !== 'done') {
      statusNode = (
        <CheckmarkFilled
          size={16}
          aria-label={descriptions.complete}
          className={cx(`${block}__status`, `${block}__status--complete`, {
            [`${block}__status--fading`]: successPhase === 'fading',
          })}
          onAnimationEnd={handleStatusAnimationEnd}
        />
      );
    }

    return (
      <div
        ref={setRefs}
        role="group"
        aria-label={name}
        className={cx(
          block,
          `${block}--${kind}`,
          {
            [`${block}--error`]: isError,
            [`${block}--leaving`]: isLeaving,
          },
          className
        )}
        onAnimationEnd={handleAnimationEnd}
        {...rest}>
        {isMedia ? (
          <span className={`${block}__thumbnail`}>
            {thumbnailSrc ? (
              // The name is the chip's accessible name; the preview adds nothing to it.
              <img
                className={`${block}__thumbnail-image`}
                src={thumbnailSrc}
                alt=""
              />
            ) : (
              <PlaceholderIcon
                aria-hidden="true"
                size={16}
                className={`${block}__thumbnail-placeholder`}
              />
            )}
            {kind === 'video' && thumbnailSrc ? (
              <span className={`${block}__video-badge`} aria-hidden="true">
                <VideoFilled
                  size={16}
                  className={`${block}__video-badge-icon`}
                />
              </span>
            ) : null}
          </span>
        ) : (
          <FileIcon
            aria-hidden="true"
            size={20}
            className={`${block}__file-icon`}
          />
        )}
        {nameShown ? (
          <span className={`${block}__text`} ref={textRef}>
            {isTruncated ? (
              // A description, not a label: the chip is already named, and the
              // tooltip only shows what the ellipsis hides.
              // autoAlign is explicit: labs's @carbon/react 1.118 predates
              // enable-v12-autoalign, so it is not implied by the v12 switch.
              <Tooltip
                align="top"
                autoAlign
                description={name}
                enterDelayMs={nameTooltipDelay}
                className={`${block}__name-tooltip`}>
                {nameNode}
              </Tooltip>
            ) : (
              nameNode
            )}
            {secondLine ? (
              <span
                className={cx(`${block}__secondary`, {
                  [`${block}__secondary--error`]: isError,
                })}>
                {secondLine}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className={`${block}__trailing`}>
          {statusNode}
          {/* The v12 lane's own button: its ghost icon-only form is Carbon's
              IconButton contract, and it carries the same states as every
              other button in the v12 work. */}
          <MegaButton
            kind="ghost"
            size="xs"
            hasIconOnly
            renderIcon={Close}
            tooltipAlignment="top"
            className={`${block}__remove`}
            disabled={isLeaving}
            onClick={handleRemove}>
            {removeLabel ?? `Remove ${name}`}
          </MegaButton>
        </span>
      </div>
    );
  }
);

FileChip.displayName = 'FileChip';

FileChip.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * A second line under the name, for something other than an error (a
   * size, say). An error's message always takes this line.
   */
  // Labs's idiom: prop-types' node is typed against an older ReactNode.
  description: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * Why the upload failed. Shown on the second line when `status` is
   * `error`; a failure is never explained by colour or an icon alone.
   */
  errorMessage: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * `file` shows a file-type glyph; `image` and `video` show a thumbnail.
   * Defaults to what `mimeType` implies.
   */
  kind: PropTypes.oneOf(fileChipKinds),

  /**
   * The file's MIME type, used to choose the kind when `kind` is not set.
   */
  mimeType: PropTypes.string,

  /**
   * The full file name. It is always the chip's accessible name, even when a
   * thumbnail-only chip does not show it.
   */
  name: PropTypes.string.isRequired,

  /**
   * How long the pointer rests on a truncated name before its tooltip shows
   * the full name, in milliseconds. A long hover, so the tooltip never fires
   * while the pointer crosses a row of chips.
   */
  nameTooltipDelay: PropTypes.number,

  /**
   * Called when the person removes the file. The chip plays its exit first
   * (none under reduced motion); moving focus afterwards is the parent's job.
   */
  onRemove: PropTypes.func,

  /**
   * Called when the `complete` check has finished fading and the chip has
   * settled back to idle.
   */
  onSuccessEnd: PropTypes.func,

  /**
   * The Remove button's label and tooltip. Defaults to "Remove <name>", so
   * the full name is reachable even when it is truncated.
   */
  removeLabel: PropTypes.string,

  /**
   * A file-type icon from `@carbon/icons-react`, in place of the one the
   * extension chooses. Only a `file` chip shows it.
   */
  // As Carbon's Button types it: a component is a function or, wrapped, an object.
  renderIcon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]) as unknown as React.Validator<ElementType>,

  /**
   * Show the name beside an image or video thumbnail. A `file` chip, and any
   * chip in error, always shows it.
   */
  showName: PropTypes.bool,

  /**
   * The upload state. `complete` is momentary: the check holds for
   * `successDelay`, fades, and the chip returns to idle.
   */
  status: PropTypes.oneOf(fileChipStatuses),

  /**
   * What each status icon announces, for translation.
   */
  // prop-types' shape allows null where the interface does not.
  statusDescriptions: PropTypes.shape({
    uploading: PropTypes.string,
    error: PropTypes.string,
    complete: PropTypes.string,
  }) as unknown as React.Validator<FileChipStatusDescriptions>,

  /**
   * How long the `complete` check holds before it fades, in milliseconds.
   * The same default as Carbon's InlineLoading. `Infinity` holds it.
   */
  successDelay: PropTypes.number,

  /**
   * The preview for an `image` or `video` chip. Without it the chip shows the
   * kind's glyph in the thumbnail's place.
   */
  thumbnailSrc: PropTypes.string,
};
