# SplitPanel Deprecation Proposal

## Proposal Summary

This PR proposes to **deprecate SplitPanel** in favor of the more flexible and
widely adopted **Resizer** component. This is a soft deprecation - the component
will remain available but will not progress to v1.0.0 or receive new features.

## Rationale

- **Low adoption**: SplitPanel has minimal npm downloads compared to Resizer
  (14,000+ downloads)
- **Overlapping functionality**: Both components serve similar purposes
- **Better alternative exists**: Resizer is more flexible, headless, and better
  maintained
- **Maintenance burden**: Maintaining two similar components is inefficient

## What This PR Includes

### ✅ Documentation Updates

- Added deprecation banner to Storybook with ⚠️ warning
- Updated README.md with deprecation notice
- Created comprehensive DEPRECATION-plan.md migration guide
- Changed Storybook status to "🛑 Deprecated"
- Moved stories to "Deprecated/Components/SplitPanel" path
- Updated package.json description with deprecation notice

### ✅ Migration Support

- Created 6 working migration stories demonstrating Resizer usage:
  1. `MigrationVerticallySplitWithResizer` - Stacked panels
  2. `MigrationHorizontallySplitWithResizer` - Side-by-side panels
  3. `MigrationWithGap` - Gap control
  4. `MigrationWithOnChange` - Percentage tracking
  5. `MigrationWithConstraints` - Min/Max constraints
  6. `MigrationWithDefaultValue` - Initial split position

### ✅ Runtime Warnings

- Added console.warn in development mode
- Links to migration guide

### ✅ CHANGELOG Entry

- Added [Unreleased] section documenting the deprecation

## Migration Path

We've created a comprehensive migration guide showing how to replicate all
SplitPanel features with Resizer:

📖 **[Migration Guide](./DEPRECATION-plan.md)**

### Quick Migration Examples

All SplitPanel features can be replicated with Resizer:

1. **Vertically stacked panels** (SplitPanel horizontal) → Resizer with
   `orientation="horizontal"`
2. **Side-by-side panels** (SplitPanel vertical) → Resizer with
   `orientation="vertical"`
3. **Gap control** → CSS `gap` property
4. **Percentage tracking** → `onResizeEnd` callback with ResizeObserver
5. **Min/Max constraints** → Custom `onResize` handler with validation
6. **Default split position** → CSS percentage values

## Proposed Timeline

### Phase 1: Soft Deprecation (Immediate - upon PR merge)

- ✅ Mark as deprecated in all documentation
- ✅ Provide comprehensive migration guide
- ✅ Add runtime warnings
- Component remains available and functional

### Phase 2: Feedback & Investigation (Month 2-4)

- Gather migration feedback from users
- Evaluate if helper utilities would ease migration
- Monitor adoption metrics
- Decide on optional helper hooks/functions

### Phase 3: Long-term Maintenance (Month 4+)

- Component remains available but receives no new features
- Only critical security fixes if necessary
- Will not progress to v1.0.0
- Source code remains in repository

## Impact on Users

### For Existing Users

**No immediate action required:**

- SplitPanel will continue to work
- Source code will not be removed
- Existing implementations remain functional
- Migration can happen at your own pace

**However, we recommend migration for:**

- Continued support and updates
- More flexibility and control
- Better long-term maintenance
- Access to new features in Resizer

### For New Users

- Should use Resizer instead of SplitPanel
- Clear migration examples provided
- Resizer is more flexible and better maintained

## Questions for Review

1. **Is the migration guide comprehensive enough?** Have we covered all common
   use cases?
2. **Should we implement helper utilities?** Or is the migration guide
   sufficient?
3. **Is the timeline appropriate?** Should we adjust the phases?
4. **Communication plan**: How should we announce this to users?

## Support & Communication

Once merged, we propose to:

1. Announce in #carbon-labs Slack channel
2. Monitor for migration questions and feedback
3. Update based on user feedback
4. Evaluate need for helper utilities after 2-4 months

## Links

- [Migration Guide](./DEPRECATION-plan.md)
- [Resizer Component](https://labs.carbondesignsystem.com/react/?path=/docs/components-resizer--docs)
- [SplitPanel Storybook](https://labs.carbondesignsystem.com/react/?path=/docs/deprecated-components-splitpanel--docs)

---

## Suggested Slack Message (After PR Merge)

```
📋 RFC: SplitPanel Deprecation Proposal

We're proposing to deprecate @carbon-labs/react-split-panel in favor of the more flexible Resizer component.

This is a soft deprecation - the component will remain available but won't progress to v1.0.0.

🔗 PR: [link]
📖 Migration Guide: [link to DEPRECATION-plan.md]
💬 Feedback welcome!

Key points:
• Comprehensive migration guide with 6 working examples
• Component remains functional for existing users
• Migration can happen at your own pace
• We'll evaluate helper utilities based on feedback

Please review and share your thoughts!
```
