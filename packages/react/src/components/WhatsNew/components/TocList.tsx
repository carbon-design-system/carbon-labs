/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import React, { ReactElement, useContext, useRef, useState } from 'react';
import { useToc } from './Toc';
import { TocItemProps } from './TocItem';

interface TocListProps {
  children: ReactElement<TocItemProps> | Array<ReactElement<TocItemProps>>;
}
interface TocListContext {
  registerRef: (index: number, ref: React.RefObject<HTMLElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
}

const TocListContext = React.createContext<TocListContext | undefined>(
  undefined
);

const TocList = ({ children }: TocListProps) => {
  const prefix = usePrefix();
  const { activeIds } = useToc();
  const [refs, setRefs] = useState<
    Record<string, React.RefObject<HTMLElement>>
  >({});
  const navRef = useRef(null);

  const registerRef = (index: number, ref: React.RefObject<HTMLElement>) => {
    setRefs((prevRefs) => {
      return {
        ...prevRefs,
        [index]: ref,
      };
    });
  };

  const getNextValueIndex = (
    elementIndex: number,
    direction: 'increment' | 'decrement'
  ) => {
    const maxVal = React.Children.count(children) - 1;
    let nextValue =
      direction === 'increment' ? elementIndex + 1 : elementIndex - 1;

    if (nextValue < 0) {
      nextValue = maxVal;
    } else if (nextValue > maxVal) {
      nextValue = 0;
    }
    return nextValue;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.dataset.index) {
      const elementIndex = parseInt(e.currentTarget.dataset.index, 10);
      let targetIndex = Infinity;
      switch (e.key) {
        case 'ArrowUp':
          e.stopPropagation();
          targetIndex = getNextValueIndex(elementIndex, 'decrement');
          break;
        case 'ArrowDown':
          e.stopPropagation();
          targetIndex = getNextValueIndex(elementIndex, 'increment');
          break;
        default:
          break;
      }
      if (isFinite(targetIndex)) {
        //scrollToSection(targetIndex); // MAYBE WE SHOULD SCROLL ON TAB?
        refs[targetIndex].current?.focus();
      }
    }
  };

  return (
    <TocListContext.Provider value={{ registerRef, handleKeyDown }}>
      <nav ref={navRef} className={`${prefix}--whats-new__toc-list`}>
        {React.Children.map(children, (el, idx) => {
          return React.cloneElement(el as React.ReactElement<any>, {
            index: idx,
            isActive: activeIds.includes(idx),
          });
        })}
      </nav>
    </TocListContext.Provider>
  );
};

TocList.displayName = 'TocList';

const useTocListContext = () => {
  const ctx = useContext(TocListContext);
  if (!ctx) {
    throw new Error(`Component must be a child of TocList`);
  }
  return ctx;
};

export { TocList, useTocListContext };
export type { TocListProps };
