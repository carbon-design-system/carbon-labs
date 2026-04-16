/**
 * R3F component prop typedefs (JSDoc only).
 */

/**
 * Props for the top-level System Topology.
 * Supply the data for each rendered layer, optional controlled interaction state,
 * layout behavior flags, and accessibility copy overrides.
 *
 * @typedef {{
 *   /** Primary blocks rendered in the top layer of the visualization. *\/
 *   primaryLayer?: import("./visualization-config").PrimaryLayerBlock[],
 *   /** Core service blocks rendered beneath the primary layer. *\/
 *   coreLayer?: import("./visualization-config").CoreLayerConfig[],
 *   /** Rack and drawer configuration for the foundation layer. *\/
 *   foundationConfig?: import("./visualization-config").FoundationConfig,
 *   /** Optional title and supporting copy rendered beside the scene. *\/
 *   textBracket?: { title?: string, sections?: string[] },
 *
 *  /** Controlled focused item id used by keyboard navigation and focus styling. *\/
 *   focusedId?: string | null,
 *  /** Called when the focused item changes through canvas interaction or a11y navigation. *\/
 *   onFocusedIdChange?: (id: string | null) => void,
 *  /** Controlled hovered item state shared with the canvas interaction context. *\/
 *   hoveredItem?: { id: string | null, layer: "primary" | "core" | "foundation" | null } | null,
 *  /** Called when pointer or keyboard hover state changes inside the canvas. *\/
 *   onHoveredItemChange?: (item: { id: string | null, layer: "primary" | "core" | "foundation" | null } | null) => void,
 *
 *   /** Called when a clickable block in any layer is activated. *\/
 *   onBlockClick?: (id?: string) => void,
 *   /** Called when the camera/view state changes. *\/
 *   onViewChange?: (info: unknown) => void,
 *
 *   /** Intentionally remounts the React Three Fiber canvas when changed. *\/
 *   canvasKey?: string | number,
 *   /** Enables paged carousel behavior for the primary layer when it overflows. *\/
 *   enablePrimaryLayerCarousel?: boolean,
 *   /** Keeps `primaryColumnCount` fixed instead of automatically using the responsive 2/4/6/8 column count. *\/
 *   lockColumnCount?: boolean,
 *   /** Explicit number of primary columns to render when column locking is enabled. Defaults to 8. *\/
 *   primaryColumnCount?: number,
 *   /** Shows loading scaffolds in the primary layer when data has not loaded yet. *\/
 *   skeletonLoader?: boolean,
 *   /** Optional responsive width thresholds for switching between 2, 4, 6, and 8 columns. *\/
 *   responsiveColumnBreakpoints?: { twoColumns: number, fourColumns: number, sixColumns: number },
 *   /** Optional notification when the responsive primary column count changes. *\/
 *   onResponsiveColumnCountChange?: (count: number) => void,
 *
 *   /** Enables accessibility helpers, focus management, and off-canvas controls. *\/
 *   enableA11y?: boolean,
 *   /** Optional accessibility and UI copy overrides. *\/
 *   i18n?: {
 *     /** Accessible label applied to the canvas region wrapper. *\/
 *     canvasRegionLabel?: string,
 *     /** Instructional text announced to assistive technology users. *\/
 *     canvasInstructions?: string,
 *     /** Label for the primary layer button group in the a11y controls. *\/
 *     primaryLayerGroupLabel?: string,
 *     /** Label for the core layer button group in the a11y controls. *\/
 *     coreLayerGroupLabel?: string,
 *     /** Label for the foundation layer button group in the a11y controls. *\/
 *     foundationLayerGroupLabel?: string,
 *     /** Label for the primary layer carousel controls group. *\/
 *     primaryCarouselGroupLabel?: string,
 *     /** Accessible label for the previous primary carousel page control. *\/
 *     primaryCarouselPreviousLabel?: string,
 *     /** Accessible label for the next primary carousel page control. *\/
 *     primaryCarouselNextLabel?: string,
 *     /** Accessible label or label builder for each primary carousel page button. *\/
 *     primaryCarouselPageLabel?: string | ((params: { index: number, position: number, total: number }) => string),
 *     /** Accessible label or label builder for each primary layer item. *\/
 *     primaryItemLabel?: string | ((params: { label: string, index: number, position: number, total: number, layer: string }) => string),
 *     /** Accessible label or label builder for each core layer item. *\/
 *     coreItemLabel?: string | ((params: { label: string, index: number, position: number, total: number, layer: string }) => string),
 *     /** Accessible label or label builder for each foundation layer item. *\/
 *     foundationItemLabel?: string | ((params: { label: string, index: number, position: number, total: number, layer: string }) => string)
 *   }
 * }} VisualizationCanvasProps
 */

/**
 * @typedef {{
 *   rowData: import("./visualization-config").CanvasRow,
 *   yPosition?: number,
 *   totalColumns?: number,
 *   rowIndex?: number,
 *   rowStartIndex?: number,
 *   focusedId?: string | null,
 *   rowTypeOrdinal?: number
 * }} RowLayoutProps
 */

/**
 * @typedef {{
 *   position?: [number, number, number],
 *   dimensions: { width: number, height: number, depth: number },
 *   variant?: import("./visualization-config").FoundationRackVariant,
 *   status?: import("./visualization-config").FoundationRackStatus,
 *   drawerCount?: number,
 *   drawerSlideDistance?: number,
 *   isFocused?: boolean,
 *   onBlockClick?: (id?: string) => void,
 *   blockId?: string
 * }} FoundationLayerProps
 */

/**
 * @typedef {{
 *   position: [number, number, number],
 *   dimensions: { width: number, height: number, depth: number },
 *   isHovered?: boolean,
 *   isExtended?: boolean,
 *   status?: import("./visualization-config").FoundationRackStatus,
 *   opacity?: number,
 *   drawerIndex?: number,
 *   drawerTotal?: number,
 *   slideDistance?: number
 * }} ServerDrawerProps
 */

export {};
