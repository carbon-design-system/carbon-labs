/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * R3F component prop typedefs (JSDoc only).
 */
/* eslint-disable jsdoc/valid-types */

/**
 * Props for the top-level Plane Stack 3D.
 * Supply the data for each rendered layer, optional controlled interaction state,
 * layout behavior flags, and accessibility copy overrides.
 *
 * @typedef {object} PlaneStack3DProps
 * @property {import("./visualization-config").PrimaryLayerBlock[]=} primaryLayer
 * @property {import("./visualization-config").CoreLayerConfig[]=} coreLayer
 * @property {import("./visualization-config").FoundationConfig=} foundationConfig
 * @property {{ title?: string, sections?: string[] }=} textBracket
 * @property {string | null=} focusedId
 * @property {(id: string | null) => void=} onFocusedIdChange
 * @property {{ id: string | null, layer: "primary" | "core" | "foundation" | null } | null=} hoveredItem
 * @property {(item: { id: string | null, layer: "primary" | "core" | "foundation" | null } | null) => void=} onHoveredItemChange
 * @property {(id?: string) => void=} onBlockClick
 * @property {(info: unknown) => void=} onViewChange
 * @property {string | number=} canvasKey
 * @property {boolean=} enablePrimaryLayerCarousel
 * @property {boolean=} lockColumnCount
 * @property {number=} primaryColumnCount
 * @property {boolean=} skeletonLoader
 * @property {{ twoColumns: number, fourColumns: number, sixColumns: number }=} responsiveColumnBreakpoints
 * @property {(count: number) => void=} onResponsiveColumnCountChange
 * @property {boolean=} enableA11y
 * @property {object=} i18n
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
