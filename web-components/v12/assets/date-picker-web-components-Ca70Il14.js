import{m as e,n as t,r as n,s as r}from"./blocks-Bg9eCzPU.js";import{n as i}from"./lib-BrqzyiR7.js";import a,{RangeWithCalendar as o,Simple as s,SingleWithCalendar as c,Skeleton as l,WithAILabel as u}from"./date-picker-web-components.stories-CHgdNF6Z.js";var d=e();function f(e){let f={a:`a`,code:`code`,em:`em`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(r,{of:a}),`
`,(0,d.jsx)(f.h1,{id:`date-picker`,children:`Date picker`}),`
`,(0,d.jsxs)(f.p,{children:[(0,d.jsx)(f.a,{href:`https://github.com/carbon-design-system/carbon/tree/main/packages/web-components/src/components/date-picker`,rel:`nofollow`,children:`Source code`}),`
\xA0|\xA0
`,(0,d.jsx)(f.a,{href:`https://www.carbondesignsystem.com/components/date-picker/usage`,rel:`nofollow`,children:`Usage guidelines`}),`
\xA0|\xA0
`,(0,d.jsx)(f.a,{href:`https://www.carbondesignsystem.com/components/date-picker/accessibility`,rel:`nofollow`,children:`Accessibility`})]}),`
`,(0,d.jsx)(f.h2,{id:`table-of-contents`,children:`Table of Contents`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.a,{href:`#overview`,children:`Overview`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#simple-date-picker`,children:`Simple date picker`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#single-date-picker`,children:`Single date picker`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#range-date-picker`,children:`Range date picker`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#skeleton-state`,children:`Skeleton state`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#ai-label`,children:`AI label`})}),`
`]}),`
`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.a,{href:`#component-api`,children:`Component API`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#api-compatibility`,children:`API Compatibility`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#breaking-changes`,children:`Breaking changes`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#cds-date-picker`,children:(0,d.jsx)(f.code,{children:`cds-date-picker`})})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#cds-date-picker-input`,children:(0,d.jsx)(f.code,{children:`cds-date-picker-input`})})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsxs)(f.a,{href:`#date-picker-date-format`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`date-format`})]})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsxs)(f.a,{href:`#date-picker-kind`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`kind`})]})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsxs)(f.a,{href:`#date-picker-max-date`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`max-date`})]})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsxs)(f.a,{href:`#date-picker-min-date`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`min-date`})]})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsxs)(f.a,{href:`#date-picker-value`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`value`})]})}),`
`]}),`
`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.a,{href:`#architecture`,children:`Architecture`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#modern-implementation`,children:`Modern implementation`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#state-machine`,children:`State machine`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#keyboard-navigation`,children:`Keyboard navigation`})}),`
`]}),`
`]}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#references`,children:`References`})}),`
`,(0,d.jsx)(f.li,{children:(0,d.jsx)(f.a,{href:`#feedback`,children:`Feedback`})}),`
`]}),`
`,(0,d.jsx)(f.h2,{id:`overview`,children:`Overview`}),`
`,(0,d.jsxs)(f.p,{children:[`Date pickers allow users to select a single or a range of dates. Pickers are
used to display past, present, or future dates. The kind of date (exact,
approximate, memorable) you are requesting from the user will determine which
picker is best to use. Each picker's format can be customized depending on
location or need. The `,(0,d.jsx)(f.code,{children:`cds-date-picker`}),` component expects one or more
`,(0,d.jsx)(f.code,{children:`cds-date-picker-input`}),` elements as children.`]}),`
`,(0,d.jsx)(n,{of:c}),`
`,(0,d.jsx)(f.h3,{id:`simple-date-picker`,children:`Simple date picker`}),`
`,(0,d.jsx)(f.p,{children:`The simple date input provides the user with only a text field in which they can
manually input a date. It allows dates to be entered without adding unnecessary
interactions that come with the calendar menu or a dropdown.`}),`
`,(0,d.jsx)(n,{of:s}),`
`,(0,d.jsx)(f.h3,{id:`single-date-picker`,children:`Single date picker`}),`
`,(0,d.jsx)(f.p,{children:`Use the single date picker when you want to pair a text input with a calendar
popover. Users can type a date directly, or open the calendar and select one.`}),`
`,(0,d.jsx)(n,{of:c}),`
`,(0,d.jsx)(f.h3,{id:`range-date-picker`,children:`Range date picker`}),`
`,(0,d.jsxs)(f.p,{children:[`Use the range date picker when users need to choose a start and end date
together. The first input should use `,(0,d.jsx)(f.code,{children:`kind="from"`}),` and the second should use
`,(0,d.jsx)(f.code,{children:`kind="to"`}),`.`]}),`
`,(0,d.jsx)(n,{of:o}),`
`,(0,d.jsx)(f.h3,{id:`skeleton-state`,children:`Skeleton state`}),`
`,(0,d.jsxs)(f.p,{children:[`You can use the `,(0,d.jsx)(f.code,{children:`cds-date-picker-input-skeleton`}),` component to render a
skeleton variant of a date picker. This is useful while the initial state or
date range is loading.`]}),`
`,(0,d.jsx)(n,{of:l}),`
`,(0,d.jsx)(f.h3,{id:`ai-label`,children:`AI label`}),`
`,(0,d.jsx)(f.p,{children:`The input supports Carbon AI label content as slotted child content.`}),`
`,(0,d.jsx)(n,{of:u}),`
`,(0,d.jsx)(f.h2,{id:`component-api`,children:`Component API`}),`
`,(0,d.jsx)(f.h3,{id:`api-compatibility`,children:`API Compatibility`}),`
`,(0,d.jsx)(f.p,{children:`This implementation maintains backward compatibility with the existing Carbon
Web Components date picker API while replacing the internal Flatpickr-based
behavior with shared primitives and a state machine.`}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsxs)(f.strong,{children:[(0,d.jsx)(f.code,{children:`cds-date-picker`}),` attributes/properties:`]})}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`date-format`}),` - Date display format (default: `,(0,d.jsx)(f.code,{children:`m/d/Y`}),`)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`disabled`}),` - Disable the date picker`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`max-date`}),` - Maximum selectable date`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`min-date`}),` - Minimum selectable date`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`name`}),` - Form field name for form submission`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`readonly`}),` - Make the date picker read-only`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`value`}),` - Selected date value`]}),`
`]}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsxs)(f.strong,{children:[(0,d.jsx)(f.code,{children:`cds-date-picker-input`}),` attributes/properties:`]})}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`color-scheme`}),` - Color scheme variant`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`disabled`}),` - Disable the input`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`hide-label`}),` - Hide the label text`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`invalid`}),` - Show invalid state`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`invalid-text`}),` - Invalid state message`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`kind`}),` - Input type (`,(0,d.jsx)(f.code,{children:`simple`}),`, `,(0,d.jsx)(f.code,{children:`single`}),`, `,(0,d.jsx)(f.code,{children:`from`}),`, `,(0,d.jsx)(f.code,{children:`to`}),`)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`label-text`}),` - Label text`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`pattern`}),` - Input validation pattern`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`placeholder`}),` - Placeholder text`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`readonly`}),` - Make input read-only`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`required`}),` - Mark as required field`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`short`}),` - Use short variant`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`size`}),` - Input size (`,(0,d.jsx)(f.code,{children:`sm`}),`, `,(0,d.jsx)(f.code,{children:`md`}),`, `,(0,d.jsx)(f.code,{children:`lg`}),`)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`type`}),` - Input type`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`value`}),` - Input value`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`warn`}),` - Show warning state`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`warn-text`}),` - Warning state message`]}),`
`]}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsx)(f.strong,{children:`Events:`})}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`cds-date-picker-changed`}),` - Fired when date selection changes`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`cds-date-picker-error`}),` - Fired when an error occurs`]}),`
`]}),`
`,(0,d.jsx)(f.h3,{id:`breaking-changes`,children:`Breaking Changes`}),`
`,(0,d.jsxs)(f.p,{children:[(0,d.jsx)(f.strong,{children:`None.`}),` This implementation is a drop-in replacement with no breaking changes to the public API.`]}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsx)(f.strong,{children:`What changed internally:`})}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsx)(f.li,{children:`Removed Flatpickr dependency (~15,000 lines of code)`}),`
`,(0,d.jsx)(f.li,{children:`Implemented native calendar using Temporal API, Popover API, and CSS Anchor Positioning`}),`
`,(0,d.jsx)(f.li,{children:`Added state machine for predictable behavior`}),`
`,(0,d.jsx)(f.li,{children:`Enhanced keyboard navigation`}),`
`,(0,d.jsx)(f.li,{children:`Improved accessibility`}),`
`]}),`
`,(0,d.jsxs)(f.p,{children:[(0,d.jsx)(f.strong,{children:`Migration:`}),`
No migration is required for existing usage patterns.`]}),`
`,(0,d.jsx)(f.h2,{id:`cds-date-picker`,children:(0,d.jsx)(f.code,{children:`cds-date-picker`})}),`
`,(0,d.jsx)(t,{of:`cds-date-picker`}),`
`,(0,d.jsx)(f.h2,{id:`cds-date-picker-input`,children:(0,d.jsx)(f.code,{children:`cds-date-picker-input`})}),`
`,(0,d.jsx)(t,{of:`cds-date-picker-input`}),`
`,(0,d.jsxs)(f.h3,{id:`date-picker-date-format`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`date-format`})]}),`
`,(0,d.jsxs)(f.p,{children:[`You can use the `,(0,d.jsx)(f.code,{children:`date-format`}),` attribute to change how the selected date is
displayed in the input. The default format is `,(0,d.jsx)(f.code,{children:`m/d/Y`}),` (MM/DD/YYYY).`]}),`
`,(0,d.jsx)(f.p,{children:`Supported format tokens:`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`m`}),` - Month (1-12)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`d`}),` - Day (1-31)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`Y`}),` - Year (4 digits)`]}),`
`]}),`
`,(0,d.jsx)(`cds-date-picker`,{"date-format":`Y-m-d`,children:(0,d.jsx)(`cds-date-picker-input`,{kind:`single`,"label-text":`Date format example`,placeholder:`yyyy/mm/dd`})}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker date-format="Y-m-d">
  <cds-date-picker-input
    kind="single"
    placeholder="yyyy/mm/dd"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsxs)(f.h3,{id:`date-picker-kind`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`kind`})]}),`
`,(0,d.jsxs)(f.p,{children:[`There are three supported variations of `,(0,d.jsx)(f.code,{children:`date-picker`}),` in Carbon.`]}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`simple`}),` will render a simple text input `,(0,d.jsx)(f.em,{children:`without`}),` a calendar dropdown.`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.code,{children:`single`}),` will render a a single text input `,(0,d.jsx)(f.em,{children:`with`}),` a calendar dropdown.`]}),`
`,(0,d.jsxs)(f.li,{children:[`For `,(0,d.jsx)(f.code,{children:`range`}),` , two `,(0,d.jsx)(f.code,{children:`cds-date-picker-input`}),` will need to be provided as
children.`]}),`
`]}),`
`,(0,d.jsxs)(f.p,{children:[`For `,(0,d.jsx)(f.code,{children:`simple`}),` and `,(0,d.jsx)(f.code,{children:`single`}),`, set the `,(0,d.jsx)(f.code,{children:`kind`}),` attribute of the
`,(0,d.jsx)(f.code,{children:`cds-date-picker-input`}),` component to the desired version.`]}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker>
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsxs)(f.p,{children:[`For the `,(0,d.jsx)(f.code,{children:`range`}),`, the `,(0,d.jsx)(f.code,{children:`kind`}),` attributes should be set to `,(0,d.jsx)(f.code,{children:`from`}),` and `,(0,d.jsx)(f.code,{children:`to`}),`,
corresponding to the start and end dates of the range.`]}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker>
  <cds-date-picker-input
    kind="from"
    label-text="Start date"
    placeholder="mm/dd/yyyy">
  </cds-date-picker-input>
  <cds-date-picker-input
    kind="to"
    label-text="End date"
    placeholder="mm/dd/yyyy">
  </cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsxs)(f.h3,{id:`date-picker-max-date`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`max-date`})]}),`
`,(0,d.jsx)(f.p,{children:`Limits the date selection to any date before the date specified. Dates after the
maximum date will be disabled in the calendar and navigation will be restricted.`}),`
`,(0,d.jsx)(`cds-date-picker`,{"max-date":`09/15/2020`,children:(0,d.jsx)(`cds-date-picker-input`,{kind:`single`,"label-text":`max-date example`,placeholder:`mm/dd/yyyy`})}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker max-date="09/15/2020">
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsxs)(f.h3,{id:`date-picker-min-date`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`min-date`})]}),`
`,(0,d.jsx)(f.p,{children:`Limits the date selection to any date after the date specified. Dates before the
minimum date will be disabled in the calendar and navigation will be restricted.`}),`
`,(0,d.jsx)(`cds-date-picker`,{"min-date":`09/15/2025`,children:(0,d.jsx)(`cds-date-picker-input`,{kind:`single`,"label-text":`min-date example`,placeholder:`mm/dd/yyyy`})}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker min-date="09/15/2025">
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsxs)(f.h3,{id:`date-picker-value`,children:[`Date picker `,(0,d.jsx)(f.code,{children:`value`})]}),`
`,(0,d.jsx)(f.p,{children:`Pass a value string to the input to initialize the selected date.`}),`
`,(0,d.jsx)(`cds-date-picker`,{children:(0,d.jsx)(`cds-date-picker-input`,{kind:`single`,"label-text":`Value as a date example`,placeholder:`mm/dd/yyyy`,value:`04/17/2025`})}),`
`,(0,d.jsx)(f.pre,{children:(0,d.jsx)(f.code,{className:`language-html`,children:`<cds-date-picker>
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"
    value="04/17/2025"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,(0,d.jsx)(f.h2,{id:`architecture`,children:`Architecture`}),`
`,(0,d.jsx)(f.h3,{id:`modern-implementation`,children:`Modern implementation`}),`
`,(0,d.jsxs)(f.p,{children:[`This date picker implementation uses modern web platform APIs and has `,(0,d.jsx)(f.strong,{children:`zero external dependencies`}),`:`]}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Temporal API`}),` - Modern date/time handling (polyfilled for browser compatibility)`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Popover API`}),` - Native browser popover for the calendar dropdown`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`CSS Anchor Positioning`}),` - Smart positioning relative to the input field`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`State Machine`}),` - Predictable state management for all interactions`]}),`
`]}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsx)(f.strong,{children:`Benefits:`})}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[`🎯 `,(0,d.jsx)(f.strong,{children:`84% less code`}),` compared to Flatpickr-based implementation`]}),`
`,(0,d.jsxs)(f.li,{children:[`📦 `,(0,d.jsx)(f.strong,{children:`~20-30% smaller bundle`}),` size`]}),`
`,(0,d.jsxs)(f.li,{children:[`🚀 `,(0,d.jsx)(f.strong,{children:`Zero external dependencies`}),` to maintain`]}),`
`,(0,d.jsxs)(f.li,{children:[`🎨 `,(0,d.jsx)(f.strong,{children:`Full customization`}),` control`]}),`
`,(0,d.jsxs)(f.li,{children:[`♿ `,(0,d.jsx)(f.strong,{children:`Enhanced accessibility`}),` with comprehensive keyboard navigation`]}),`
`]}),`
`,(0,d.jsx)(f.h3,{id:`state-machine`,children:`State machine`}),`
`,(0,d.jsx)(f.p,{children:`The date picker uses a finite state machine to manage all interactions and state transitions.
This provides:`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Predictable behavior`}),` - All state changes are explicit and testable`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Clear event handling`}),` - Events trigger specific state transitions`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Maintainable code`}),` - State logic is centralized and documented`]}),`
`]}),`
`,(0,d.jsxs)(f.p,{children:[`States include: `,(0,d.jsx)(f.code,{children:`IDLE`}),`, `,(0,d.jsx)(f.code,{children:`FOCUSED`}),`, `,(0,d.jsx)(f.code,{children:`CALENDAR_OPEN`}),`, `,(0,d.jsx)(f.code,{children:`DATE_SELECTED`}),`, `,(0,d.jsx)(f.code,{children:`RANGE_START_SELECTED`}),`, `,(0,d.jsx)(f.code,{children:`RANGE_SELECTING`})]}),`
`,(0,d.jsxs)(f.p,{children:[`For more detail on the shared state logic, see the primitives package in
`,(0,d.jsx)(f.a,{href:`https://github.com/carbon-design-system/carbon-labs/tree/main/packages/primitives/src/date-picker`,rel:`nofollow`,children:`GitHub`}),`.`]}),`
`,(0,d.jsx)(f.h3,{id:`keyboard-navigation`,children:`Keyboard navigation`}),`
`,(0,d.jsx)(f.p,{children:`The calendar supports comprehensive keyboard navigation:`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Arrow keys`}),` - Navigate between dates`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Enter`}),` - Select the focused date`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Escape`}),` - Close the calendar`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Tab`}),` - Navigate through the date picker interface`,`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Single mode`}),`: Input field → Calendar (when open) → Outside the component`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Range mode`}),`: First input → Calendar (when open) → Second input → Calendar (when open) → Outside the component`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Shift+Tab`}),` - Reverse navigation through the same flow`]}),`
`]}),`
`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Page Up/Down`}),` - Navigate between months`]}),`
`,(0,d.jsxs)(f.li,{children:[(0,d.jsx)(f.strong,{children:`Home/End`}),` - Jump to start/end of week`]}),`
`]}),`
`,(0,d.jsx)(f.p,{children:(0,d.jsx)(f.strong,{children:`Tab Navigation Flow:`})}),`
`,(0,d.jsxs)(f.p,{children:[`In `,(0,d.jsx)(f.strong,{children:`single date mode`}),`, pressing Tab follows this pattern:`]}),`
`,(0,d.jsxs)(f.ol,{children:[`
`,(0,d.jsx)(f.li,{children:`Focus on input field`}),`
`,(0,d.jsx)(f.li,{children:`If calendar is open, Tab moves focus to the calendar`}),`
`,(0,d.jsx)(f.li,{children:`Tab again moves focus outside the date picker`}),`
`]}),`
`,(0,d.jsxs)(f.p,{children:[`In `,(0,d.jsx)(f.strong,{children:`range date mode`}),`, pressing Tab follows this pattern:`]}),`
`,(0,d.jsxs)(f.ol,{children:[`
`,(0,d.jsx)(f.li,{children:`Focus on first input field (start date)`}),`
`,(0,d.jsx)(f.li,{children:`If calendar is open, Tab moves focus to the calendar`}),`
`,(0,d.jsx)(f.li,{children:`Tab again moves focus to second input field (end date)`}),`
`,(0,d.jsx)(f.li,{children:`If calendar is open, Tab moves focus to the calendar again`}),`
`,(0,d.jsx)(f.li,{children:`Tab again moves focus outside the date picker`}),`
`]}),`
`,(0,d.jsx)(f.p,{children:`Shift+Tab reverses this flow, allowing you to navigate backward through the same sequence.`}),`
`,(0,d.jsx)(f.p,{children:`When the calendar opens without a selected date, focus automatically moves to today's date
for easy keyboard navigation.`}),`
`,(0,d.jsx)(f.h2,{id:`references`,children:`References`}),`
`,(0,d.jsxs)(f.ul,{children:[`
`,(0,d.jsxs)(f.li,{children:[`The date picker uses the `,(0,d.jsx)(f.a,{href:`https://tc39.es/proposal-temporal/docs/`,rel:`nofollow`,children:`Temporal API`}),` for modern date handling`]}),`
`,(0,d.jsxs)(f.li,{children:[`The calendar uses the `,(0,d.jsx)(f.a,{href:`https://developer.mozilla.org/en-US/docs/Web/API/Popover_API`,rel:`nofollow`,children:`Popover API`}),` for dropdown behavior`]}),`
`,(0,d.jsxs)(f.li,{children:[`Positioning uses `,(0,d.jsx)(f.a,{href:`https://developer.chrome.com/blog/tether-elements-to-each-other-with-css-anchor-positioning`,rel:`nofollow`,children:`CSS Anchor Positioning`}),` for smart placement`]}),`
`,(0,d.jsxs)(f.li,{children:[`The `,(0,d.jsx)(f.code,{children:`cds-date-picker-input`}),` component takes in similar attributes to the
`,(0,d.jsx)(f.code,{children:`cds-text-input`}),` component, such as `,(0,d.jsx)(f.code,{children:`size`}),` and `,(0,d.jsx)(f.code,{children:`placeholder`}),`. For more
information on these attributes, check out the
`,(0,d.jsx)(f.a,{href:`../?path=/docs/components-text-input--overview`,children:`text input`}),` page.`]}),`
`]}),`
`,(0,d.jsx)(f.h2,{id:`feedback`,children:`Feedback`}),`
`,(0,d.jsxs)(f.p,{children:[`Help us improve this component by providing feedback, asking questions on Slack,
or updating this file on
`,(0,d.jsx)(f.a,{href:`https://github.com/carbon-design-system/carbon/edit/main/packages/web-components/src/components/date-picker/date-picker.mdx`,rel:`nofollow`,children:`GitHub`}),`.`]})]})}function p(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,d.jsx)(t,{...e,children:(0,d.jsx)(f,{...e})}):f(e)}export{p as default};