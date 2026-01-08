# SplitPanel Deprecation Announcement

## Summary

SplitPanel is now **deprecated** and unlikely to progress to v1.0.0. All users
should migrate to the more flexible and widely adopted **Resizer** component.

## Why Deprecate?

- **Low adoption**: SplitPanel has minimal npm downloads compared to Resizer
  (14,000+ downloads)
- **Overlapping functionality**: Both components serve similar purposes
- **Better alternative exists**: Resizer is more flexible, headless, and better
  maintained
- **Maintenance burden**: Maintaining two similar components is inefficient

## Migration Path

We've created a comprehensive migration guide with working examples:

📖
**[Migration Guide](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/SplitPanel/DEPRECATION-plan.md)**

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

### Storybook Examples

We've added 6 migration stories in Storybook demonstrating each pattern:

- `MigrationVerticallySplitWithResizer`
- `MigrationHorizontallySplitWithResizer`
- `MigrationWithGap`
- `MigrationWithOnChange`
- `MigrationWithConstraints`
- `MigrationWithDefaultValue`

## What's Changed

✅ **Documentation**

- Added deprecation banner to Storybook
- Updated README.md with deprecation notice
- Created comprehensive DEPRECATION-plan.md
- Changed Storybook status to "🛑 Deprecated"
- Moved stories to "Deprecated/Components/SplitPanel" path

✅ **Runtime Warnings**

- Console warning in development mode
- Links to migration guide

✅ **Package Metadata**

- Updated package.json description with deprecation notice
- Added CHANGELOG entry

## Timeline

### Phase 1: Documentation & Deprecation (Current)

- ✅ Mark as deprecated
- ✅ Provide migration guide
- ✅ Add runtime warnings

### Phase 2: Investigation (Month 2-4)

- Gather migration feedback
- Evaluate if helper utilities are needed
- Monitor adoption metrics

### Phase 3: Ongoing (Month 4+)

- Component remains available but receives no new features
- Only critical security fixes if necessary
- Will not progress to v1.0.0

## Support

- **Migration questions**: #carbon-labs Slack channel
- **Migration guide**:
  [DEPRECATION-plan.md](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/SplitPanel/DEPRECATION-plan.md)
- **Resizer documentation**:
  [Storybook](https://labs.carbondesignsystem.com/react/?path=/docs/components-resizer--docs)

## For Existing Users

**Don't panic!**

- SplitPanel will remain available in the repository
- Source code will not be removed
- Existing implementations will continue to work
- You can migrate at your own pace

However, we strongly encourage migration to Resizer for:

- Continued support and updates
- More flexibility and control
- Better long-term maintenance
- Access to new features

## Questions?

Please reach out in #carbon-labs or open an issue on GitHub.

---

**Links:**

- [Migration Guide](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/SplitPanel/DEPRECATION-plan.md)
- [Resizer Component](https://labs.carbondesignsystem.com/react/?path=/docs/components-resizer--docs)
- [SplitPanel Storybook](https://labs.carbondesignsystem.com/react/?path=/docs/deprecated-components-splitpanel--docs)
