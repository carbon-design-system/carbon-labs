/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useMemo,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import {
  ComposedModal,
  ModalBody,
  ModalHeader,
  type ModalBackdrop,
} from '@carbon-labs/react-modal';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon-labs/react-tabs';
import './about-modal.scss';

/* ============================================================================
 * AboutModal — Carbon for IBM Products' AboutModal, on the kit's modal
 * ============================================================================
 *
 * Its props: `open`, `onClose`, `title`, `logo`, `content`, `links`,
 * `additionalInfo` (one item: its label and content; several: tabs),
 * `copyrightText`, `closeIconDescription`, `modalAriaLabel`,
 * `launcherButtonRef`, `className`. It follows `open`, and closes itself
 * unless `onClose` returns false (ComposedModal's rule).
 *
 * Passive (no buttons): the close button, Escape or a press outside closes
 * it. Its motion is the modal's — the overlay fades, the surface arrives
 * centred from 92% of its box, leaning toward what opened it, and pulls back — and
 * the tabs' (the marker glides, the panels swap out, then in).
 * ========================================================================== */

export interface AboutModalInfo {
  label: string;
  content: ReactNode;
}

export interface AboutModalProps {
  /** One item: its label and content under the body; several: tabs. */
  additionalInfo?: AboutModalInfo[];
  className?: string;
  /** The close button's tooltip and name. Default "Close". */
  closeIconDescription?: string;
  /** The body: the version, what the product is. */
  content?: ReactNode;
  /** At the foot. */
  copyrightText?: ReactNode;
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** A row of links under the content. */
  links?: ReactNode[];
  /** Over the title. */
  logo?: ReactNode;
  /** Names the dialog (default: its title). */
  modalAriaLabel?: string;
  /** Asks to close; returning `false` keeps it open. */
  onClose?: (event: SyntheticEvent | Event) => boolean | void;
  open?: boolean;
  title?: ReactNode;
  /** The modal's backdrop (ComposedModal's; `false` the dim alone). */
  backdrop?: ModalBackdrop | false;
  /** The modal's cast shadow (default off). */
  shadow?: SurfaceShadowOption;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

export const AboutModal = forwardRef<HTMLDivElement, AboutModalProps>(
  function AboutModal(
    {
      additionalInfo,
      className,
      closeIconDescription = 'Close',
      content,
      copyrightText,
      launcherButtonRef,
      links,
      logo,
      modalAriaLabel,
      onClose,
      open = false,
      title,
      backdrop,
      shadow,
      timeScale = 1,
    },
    ref
  ) {
    const info = additionalInfo ?? [];
    const tabsMotion = useMemo(() => ({ timeScale }), [timeScale]);
    const hasFoot =
      info.length > 0 || (copyrightText != null && copyrightText !== '');
    return (
      <ComposedModal
        ref={ref}
        open={open}
        onClose={onClose}
        size="sm"
        aria-label={modalAriaLabel}
        launcherButtonRef={launcherButtonRef}
        className={['cds-about-modal', className].filter(Boolean).join(' ')}
        containerClassName="cds-about-modal__container"
        backdrop={backdrop}
        shadow={shadow}
        timeScale={timeScale}>
        <ModalHeader
          className="cds-about-modal__header"
          title={title}
          iconDescription={closeIconDescription}>
          {logo != null && <div className="cds-about-modal__logo">{logo}</div>}
        </ModalHeader>
        <ModalBody className="cds-about-modal__body">
          {content != null && (
            <div className="cds-about-modal__content">{content}</div>
          )}
          {links?.length ? (
            <div className="cds-about-modal__links">
              {links.map((l, i) => (
                <span key={i} className="cds-about-modal__link">
                  {l}
                </span>
              ))}
            </div>
          ) : null}
          {hasFoot && (
            <div className="cds-about-modal__foot">
              {info.length === 1 && (
                <div className="cds-about-modal__info">
                  <p className="cds-about-modal__info-label">
                    {info[0]!.label}
                  </p>
                  <div className="cds-about-modal__info-content">
                    {info[0]!.content}
                  </div>
                </div>
              )}
              {info.length > 1 && (
                <Tabs motion={tabsMotion}>
                  <TabList aria-label="Additional information">
                    {info.map((x) => (
                      <Tab key={x.label}>{x.label}</Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {info.map((x) => (
                      <TabPanel
                        key={x.label}
                        className="cds-about-modal__panel">
                        {x.content}
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              )}
              {copyrightText != null && copyrightText !== '' && (
                <p className="cds-about-modal__copyright">{copyrightText}</p>
              )}
            </div>
          )}
        </ModalBody>
      </ComposedModal>
    );
  }
);
AboutModal.displayName = 'AboutModal';
