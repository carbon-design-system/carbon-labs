/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  buildPrimaryNavigation,
  getNextPrimaryFocusId,
} from './primaryNavigation';

/**
 *
 * @param root0
 * @param root0.a11yItems
 * @param root0.focusedId
 * @param root0.onFocusedIdChange
 * @param root0.enableA11y
 */
export function useCanvasA11y({
  a11yItems,
  focusedId,
  onFocusedIdChange,
  enableA11y,
}) {
  const instructionsId = useId();
  const a11yButtonRefs = useRef(new Map());
  const groupButtonRefs = useRef(new Map());
  const [internalFocusedId, setInternalFocusedId] = useState(null);
  const [isFocusWithinCanvas, setIsFocusWithinCanvas] = useState(false);
  const [activeLayer, setActiveLayer] = useState(null);
  const [focusedGroupLayer, setFocusedGroupLayer] = useState(null);

  const requestedFocusedId = focusedId ?? internalFocusedId;
  const resolvedFocusedId = useMemo(() => {
    if (requestedFocusedId == null) {
      return null;
    }
    const exists = a11yItems.allItems.some(
      (item) => item.id === requestedFocusedId
    );
    return exists ? requestedFocusedId : null;
  }, [a11yItems.allItems, requestedFocusedId]);

  const primaryNavigation = useMemo(
    () => buildPrimaryNavigation(a11yItems.primaryItems),
    [a11yItems.primaryItems]
  );

  const setFocusedBlock = useCallback(
    (nextFocusedId) => {
      if (focusedId == null) {
        setInternalFocusedId(nextFocusedId ?? null);
      }
      onFocusedIdChange?.(nextFocusedId ?? null);
    },
    [focusedId, onFocusedIdChange]
  );

  const registerA11yButton = useCallback((id, node) => {
    if (node) {
      a11yButtonRefs.current.set(id, node);
      return;
    }
    a11yButtonRefs.current.delete(id);
  }, []);
  const registerGroupButton = useCallback((layer, node) => {
    if (node) {
      groupButtonRefs.current.set(layer, node);
      return;
    }
    groupButtonRefs.current.delete(layer);
  }, []);

  const focusA11yItemById = useCallback(
    (id) => {
      if (!id) {
        return;
      }
      setFocusedBlock(id);
      a11yButtonRefs.current.get(id)?.focus();
    },
    [setFocusedBlock]
  );
  const focusGroupByLayer = useCallback((layer) => {
    if (!layer) {
      return;
    }
    groupButtonRefs.current.get(layer)?.focus();
  }, []);

  const getLayerItems = useCallback(
    (layer) => {
      if (layer === 'primary') {
        return a11yItems.primaryItems;
      }
      if (layer === 'core') {
        return a11yItems.coreItems;
      }
      if (layer === 'foundation') {
        return a11yItems.foundationItems;
      }
      return [];
    },
    [a11yItems.coreItems, a11yItems.foundationItems, a11yItems.primaryItems]
  );

  const handleLayerGroupFocus = useCallback(
    (layer) => {
      setIsFocusWithinCanvas(true);
      setFocusedGroupLayer(layer);
      setActiveLayer(null);
      setFocusedBlock(null);
    },
    [setFocusedBlock]
  );

  const handleLayerGroupActivate = useCallback(
    (layer) => {
      const layerItems = getLayerItems(layer);
      if (layerItems.length === 0) {
        return;
      }
      setIsFocusWithinCanvas(true);
      setFocusedGroupLayer(null);
      setActiveLayer(layer);
      focusA11yItemById(layerItems[0].id);
    },
    [focusA11yItemById, getLayerItems]
  );

  const movePrimaryFocus = useCallback(
    (key) => {
      const nextId = getNextPrimaryFocusId({
        key,
        resolvedFocusedId,
        primaryItems: a11yItems.primaryItems,
        navigation: primaryNavigation,
      });
      if (nextId) {
        focusA11yItemById(nextId);
      }
    },
    [
      a11yItems.primaryItems,
      focusA11yItemById,
      primaryNavigation,
      resolvedFocusedId,
    ]
  );

  const handleCanvasKeyDown = useCallback(
    (event) => {
      if (!enableA11y) {
        return;
      }
      const { key } = event;

      if (key === 'Escape' && activeLayer) {
        event.preventDefault();
        setFocusedGroupLayer(activeLayer);
        setActiveLayer(null);
        setFocusedBlock(null);
        focusGroupByLayer(activeLayer);
        return;
      }

      if (activeLayer !== 'primary') {
        return;
      }

      if (
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight'
      ) {
        event.preventDefault();
        movePrimaryFocus(key);
        return;
      }
    },
    [
      activeLayer,
      enableA11y,
      focusGroupByLayer,
      movePrimaryFocus,
      setFocusedBlock,
    ]
  );

  const handleA11yItemFocus = useCallback(
    (layer, id) => {
      setIsFocusWithinCanvas(true);
      setFocusedGroupLayer(null);
      setActiveLayer(layer);
      setFocusedBlock(id);
    },
    [setFocusedBlock]
  );

  const handleCanvasBlur = useCallback(
    (event) => {
      if (!enableA11y) {
        return;
      }
      const nextFocusedElement = event.relatedTarget;
      if (
        nextFocusedElement &&
        event.currentTarget.contains(nextFocusedElement)
      ) {
        return;
      }
      setIsFocusWithinCanvas(false);
      setActiveLayer(null);
      setFocusedGroupLayer(null);
    },
    [enableA11y]
  );

  const handleCanvasFocus = useCallback(() => {
    if (!enableA11y) {
      return;
    }
    setIsFocusWithinCanvas(true);
  }, [enableA11y]);

  const handleAuxiliaryControlFocus = useCallback(() => {
    if (!enableA11y) {
      return;
    }
    // Auxiliary controls (like carousel SR-only buttons) should not keep
    // a layer/group focus ring active in the 3D scene.
    setIsFocusWithinCanvas(true);
    setActiveLayer(null);
    setFocusedGroupLayer(null);
    setFocusedBlock(null);
  }, [enableA11y, setFocusedBlock]);

  return {
    instructionsId,
    resolvedFocusedId,
    focusedIdForRender:
      isFocusWithinCanvas && activeLayer ? resolvedFocusedId : null,
    focusedGroupLayerForRender:
      isFocusWithinCanvas && !activeLayer ? focusedGroupLayer : null,
    activeLayer,
    registerGroupButton,
    registerA11yButton,
    handleLayerGroupFocus,
    handleLayerGroupActivate,
    handleA11yItemFocus,
    handleCanvasKeyDown,
    handleCanvasFocus,
    handleCanvasBlur,
    handleAuxiliaryControlFocus,
  };
}

export default useCanvasA11y;
