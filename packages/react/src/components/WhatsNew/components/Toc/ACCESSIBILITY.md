# Table of Contents (Toc) Component - Accessibility Standards

## Overview

This document outlines the accessibility standards and requirements for the Table of Contents (Toc) component, based on WCAG 2.0 guidelines (specifically technique G64), Carbon Design System accessibility patterns, and industry best practices.

## WCAG 2.0 Technique G64: Providing a Table of Contents

**Reference**: [WCAG 2.0 Technique G64](https://www.w3.org/TR/WCAG20-TECHS/G64.html)

### Purpose

The table of contents serves as a navigational aid that:

- Provides an overview of document structure
- Allows users to navigate directly to specific sections
- Helps users understand content organization before reading
- Enables quick access to relevant information

### Success Criteria

- **WCAG 2.4.1 (Bypass Blocks)**: Level A - Provides a mechanism to bypass blocks of content
- **WCAG 2.4.5 (Multiple Ways)**: Level AA - Provides multiple ways to locate content
- **WCAG 2.4.8 (Location)**: Level AAA - Provides information about user's location within content

---

## Semantic HTML Requirements

### 1. Navigation Landmark (`<nav>`)

**Current Implementation**: ✅ Implemented in [`TocList.tsx`](./TocList.tsx:37)

```tsx
<nav className="clabs__toc-list">{/* ToC items */}</nav>
```

**Requirements**:

- Use semantic `<nav>` element to identify the table of contents as a navigation landmark
- Screen readers can identify and navigate to this landmark region
- Provides structural meaning to assistive technologies

### 2. List Structure

**Current Implementation**: ✅ Implemented in [`TocItem.tsx`](./TocItem.tsx:142)

```tsx
<li className="clabs__toc-item">
  <a href="#section-id">{children}</a>
</li>
```

**Requirements**:

- Use proper list markup (`<ul>` or `<ol>` containing `<li>` elements)
- Each navigation item must be a list item containing an anchor link
- Maintains semantic relationship between navigation items

### 3. Anchor Links

**Current Implementation**: ✅ Implemented with proper `href` attributes

**Requirements**:

- All links must have valid `href` attributes pointing to section IDs
- Links must be keyboard accessible (native `<a>` elements)
- Link text must be descriptive and meaningful

---

## ARIA Attributes

### 1. Navigation Label (`aria-label`)

**Current Implementation**: ❌ **MISSING** - Needs to be added

**Required Implementation**:

```tsx
<nav aria-label="Table of contents" className="clabs__toc-list">
  {/* ToC items */}
</nav>
```

**Rationale**:

- Distinguishes this navigation from other `<nav>` elements on the page
- Screen readers announce "Table of contents navigation" when users navigate to this landmark
- Follows Carbon Design System pattern for labeling navigation regions

**Alternative**: Use `aria-labelledby` if there's a visible heading:

```tsx
<h2 id="toc-heading">On this page</h2>
<nav aria-labelledby="toc-heading" className="clabs__toc-list">
  {/* ToC items */}
</nav>
```

### 2. Current Location (`aria-current="location"`)

**Current Implementation**: ❌ **MISSING** - Needs to be added

**Required Implementation**:

```tsx
<li className="clabs__toc-item clabs__toc-item-active">
  <a href="#current-section" aria-current="location">
    Current Section
  </a>
</li>
```

**Rationale**:

- Indicates the user's current location within the document structure
- Screen readers announce "Current location" when focused
- Provides context about where the user is in the content
- Aligns with WCAG 2.4.8 (Location) success criterion

**Values for `aria-current`**:

- `location` - Current location within the environment or context (recommended for ToC)
- `page` - Current page within a set of pages
- `step` - Current step within a process
- `true` - Generic current item

### 3. Active Bar (`aria-hidden="true"`)

**Current Implementation**: ✅ Implemented in [`TocList.tsx`](./TocList.tsx:40)

```tsx
<div className="clabs__toc-active-bar" aria-hidden="true" />
```

**Rationale**:

- Visual indicator only, not meaningful to screen readers
- Prevents screen readers from announcing decorative element
- Active state is conveyed through `aria-current` on the link itself

---

## Keyboard Navigation

### 1. Tab Order

**Current Implementation**: ✅ Native browser behavior

**Requirements**:

- All ToC links must be in the natural tab order
- Tab key moves focus sequentially through all links
- No custom `tabindex` values needed (use default `tabindex="0"`)
- Links should appear in logical reading order

**Testing**:

- Press Tab to move forward through links
- Press Shift+Tab to move backward through links
- Focus should be clearly visible on each link

### 2. Activation

**Current Implementation**: ✅ Implemented in [`TocItem.tsx`](./TocItem.tsx:41-139)

**Requirements**:

- Enter key activates the focused link (native behavior)
- Space key activates the focused link (native behavior)
- Click activates the link (mouse/touch)
- Smooth scrolling to target section
- URL hash updates without page jump

**Current Behavior**:

```tsx
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const targetElement = document.getElementById(targetId);
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.pushState(null, '', href);
};
```

### 3. Skip Links

**Recommendation**: Consider adding a "Skip to main content" link

**Implementation Example**:

```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

**CSS**:

```scss
.skip-link {
  position: absolute;
  left: -9999px;

  &:focus {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    padding: 1rem;
    background: $background;
    color: $text-primary;
  }
}
```

---

## Focus Management

### 1. Focus Indicators

**Current Implementation**: ✅ Implemented in [`toc.scss`](./toc.scss:55-59)

```scss
.clabs__toc-item a:focus {
  color: $text-primary;
  outline: 0.125rem solid $focus;
  outline-offset: -0.125rem;
}
```

**Requirements**:

- Focus indicator must be clearly visible
- Minimum contrast ratio of 3:1 against adjacent colors (WCAG 2.4.7)
- Focus outline should not be removed (`outline: none` is prohibited)
- Carbon uses `$focus` token for consistent focus styling

**Testing**:

- Tab through all links and verify focus indicator is visible
- Test in both light and dark themes
- Verify focus indicator meets 3:1 contrast ratio

### 2. Focus After Navigation

**Current Implementation**: ❌ **CRITICAL GAP** - Scrolls to target but doesn't move focus

**The Problem**:
When a keyboard/screen reader user activates a ToC link:

1. ✅ The page scrolls to the target section (visual feedback)
2. ✅ The URL hash updates (browser history)
3. ❌ **Focus remains on the ToC link** (keyboard/screen reader cursor doesn't move)
4. ❌ Screen reader doesn't announce the target content
5. ❌ User must manually navigate to find where they are in the content

**Why This Matters**:

- **Screen reader users** hear nothing after activation - they don't know if navigation worked
- **Keyboard users** must Tab many times to reach the content they just navigated to
- **Violates user expectations** - clicking a link should take you to that content
- **Poor UX** - Creates a disconnect between visual scroll and assistive technology experience

**The Solution**: Move focus to the target heading after navigation

**Required Implementation**:

```tsx
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const targetId = href.replace('#', '');
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    // Scroll to target
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // CRITICAL: Move focus to target for keyboard/screen reader users
    // This ensures the screen reader cursor moves to the content
    const originalTabIndex = targetElement.getAttribute('tabindex');

    // Make target focusable if it's not already interactive
    // tabindex="-1" means focusable by script but not in tab order
    if (!targetElement.hasAttribute('tabindex')) {
      targetElement.setAttribute('tabindex', '-1');
    }

    // Focus after scroll animation completes
    setTimeout(() => {
      targetElement.focus({ preventScroll: true }); // preventScroll since we already scrolled

      // Clean up: restore original tabindex after focus
      // This prevents the element from staying in the tab order
      if (originalTabIndex === null) {
        targetElement.removeAttribute('tabindex');
      } else {
        targetElement.setAttribute('tabindex', originalTabIndex);
      }
    }, 500); // Match smooth scroll duration

    window.history.pushState(null, '', href);
  }
};
```

**What Happens After Implementation**:

1. **User activates ToC link** (Enter/Space/Click)
2. **Page scrolls** to target section (visual feedback)
3. **Focus moves** to target heading (programmatic focus)
4. **Screen reader announces** the heading text (e.g., "Introduction, heading level 2")
5. **User can immediately** Tab to next element or continue reading from that point
6. **Keyboard users** are now positioned at the content they wanted to reach

**User Experience Flow**:

```
Before (Current - BAD):
User: [Presses Enter on "Introduction" link]
Screen Reader: [Silence - no announcement]
User: [Must Tab 10+ times to find where they are]
User: "Where did I go? Did it work?"

After (With Focus Management - GOOD):
User: [Presses Enter on "Introduction" link]
Screen Reader: "Introduction, heading level 2"
User: [Can immediately Tab to next element or read content]
User: "Perfect! I'm at the Introduction section."
```

**Alternative Approach - Focus on Container**:

If the target is a section container (not a heading), focus the container:

```tsx
// Find the first heading within the section
const targetHeading = targetElement.querySelector('h1, h2, h3, h4, h5, h6');
const elementToFocus = targetHeading || targetElement;

// Make focusable and focus
if (!elementToFocus.hasAttribute('tabindex')) {
  elementToFocus.setAttribute('tabindex', '-1');
}

setTimeout(() => {
  elementToFocus.focus({ preventScroll: true });
  // Clean up tabindex...
}, 500);
```

**Best Practices**:

- ✅ Always move focus after navigation
- ✅ Use `tabindex="-1"` for non-interactive elements (focusable by script only)
- ✅ Clean up `tabindex` after focus to avoid polluting tab order
- ✅ Use `preventScroll: true` in focus() since we already scrolled
- ✅ Match timeout to scroll animation duration
- ✅ Focus the heading, not the container (headings are more meaningful)

**Testing**:

1. **With Screen Reader**:
   - Activate a ToC link
   - Verify screen reader announces the target heading
   - Verify you can immediately Tab to next element

2. **With Keyboard Only**:
   - Activate a ToC link with Enter
   - Verify focus indicator appears on target heading
   - Verify you can Tab to next element without searching

3. **With Mouse**:
   - Click a ToC link
   - Verify page scrolls smoothly
   - Verify no unexpected focus behavior

**Priority**: 🔴 **CRITICAL** - This is not optional for accessibility compliance

---

## Screen Reader Considerations

### 1. Announcement Patterns

**Navigation Landmark**:

- With `aria-label`: "Table of contents navigation, landmark"
- Without label: "Navigation, landmark"

**Current Location**:

- With `aria-current="location"`: "Introduction, link, current location"
- Without: "Introduction, link"

**List Structure**:

- "List, 5 items"
- "Introduction, link, 1 of 5"
- "Getting Started, link, 2 of 5"

### 2. Testing with Screen Readers

**VoiceOver (macOS/iOS)**:

- Navigate to ToC: `Control+Option+U` (Web Rotor) → Landmarks
- Navigate links: `Control+Option+→` (next item)
- Activate link: `Control+Option+Space`

**JAWS (Windows)**:

- Navigate to ToC: `R` (next region/landmark)
- Navigate links: `Tab` or `K` (next link)
- Activate link: `Enter`

**NVDA (Windows)**:

- Navigate to ToC: `D` (next landmark)
- Navigate links: `Tab` or `K` (next link)
- Activate link: `Enter`

### 3. Link Text Requirements

**Current Implementation**: ✅ Uses meaningful text from children

**Requirements**:

- Link text must be descriptive and unique
- Avoid generic text like "Click here" or "Read more"
- Link text should make sense out of context
- Consider adding visually hidden text for context if needed

**Example**:

```tsx
<TocItem href="#installation">
  Installation
  <span className="visually-hidden"> - Getting Started Guide</span>
</TocItem>
```

---

## Color and Contrast

### 1. Text Contrast

**Current Implementation**: ✅ Uses Carbon Design System tokens

```scss
.clabs__toc-item a {
  color: $text-secondary; // Default state
}

.clabs__toc-item a:hover {
  color: $text-primary; // Hover state
}

.clabs__toc-item a:focus {
  color: $text-primary; // Focus state
}

.clabs__toc-item-active a {
  // Active state uses heading-01 style
}
```

**Requirements**:

- Normal text: Minimum 4.5:1 contrast ratio (WCAG 2.1.4.3 Level AA)
- Large text (18pt+): Minimum 3:1 contrast ratio
- Carbon tokens ensure compliance across themes

**Testing**:

- Test in both light and dark themes
- Use browser DevTools or contrast checker tools
- Verify all interactive states meet contrast requirements

### 2. Non-Text Contrast

**Active Indicator Bar**:

```scss
.clabs__toc-active-bar {
  background-color: $border-interactive; // Blue indicator
}
```

**Requirements**:

- UI components: Minimum 3:1 contrast ratio (WCAG 1.4.11)
- Active indicator must be distinguishable from background
- Should not rely solely on color to convey state

### 3. Color Independence

**Current Implementation**: ✅ Multiple indicators for active state

**Active State Indicators**:

1. Blue bar (visual)
2. Bold text weight (visual)
3. `aria-current="location"` (programmatic)
4. CSS class `clabs__toc-item-active` (programmatic)

**Rationale**:

- Does not rely solely on color to indicate state
- Provides multiple cues for different user needs
- Meets WCAG 1.4.1 (Use of Color)

---

## Implementation Checklist

### Required Changes

- [ ] **🔴 CRITICAL: Move focus to target after navigation**
  - File: [`TocItem.tsx`](./TocItem.tsx)
  - Change: Implement focus management in `handleClick` function
  - Impact: Without this, keyboard/screen reader users cannot effectively navigate content after using ToC
  - Why: Screen readers stay on the ToC link and don't announce the target content
  - Priority: **CRITICAL** - Blocks accessibility compliance
  - See: [Focus After Navigation](#2-focus-after-navigation) section for complete implementation

- [ ] **Add `aria-label` to TocList navigation**
  - File: [`TocList.tsx`](./TocList.tsx)
  - Add: `aria-label="Table of contents"` to `<nav>` element
  - Priority: HIGH

- [ ] **Add `aria-current="location"` to active TocItem**
  - File: [`TocItem.tsx`](./TocItem.tsx) or [`TocActiveTracker.tsx`](./TocActiveTracker.tsx)
  - Add: `aria-current="location"` to active link
  - Priority: HIGH

- [ ] **Add skip link (optional but recommended)**
  - File: New component or page layout
  - Add: "Skip to main content" link
  - Priority: LOW

### Testing Checklist

- [ ] **Keyboard Navigation**
  - [ ] Tab through all ToC links
  - [ ] Activate links with Enter key
  - [ ] Activate links with Space key
  - [ ] Verify focus indicators are visible
  - [ ] Test in both light and dark themes

- [ ] **Screen Reader Testing**
  - [ ] Test with VoiceOver (macOS)
  - [ ] Test with JAWS (Windows)
  - [ ] Test with NVDA (Windows)
  - [ ] Verify navigation landmark is announced
  - [ ] Verify current location is announced
  - [ ] Verify list structure is announced

- [ ] **Color and Contrast**
  - [ ] Verify text contrast ratios (4.5:1 minimum)
  - [ ] Verify focus indicator contrast (3:1 minimum)
  - [ ] Verify active indicator contrast (3:1 minimum)
  - [ ] Test in light theme
  - [ ] Test in dark theme
  - [ ] Test with high contrast mode

- [ ] **Semantic HTML**
  - [ ] Verify `<nav>` element is used
  - [ ] Verify proper list structure (`<ul>`/`<ol>` + `<li>`)
  - [ ] Verify anchor links have valid `href` attributes
  - [ ] Verify link text is descriptive

---

## Code Examples

### Complete Accessible TocList

```tsx
import cx from 'classnames';
import React, { HTMLProps } from 'react';
import { config } from '@/shared/config/cssVariables';

interface TocListProps extends HTMLProps<HTMLElement> {
  children: React.ReactNode;
  /**
   * Accessible label for the navigation landmark.
   * @default "Table of contents"
   */
  ariaLabel?: string;
}

const TocList = ({
  children,
  className,
  ariaLabel = 'Table of contents',
  ...rest
}: TocListProps) => {
  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      className={cx(`${config.labsPrefix}__toc-list`, className)}>
      <div
        className={`${config.labsPrefix}__toc-active-bar`}
        aria-hidden="true"
      />
      <ul>{children}</ul>
    </nav>
  );
};

TocList.displayName = 'TocList';

export { TocList };
export type { TocListProps };
```

### Complete Accessible TocItem with aria-current

```tsx
import cx from 'classnames';
import React, { HTMLProps } from 'react';
import { config } from '@/shared/config/cssVariables';

interface TocItemProps extends HTMLProps<HTMLLIElement> {
  children: React.ReactNode;
  href: string;
  /**
   * Whether this item represents the current location.
   * When true, adds aria-current="location" to the link.
   */
  isActive?: boolean;
}

const TocItem = ({
  children,
  href,
  className,
  isActive = false,
  ...rest
}: TocItemProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Smooth scroll to target
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Update URL hash
      window.history.pushState(null, '', href);

      // Optional: Move focus to target for screen readers
      const originalTabIndex = targetElement.getAttribute('tabindex');
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }

      setTimeout(() => {
        targetElement.focus();
        if (originalTabIndex === null) {
          targetElement.removeAttribute('tabindex');
        }
      }, 500);
    }
  };

  return (
    <li
      {...rest}
      className={cx(
        `${config.labsPrefix}__toc-item`,
        { [`${config.labsPrefix}__toc-item-active`]: isActive },
        className
      )}>
      <a
        href={href}
        onClick={handleClick}
        aria-current={isActive ? 'location' : undefined}>
        {children}
      </a>
    </li>
  );
};

TocItem.displayName = 'TocItem';

export { TocItem };
export type { TocItemProps };
```

---

## References

### WCAG 2.0 Guidelines

- [G64: Providing a Table of Contents](https://www.w3.org/TR/WCAG20-TECHS/G64.html)
- [2.4.1 Bypass Blocks (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html)
- [2.4.5 Multiple Ways (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/multiple-ways.html)
- [2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [2.4.8 Location (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/location.html)
- [1.4.1 Use of Color (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)
- [1.4.3 Contrast (Minimum) (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [1.4.11 Non-text Contrast (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)

### Carbon Design System

- [Accessibility Guidelines](https://carbondesignsystem.com/guidelines/accessibility/overview/)
- [Keyboard Navigation](https://carbondesignsystem.com/guidelines/accessibility/keyboard/)
- [UI Shell Header Accessibility](https://carbondesignsystem.com/components/UI-shell-header/accessibility/)

### ARIA Specifications

- [aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label)
- [aria-labelledby](https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby)
- [aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current)
- [Navigation Landmark](https://www.w3.org/TR/wai-aria-practices-1.1/#aria_lh_navigation)

---

## Document History

| Version | Date       | Author          | Changes                                  |
| ------- | ---------- | --------------- | ---------------------------------------- |
| 1.0     | 2025-01-XX | IBM Carbon Team | Initial accessibility standards document |

---

## Questions or Feedback

For questions about these accessibility standards or to report accessibility issues, please:

1. Review the [Carbon Design System Accessibility Guidelines](https://carbondesignsystem.com/guidelines/accessibility/overview/)
2. Open an issue in the project repository
3. Contact the accessibility team

**Remember**: Accessibility is not a feature—it's a fundamental requirement for inclusive design.
