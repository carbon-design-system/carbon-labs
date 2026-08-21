# Focus Region Pattern Specification

## About This Pattern

The Focus Region pattern provides a mechanism for keyboard users to efficiently navigate between major sections of an application using F6/Shift+F6. Each region maintains a "focus location" that remembers the last focused element, allowing users to quickly jump back to where they were working in each section.

This pattern is particularly useful for:
- Complex applications with multiple interactive regions (headers, sidebars, main content, toolbars)
- Modal dialogs that need to restrict focus to specific regions
- Applications where keyboard-only users need efficient navigation between sections

## Example

[Link to working example would go here]

## Keyboard Interaction

### Normal Tab Navigation

| Key | Function |
|-----|----------|
| <kbd>Tab</kbd> | Moves focus to the next tabbable element in the natural DOM order. Works normally across the entire page. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous tabbable element in the natural DOM order. Works normally across the entire page. |

### Between Regions (F6 Navigation)

| Key | Function |
|-----|----------|
| <kbd>F6</kbd> | Moves focus to the focus location of the next enabled region in DOM order. Wraps from the last region to the first region. |
| <kbd>Shift</kbd> + <kbd>F6</kbd> | Moves focus to the focus location of the previous enabled region in DOM order. Wraps from the first region to the last region. |

**Focus Location:** Each region tracks the last element that received focus within it. When navigating to a region via F6:
1. If the region was previously visited, focus moves to the last focused element
2. If the region has never been visited, focus moves to the first tabbable element
3. If the region is empty (no tabbable elements), focus moves to the region container itself (which has `tabindex="-1"`)

### Modal Behavior

| Context | Key | Function |
|---------|-----|----------|
| No modal active | <kbd>Tab</kbd> | Normal tab order through entire page |
| No modal active | <kbd>F6</kbd> | Cycles through all enabled regions |
| Modal active | <kbd>Tab</kbd> | Wraps within modal regions only; does not escape to non-modal content |
| Modal active | <kbd>F6</kbd> | Cycles only through regions in the active modal group |
| Modal active | <kbd>Escape</kbd> | Closes the modal and returns focus (implementation-specific, not enforced by pattern) |

## Roles, States, and Properties

### Region Container

| Role | Attribute | Element | Usage |
|------|-----------|---------|-------|
| `region` | | `div` (or semantic element) | Identifies the element as a landmark region. Default role when no semantic element is used. |
| `main` | | `main` | Identifies the primary content region. Should appear only once per page. |
| `navigation` | | `nav` | Identifies a navigation region. |
| `complementary` | | `aside` | Identifies a supporting section of content. |
| `banner` | | `header` | Identifies the header region. Should appear only once per page. |
| `contentinfo` | | `footer` | Identifies the footer region. Should appear only once per page. |
| | `aria-label` | `div`, `main`, `nav`, etc. | Provides an accessible name for the region. **Required** when using `role="region"`. Recommended for all regions. |
| | `aria-labelledby` | `div`, `main`, `nav`, etc. | References an element that labels the region. Alternative to `aria-label`. |
| | `tabindex="-1"` | `div`, `main`, `nav`, etc. | Makes the region container programmatically focusable. **Required** for empty regions and F6 navigation. |
| | `data-focus-region` | `div`, `main`, `nav`, etc. | Implementation-specific attribute for identifying focus regions. |
| | `data-focus-region-id` | `div`, `main`, `nav`, etc. | Implementation-specific attribute containing the unique region ID. |
| | `data-focus-region-group` | `div`, `main`, `nav`, etc. | Implementation-specific attribute for modal group membership. Contains the group ID if specified. |

## Behavior Specifications

### 1. Normal Tab Order

**Default Behavior:**
- Tab and Shift+Tab work normally through the entire page in DOM order
- No tab trapping or wrapping within regions
- Users can Tab through all tabbable elements naturally
- Focus regions do not interfere with normal Tab navigation

**Tabbable Element Detection:**

The implementation uses comprehensive tabbable element detection for F6 navigation fallback:

- **Selector-based matching**: `a[href]`, `area[href]`, `button`, `input`, `select`, `textarea`, `iframe`, `object`, `embed`, `[tabindex]`, `[contenteditable]`
- **Visibility checks**: Excludes elements with `hidden` attribute, `display: none`, or `visibility: hidden`
- **Inert detection**: Excludes elements within an `inert` subtree
- **Shadow DOM traversal**: Recursively searches open shadow roots for tabbable elements
- **Disabled filtering**: Excludes disabled form controls and `tabindex="-1"` elements

This ensures F6 navigation reliably finds the first interactive element in each region, even in complex component hierarchies.

### 2. Focus Location Tracking

**Purpose:** Each region maintains a "focus location" - the last element that received focus within that region.

**Behavior:**
- When an element within a region receives focus (via Tab, click, or programmatic focus), that element becomes the region's focus location
- The focus location is stored and persists as the user navigates away from the region
- When F6 navigates to a region, focus moves to the stored focus location
- If no focus location exists (region never visited), focus moves to the first tabbable element
- If the stored focus location no longer exists in the DOM, focus moves to the first tabbable element

**Initial Focus Location:**
- On page load, each region's initial focus location is the first tabbable element within it
- If a region is marked as default, focus moves to that region's focus location on page load

### 3. F6 Navigation

**Between Regions:**
- <kbd>F6</kbd> moves focus to the focus location of the next enabled region in DOM order
- <kbd>Shift</kbd> + <kbd>F6</kbd> moves focus to the focus location of the previous enabled region in DOM order
- Navigation wraps: from last region to first, and first region to last
- Disabled regions (`enabled={false}`) are skipped during F6 navigation

**Focus Target in Destination Region:**
1. **If the region has a stored focus location:** Focus that element
2. **If the region has never been visited:** Focus the first tabbable element
3. **If the region is empty (no tabbable elements):** Focus the region container itself (which has `tabindex="-1"`)

**Region Order:**
- Regions are ordered by their position in the DOM
- F6 navigates forward through this order
- Shift+F6 navigates backward through this order

### 4. Empty Region Behavior

**Definition:** A region with no tabbable child elements.

**Behavior:**
- The region container itself receives focus when navigated to via <kbd>F6</kbd>
- The region container must have `tabindex="-1"` to accept programmatic focus
- <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> work normally (move to next/previous tabbable element in DOM)
- <kbd>F6</kbd> and <kbd>Shift</kbd> + <kbd>F6</kbd> continue to work normally
- The region must have an accessible name (`aria-label` or `aria-labelledby`) so screen readers can announce meaningful information

**Accessibility Requirement:**
- The focused region container must display a visible focus indicator that meets WCAG 2.4.11 (Focus Appearance) requirements

### 5. Default Region

**Purpose:** Specify which region should receive focus on page load.

**Behavior:**
- Any region may be marked as the default via an `isDefault` attribute/prop
- Only the **first** region with `isDefault` in DOM order is respected
- When a default region is specified, focus moves to that region's focus location on page load
- If no region is marked as default, focus remains wherever the browser naturally places it
- Multiple `isDefault` declarations should trigger a development warning

**Focus on Load:**
- If the default region has tabbable elements, focus the first one
- If the default region is empty, focus the region container

### 6. Modal Behavior

**Group-Based Focus Restriction:**
- Regions can belong to one or more groups via a `groupId` attribute
- Groups are identified by string IDs (e.g., `"my-dialog"`, `"toolbar"`)
- A region can belong to multiple groups (comma-separated: `"dialog-1, overlay"`)

**Modal Stack:**
- A global modal stack tracks active modal groups
- When a group is pushed onto the stack, it becomes the active modal context
- Only regions belonging to the active group are enabled for F6 navigation
- All other regions and non-modal content become `inert` automatically

**Stack Operations:**
- `pushModal(groupId, options)`: Activates a modal group
  - Captures `document.activeElement` for later restoration
  - Optionally accepts `initialFocus` target (selector or element reference)
  - If `initialFocus` not provided, focuses first tabbable element in first modal region
  - Sets `inert` on all non-modal content
- `popModal(groupId?)`: Deactivates a modal group
  - If `groupId` provided, removes that specific group (warns if not at top of stack)
  - If `groupId` omitted, removes top of stack
  - Removes `inert` from non-modal content
  - Restores focus to captured element (or falls back to next active group)

**Focus Behavior During Modal:**
- <kbd>F6</kbd> and <kbd>Shift</kbd> + <kbd>F6</kbd> cycle only through regions in the active group
- <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> wrapping is handled by the modal container (e.g., Carbon Modal, Dialog, Tearsheet)
- Non-modal content focus trapping is handled by the modal container
- Stacked modals are supported (pushing a second group narrows focus further)

**Integration with Carbon Modal Components:**
FocusRegion is designed to work with Carbon's modal components (Modal, Dialog, Tearsheet, etc.):
- Carbon modal components handle focus trapping (Tab wrapping within the modal)
- Carbon modal components handle setting `inert` on non-modal content
- FocusRegion provides F6 navigation between regions within the modal
- Use `groupId` prop to associate regions with a modal group
- Call `pushModal(groupId)` when opening a modal, `popModal(groupId)` when closing

**Example with Carbon Modal:**
```jsx
const [isOpen, setIsOpen] = useState(false);
const { pushModal, popModal } = useFocusGroupModal();

const handleOpen = () => {
  setIsOpen(true);
  pushModal('my-dialog');
};

const handleClose = () => {
  setIsOpen(false);
  popModal('my-dialog');
};

<Modal open={isOpen} onRequestClose={handleClose}>
  <FocusRegion id="modal-form" groupId="my-dialog" role="region" aria-label="Form">
    {/* Form content */}
  </FocusRegion>
  <FocusRegion id="modal-actions" groupId="my-dialog" role="region" aria-label="Actions">
    {/* Action buttons */}
  </FocusRegion>
</Modal>
```

**Focus Restoration:**
When a modal is closed:
1. Try to restore focus to the element that had focus when the modal opened
2. If that element no longer exists, focus the first tabbable element in the next active modal group (if any)
3. If no modal group is active, focus the first tabbable element in the page
4. If all else fails, focus `document.body` (with a development warning)

### 7. Enabled/Disabled State

**Purpose:** Temporarily disable a region without removing it from the DOM.

**Behavior:**
- Disabled regions (`enabled={false}`) are skipped during <kbd>F6</kbd> navigation
- Tab and Shift+Tab continue to work normally through disabled regions (browser handles this naturally)
- The implementation filters out disabled regions when building the F6 navigation list

**Note:** This pattern does not manage focus trapping or `inert` attributes. If you need to prevent interaction with a region's content, handle that separately (e.g., via Carbon Modal's built-in focus management).

### 8. Shadow DOM Support

**Behavior:**
- The implementation fully supports open shadow roots
- When finding tabbable elements, the implementation recursively traverses into shadow roots
- Closed shadow roots cannot be traversed (browser limitation)

**Implementation:**
- The `getTabbableElements()` function checks for `element.shadowRoot` on each element
- If a shadow root exists, it recursively searches within it using the same tabbable element logic
- This ensures F6 navigation works correctly with web components and shadow DOM

## Accessibility Features

### Screen Reader Support

**Landmark Navigation:**
- Each focus region is an ARIA landmark (via `role` or semantic HTML element)
- Screen reader users can navigate between landmarks using screen reader shortcuts (e.g., <kbd>R</kbd> key in NVDA/JAWS)
- This complements (but does not replace) <kbd>F6</kbd> navigation for sighted keyboard users

**Accessible Naming:**
- Every region **must** have an accessible name via `aria-label` or `aria-labelledby`
- An unlabeled `role="region"` is not exposed as a landmark by assistive technology
- Development mode should warn if a region lacks an accessible name

**Focus Indicators:**
- All focused elements must display a visible focus indicator
- Focus indicators must meet WCAG 2.4.11 (Focus Appearance) requirements
- Empty regions must display a focus indicator when the region container is focused

### Development Warnings

The implementation emits console warnings in development mode for:

1. **Missing Accessible Label:**
   - When a region has `role="region"` but no `aria-label` or `aria-labelledby`
   - Message: "A region with role='region' requires either aria-label or aria-labelledby"

2. **Multiple Default Regions:**
   - When more than one region declares `defaultFocus={true}`
   - Message: "Multiple regions declared with defaultFocus={true}. Only the first region in DOM order will be used as the default."

3. **Singleton Role Violations:**
   - When roles that should appear only once per page (`main`, `banner`, `contentinfo`) appear on multiple regions
   - Message: "Multiple regions with singleton role='[role]' detected. This role should only appear once per page."

4. **Modal Group Not Found:**
   - When `pushModal(groupId)` is called but no regions have that `groupId`
   - Message: "pushModal called for group '[groupId]' but no regions with this group ID are registered."

5. **Out-of-Order Modal Closing:**
   - When `popModal(groupId)` is called with a group ID that is not at the top of the stack
   - Message: "Popping modal group '[groupId]' out of order. This may indicate incorrect modal lifecycle management."

6. **Focus Restoration Failure:**
   - When focus restoration falls through to `document.body` as a last resort
   - Message: "Could not find valid focus restore target. Falling back to document.body."

## Implementation Considerations

### Performance

- Use `MutationObserver` to efficiently track changes to tabbable elements within regions
- Cache focus location and only update when focus changes
- Debounce or throttle expensive operations if necessary

### Framework Integration

This pattern can be implemented in any UI framework or as vanilla web components:
- **React:** Component with hooks for state management
- **Web Components:** Custom element with Shadow DOM support
- **Vue/Angular/Svelte:** Framework-specific component implementations

### Testing Requirements

Implementations should include tests for:
- Normal tab order through page (no interference)
- Focus location tracking and restoration
- F6 navigation between regions
- Disabled region skipping
- Empty region focus behavior
- Default region initial focus
- Modal group focus restriction (F6 only cycles through modal regions)
- Shadow DOM tabbable element detection
- Hidden element filtering
- Accessible label warnings
- Singleton role warnings

## References

- [WCAG 2.1.2: No Keyboard Trap](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)
- [WCAG 2.4.11: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [HTML `inert` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert)

## Version History

- **2.0.0** (2026-05-11): Simplified to focus location tracking with normal tab order
- **1.0.0** (2026-05-08): Initial specification with tab trapping