# SplitPanel Deprecation Plan

## Executive Summary

This document outlines the plan to deprecate the `SplitPanel` component in favor
of the more widely adopted `Resizer` component. With Resizer achieving over
14,000 downloads compared to SplitPanel's significantly lower adoption,
consolidating on Resizer will reduce maintenance burden while providing users
with a more flexible, headless solution.

**Deprecation Approach**: SplitPanel will be marked as deprecated and indicated
as unlikely to progress to v1.0.0. The source code will remain in the repository
for potential future cleanup or resurrection if needed.

## Background

- **SplitPanel**: An opinionated component that manages two panels with a
  built-in split handle (released April 2025)
- **Resizer**: A headless, atomic component extracted from SplitPanel that
  provides resizing functionality (released June 2025)
- **Current Status**: Despite being newer, Resizer has achieved 14,000+
  downloads while SplitPanel has minimal adoption
- **Relationship**: Resizer was created as a more flexible, headless alternative
  based on learnings from SplitPanel. Its superior adoption demonstrates that
  users prefer the flexible, composable approach over the opinionated two-panel
  solution.

## Unique Functionality of SplitPanel

### 1. **Opinionated Two-Panel Layout**

SplitPanel provides a complete, ready-to-use solution with:

- Two predefined panel slots (`childrenBeforeSplit` and `childrenAfterSplit`)
- Automatic panel sizing using CSS Grid with fractional units
- Built-in panel wrapper elements with layer styling

### 2. **Percentage-Based Split Values**

- Uses percentage values (0-100) for split positioning
- `defaultSplitValue` prop for initial split position
- `splitMin` and `splitMax` props for constraining split range
- `onChange` callback reports current split value as percentage

### 3. **Built-in Visual Handle**

- Includes drag icons (`DragHorizontal` and `DragVertical` from Carbon)
- Handle styling integrated with Carbon Design System
- Automatic icon selection based on orientation

### 4. **Gap Management**

- Predefined gap sizes: `default`, `narrow`, `none`
- Gaps correspond to Carbon grid spacing (default, narrow, condensed)
- Automatic gap styling between panels

### 5. **Integrated ARIA Attributes**

- Pre-configured `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Automatic aria-orientation based on orientation prop
- Built-in separator role

### 6. **Keyboard Interaction Defaults**

- Pre-configured step sizes: 5px (normal) and 25px (shift)
- `splitKeyStepPixels` and `splitShiftKeyStepPixels` props for customization
- Home/End key support for min/max values

## Migration Stories: Replacing SplitPanel with Resizer

### Story 1: Basic Two-Panel Layout (Horizontal)

**Before (SplitPanel):**

```jsx
<SplitPanel
  orientation="horizontal"
  defaultSplitValue={50}
  childrenBeforeSplit={<div>Top Panel</div>}
  childrenAfterSplit={<div>Bottom Panel</div>}
  style={{ height: '400px', width: '600px' }}
/>
```

**After (Resizer):**

```jsx
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    width: '600px',
  }}>
  <div style={{ height: '50%', backgroundColor: 'var(--cds-layer)' }}>
    Top Panel
  </div>
  <Resizer orientation="horizontal" />
  <div style={{ height: '50%', backgroundColor: 'var(--cds-layer)' }}>
    Bottom Panel
  </div>
</div>
```

### Story 2: Vertical Split with Custom Gap

**Before (SplitPanel):**

```jsx
<SplitPanel
  orientation="vertical"
  gap="narrow"
  defaultSplitValue={30}
  childrenBeforeSplit={<div>Left Panel</div>}
  childrenAfterSplit={<div>Right Panel</div>}
/>
```

**After (Resizer):**

```jsx
<div
  style={{
    display: 'flex',
    gap: 'var(--cds-spacing-03)', // narrow gap
  }}>
  <div
    style={{
      width: '30%',
      backgroundColor: 'var(--cds-layer)',
      minWidth: '48px',
    }}>
    Left Panel
  </div>
  <Resizer orientation="vertical" />
  <div
    style={{
      width: '70%',
      backgroundColor: 'var(--cds-layer)',
      minWidth: '48px',
    }}>
    Right Panel
  </div>
</div>
```

### Story 3: Controlled Split with onChange

**Before (SplitPanel):**

```jsx
const [splitValue, setSplitValue] = useState(50);

<SplitPanel
  orientation="horizontal"
  defaultSplitValue={splitValue}
  onChange={(value) => {
    setSplitValue(value);
    console.log('Split at:', value, '%');
  }}
  splitMin={10}
  splitMax={90}
  childrenBeforeSplit={<div>Panel A</div>}
  childrenAfterSplit={<div>Panel B</div>}
/>;
```

**After (Resizer):**

```jsx
const containerRef = useRef(null);
const [splitPercent, setSplitPercent] = useState(50);

const handleResize = (event, delta) => {
  const container = containerRef.current;
  if (!container) return;

  const totalHeight = container.offsetHeight;
  const topPanel = container.firstElementChild;
  const currentHeight = topPanel.clientHeight;
  const newHeight = Math.max(
    totalHeight * 0.1, // 10% min
    Math.min(totalHeight * 0.9, currentHeight + delta) // 90% max
  );

  topPanel.style.height = `${newHeight}px`;
  const percent = (newHeight / totalHeight) * 100;
  setSplitPercent(percent);
  console.log('Split at:', percent.toFixed(1), '%');
};

<div
  ref={containerRef}
  style={{
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
  }}>
  <div
    style={{
      height: '50%',
      backgroundColor: 'var(--cds-layer)',
      minHeight: '10%',
    }}>
    Panel A
  </div>
  <Resizer orientation="horizontal" onResize={handleResize} />
  <div
    style={{
      flex: 1,
      backgroundColor: 'var(--cds-layer)',
    }}>
    Panel B
  </div>
</div>;
```

### Story 4: Nested Panels

**Before (SplitPanel):**

```jsx
<SplitPanel
  orientation="horizontal"
  defaultSplitValue={25}
  childrenBeforeSplit={
    <SplitPanel
      orientation="vertical"
      defaultSplitValue={25}
      childrenBeforeSplit={<div>Top Left</div>}
      childrenAfterSplit={<div>Bottom Left</div>}
    />
  }
  childrenAfterSplit={<div>Right</div>}
/>
```

**After (Resizer):**

```jsx
<div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
  <div style={{ height: '25%', display: 'flex' }}>
    <div
      style={{
        width: '25%',
        backgroundColor: 'var(--cds-layer)',
        minWidth: '48px',
      }}>
      Top Left
    </div>
    <Resizer orientation="vertical" />
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--cds-layer)',
      }}>
      Bottom Left
    </div>
  </div>
  <Resizer orientation="horizontal" />
  <div
    style={{
      flex: 1,
      backgroundColor: 'var(--cds-layer)',
    }}>
    Right
  </div>
</div>
```

## Options to Provide SplitPanel's Unique Functionality

### Option 1: Migration Guide Only (Recommended)

**Approach**: Provide comprehensive migration documentation showing how to
replicate SplitPanel functionality using Resizer.

**Pros**:

- Encourages adoption of the more flexible Resizer component
- Reduces maintenance burden
- Aligns with Resizer's headless design philosophy
- Users gain more control over styling and behavior

**Cons**:

- Requires more code from users
- Migration effort for existing SplitPanel users
- Loss of percentage-based API convenience

**Implementation**:

- Create detailed migration guide with examples
- Provide code snippets for common patterns
- Document how to achieve gap, percentage values, and onChange behavior

### Option 2: SplitPanel Wrapper Component

**Approach**: Create a thin wrapper around Resizer that provides SplitPanel's
API as a compatibility layer.

**Pros**:

- Easier migration path for existing users
- Maintains familiar API
- Can be marked as deprecated while still functional

**Cons**:

- Adds maintenance burden
- May delay full migration to Resizer
- Doesn't leverage Resizer's flexibility

**Implementation**:

```jsx
// SplitPanel.tsx (deprecated wrapper)
export const SplitPanel = ({
  childrenBeforeSplit,
  childrenAfterSplit,
  orientation = 'horizontal',
  defaultSplitValue = 50,
  gap = 'default',
  onChange,
  splitMin = 0,
  splitMax = 100,
  ...rest
}) => {
  // Implementation using Resizer internally
  // Mark as deprecated in JSDoc
};
```

### Option 3: Utility Hooks/Helpers (Option 1 + Helpers)

**Approach**: Provide comprehensive migration guide (Option 1) **plus** optional
React hooks or utility functions to simplify common SplitPanel patterns with
Resizer.

**Pros**:

- Provides convenience without maintaining full component
- Encourages Resizer adoption while easing migration
- Flexible and composable
- Reduces boilerplate for common patterns
- Users can choose to use helpers or implement directly

**Cons**:

- Still requires learning new patterns
- Additional documentation needed
- Adds some maintenance burden (though less than full component)
- May delay some users from learning Resizer's full flexibility

**Implementation**:

```jsx
// usePercentageSplit.ts - Optional helper for percentage-based splits
export const usePercentageSplit = (
  containerRef,
  orientation,
  defaultValue = 50,
  min = 0,
  max = 100
) => {
  // Returns handlers for Resizer that work with percentages
  // Users can choose to use this or implement their own logic
};
```

**Note**: This option combines the migration guide approach with optional
convenience utilities. Users who want maximum control can follow the migration
guide directly, while those who want convenience can use the helpers.

### Option 4: Enhanced Resizer Props (Not Recommended)

**Approach**: Add SplitPanel-specific features directly to Resizer.

**Pros**:

- Single component to maintain

**Cons**:

- Violates Resizer's headless design principle
- Increases Resizer complexity
- May conflict with existing Resizer usage patterns

## Recommended Deprecation Plan

### Phase 1: Documentation & Deprecation Notice (Month 1-2)

**Goal**: Mark SplitPanel as deprecated and provide clear migration path to
Resizer

1. **Add deprecation notice to SplitPanel documentation**

   - Update README.md with deprecation warning and link to Resizer
   - Add prominent banner to Storybook stories
   - Update package.json description with deprecation notice

2. **Create comprehensive migration guide**

   - Document all migration stories (see above sections)
   - Provide side-by-side comparisons of SplitPanel vs Resizer
   - Include links to Resizer documentation and examples
   - Add troubleshooting section for common migration issues

3. **Add runtime deprecation warnings**

   ```jsx
   useEffect(() => {
     console.warn(
       'SplitPanel is deprecated and unlikely to progress to v1.0.0. ' +
         'Please migrate to Resizer for continued support. See migration guide: [URL]'
     );
   }, []);
   ```

4. **Communication**
   - Announce in Carbon Labs Slack channel (#carbon-labs)
   - Add to CHANGELOG.md
   - Update component status in Storybook to "Deprecated"

### Phase 2: Investigation & Optional Helpers (Month 2-4)

**Goal**: Investigate if developer hooks/helpers would reduce migration friction

1. **Gather migration feedback**

   - Monitor migration questions and pain points
   - Identify common patterns that require significant boilerplate
   - Assess if helpers would provide meaningful value

2. **Evaluate helper utility options**

   - Determine if percentage-based split helpers are needed
   - Consider gap management utilities
   - Assess demand for onChange callback helpers

3. **Decision point: Implement helpers or not**

   - **If helpers are valuable**: Create optional utility hooks/functions
   - **If not needed**: Continue with migration guide only approach
   - Document decision and rationale

4. **If implementing helpers**:

   ```jsx
   // Example: usePercentageSplit.ts
   export const usePercentageSplit = (
     containerRef,
     orientation,
     defaultValue = 50,
     min = 0,
     max = 100
   ) => {
     // Returns handlers for Resizer that work with percentages
   };
   ```

### Phase 3: Deprecation Period (Month 3-8)

**Goal**: Support users during migration while monitoring adoption

1. **Mark package as deprecated in npm**

   ```bash
   npm deprecate @carbon-labs/react-split-panel "Deprecated in favor of @carbon-labs/react-resizer"
   ```

2. **Update all examples and documentation**

   - Replace SplitPanel examples with Resizer equivalents
   - Update Stackblitz examples
   - Archive old SplitPanel examples with deprecation notice

3. **Monitor usage and provide support**

   - Track npm download trends
   - Respond to migration questions
   - Collect feedback on migration guide and helpers (if implemented)

### Phase 4: Long-term Maintenance (Month 9+)

**Goal**: Maintain deprecated status without active removal

1. **Ongoing status**

   - Keep component marked as deprecated in npm
   - Maintain deprecation warnings in documentation
   - Source code remains in repository for potential future use

2. **No active development**

   - No new features will be added
   - Only critical security fixes if necessary
   - Component will not progress to v1.0.0

3. **Future options**

   - Code remains available for resurrection if use case emerges
   - Can be removed in future major cleanup if desired
   - Serves as reference implementation for migration guide

## Success Metrics

1. **Adoption Metrics**

   - Decrease in SplitPanel npm downloads
   - Increase in Resizer npm downloads
   - Reduction in SplitPanel-related support questions

2. **Migration Completion**

   - Zero internal Carbon Labs usage of SplitPanel
   - All examples migrated to Resizer
   - Documentation fully updated

3. **User Satisfaction**
   - Positive feedback on migration guide
   - Minimal migration-related issues
   - Community acceptance of deprecation

## Risk Mitigation

### Risk 1: User Resistance

**Mitigation**:

- Provide excellent migration documentation
- Offer support during transition period
- Consider temporary wrapper if needed

### Risk 2: Complex Migration Cases

**Mitigation**:

- Document advanced patterns
- Provide helper utilities if common patterns emerge
- Offer direct support for complex cases

### Risk 3: Breaking Existing Applications

**Mitigation**:

- Soft deprecation approach (no forced removal)
- Clear communication and warnings
- Source code remains available indefinitely
- Component continues to function for existing users

## Conclusion

Deprecating SplitPanel in favor of Resizer aligns with the component's evolution
and user adoption patterns. Resizer's headless, flexible design provides
superior customization while reducing maintenance burden. With a thoughtful
migration plan and comprehensive documentation, users can successfully
transition to Resizer while gaining access to a more powerful and widely-adopted
solution.

**Deprecation Approach**: Soft deprecation with source code retention rather
than forced removal. This allows existing users to continue using SplitPanel
while clearly signaling that Resizer is the recommended path forward and that
SplitPanel is unlikely to progress to v1.0.0.

**Recommended Timeline**: 2-4 months for initial deprecation and migration
guide, then ongoing deprecated status

**Next Steps**:

1. Review and approve this deprecation plan
2. Create migration guide documentation
3. Implement Phase 1 deprecation notices
4. Announce deprecation to community
5. Investigate helper utilities based on migration feedback (Phase 2)

**Recommended Timeline**: 9-12 months from announcement to removal

**Next Steps**:

1. Review and approve this deprecation plan
2. Create migration guide documentation
3. Implement Phase 1 deprecation notices
4. Announce deprecation to community
