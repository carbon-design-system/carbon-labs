/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { Close } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { StatusMark, type StatusMarkKind } from '@carbon-labs/react-feedback';
import { SwapSlot } from '@carbon-labs/react-feedback';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Scroller } from '@carbon-labs/react-scroller';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { ModalContext } from './ComposedModal';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { ModalSwap } from './ModalSwap';
import { assignRef } from '@carbon-labs/react-util';

/* ============================================================================
 * ModalHeader, ModalBody, ModalFooter — Carbon v11's ComposedModal parts
 * ============================================================================
 *
 *   header   v11's label (label-01, secondary) over its title (heading-03),
 *            and the close button: the kit's IconButton, ghost, its label
 *            the tooltip and the name (`iconDescription`, default "Close")
 *   body     the kit's Scroller. When it overflows (or `hasScrollingContent`)
 *            it's a focusable, named region, and a 16px soft edge (the
 *            token) shows where there's more. `swapKey` swaps
 *            its content out, then in (ModalSwap)
 *   footer   the kit's Buttons at their natural width, at the end
 *            (secondary, primary; two secondaries with `secondaryButtons`);
 *            no buttons, no room. `loadingStatus` swaps the primary's label
 *            out, then in (its width gliding with the in): active (a spinner, the
 *            description), finished (a check; `onLoadingSuccess` 1.5s later,
 *            v11's delay), error. The mark at the button's end is one
 *            StatusMark: the spinner becomes the check or the error mark in
 *            place by the status hand-off (shrink, grow, draw on), as
 *            InlineLoading's does; it arrives and leaves in place (SwapSlot).
 *            While loading the primary is busy
 *            (aria-busy, aria-disabled, focus kept) and the secondaries are
 *            disabled, as v11's
 * ========================================================================== */

const noop = () => {};

function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error(
      'ModalHeader, ModalBody and ModalFooter go inside a ComposedModal.'
    );
  return ctx;
}

/* ── header ──────────────────────────────────────────────────────────────── */

export interface ModalHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Also called when the close button is pressed. */
  buttonOnClick?: (event: ReactMouseEvent) => void;
  children?: ReactNode;
  className?: string;
  closeClassName?: string;
  closeIconClassName?: string;
  /** Called instead of the modal's own close (v11 passes it in). */
  closeModal?: (event: SyntheticEvent) => void;
  /** The close button's tooltip and name. Default "Close". */
  iconDescription?: string;
  label?: ReactNode;
  labelClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  function ModalHeader(
    {
      buttonOnClick,
      children,
      className,
      closeClassName,
      closeIconClassName,
      closeModal,
      iconDescription = 'Close',
      label,
      labelClassName,
      title,
      titleClassName,
      ...rest
    },
    ref
  ) {
    const ctx = useModal();
    const { register } = ctx;
    const hasLabel = label != null && label !== '';
    const hasTitle = title != null && title !== '';
    useLayoutEffect(() => {
      register('label', hasLabel);
      register('title', hasTitle);
      return () => {
        register('label', false);
        register('title', false);
      };
    }, [register, hasLabel, hasTitle]);

    return (
      <div
        {...rest}
        ref={ref}
        className={['cds-modal__header', className].filter(Boolean).join(' ')}>
        {hasLabel && (
          <h2
            id={ctx.labelId}
            className={['cds-modal__label', labelClassName]
              .filter(Boolean)
              .join(' ')}>
            {label}
          </h2>
        )}
        {hasTitle && (
          <h2
            id={ctx.titleId}
            className={['cds-modal__heading', titleClassName]
              .filter(Boolean)
              .join(' ')}>
            {title}
          </h2>
        )}
        {children}
        <div className="cds-modal__close">
          <IconButton
            frame="ghost"
            size="md"
            corners="full"
            align="left"
            label={iconDescription}
            className={closeClassName}
            data-modal-close=""
            onClick={(e) => {
              (closeModal ?? ctx.closeModal)(e);
              buttonOnClick?.(e);
            }}>
            <Close
              size={16}
              className={closeIconClassName}
              aria-hidden="true"
            />
          </IconButton>
        </div>
      </div>
    );
  }
);
ModalHeader.displayName = 'ModalHeader';

/* ── body ────────────────────────────────────────────────────────────────── */

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the body when it scrolls (default: the modal's title). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: ReactNode;
  /** v11 (deprecated there): accepted; the body is laid out the same. */
  hasForm?: boolean;
  /** A scrolling region from the start (it becomes one anyway when it overflows). */
  hasScrollingContent?: boolean;
  /** A new key swaps the content, out then in. */
  swapKey?: string | number;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  function ModalBody(
    {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      children,
      className,
      hasForm: _hasForm,
      hasScrollingContent = false,
      swapKey,
      ...rest
    },
    ref
  ) {
    const ctx = useModal();
    const viewport = useRef<HTMLDivElement | null>(null);
    const [overflows, setOverflows] = useState(false);
    const scrolls = hasScrollingContent || overflows;

    // Whether it overflows, and where there's more (the soft edges).
    useEffect(() => {
      const vp = viewport.current;
      if (!vp) return;
      const read = () => {
        const more = vp.scrollHeight - vp.clientHeight;
        setOverflows(more > 5);
        vp.toggleAttribute('data-more-above', vp.scrollTop > 1);
        vp.toggleAttribute('data-more-below', more - vp.scrollTop > 1);
      };
      read();
      const ro = new ResizeObserver(read);
      ro.observe(vp);
      if (vp.firstElementChild) ro.observe(vp.firstElementChild); // the inner box: the content's own size
      vp.addEventListener('scroll', read, { passive: true });
      return () => {
        ro.disconnect();
        vp.removeEventListener('scroll', read);
      };
    }, []);

    // A scrolling body is a tab stop (the Scroller's viewport takes no tabIndex prop).
    useEffect(() => {
      const vp = viewport.current;
      if (!vp) return;
      if (scrolls) vp.tabIndex = 0;
      else vp.removeAttribute('tabindex');
    }, [scrolls]);

    // A framed surface, as SidePanel's body, Tearsheet's and Card's content are: what selects and navigates inside
    // it is ghost by default, and its containers round (a modal is 16 over the page, the corners ladder).
    const framed = (
      <KitDefaults frame="ghost" containerCorners="rounded">
        {children}
      </KitDefaults>
    );
    const content =
      swapKey === undefined ? (
        framed
      ) : (
        <ModalSwap swapKey={swapKey} timeScale={ctx.timeScale}>
          {framed}
        </ModalSwap>
      );

    return (
      <Scroller
        {...rest}
        id={ctx.bodyId}
        className={['cds-modal__body', className].filter(Boolean).join(' ')}
        viewportClassName="cds-modal__viewport"
        timeScale={ctx.timeScale}
        viewportRef={(el) => {
          viewport.current = el;
          assignRef(ref, el);
        }}
        aria-label={scrolls ? ariaLabel : undefined}
        aria-labelledby={
          scrolls && !ariaLabel ? (ariaLabelledBy ?? ctx.titleId) : undefined
        }>
        <div className="cds-modal__inner">{content}</div>
      </Scroller>
    );
  }
);
ModalBody.displayName = 'ModalBody';

/* ── footer ──────────────────────────────────────────────────────────────── */

export type ModalLoadingStatus = 'inactive' | 'active' | 'finished' | 'error';

export interface ModalSecondaryButton {
  buttonText?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** Called by the secondary button instead of the modal's own close. */
  closeModal?: (event: SyntheticEvent) => void;
  /** Default: the modal's `danger`. */
  danger?: boolean;
  dangerDescription?: string;
  /** The primary button's ref (v11's spelling). */
  inputref?: Ref<HTMLButtonElement>;
  loadingDescription?: ReactNode;
  /** The status icon's name, read with the description. */
  loadingIconDescription?: string;
  loadingStatus?: ModalLoadingStatus;
  onLoadingSuccess?: () => void;
  /** The secondary button, after the modal's close. */
  onRequestClose?: (event: SyntheticEvent) => void;
  onRequestSubmit?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  primaryButtonDisabled?: boolean;
  primaryButtonText?: ReactNode;
  primaryClassName?: string;
  secondaryButtonText?: ReactNode;
  /** Two secondary buttons instead of one (v11: exactly two). */
  secondaryButtons?: ModalSecondaryButton[];
  secondaryClassName?: string;
}

/** The primary button's mark for each loading status: none, the spinner, the check, the error mark. */
const MARK_KIND: Record<ModalLoadingStatus, StatusMarkKind | null> = {
  inactive: null,
  active: 'pending',
  finished: 'success',
  error: 'error',
};

/** v11 InlineLoading's success delay. */
export const MODAL_SUCCESS_DELAY_MS = 1500;

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter(
    {
      children,
      className,
      closeModal,
      danger,
      dangerDescription = '',
      inputref,
      loadingDescription,
      loadingIconDescription,
      loadingStatus = 'inactive',
      onLoadingSuccess = noop,
      onRequestClose = noop,
      onRequestSubmit = noop,
      primaryButtonDisabled = false,
      primaryButtonText,
      primaryClassName,
      secondaryButtonText,
      secondaryButtons,
      secondaryClassName,
      ...rest
    },
    ref
  ) {
    const ctx = useModal();
    const { register } = ctx;
    useLayoutEffect(() => {
      register('footer', true);
      return () => register('footer', false);
    }, [register]);

    const loading = loadingStatus !== 'inactive';
    const isDanger = danger ?? ctx.danger;
    const three =
      Array.isArray(secondaryButtons) && secondaryButtons.length === 2;

    // Finished: v11 hands over after its success delay.
    const onSuccess = useLatest(onLoadingSuccess);
    useEffect(() => {
      if (loadingStatus !== 'finished') return;
      const t = window.setTimeout(
        () => onSuccess.current(),
        MODAL_SUCCESS_DELAY_MS
      );
      return () => window.clearTimeout(t);
    }, [loadingStatus, onSuccess]);

    const close = (e: ReactMouseEvent<HTMLButtonElement>) => {
      (closeModal ?? ctx.closeModal)(e);
      onRequestClose(e);
    };

    const secondaries =
      three ||
      (Array.isArray(secondaryButtons) && secondaryButtons.length === 1)
        ? secondaryButtons!.map(({ buttonText, onClick }, i) => (
            <Button
              key={i}
              kind="secondary"
              size="lg"
              corners="full"
              className={secondaryClassName}
              disabled={loading}
              data-modal-secondary={i === 0 ? '' : undefined}
              onClick={onClick}
              timeScale={ctx.timeScale}>
              {buttonText}
            </Button>
          ))
        : secondaryButtonText != null && (
            <Button
              kind="secondary"
              size="lg"
              corners="full"
              className={secondaryClassName}
              disabled={loading}
              data-modal-secondary=""
              onClick={close}
              timeScale={ctx.timeScale}>
              {secondaryButtonText}
            </Button>
          );

    // One mark from the spinner to its status, changing in place by the status hand-off (StatusMark), while the label swaps.
    const markKind = MARK_KIND[loadingStatus];
    const iconName =
      loadingIconDescription ??
      (loadingStatus === 'active'
        ? 'Loading'
        : loadingStatus === 'finished'
          ? 'Loaded'
          : 'Error');
    const label = loading
      ? (loadingDescription ?? primaryButtonText)
      : primaryButtonText;
    const empty = primaryButtonText == null && !secondaries && children == null;

    return (
      <div
        {...rest}
        ref={ref}
        aria-busy={loading}
        className={[
          'cds-modal__footer',
          three && 'cds-modal__footer--three-button',
          empty && 'cds-modal__footer--empty',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {secondaries}
        {primaryButtonText != null && (
          <Button
            ref={(el) => assignRef(inputref, el as HTMLButtonElement | null)}
            kind={isDanger ? 'danger' : 'primary'}
            size="lg"
            corners="full"
            className={primaryClassName}
            dangerDescription={dangerDescription}
            disabled={primaryButtonDisabled}
            aria-busy={loadingStatus === 'active' || undefined}
            aria-disabled={loading || undefined}
            data-modal-primary=""
            timeScale={ctx.timeScale}
            onClick={(e) => {
              if (loading) e.preventDefault();
              else onRequestSubmit(e);
            }}>
            <span className="cds-modal__btn-content">
              <ModalSwap
                swapKey={loadingStatus}
                className="cds-modal__btn-swap"
                timeScale={ctx.timeScale}
                glideWidth>
                <span className="cds-modal__btn-status">{label}</span>
              </ModalSwap>
              {/* The mark rides the button's end; it arrives and leaves in place, and changes kind in place. */}
              <span className="cds-modal__btn-icon" aria-hidden="true">
                <SwapSlot
                  swapKey={markKind ? 'mark' : 'none'}
                  empty={!markKind}>
                  {markKind && <StatusMark kind={markKind} size={16} />}
                </SwapSlot>
              </span>
            </span>
          </Button>
        )}
        {children}
        {/* The status, said once as it changes (v11's InlineLoading is a live region). */}
        <span className="cds-modal__assistive" role="status">
          {loading
            ? `${iconName}${loadingDescription ? `: ${String(loadingDescription)}` : ''}`
            : ''}
        </span>
      </div>
    );
  }
);
ModalFooter.displayName = 'ModalFooter';
