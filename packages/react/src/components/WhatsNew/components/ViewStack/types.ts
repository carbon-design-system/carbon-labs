/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface iViewStackContext {
  registerRef: (index: number, ref: React.RefObject<HTMLLIElement>) => void;
  previousViewIndexStack: number[];
  viewIndexStack: number[];
  viewStackHistory: iViewStackHistory[];
  handleTransitionEnd: (el?: HTMLLIElement | null) => void;
}

interface iViewStackHistory {
  id: number;
  title: string;
}

type iViewStackCallbackResponse = {
  currentIndex: number;
  lastIndex: number;
  totalViews: number;
  historyStack: iViewStackHistory[];
};

export type {
  iViewStackContext,
  iViewStackHistory,
  iViewStackCallbackResponse,
};
