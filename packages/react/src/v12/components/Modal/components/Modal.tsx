/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import {
  ComposedModal,
  type ComposedModalProps,
  type ModalSize,
} from './ComposedModal';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  type ModalLoadingStatus,
  type ModalSecondaryButton,
} from './parts';

/* ============================================================================
 * Modal — Carbon v11's Modal, in one piece, on ComposedModal
 * ============================================================================
 *
 * v11's props, prop for prop: `open`, `onRequestClose`, `onRequestSubmit`,
 * `onSecondarySubmit`, `modalHeading`, `modalLabel`, `modalAriaLabel`,
 * `primaryButtonText`, `primaryButtonDisabled`, `secondaryButtonText`,
 * `secondaryButtons`, `danger`, `dangerDescription`, `alert`,
 * `passiveModal`, `size`, `preventCloseOnClickOutside`,
 * `hasScrollingContent`, `isFullWidth`, `launcherButtonRef`,
 * `selectorPrimaryFocus`, `selectorsFloatingMenus`, `shouldSubmitOnEnter`,
 * `loadingStatus`, `loadingDescription`, `loadingIconDescription`,
 * `onLoadingSuccess`, `closeButtonLabel`. It is controlled: every way of
 * closing calls `onRequestClose`, and only `open` closes it.
 *
 * Its look and motion are ComposedModal's (the overlay fades, the surface
 * snaps in centred and pulls back); its parts' are parts.tsx's.
 * ========================================================================== */

export interface ModalProps extends Omit<
  ComposedModalProps,
  'onClose' | 'onKeyDown' | 'children' | 'containerClassName'
> {
  alert?: boolean;
  'aria-label'?: string;
  children?: ReactNode;
  className?: string;
  /** The close button's tooltip and name. Default "Close". */
  closeButtonLabel?: string;
  danger?: boolean;
  dangerDescription?: string;
  hasScrollingContent?: boolean;
  isFullWidth?: boolean;
  launcherButtonRef?: RefObject<HTMLElement | null>;
  loadingDescription?: string;
  loadingIconDescription?: string;
  loadingStatus?: ModalLoadingStatus;
  /** Names the dialog when there's no heading. */
  modalAriaLabel?: string;
  modalHeading?: ReactNode;
  modalLabel?: ReactNode;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onLoadingSuccess?: () => void;
  /** Every way of closing asks here; set `open` to close it. */
  onRequestClose?: (event: SyntheticEvent | Event) => void;
  onRequestSubmit?: (event: SyntheticEvent) => void;
  /** The secondary button, instead of `onRequestClose`. */
  onSecondarySubmit?: (event: SyntheticEvent) => void;
  open?: boolean;
  /** No footer: an informational modal, closed by its close button, Escape or a press outside. */
  passiveModal?: boolean;
  preventCloseOnClickOutside?: boolean;
  primaryButtonDisabled?: boolean;
  primaryButtonText?: ReactNode;
  secondaryButtonText?: ReactNode;
  /** Two secondary buttons (v11: exactly two). */
  secondaryButtons?: ModalSecondaryButton[];
  selectorPrimaryFocus?: string;
  selectorsFloatingMenus?: string[];
  /** Enter submits (not on the close or secondary buttons). */
  shouldSubmitOnEnter?: boolean;
  size?: ModalSize;
  /** The cast shadow (default off). */
  shadow?: SurfaceShadowOption;
  /** Slow motion. */
  timeScale?: number;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    'aria-label': ariaLabel,
    children,
    closeButtonLabel = 'Close',
    hasScrollingContent = false,
    loadingDescription,
    loadingIconDescription,
    loadingStatus = 'inactive',
    modalAriaLabel,
    modalHeading,
    modalLabel,
    onKeyDown,
    onLoadingSuccess,
    onRequestClose,
    onRequestSubmit,
    onSecondarySubmit,
    passiveModal = false,
    primaryButtonDisabled = false,
    primaryButtonText,
    secondaryButtonText,
    secondaryButtons,
    shouldSubmitOnEnter = false,
    dangerDescription,
    ...rest
  },
  ref
) {
  const label = ariaLabel ?? modalAriaLabel;

  const onKey = (e: ReactKeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (
      shouldSubmitOnEnter &&
      e.key === 'Enter' &&
      !t.closest(
        '[data-modal-close], [data-modal-secondary], [data-modal-primary]'
      )
    ) {
      e.stopPropagation();
      onRequestSubmit?.(e);
    }
    onKeyDown?.(e);
  };

  return (
    <ComposedModal
      {...rest}
      ref={ref}
      aria-label={label}
      onKeyDown={onKey}
      onClose={(e) => {
        onRequestClose?.(e);
        // Controlled: it closes when `open` says so.
        return false;
      }}>
      <ModalHeader
        label={modalLabel}
        title={modalHeading}
        iconDescription={closeButtonLabel}
      />
      <ModalBody hasScrollingContent={hasScrollingContent} aria-label={label}>
        {children}
      </ModalBody>
      {!passiveModal && (
        <ModalFooter
          primaryButtonText={primaryButtonText}
          primaryButtonDisabled={primaryButtonDisabled}
          secondaryButtonText={secondaryButtonText}
          secondaryButtons={secondaryButtons}
          dangerDescription={dangerDescription}
          loadingStatus={loadingStatus}
          loadingDescription={loadingDescription}
          loadingIconDescription={loadingIconDescription}
          onLoadingSuccess={onLoadingSuccess}
          onRequestSubmit={(e: ReactMouseEvent<HTMLButtonElement>) =>
            onRequestSubmit?.(e)
          }
          closeModal={(e) => (onSecondarySubmit ?? onRequestClose)?.(e)}
        />
      )}
    </ComposedModal>
  );
});
Modal.displayName = 'Modal';
