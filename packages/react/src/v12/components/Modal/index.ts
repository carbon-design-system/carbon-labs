/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The modal — Modal, ComposedModal and its parts.
 */
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export {
  ComposedModal,
  ModalContext,
  MODAL_MOTION,
  modalSnapProfile,
} from './components/ComposedModal';
export {
  MODAL_BACKDROP,
  MODAL_BACKDROP_DEFAULT,
  MODAL_CHROME_ATTR,
  MODAL_LAUNCHER_ATTR,
  MODAL_PAGE_MAX_LAYERS,
  modalPageLayers,
  prewarmBackdrop,
  resolveBackdrop,
  splitPageLayers,
} from './components/backdrop';
export type {
  BackdropKind,
  ModalBackdrop,
  ModalBlur,
} from './components/backdrop';
export type {
  ComposedModalProps,
  ModalContextValue,
  ModalSize,
} from './components/ComposedModal';
export {
  ModalHeader,
  ModalBody,
  ModalFooter,
  MODAL_SUCCESS_DELAY_MS,
} from './components/parts';
export type {
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalLoadingStatus,
  ModalSecondaryButton,
} from './components/parts';
export {
  MODAL_CAUSE_MS,
  modalCause,
  modalPressCause,
} from './components/press-cause';
export { ModalSwap } from './components/ModalSwap';
export type { ModalSwapProps } from './components/ModalSwap';

// The names other v12 packages take from this package's files.
export { holdPageScale, releasePageScale } from './components/backdrop';
