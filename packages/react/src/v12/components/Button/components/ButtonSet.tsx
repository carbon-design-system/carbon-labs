/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  forwardRef,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  resolveButtonLook,
  type ButtonLookProps,
} from '@carbon-labs/react-props';
import './button.scss';

/* ============================================================================
 * ButtonSet — v11's ButtonSet: a row (or `stacked` column) of buttons
 * ============================================================================
 *
 * v11's props: `stacked`, `fluid` (the set fills its container and stacks
 * once each button would be under 176px; the buttons then sort by kind,
 * the primary at the end, as v11's `buttonOrder`).
 *
 * The kit's set follows its buttons' `corners` (button.scss). Square
 * buttons join as v11's set, with its 1px separator; rounded and full
 * buttons keep their corners and sit 8px apart, row, stacked or fluid.
 * ========================================================================== */

export interface ButtonSetProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** Fill the container, stacking when there's no room (v11). */
  fluid?: boolean;
  /** A column instead of a row (v11). Ignored when `fluid`. */
  stacked?: boolean;
}

/** v11's order: ghost first, primary last (reversed when stacked), by look. */
const ORDER: Record<string, number> = {
  ghost: 1,
  'danger--ghost': 2,
  tertiary: 3,
  danger: 5,
  primary: 6,
};
/** A child button's look (its kind, variant and frame), by v11's kind names. */
const lookOf = (child: ReactNode) =>
  isValidElement<ButtonLookProps>(child)
    ? resolveButtonLook(child.props)
    : 'primary';

export const ButtonSet = forwardRef<HTMLDivElement, ButtonSetProps>(
  function ButtonSet(
    { children, className, fluid = false, stacked = false, ...rest },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [fluidStacked, setFluidStacked] = useState(false);

    // Fluid: the CSS decides when to stack (container queries); read it back.
    useLayoutEffect(() => {
      const inner = innerRef.current;
      if (!fluid || !inner) return;
      const read = () =>
        setFluidStacked(
          getComputedStyle(inner)
            .getPropertyValue('--cds-btn-set-direction')
            .trim() === 'column'
        );
      read();
      const ro = new ResizeObserver(read);
      ro.observe(inner);
      return () => ro.disconnect();
    }, [fluid]);

    const isStacked = fluid ? fluidStacked : stacked;
    const items = fluid
      ? Children.toArray(children).sort(
          (a, b) =>
            ((ORDER[lookOf(a)] ?? 4) - (ORDER[lookOf(b)] ?? 4)) *
            (isStacked ? -1 : 1)
        )
      : children;

    return (
      <div
        {...rest}
        ref={ref}
        className={[
          'cds-btn-set',
          isStacked && 'cds-btn-set--stacked',
          fluid && 'cds-btn-set--fluid',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {fluid ? (
          <div ref={innerRef} className="cds-btn-set__fluid-inner">
            {items}
          </div>
        ) : (
          items
        )}
      </div>
    );
  }
);
ButtonSet.displayName = 'ButtonSet';
