/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { useToc } from './Toc';
import cx from 'classnames';

interface TocSectionsProps extends React.HTMLProps<HTMLDivElement> {
  rootMargin?: string;
  threshold?: number | number[];
}

interface TocSectionsContext {
  registerRef: (index: number, ref: React.RefObject<HTMLElement>) => void;
}

const TocSectionsContext = React.createContext<TocSectionsContext | undefined>(
  undefined
);
const TocSections = ({
  children,
  rootMargin,
  threshold,
  className,
  ...rest
}: TocSectionsProps) => {
  const prefix = usePrefix();
  const { dispatch, scrollToSectionIndex } = useToc();
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const [refs, setRefs] = useState<
    Record<string, React.RefObject<HTMLElement>>
  >({});

  useEffect(() => {
    const tmpEl =
      refs[scrollToSectionIndex]?.current ||
      scrollableDivRef.current?.querySelector(
        `[data-index="${scrollToSectionIndex}"]`
      );

    if (tmpEl) {
      tmpEl.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [scrollToSectionIndex, refs]);

  useEffect(() => {
    scrollableDivRef?.current?.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, [refs]);

  const registerRef = (index: number, ref: React.RefObject<HTMLElement>) => {
    setRefs((prevRefs) => ({
      ...prevRefs,
      [index]: ref,
    }));
  };
  // INTERSECTION OBSERVER
  useEffect(() => {
    intersectionObserverRef.current?.disconnect();
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const tmpEl = entry.target as HTMLElement;

          const dispatchType = entry.isIntersecting ? 'add' : 'remove';
          if (tmpEl.dataset.index) {
            dispatch({
              type: dispatchType,
              payload: parseInt(tmpEl.dataset.index, 10),
            });
          }
        });
      },
      { root: scrollableDivRef.current, threshold, rootMargin }
    );

    Object.values(refs).forEach((ref) => {
      if (ref.current) {
        intersectionObserverRef.current?.observe(ref.current);
      }
    });
    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, [refs, dispatch, rootMargin, threshold]);

  return (
    <TocSectionsContext.Provider value={{ registerRef }}>
      <div
        {...rest}
        ref={scrollableDivRef}
        className={cx(className, `${prefix}--whats-new__toc-sections`)}>
        {React.Children.map(children, (el, idx) => {
          return React.cloneElement(el as React.ReactElement<any>, {
            index: idx,
          });
        })}
      </div>
    </TocSectionsContext.Provider>
  );
};

TocSections.displayName = '';

const useTocSectionsContext = () => {
  const ctx = useContext(TocSectionsContext);
  if (!ctx) {
    throw new Error(`Component must be a child of TocSections`);
  }
  return ctx;
};

export { TocSections, useTocSectionsContext };
