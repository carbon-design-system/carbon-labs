import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type CanvasInteractionLayer = "primary" | "core" | "foundation";

export interface CanvasHoveredItem {
  id: string | null;
  layer: CanvasInteractionLayer | null;
}

type HoverListener = (item: CanvasHoveredItem | null) => void;

export interface CanvasInteractionApi {
  getHoveredItem: () => CanvasHoveredItem | null;
  setHoveredItem: (item: CanvasHoveredItem | null) => void;
  publishHoveredItem: (item: CanvasHoveredItem | null) => void;
  subscribe: (listener: HoverListener) => () => void;
}

export function normalizeHoveredItem(
  item: CanvasHoveredItem | null | undefined,
): CanvasHoveredItem | null {
  if (!item?.id || !item?.layer) return null;
  return { id: item.id, layer: item.layer };
}

function isSameHoveredItem(
  left: CanvasHoveredItem | null,
  right: CanvasHoveredItem | null,
) {
  return left?.id === right?.id && left?.layer === right?.layer;
}

export function createCanvasInteractionApi(
  onHoveredItemChange?: (item: CanvasHoveredItem | null) => void,
): CanvasInteractionApi {
  let hoveredItem: CanvasHoveredItem | null = null;
  const listeners = new Set<HoverListener>();

  const notify = () => {
    listeners.forEach((listener) => listener(hoveredItem));
  };

  return {
    getHoveredItem: () => hoveredItem,
    setHoveredItem: (item) => {
      const normalized = normalizeHoveredItem(item);
      if (isSameHoveredItem(hoveredItem, normalized)) return;
      hoveredItem = normalized;
      notify();
    },
    publishHoveredItem: (item) => {
      const normalized = normalizeHoveredItem(item);
      if (isSameHoveredItem(hoveredItem, normalized)) return;
      hoveredItem = normalized;
      notify();
      onHoveredItemChange?.(normalized);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const CanvasInteractionContext =
  createContext<CanvasInteractionApi | null>(null);

export function useCanvasInteractionApi() {
  return useContext(CanvasInteractionContext);
}

export function useCanvasItemHover(
  id: string | undefined,
  layer: CanvasInteractionLayer,
) {
  const api = useCanvasInteractionApi();
  const [isHovered, setIsHovered] = useState(() => {
    const hoveredItem = api?.getHoveredItem();
    return hoveredItem?.id === id && hoveredItem?.layer === layer;
  });
  const latestMatchRef = useRef(isHovered);

  useEffect(() => {
    if (!api || !id) {
      latestMatchRef.current = false;
      setIsHovered(false);
      return;
    }

    const syncFromStore = (item: CanvasHoveredItem | null) => {
      const nextMatch = item?.id === id && item?.layer === layer;
      if (latestMatchRef.current === nextMatch) return;
      latestMatchRef.current = nextMatch;
      setIsHovered(nextMatch);
    };

    syncFromStore(api.getHoveredItem());
    return api.subscribe(syncFromStore);
  }, [api, id, layer]);

  return isHovered;
}
