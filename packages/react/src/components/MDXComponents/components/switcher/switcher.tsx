/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Locked } from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, {
  AnchorHTMLAttributes,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MdxComponent } from '../interfaces';
import { mediaQueries, useMatchMedia, withPrefix } from '../utils';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SwitcherContextInterface {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SwitcherContext = createContext<SwitcherContextInterface>({
  isOpen: false,
  setIsOpen: () => undefined,
});

// ---------------------------------------------------------------------------
// Default children
// ---------------------------------------------------------------------------

const DefaultChildren = () => (
  <>
    <SwitcherDivider>Foundations</SwitcherDivider>
    <SwitcherLink href="https://ibm.com/brand" isInternal>
      IBM Brand Center
    </SwitcherLink>
    <SwitcherLink href="https://ibm.com/design/language">
      IBM Design Language
    </SwitcherLink>
    <SwitcherDivider>Implementation</SwitcherDivider>
    <SwitcherLink href="https://www.carbondesignsystem.com/">
      Carbon Design System
    </SwitcherLink>
    <SwitcherLink href="http://ibm.biz/carbon4ibmproducts" isInternal>
      Carbon for IBM Products
    </SwitcherLink>
    <SwitcherLink href="https://ibm.biz/carbon4cloud" isInternal>
      Carbon for Cloud
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/standards/carbon/">
      Carbon for IBM.com
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/design/event/">
      IBM Event Design
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/design/workplace/">
      IBM Workplace Design
    </SwitcherLink>
    <SwitcherDivider>Practices</SwitcherDivider>
    <SwitcherLink href="https://www.ibm.com/design/thinking/">
      Enterprise Design Thinking
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/able/">
      IBM Accessibility
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/design/ai">
      IBM Design for AI
    </SwitcherLink>
    <SwitcherLink href="https://www.ibm.com/design/research/">
      IBM Design Research
    </SwitcherLink>
    <SwitcherLink
      isInternal
      href="https://w3.ibm.com/design/experience-standards/">
      IBM Experience Standards
    </SwitcherLink>
    <SwitcherDivider>Community</SwitcherDivider>
    <SwitcherLink href="https://w3.ibm.com/design/" isInternal>
      IBM Design
    </SwitcherLink>
  </>
);

// ---------------------------------------------------------------------------
// Switcher
// ---------------------------------------------------------------------------

interface SwitcherProps {
  /** Content rendered inside the nav. Defaults to the IBM Design ecosystem links. */
  children?: ReactNode;
  /** Controls open/closed state. When omitted the component manages its own state. */
  isOpen?: boolean | null;
  /** Called when the switcher requests a state change (e.g. Escape key). */
  onToggle?: (open: boolean) => void;
}

/**
 * The `<Switcher>` component renders a fixed side-nav containing links to
 * related IBM design system sites. Use `<SwitcherDivider>` for section
 * headings and `<SwitcherLink>` for individual links.
 */
export const Switcher: MdxComponent<SwitcherProps> = ({
  children = <DefaultChildren />,
  isOpen: isOpenProp,
  onToggle,
}) => {
  const isLg = useMatchMedia(mediaQueries.lg);
  const [isOpenState, setIsOpenState] = useState(false);

  // Prefer controlled prop when provided, otherwise use internal state.
  // Treat null as "not provided" (same as undefined) so callers can safely
  // pass a nullable boolean from PropTypes without breaking the boolean context.
  const isOpen: boolean = isOpenProp != null ? isOpenProp : isOpenState;

  const setIsOpen = useCallback(
    (open: boolean) => {
      setIsOpenState(open);
      onToggle?.(open);
    },
    [onToggle]
  );

  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close on Escape key.
  useEffect(() => {
    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsOpen]);

  // Drive max-height via a CSS custom property to avoid the inline style prop.
  useEffect(() => {
    if (!navRef.current) {
      return;
    }
    const value =
      !isLg && isOpen
        ? '100%'
        : isOpen && listRef.current
          ? `${listRef.current.offsetHeight + 40}px`
          : '0px';
    navRef.current.style.setProperty(
      `--${withPrefix('switcher-max-height')}`,
      value
    );
  }, [isOpen, isLg]);

  return (
    <SwitcherContext.Provider value={{ isOpen, setIsOpen }}>
      <nav
        ref={navRef}
        aria-label="IBM Design ecosystem"
        className={clsx(withPrefix('switcher'), {
          [withPrefix('switcher--open')]: isOpen,
        })}
        tabIndex={-1}>
        <ul ref={listRef}>{children}</ul>
      </nav>
    </SwitcherContext.Provider>
  );
};

Switcher.propTypes = {
  /**
   * Content rendered inside the nav. Defaults to the IBM Design ecosystem links.
   */
  children: PropTypes.node as unknown as React.Validator<ReactNode>,
  /**
   * Controls open/closed state. When omitted the component manages its own state.
   */
  isOpen: PropTypes.bool,
  /**
   * Called when the switcher requests a state change (e.g. Escape key).
   */
  onToggle: PropTypes.func as unknown as React.Validator<
    ((open: boolean) => void) | undefined
  >,
};

// ---------------------------------------------------------------------------
// SwitcherDivider
// ---------------------------------------------------------------------------

interface SwitcherDividerProps {
  children: ReactNode;
}

/**
 * `<SwitcherDivider>` renders a labelled section separator inside `<Switcher>`.
 */
export const SwitcherDivider: MdxComponent<SwitcherDividerProps> = ({
  children,
}) => (
  <li className={withPrefix('switcher-divider')}>
    <span>{children}</span>
  </li>
);

SwitcherDivider.propTypes = {
  /**
   * Section label text.
   */
  children: PropTypes.node.isRequired as unknown as React.Validator<ReactNode>,
};

// ---------------------------------------------------------------------------
// SwitcherLink
// ---------------------------------------------------------------------------

interface SwitcherLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  children: ReactNode;
  href?: string | null;
  /** Marks the link as IBM-internal and shows a lock icon. */
  isInternal?: boolean | null;
  /** Renders the link in a disabled, non-interactive state. */
  disabled?: boolean | null;
}

/**
 * `<SwitcherLink>` renders a single navigation link inside `<Switcher>`.
 * Pass `isInternal` to append the IBM lock icon.
 */
export const SwitcherLink: MdxComponent<SwitcherLinkProps> = ({
  children,
  disabled,
  href: hrefProp,
  isInternal,
  ...rest
}) => {
  const { isOpen } = useContext(SwitcherContext);
  const isDisabled = disabled ?? false;
  const href = isDisabled || !hrefProp ? undefined : hrefProp;
  const className = isDisabled
    ? withPrefix('switcher-link--disabled')
    : withPrefix('switcher-link');
  const tabIndex = isOpen && !isDisabled ? 0 : -1;

  return (
    <li>
      <a
        aria-disabled={isDisabled || undefined}
        className={className}
        href={href}
        role="button"
        tabIndex={tabIndex}
        {...rest}>
        {children}
        {isInternal && <Locked />}
      </a>
    </li>
  );
};

SwitcherLink.propTypes = {
  /**
   * Link label.
   */
  children: PropTypes.node.isRequired as unknown as React.Validator<ReactNode>,
  /**
   * When true, renders the link in a non-interactive disabled state.
   */
  disabled: PropTypes.bool,
  /**
   * Destination URL.
   */
  href: PropTypes.string,
  /**
   * When true, appends a lock icon to indicate an IBM-internal destination.
   */
  isInternal: PropTypes.bool,
};
