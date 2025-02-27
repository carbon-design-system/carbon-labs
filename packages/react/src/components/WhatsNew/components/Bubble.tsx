/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import { NewPopoverAlignment } from '@carbon/react';
import React, { HTMLProps, useLayoutEffect, useRef } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import {
  autoUpdate,
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/react';

interface BubbleProps extends Omit<HTMLProps<HTMLDivElement>, 'target'> {
  align: NewPopoverAlignment;
  target: Element | React.RefObject<Element> | string | null | undefined;
  dropShadow?: boolean;
  highContrast?: boolean;
  open: boolean;
}

const Bubble = ({
  children,
  align,
  target,
  className: customClassName,
  dropShadow = true,
  highContrast = false,
  open,
  // onClose,
  ...rest
}: BubbleProps) => {
  const prefix = usePrefix();
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (target) {
      if (typeof target === 'string') {
        targetRef.current = document.querySelector(target);
      } else if ('current' in target) {
        targetRef.current = target.current;
      } else {
        targetRef.current = target;
      }

      if (targetRef.current && tooltipRef.current && arrowRef.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        // const middlewares = align ? [flip()] : [autoPlacement()];

        const middlewares = [
          offset(10),
          flip(),
          shift({ padding: 5 }),
          arrow({ element: arrowRef.current }),
        ];

        const cleanup = autoUpdate(
          targetRef.current,
          tooltipRef.current,
          () => {
            if (targetRef.current && tooltipRef.current) {
              computePosition(targetRef.current, tooltipRef.current, {
                placement: align,
                strategy: 'fixed',
                middleware: middlewares,
              }).then(({ x, y, placement, middlewareData }) => {
                if (tooltipRef.current) {
                  Object.assign(tooltipRef.current.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  });
                }

                const arrowX = middlewareData.arrow?.x;
                const arrowY = middlewareData.arrow?.y;

                const staticSide = {
                  top: 'bottom',
                  right: 'left',
                  bottom: 'top',
                  left: 'right',
                }[placement.split('-')[0]];

                if (staticSide && arrowRef.current) {
                  Object.assign(arrowRef.current.style, {
                    left: arrowX != null ? `${arrowX}px` : '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                  });
                }
              });
            }
          },
          { animationFrame: true }
        );

        return () => {
          cleanup();
        };
      }
    }
  }, [target, open, align]);

  return (
    <div
      {...rest}
      ref={tooltipRef}
      className={cx(
        {
          [`${prefix}--whats-new__bubble`]: true,
          [`${prefix}--whats-new__bubble-open`]: open,
          [`${prefix}--whats-new__bubble-drop-shadow`]: dropShadow,
          [`${prefix}--whats-new__bubble-high-contrast`]: highContrast,
        },
        customClassName
      )}>
      <div
        ref={arrowRef}
        className={cx({
          [`${prefix}--whats-new__bubble__arrow`]: true,
          [`${prefix}--whats-new__bubble__arrow-high-contrast`]: highContrast,
        })}></div>
      {children}
    </div>
  );
};

Bubble.displayName = 'Bubble';

export { Bubble };
