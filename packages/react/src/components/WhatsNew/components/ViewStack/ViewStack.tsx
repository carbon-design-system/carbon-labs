/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  isValidElement,
} from 'react';
import cx from 'classnames';
import { View, ViewProps } from './View';
import { ViewStackContext } from './ViewStackContext';
import { iViewStackCallbackResponse, iViewStackHistory } from './types';

interface ViewStackProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'aria-label' | 'role'> {
  ariaLabel?: string;
  role?: string;
  children: React.ReactNode;
  className?: string;

  /**
   * Function used to translate assistive text used in the ViewStack. **Example return value:** Displaying view ${currentIndex} of ${lastIndex}
   **/
  viewAssistiveTranslator?: (currentIndex: number, lastIndex: number) => string;

  /**
   * Function used to update any local state based on the ViewStack's internal state **before** any chages are made.
   * @param {object} res: {currentIndex: number, lastIndex: number, totalViews: number, historyStack: [{id: number, title: string}...]}
   **/
  onViewChangeStart?: (res: iViewStackCallbackResponse) => void;
  /**
   * Function used to update any local state based on the ViewStack's internal state **after** any chages are made.
   * @param {object} res: {currentIndex: number, lastIndex: number, totalViews: number, historyStack: [{id: number, title: string}...]}
   **/
  onViewChangeEnd?: (res: iViewStackCallbackResponse) => void;
}

const ViewStack = forwardRef(
  (
    {
      children,
      ariaLabel = 'View stack',
      role = 'region',
      className = '',
      viewAssistiveTranslator,
      onViewChangeStart,
      onViewChangeEnd,
      ...rest
    }: ViewStackProps,
    ref
  ) => {
    const labsPrefix = usePrefix();
    const prefix = `${labsPrefix}--whats-new`;
    const [refs, setRefs] = useState<
      Record<string, React.RefObject<HTMLLIElement>>
    >({});

    const [viewIndexStack, setViewIndexStack] = useState<number[]>([0]);
    const [previousViewIndexStack, setPreviousViewIndexStack] = useState<
      number[]
    >([0]);
    const [viewStackHistory, setViewStackHistory] = useState<
      iViewStackHistory[]
    >([]);

    const registerRef = useCallback(
      (index: number, ref: React.RefObject<HTMLLIElement>) => {
        setRefs((prevRefs) => ({
          ...prevRefs,
          [index]: ref,
        }));
      },
      []
    );
    const getHistory = useCallback(
      (inIndexArray: number[]) => {
        return inIndexArray.map((id) => {
          const tmpTitle = refs[id].current?.title;
          return { id: id, title: tmpTitle || '' };
        });
      },
      [refs]
    );

    const getCallbackResponse = useCallback((): iViewStackCallbackResponse => {
      const totalRefs = Object.keys(refs).length;
      const lastElementRef = refs[totalRefs - 1];
      const historicalData = getHistory(viewIndexStack);
      return {
        currentIndex: viewIndexStack[0],
        lastIndex: parseInt(
          lastElementRef?.current?.dataset.index ||
            viewIndexStack[0].toString(),
          10
        ),
        totalViews: totalRefs,
        historyStack: historicalData,
      };
    }, [refs, viewIndexStack, getHistory]);

    const handleTransitionStart = useCallback(() => {
      setPreviousViewIndexStack([...viewIndexStack]);
      const { currentIndex, lastIndex, totalViews, historyStack } =
        getCallbackResponse();
      if (onViewChangeStart) {
        onViewChangeStart({
          currentIndex,
          lastIndex,
          totalViews,
          historyStack,
        });
      }
    }, [onViewChangeStart, getCallbackResponse, viewIndexStack]);

    const handleTransitionEnd = useCallback(
      (el?: HTMLLIElement | null) => {
        if (!el) {
          return;
        }
        const tmpElementIndex = el.dataset.index;

        if (
          tmpElementIndex &&
          viewIndexStack[0] === parseInt(tmpElementIndex, 10) &&
          onViewChangeEnd
        ) {
          const { currentIndex, lastIndex, totalViews, historyStack } =
            getCallbackResponse();
          setViewStackHistory(historyStack);
          onViewChangeEnd({
            currentIndex,
            lastIndex,
            totalViews,
            historyStack,
          });
        }
      },
      [onViewChangeEnd, viewIndexStack, getCallbackResponse]
    );

    const sanitizeIndex = useCallback(
      (idx: number) => {
        const floorVal = 0;
        const ceilVal = Object.keys(refs).length - 1;
        if (idx < floorVal) {
          return floorVal;
        } else if (idx > ceilVal) {
          return ceilVal;
        }
        return idx;
      },
      [refs]
    );

    const transitionToViewIndex = useCallback(
      (idx: number) => {
        const sanitizedIndex = sanitizeIndex(idx);
        if (viewIndexStack[0] !== sanitizedIndex) {
          const stackIndex = viewIndexStack.findIndex(
            (tmpIndex) => tmpIndex === sanitizedIndex
          );
          if (stackIndex === -1) {
            handleTransitionStart();
            setViewIndexStack([sanitizedIndex, ...viewIndexStack]);
          } else {
            handleTransitionStart();
            setViewIndexStack([sanitizedIndex, ...viewIndexStack]);
          }
        }
      },
      [handleTransitionStart, viewIndexStack, sanitizeIndex]
    );

    const internalAssistiveTranslator = viewAssistiveTranslator
      ? viewAssistiveTranslator
      : (currentIndex: number, lastIndex: number) => {
          return `Displaying view ${currentIndex} of ${lastIndex}`;
        };

    const navigateNext = useCallback(() => {
      const targetViewIndex = viewIndexStack[0] + 1;
      transitionToViewIndex(targetViewIndex);
    }, [transitionToViewIndex, viewIndexStack]);

    const navigateBack = useCallback(() => {
      if (viewIndexStack.length - 1 >= 1) {
        handleTransitionStart();
        setViewIndexStack(viewIndexStack.slice(1));
      }
    }, [viewIndexStack, handleTransitionStart]);

    const navigateHome = useCallback(() => {
      if (viewIndexStack.length > 1) {
        handleTransitionStart();
        setViewIndexStack([0]);
        const historyStack = getHistory([0]);
        setViewStackHistory(historyStack);
        const { currentIndex, lastIndex, totalViews } = getCallbackResponse();
        if (onViewChangeEnd) {
          onViewChangeEnd({
            currentIndex,
            lastIndex,
            totalViews,
            historyStack,
          });
        }
      }
    }, [
      handleTransitionStart,
      onViewChangeEnd,
      getCallbackResponse,
      getHistory,
      viewIndexStack,
    ]);

    useImperativeHandle(
      ref as React.RefObject<void>,
      () => ({
        next() {
          navigateNext();
        },
        back() {
          navigateBack();
        },
        home() {
          navigateHome();
        },
        pushViewIndex(idx: number) {
          transitionToViewIndex(idx);
        },
      }),
      [navigateNext, navigateBack, navigateHome, transitionToViewIndex]
    );

    useEffect(() => {
      const initialReference = refs[0];
      if (Object.keys(refs).length > 0) {
        handleTransitionEnd(initialReference.current);
      }
    }, [refs, handleTransitionEnd]);

    return (
      <ViewStackContext.Provider
        value={{
          viewIndexStack,
          previousViewIndexStack,
          viewStackHistory,
          registerRef,
          handleTransitionEnd,
        }}>
        <div
          aria-label={ariaLabel}
          role={role}
          tabIndex={0}
          {...rest}
          className={cx(className, `${prefix}__view-stack`)}>
          <ul>
            {React.Children.map(children, (el, idx) => {
              if (isValidElement(el)) {
                if (el.type === View) {
                  return React.cloneElement(
                    el as React.ReactElement<ViewProps>,
                    {
                      index: idx,
                    }
                  );
                }
                return null;
              }
              return null;
            })}
          </ul>
          <div
            aria-live="polite"
            aria-atomic="true"
            className={`${prefix}__view-stack-announcer`}>
            {internalAssistiveTranslator(
              viewIndexStack[0] + 1,
              Object.keys(refs).length
            )}
          </div>
        </div>
      </ViewStackContext.Provider>
    );
  }
);

ViewStack.displayName = 'ViewStack';

export { ViewStack };
