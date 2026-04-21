/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { SystemTopology3DProps } from './types/component-props';
import LoadingOverlay from './LoadingOverlay';
import Scene from './Scene';
import { buildRowsFromVisualizationData } from './data/buildRowsFromVisualizationData';
import { getRowHeight } from './layout/utils';
import {
  DEFAULT_RESPONSIVE_COLUMN_BREAKPOINTS,
  useResponsiveColumnCount,
} from './hooks/useResponsiveDimensions';
import { buildA11yItems } from './layout/a11yItems';
import CanvasA11yElements from './a11y/CanvasA11yElements';
import CarouselA11yControls from './a11y/CarouselA11yControls';
import { useCanvasA11y } from './a11y/useCanvasA11y';
import { DEFAULT_A11Y_COPY, resolveI18nMessage } from './a11y/messages';
import { getPrimaryCenterX } from './constants';
import { usePrimaryLayerCarousel } from './subcomponents/PrimaryLayer/PrimaryLayerCarouselLogic';
import { CAMERA_CONFIG } from './config/cameraConfig';
import { hasMissingColumnIndex } from './utils/primaryLayer';
import {
  CanvasInteractionContext,
  createCanvasInteractionApi,
  normalizeHoveredItem,
} from './interactionContext';
import type { PrimaryLayerBlock } from './types/visualization-config';

const DEFAULT_PRIMARY_COLUMN_COUNT = 8;

function resolveColumnCount(columnCount?: number) {
  return Math.max(1, Number(columnCount) || 1);
}

function buildPrimaryLoadingScaffold(columnCount: number) {
  const safeColumnCount = resolveColumnCount(columnCount);

  return Array.from({ length: safeColumnCount }, (_, columnIndex) => ({
    id: `loading-scaffold-${columnIndex}`,
    columnIndex,
    isLoadingScaffold: true,
  }));
}

function remapPrimaryLayerToColumnCount(
  primaryLayer: PrimaryLayerBlock[] | undefined,
  nextColumnCount: number
) {
  if (!Array.isArray(primaryLayer) || primaryLayer.length === 0) {
    return [];
  }

  const safeNextColumnCount = resolveColumnCount(nextColumnCount);
  const currentColumnCount =
    primaryLayer.reduce(
      (max, block) => Math.max(max, Number(block.columnIndex ?? 0)),
      -1
    ) + 1;

  if (currentColumnCount <= 0 || currentColumnCount === safeNextColumnCount) {
    return primaryLayer;
  }

  if (currentColumnCount === 1) {
    return primaryLayer.map((block) => ({
      ...block,
      columnIndex: 0,
    }));
  }

  return primaryLayer.map((block) => {
    const currentIndex = Math.max(0, Number(block.columnIndex ?? 0));
    const nextIndex = Math.min(
      safeNextColumnCount - 1,
      Math.round(
        (currentIndex * (safeNextColumnCount - 1)) / (currentColumnCount - 1)
      )
    );

    return {
      ...block,
      columnIndex: nextIndex,
    };
  });
}

interface SystemTopology3DContentProps
  extends Omit<SystemTopology3DProps, 'hoveredItem' | 'onHoveredItemChange'> {
  interactionApi: ReturnType<typeof createCanvasInteractionApi>;
  onIntroAnimationComplete?: () => void;
}

function SystemTopology3DContent({
  primaryLayer,
  coreLayer,
  foundationConfig,
  textBracket,
  focusedId,
  onFocusedIdChange,
  onBlockClick,
  onViewChange,
  canvasKey,
  enablePrimaryLayerCarousel = true,
  lockColumnCount = false,
  primaryColumnCount = DEFAULT_PRIMARY_COLUMN_COUNT,
  skeletonLoader = false,
  responsiveColumnBreakpoints = DEFAULT_RESPONSIVE_COLUMN_BREAKPOINTS,
  onResponsiveColumnCountChange,
  enableA11y = true,
  i18n,
  interactionApi,
  onIntroAnimationComplete: onIntroAnimationCompleteProp,
  theme = 'dark',
}: SystemTopology3DContentProps) {
  const hasStartedIntroRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousEffectivePrimaryColumnCountRef = useRef<number | null>(null);
  const canvasShellRef = useRef<HTMLDivElement | null>(null);
  const [isPlayingIntroAnimation, setIsPlayingIntroAnimation] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [carouselKeyboardFocus, setCarouselKeyboardFocus] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState<number | undefined>(undefined);
  const responsiveColumnCount = useResponsiveColumnCount(
    canvasWidth,
    responsiveColumnBreakpoints
  );
  const requestedPrimaryColumnCount = resolveColumnCount(primaryColumnCount);
  const effectivePrimaryColumnCount = lockColumnCount
    ? requestedPrimaryColumnCount
    : responsiveColumnCount;
  const shouldSkipPrimaryEnterAnimation =
    previousEffectivePrimaryColumnCountRef.current !== null &&
    previousEffectivePrimaryColumnCountRef.current !==
      effectivePrimaryColumnCount;
  useLayoutEffect(() => {
    const shellElement = canvasShellRef.current;
    if (!shellElement) {return;}

    const updateCanvasWidth = (nextWidth: number) => {
      setCanvasWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth
      );
    };

    updateCanvasWidth(shellElement.getBoundingClientRect().width);

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (typeof nextWidth === 'number') {
        updateCanvasWidth(nextWidth);
      }
    });

    resizeObserver.observe(shellElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Ensure intro animation only plays once per component lifecycle
  useLayoutEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }
  }, []);

  const handleInitialSceneReady = useCallback(() => {
    if (hasStartedIntroRef.current || !hasInitializedRef.current) {return;}
    hasStartedIntroRef.current = true;
    setIsPlayingIntroAnimation(true);
  }, []);

  const handleIntroAnimationComplete = useCallback(() => {
    setIsPlayingIntroAnimation(false);
    onIntroAnimationCompleteProp?.();
  }, [onIntroAnimationCompleteProp]);

  // Notify parent of responsive column count changes (unless locked)
  useEffect(() => {
    if (
      !lockColumnCount &&
      onResponsiveColumnCountChange &&
      responsiveColumnCount !== requestedPrimaryColumnCount
    ) {
      onResponsiveColumnCountChange(responsiveColumnCount);
    }
  }, [
    lockColumnCount,
    responsiveColumnCount,
    onResponsiveColumnCountChange,
    requestedPrimaryColumnCount,
  ]);

  useEffect(() => {
    previousEffectivePrimaryColumnCountRef.current =
      effectivePrimaryColumnCount;
  }, [effectivePrimaryColumnCount]);

  const primaryLayerNeedsAutoPlacement = useMemo(
    () => hasMissingColumnIndex(primaryLayer),
    [primaryLayer]
  );

  const primaryLayerForCarousel = useMemo(
    () =>
      primaryLayerNeedsAutoPlacement
        ? Array.isArray(primaryLayer)
          ? primaryLayer
          : []
        : remapPrimaryLayerToColumnCount(
            primaryLayer,
            effectivePrimaryColumnCount
          ),
    [effectivePrimaryColumnCount, primaryLayer, primaryLayerNeedsAutoPlacement]
  );

  const {
    pages: primaryLayerPages,
    primaryLayerForRender,
    pageCount: primaryLayerPageCount,
    activePageIndex: activePrimaryLayerPage,
    goToPreviousPage,
    goToNextPage,
    goToPage,
  } = usePrimaryLayerCarousel(
    primaryLayerForCarousel,
    enablePrimaryLayerCarousel,
    effectivePrimaryColumnCount
  );

  const primaryLayerRowsInput = useMemo(() => {
    if (!skeletonLoader || primaryLayerForRender.length > 0) {
      return primaryLayerForRender;
    }

    return buildPrimaryLoadingScaffold(effectivePrimaryColumnCount);
  }, [effectivePrimaryColumnCount, primaryLayerForRender, skeletonLoader]);

  const resolvedRows = useMemo(
    () =>
      buildRowsFromVisualizationData({
        primaryLayer: primaryLayerRowsInput,
        coreLayer,
        foundationConfig,
      }),
    [primaryLayerRowsInput, coreLayer, foundationConfig]
  );
  const sceneBoundsRows = useMemo(() => {
    if (!enablePrimaryLayerCarousel || primaryLayerPages.length <= 1) {
      return resolvedRows;
    }

    let tallestRows: any = null;
    let tallestPrimaryHeight = -Infinity;

    for (const page of primaryLayerPages) {
      const candidateRows = buildRowsFromVisualizationData({
        primaryLayer: page,
        coreLayer,
        foundationConfig,
      });
      const candidatePrimaryHeight = getRowHeight(candidateRows[0] ?? []);

      if (candidatePrimaryHeight > tallestPrimaryHeight) {
        tallestPrimaryHeight = candidatePrimaryHeight;
        tallestRows = candidateRows;
      }
    }

    return tallestRows ?? resolvedRows;
  }, [
    coreLayer,
    enablePrimaryLayerCarousel,
    foundationConfig,
    primaryLayerPages,
    resolvedRows,
  ]);
  const a11yItems = useMemo(() => buildA11yItems(resolvedRows), [resolvedRows]);
  const {
    instructionsId,
    focusedIdForRender,
    focusedGroupLayerForRender,
    activeLayer,
    registerGroupButton,
    registerA11yButton,
    handleLayerGroupFocus,
    handleLayerGroupActivate,
    handleA11yItemFocus: baseHandleA11yItemFocus,
    handleCanvasKeyDown: baseHandleCanvasKeyDown,
    handleCanvasFocus,
    handleCanvasBlur: baseHandleCanvasBlur,
    handleAuxiliaryControlFocus: baseHandleAuxiliaryControlFocus,
  } = useCanvasA11y({
    a11yItems,
    focusedId,
    onFocusedIdChange,
    enableA11y,
  });

  const primaryCenterX = useMemo(
    () => getPrimaryCenterX(effectivePrimaryColumnCount),
    [effectivePrimaryColumnCount]
  );
  const a11yItemById = useMemo(
    () => new Map(a11yItems.allItems.map((item) => [item.id, item])),
    [a11yItems.allItems]
  );

  const publishHoveredItem = useCallback(
    (nextHoveredItem) => {
      interactionApi.publishHoveredItem(nextHoveredItem);
    },
    [interactionApi]
  );

  useEffect(() => {
    if (!focusedIdForRender) {return;}
    const focusedItem = a11yItemById.get(focusedIdForRender);
    if (!focusedItem) {return;}
    publishHoveredItem({ id: focusedItem.id, layer: focusedItem.layer });
  }, [a11yItemById, focusedIdForRender, publishHoveredItem]);

  const handleA11yItemFocus = useCallback(
    (layer, id) => {
      baseHandleA11yItemFocus(layer, id);
      publishHoveredItem({ id, layer });
    },
    [baseHandleA11yItemFocus, publishHoveredItem]
  );

  const handleCanvasKeyDown = useCallback(
    (event) => {
      baseHandleCanvasKeyDown(event);
    },
    [baseHandleCanvasKeyDown]
  );

  const handleCanvasBlur = useCallback(
    (event) => {
      baseHandleCanvasBlur(event);
      if (
        event.relatedTarget &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }
      publishHoveredItem(null);
    },
    [baseHandleCanvasBlur, publishHoveredItem]
  );

  const handleAuxiliaryControlFocus = useCallback(() => {
    baseHandleAuxiliaryControlFocus();
    publishHoveredItem(null);
  }, [baseHandleAuxiliaryControlFocus, publishHoveredItem]);

  return (
    <CanvasInteractionContext.Provider value={interactionApi}>
      <div
        ref={canvasShellRef}
        className="system-topology-3d"
        role={enableA11y ? 'region' : undefined}
        aria-label={
          enableA11y
            ? resolveI18nMessage(
                i18n,
                'canvasRegionLabel',
                DEFAULT_A11Y_COPY.canvasRegionLabel
              )
            : undefined
        }
        aria-describedby={enableA11y ? instructionsId : undefined}
        onKeyDown={handleCanvasKeyDown}
        onFocus={handleCanvasFocus}
        onBlur={handleCanvasBlur}
        onPointerEnter={() => setIsPointerInside(true)}
        onPointerLeave={() => setIsPointerInside(false)}>
        <CanvasA11yElements
          enableA11y={enableA11y}
          instructionsId={instructionsId}
          i18n={i18n}
          a11yItems={a11yItems}
          activeLayer={activeLayer}
          registerGroupButton={registerGroupButton}
          registerA11yButton={registerA11yButton}
          onGroupFocus={handleLayerGroupFocus}
          onGroupActivate={handleLayerGroupActivate}
          onItemFocus={handleA11yItemFocus}
          onItemClick={onBlockClick}
        />

        <CarouselA11yControls
          enableA11y={enableA11y}
          enableCarousel={enablePrimaryLayerCarousel}
          pageCount={primaryLayerPageCount}
          activePageIndex={activePrimaryLayerPage}
          i18n={i18n}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          onGoToPage={goToPage}
          onAuxiliaryControlFocus={handleAuxiliaryControlFocus}
          onCarouselKeyboardFocusChange={setCarouselKeyboardFocus}
        />

        <LoadingOverlay />

        <Canvas
          key={canvasKey}
          aria-hidden={enableA11y ? 'true' : undefined}
          // eslint-disable-next-line react/forbid-component-props
          style={{ width: '100%', height: '100%' }}
          camera={{
            fov: CAMERA_CONFIG.fov,
            near: CAMERA_CONFIG.near,
            far: CAMERA_CONFIG.far,
            zoom: 1.75,
          }}
          frameloop="always"
          performance={{ min: 0.5 }}
          flat
          gl={
            {
              toneMapping: THREE.NoToneMapping,
              outputColorSpace: THREE.SRGBColorSpace,
              premultipliedAlpha: false,
            } as any
          }
          resize={{ scroll: false, debounce: 0 }}>
          <Scene
            resolvedRows={resolvedRows}
            textBracket={textBracket}
            focusedIdForRender={focusedIdForRender}
            focusedGroupLayerForRender={focusedGroupLayerForRender}
            primaryColumnCount={effectivePrimaryColumnCount}
            skeletonLoader={skeletonLoader}
            skipPrimaryEnterAnimation={shouldSkipPrimaryEnterAnimation}
            onBlockClick={onBlockClick}
            enablePrimaryLayerCarousel={enablePrimaryLayerCarousel}
            primaryLayerPageCount={primaryLayerPageCount}
            activePrimaryLayerPage={activePrimaryLayerPage}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            goToPage={goToPage}
            sceneBoundsRows={sceneBoundsRows}
            carouselKeyboardFocus={carouselKeyboardFocus}
            onInitialSceneReady={handleInitialSceneReady}
            primaryCenterX={primaryCenterX}
            isPlayingIntroAnimation={isPlayingIntroAnimation}
            isPointerInside={isPointerInside}
            onIntroAnimationComplete={handleIntroAnimationComplete}
            onViewChange={onViewChange}
            theme={theme}
          />
        </Canvas>
      </div>
    </CanvasInteractionContext.Provider>
  );
}

function SystemTopology3D({
  hoveredItem,
  onHoveredItemChange,
  ...contentProps
}: SystemTopology3DProps) {
  const onHoveredItemChangeRef = useRef(onHoveredItemChange);
  const [canSyncExternalHover, setCanSyncExternalHover] = useState(false);
  const interactionApiRef = useRef(
    createCanvasInteractionApi((item) => onHoveredItemChangeRef.current?.(item))
  );

  useEffect(() => {
    onHoveredItemChangeRef.current = onHoveredItemChange;
  }, [onHoveredItemChange]);

  useEffect(() => {
    if (!canSyncExternalHover || hoveredItem === undefined) {return;}
    interactionApiRef.current.setHoveredItem(normalizeHoveredItem(hoveredItem));
  }, [canSyncExternalHover, hoveredItem]);

  return (
    <div className="system-topology-3d-shell">
      <MemoizedSystemTopology3DContent
        {...contentProps}
        interactionApi={interactionApiRef.current}
        onIntroAnimationComplete={() => setCanSyncExternalHover(true)}
      />
    </div>
  );
}

// Custom comparison function to prevent unnecessary rerenders
// This helps prevent the intro animation from flickering when parent components rerender
function arePropsEqual(
  prevProps: SystemTopology3DContentProps,
  nextProps: SystemTopology3DContentProps
): boolean {
  // Compare primitive props
  if (
    prevProps.focusedId !== nextProps.focusedId ||
    prevProps.canvasKey !== nextProps.canvasKey ||
    prevProps.primaryColumnCount !== nextProps.primaryColumnCount ||
    prevProps.skeletonLoader !== nextProps.skeletonLoader ||
    prevProps.lockColumnCount !== nextProps.lockColumnCount ||
    prevProps.enablePrimaryLayerCarousel !==
      nextProps.enablePrimaryLayerCarousel ||
    prevProps.enableA11y !== nextProps.enableA11y ||
    prevProps.theme !== nextProps.theme
  ) {
    return false;
  }

  // Compare array/object props by reference (they should be memoized by parent)
  if (
    prevProps.primaryLayer !== nextProps.primaryLayer ||
    prevProps.coreLayer !== nextProps.coreLayer ||
    prevProps.foundationConfig !== nextProps.foundationConfig ||
    prevProps.textBracket !== nextProps.textBracket ||
    prevProps.i18n !== nextProps.i18n ||
    prevProps.interactionApi !== nextProps.interactionApi
  ) {
    return false;
  }

  // Function props are compared by reference - parent should memoize these
  // to prevent unnecessary rerenders
  return true;
}

const MemoizedSystemTopology3DContent = memo(
  SystemTopology3DContent,
  arePropsEqual
);

export default SystemTopology3D;
