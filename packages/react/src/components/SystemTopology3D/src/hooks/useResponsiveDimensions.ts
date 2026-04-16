/**
 * Carbon Grid Breakpoints
 * https://carbondesignsystem.com/guidelines/2x-grid/overview/#breakpoints
 */
export const CARBON_BREAKPOINTS = {
  sm: 320, // Small (mobile)
  md: 672, // Medium (tablet)
  lg: 1056, // Large (desktop)
  xlg: 1312, // Extra large
  max: 1584, // Maximum
} as const;

export interface ResponsiveColumnBreakpoints {
  twoColumns: number;
  fourColumns: number;
  sixColumns: number;
}

export const DEFAULT_RESPONSIVE_COLUMN_BREAKPOINTS: ResponsiveColumnBreakpoints =
  {
    twoColumns: CARBON_BREAKPOINTS.md,
    fourColumns: CARBON_BREAKPOINTS.lg,
    sixColumns: CARBON_BREAKPOINTS.xlg,
  };

/**
 * Hook to determine responsive column count based on Carbon Grid breakpoints
 * Returns the appropriate number of columns for the current container size
 */
export function useResponsiveColumnCount(
  containerWidth?: number,
  breakpoints: ResponsiveColumnBreakpoints =
    DEFAULT_RESPONSIVE_COLUMN_BREAKPOINTS,
) {
  const resolvedWidth =
    typeof containerWidth === "number" && Number.isFinite(containerWidth)
      ? containerWidth
      : CARBON_BREAKPOINTS.max;

  // Map Carbon breakpoints to column counts
  // sm (< 672px): 2 columns
  // md (672px - 1056px): 4 columns
  // lg (1056px - 1312px): 6 columns
  // xlg+ (>= 1312px): 8 columns
  if (resolvedWidth < breakpoints.twoColumns) {
    return 2;
  } else if (resolvedWidth < breakpoints.fourColumns) {
    return 4;
  } else if (resolvedWidth < breakpoints.sixColumns) {
    return 6;
  } else {
    return 8;
  }
}
