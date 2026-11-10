/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { forwardRef, useRef, type MouseEvent } from 'react';
import { CopyToggle } from '@carbon-labs/react-motion-icons';
import {
  IconButton,
  mergeRefs,
  type IconButtonProps,
  type TooltipAlign,
} from '@carbon-labs/react-tooltip';
import type { TooltipAlignDeprecated } from '@carbon-labs/react-selection-kit';
import { useCopyFeedback } from './useCopyFeedback';
import './copy-button.scss';

/* ============================================================================
 * CopyButton — Carbon v11's CopyButton on the kit's IconButton.
 * ============================================================================
 *
 * v11's API, prop for prop (`@carbon/react` CopyButton): `align` (default
 * bottom), `autoAlign`, `feedback` ("Copied"), `feedbackTimeout` (2000),
 * `iconDescription` ("Copy to clipboard"), `onClick`, `className`, and the
 * button's own props (`disabled`, `kind`, `size`, …) passed through. As in
 * v11 it doesn't write the clipboard itself: `onClick` does (CodeSnippet's
 * does). The description is the tooltip and the accessible name; a click
 * turns it into the feedback for `feedbackTimeout`.
 *
 * The kit adds:
 *
 *   button    the kit's IconButton, its `frame` ghost by default (the chat's
 *             copy, the toolbars'; `frame="inset"` gives the button its own
 *             surface, and `kind` and `variant` keep the kit's defaults).
 *             The rollover, the 1px hover growth and press, the
 *             keyboard ring in the icon's colour
 *   copied    the Copy ⇄ Checkmark toggle: a copy closes the pages into a
 *             checkmark, back to Copy as the feedback ends; its hover plays
 *             on the button's hover or focus
 *   feedback  in the tooltip, v11's place: the description moves out to the
 *             side and "Copied" comes in from the other (RollText, whole and
 *             horizontal: a change of meaning, read along the line), the
 *             tooltip resizing round it on the roll's clock and staying
 *             centred on the button; back after `feedbackTimeout`
 *   announce  the feedback in a polite live region, once per copy
 *   reduced   the icon and the text swap at once (the icon's own rule)
 * ========================================================================== */

export interface CopyButtonProps extends Omit<
  IconButtonProps,
  'label' | 'children' | 'renderIcon' | 'align'
> {
  /** The tooltip's side and alignment (v11). Default `bottom`. */
  align?: TooltipAlign | TooltipAlignDeprecated;
  /** Flip the tooltip to stay in view (v11, experimental). */
  autoAlign?: boolean;
  className?: string;
  /** The tooltip's text after a click (v11). Default "Copied". */
  feedback?: string;
  /** How long the feedback shows, ms (v11). Default 2000. */
  feedbackTimeout?: number;
  /** The tooltip, and the button's accessible name (v11). Default "Copy to clipboard". */
  iconDescription?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      align = 'bottom',
      autoAlign = false,
      className,
      feedback = 'Copied',
      feedbackTimeout = 2000,
      iconDescription = 'Copy to clipboard',
      onClick,
      kind,
      variant,
      frame = 'ghost',
      size = 'md',
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const fb = useCopyFeedback(btnRef, {
      feedback,
      description: iconDescription,
      feedbackTimeout,
    });
    const big = size === 'lg' || size === 'xl' || size === '2xl';

    return (
      <>
        <IconButton
          {...rest}
          ref={mergeRefs<HTMLButtonElement>(btnRef, ref)}
          kind={kind}
          variant={variant}
          frame={frame}
          size={size}
          align={align}
          autoAlign={autoAlign}
          label={fb.label}
          closeOnActivation={false}
          className={['cds-copy-btn', className].filter(Boolean).join(' ')}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            fb.copy();
          }}
          onPointerEnter={(e) => {
            fb.handlers.onPointerEnter();
            onPointerEnter?.(e);
          }}
          onPointerLeave={(e) => {
            fb.handlers.onPointerLeave();
            onPointerLeave?.(e);
          }}
          onFocus={(e) => {
            fb.handlers.onFocus();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            fb.handlers.onBlur();
            onBlur?.(e);
          }}>
          <CopyToggle
            size={big ? 20 : 16}
            toggled={fb.copied}
            disableToggle
            aria-hidden="true"
          />
        </IconButton>
        <span className="cds-copy-btn__status" role="status" aria-live="polite">
          {fb.announcement}
        </span>
      </>
    );
  }
);
CopyButton.displayName = 'CopyButton';
