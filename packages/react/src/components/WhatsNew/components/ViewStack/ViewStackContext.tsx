import { createContext, useContext } from 'react';
import { iViewStackContext } from './types';

const ViewStackContext = createContext<iViewStackContext | undefined>(
  undefined
);

const useViewStackContext = () => {
  const ctx = useContext(ViewStackContext);
  if (!ctx) {
    throw new Error(`Component must be a child of ViewStack`);
  }
  return ctx;
};

export { ViewStackContext, useViewStackContext };
