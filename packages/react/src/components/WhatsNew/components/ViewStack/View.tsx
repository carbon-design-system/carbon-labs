/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import React, { useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';
import { useViewStackContext } from './ViewStackContext';

interface ViewProps extends Omit<React.HTMLProps<HTMLLIElement>, 'title'> {
  /**
   * Required property used in history. Useful for providing navigational button labels to a different view. **Example** "Back to Settings"
   **/
  title: string;
  /**
   * Internally used and passed in programmatically. Any value provided will be overwritten.
   **/
  index?: number;
}

const View = ({ className, title, index = Infinity, ...rest }: ViewProps) => {
  const {
    registerRef,
    viewIndexStack,
    previousViewIndexStack,
    handleTransitionEnd,
  } = useViewStackContext();
  const ref = useRef<HTMLLIElement>(null);
  const labsPrefix = usePrefix();
  const prefix = `${labsPrefix}--whats-new`;

  useEffect(() => {
    registerRef(index, ref);
  }, [index, registerRef]);

  const stackIndex = viewIndexStack.findIndex((idx) => idx === index);

  const stackIndexInstanceCount = previousViewIndexStack.filter(
    (viIdx) => viIdx === index
  ).length;

  const isBeingRecycledOut =
    previousViewIndexStack.length > viewIndexStack.length &&
    previousViewIndexStack[0] === index &&
    stackIndexInstanceCount > 0;

  const isBeingRecycledIn =
    previousViewIndexStack.length < viewIndexStack.length &&
    viewIndexStack[0] === index &&
    stackIndexInstanceCount > 0;

  const isInViewStack = stackIndex > -1;
  const isActive = stackIndex === 0;

  if (isActive && ref.current) {
    ref.current.scrollTop = 0;
  }

  const transitionComplete = useCallback(() => {
    ref.current?.classList.remove(
      `${prefix}__view-recycle-in`,
      `${prefix}__view-recycle-out`
    );
    handleTransitionEnd(ref.current);
  }, [handleTransitionEnd, prefix]);

  if (!isFinite(index)) {
    return null;
  }

  return (
    <li
      {...rest}
      className={cx(
        {
          [`${prefix}__view`]: true,
          [`${prefix}__view-in-stack`]: isInViewStack && !isActive,
          [`${prefix}__view-active`]: isInViewStack && isActive,
          [`${prefix}__view-recycle-in`]:
            isBeingRecycledIn && !isBeingRecycledOut,
          [`${prefix}__view-recycle-out`]:
            isBeingRecycledOut && !isBeingRecycledIn,
        },
        className
      )}
      ref={ref}
      data-index={index}
      title={title}
      onAnimationEnd={() => {
        transitionComplete();
      }}
      onTransitionEnd={() => {
        transitionComplete();
      }}
    />
  );
};

View.displayName = 'View';

export { View };
export type { ViewProps };
