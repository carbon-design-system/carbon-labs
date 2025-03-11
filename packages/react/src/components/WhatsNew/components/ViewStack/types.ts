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
