import{j as e,M as l,C as d,A as s}from"./blocks-DkIR_S9r.js";import{useMDXComponents as c}from"./index-3CoO0Wa0.js";import{D as a,S as r,a as o,R as h,b as p,W as x}from"./date-picker.stories-BeA6aL6m.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-BYwDqDGO.js";import"./index-CfvNz2XJ.js";import"./directive-CJw_OlP2.js";import"./unsafe-html-BSxk0Dof.js";import"./index-C3nV9oXV.js";import"./16-B9g2nIv4.js";import"./property-2ihw2HmP.js";import"./class-map-C6_RSEfh.js";import"./state-BdUAjaG6.js";import"./query-BApjzB0v.js";import"./if-defined-7NM1nQDh.js";import"./16-DeKHrdu0.js";import"./16-CQhU3uUy.js";import"./16-z4EPQvwm.js";import"./layer-Dy6bYSd0.js";import"./carbon-element-DvT6Hso_.js";import"./ai-label-action-button-DrurVpay.js";import"./toggletip-DHGJUGEv.js";import"./host-listener-C4Ji6v3a.js";import"./focus-CH_-ZGzI.js";import"./deep-shadow-contains-D-nK2JqD.js";import"./floating-ui.dom-DgLPPlcg.js";import"./icon-loader-DbmLmiwg.js";import"./16-hRAwM-Pz.js";import"./button-hK6OF4sF.js";function t(i){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...c(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(l,{of:a}),`
`,e.jsx(n.h1,{id:"date-picker",children:"Date picker"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"https://github.com/carbon-design-system/carbon/tree/main/packages/web-components/src/components/date-picker",rel:"nofollow",children:"Source code"}),`
 | 
`,e.jsx(n.a,{href:"https://www.carbondesignsystem.com/components/date-picker/usage",rel:"nofollow",children:"Usage guidelines"}),`
 | 
`,e.jsx(n.a,{href:"https://www.carbondesignsystem.com/components/date-picker/accessibility",rel:"nofollow",children:"Accessibility"})]}),`
`,e.jsx(n.h2,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"#overview",children:"Overview"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#simple-datepicker",children:"Simple date picker"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#range-datepicker",children:"Range date picker"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#skeleton-state",children:"Skeleton state"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#ai-label",children:"AI label"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"#component-api",children:"Component API"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#api-compatibility",children:"API Compatibility"})}),`
`,e.jsx(n.li,{children:e.jsxs(n.a,{href:"#date-picker-date-format",children:["Date picker ",e.jsx(n.code,{children:"date-format"})]})}),`
`,e.jsx(n.li,{children:e.jsxs(n.a,{href:"#date-picker-kind",children:["Date picker ",e.jsx(n.code,{children:"kind"})]})}),`
`,e.jsx(n.li,{children:e.jsxs(n.a,{href:"#date-picker-max-date",children:["Date picker ",e.jsx(n.code,{children:"max-date"})]})}),`
`,e.jsx(n.li,{children:e.jsxs(n.a,{href:"#date-picker-min-date",children:["Date picker ",e.jsx(n.code,{children:"min-date"})]})}),`
`,e.jsx(n.li,{children:e.jsxs(n.a,{href:"#date-picker-value",children:["Date picker ",e.jsx(n.code,{children:"value"})]})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"#architecture",children:"Architecture"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#modern-implementation",children:"Modern implementation"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#state-machine",children:"State machine"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#keyboard-navigation",children:"Keyboard navigation"})}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#cdn",children:"CDN"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#references",children:"References"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#feedback",children:"Feedback"})}),`
`]}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsxs(n.p,{children:[`Date pickers allow users to select a single or a range of dates. Pickers are
used to display past, present, or future dates. The kind of date (exact,
approximate, memorable) you are requesting from the user will determine which
picker is best to use. Each picker's format can be customized depending on
location or need. The `,e.jsx(n.code,{children:"date-picker"})," component expects a ",e.jsx(n.code,{children:"cds-date-picker-input"}),`
as a child.`]}),`
`,e.jsx(d,{of:r}),`
`,e.jsx(n.h3,{id:"simple-date-picker",children:"Simple date picker"}),`
`,e.jsx(n.p,{children:`The simple date input provides the user with only a text field in which they can
manually input a date. It allows dates to be entered without adding unnecessary
interactions that come with the calendar menu or a dropdown.`}),`
`,e.jsx(d,{of:o}),`
`,e.jsx(n.h3,{id:"range-date-picker",children:"Range date picker"}),`
`,e.jsx(n.p,{children:`Calendar pickers default to showing today's date when opened and only one month
is shown at a time. Calendar pickers allow users to navigate through months and
years, however they work best when used for recent or near future dates.`}),`
`,e.jsx(d,{of:r}),`
`,e.jsx(d,{of:h}),`
`,e.jsx(n.h3,{id:"skeleton-state",children:"Skeleton state"}),`
`,e.jsxs(n.p,{children:["You can use the ",e.jsx(n.code,{children:"cds-date-picker-skeleton"}),` component to render a skeleton
variant of a date picker. This is useful to display while an initial date range
in your date picker is being fetched from an external resource like an API.`]}),`
`,e.jsx(d,{of:p}),`
`,e.jsx(n.h3,{id:"ai-label",children:"AI label"}),`
`,e.jsx(d,{of:x}),`
`,e.jsx(n.h2,{id:"component-api",children:"Component API"}),`
`,e.jsx(n.h3,{id:"api-compatibility",children:"API Compatibility"}),`
`,e.jsxs(n.p,{children:["This implementation maintains ",e.jsx(n.strong,{children:"full backward compatibility"})," with the existing Carbon Web Components date picker API. All existing attributes and properties work exactly as before:"]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"cds-date-picker"})," attributes:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"allow-input"})," - Allow manual date entry (default: ",e.jsx(n.code,{children:"true"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"close-on-select"})," - Close calendar on date selection (default: ",e.jsx(n.code,{children:"true"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"date-format"})," - Date display format (default: ",e.jsx(n.code,{children:"m/d/Y"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"disabled"})," - Disable the date picker"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"enabled-range"})," - Specify enabled date range"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"max-date"})," - Maximum selectable date"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"min-date"})," - Minimum selectable date"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"name"})," - Form field name"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"open"})," - Control calendar visibility"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"readonly"})," - Make date picker read-only"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"value"})," - Selected date(s) in ISO8601 format"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"cds-date-picker-input"})," attributes:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"color-scheme"})," - Color scheme variant"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"disabled"})," - Disable the input"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"hide-label"})," - Hide the label text"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"invalid"})," - Show invalid state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"invalid-text"})," - Invalid state message"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"kind"})," - Input type (",e.jsx(n.code,{children:"simple"}),", ",e.jsx(n.code,{children:"single"}),", ",e.jsx(n.code,{children:"from"}),", ",e.jsx(n.code,{children:"to"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"label-text"})," - Label text"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"pattern"})," - Input validation pattern"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"placeholder"})," - Placeholder text"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"readonly"})," - Make input read-only"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"required"})," - Mark as required field"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"short"})," - Use short variant"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"size"})," - Input size (",e.jsx(n.code,{children:"sm"}),", ",e.jsx(n.code,{children:"md"}),", ",e.jsx(n.code,{children:"lg"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"type"})," - Input type"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"value"})," - Input value"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"warn"})," - Show warning state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"warn-text"})," - Warning state message"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Events:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"cds-date-picker-changed"})," - Fired when date selection changes"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"cds-date-picker-error"})," - Fired when an error occurs"]}),`
`]}),`
`,e.jsx(n.h3,{id:"breaking-changes",children:"Breaking Changes"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"None."})," This implementation is a drop-in replacement with no breaking changes to the public API."]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What changed internally:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Removed Flatpickr dependency (~15,000 lines of code)"}),`
`,e.jsx(n.li,{children:"Implemented native calendar using Temporal API, Popover API, and CSS Anchor Positioning"}),`
`,e.jsx(n.li,{children:"Added state machine for predictable behavior"}),`
`,e.jsx(n.li,{children:"Enhanced keyboard navigation"}),`
`,e.jsx(n.li,{children:"Improved accessibility"}),`
`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Migration:"}),`
No migration needed. Existing code continues to work without modifications.`]}),`
`,e.jsx(n.h2,{id:"cds-date-picker",children:e.jsx(n.code,{children:"cds-date-picker"})}),`
`,e.jsx(s,{of:"cds-date-picker"}),`
`,e.jsx(n.h2,{id:"cds-date-picker-input",children:e.jsx(n.code,{children:"cds-date-picker-input"})}),`
`,e.jsx(s,{of:"cds-date-picker-input"}),`
`,e.jsxs(n.h3,{id:"date-picker-date-format",children:["Date picker ",e.jsx(n.code,{children:"date-format"})]}),`
`,e.jsxs(n.p,{children:["You can use the ",e.jsx(n.code,{children:"date-format"}),` attribute to change how the selected date is
displayed in the input. The default format is `,e.jsx(n.code,{children:"m/d/Y"})," (MM/DD/YYYY)."]}),`
`,e.jsx(n.p,{children:"Supported format tokens:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"m"})," - Month (1-12)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"d"})," - Day (1-31)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Y"})," - Year (4 digits)"]}),`
`]}),`
`,e.jsx("cds-date-picker",{"date-format":"Y-m-d",children:e.jsx("cds-date-picker-input",{kind:"single","label-text":"Date format example",placeholder:"yyyy/mm/dd"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker date-format="Y-m-d">
  <cds-date-picker-input
    kind="single"
    placeholder="yyyy/mm/dd"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,e.jsxs(n.h3,{id:"date-picker-kind",children:["Date picker ",e.jsx(n.code,{children:"kind"})]}),`
`,e.jsxs(n.p,{children:["There are three supported variations of ",e.jsx(n.code,{children:"date-picker"})," in Carbon."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"simple"})," will render a simple text input ",e.jsx(n.em,{children:"without"})," a calendar dropdown."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"single"})," will render a a single text input ",e.jsx(n.em,{children:"with"})," a calendar dropdown."]}),`
`,e.jsxs(n.li,{children:["For ",e.jsx(n.code,{children:"range"})," , two ",e.jsx(n.code,{children:"cds-date-picker-input"}),` will need to be provided as
children.`]}),`
`]}),`
`,e.jsxs(n.p,{children:["For ",e.jsx(n.code,{children:"simple"})," and ",e.jsx(n.code,{children:"single"}),", set the ",e.jsx(n.code,{children:"kind"}),` attribute of the
`,e.jsx(n.code,{children:"cds-date-picker-input"})," component to the desired version."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker>
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,e.jsxs(n.p,{children:["For the ",e.jsx(n.code,{children:"range"}),", the ",e.jsx(n.code,{children:"kind"})," attributes should be set to ",e.jsx(n.code,{children:"from"})," and ",e.jsx(n.code,{children:"to"}),`,
corresponding to the start and end dates of the range.`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker>
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
`,e.jsxs(n.h3,{id:"date-picker-max-date",children:["Date picker ",e.jsx(n.code,{children:"max-date"})]}),`
`,e.jsx(n.p,{children:`Limits the date selection to any date before the date specified. Dates after the
maximum date will be disabled in the calendar and navigation will be restricted.`}),`
`,e.jsx("cds-date-picker",{"max-date":"09/15/2020",children:e.jsx("cds-date-picker-input",{kind:"single","label-text":"max-date example",placeholder:"mm/dd/yyyy"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker max-date="09/15/2020">
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,e.jsxs(n.h3,{id:"date-picker-min-date",children:["Date picker ",e.jsx(n.code,{children:"min-date"})]}),`
`,e.jsx(n.p,{children:`Limits the date selection to any date after the date specified. Dates before the
minimum date will be disabled in the calendar and navigation will be restricted.`}),`
`,e.jsx("cds-date-picker",{"min-date":"09/15/2025",children:e.jsx("cds-date-picker-input",{kind:"single","label-text":"min-date example",placeholder:"mm/dd/yyyy"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker min-date="09/15/2025">
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,e.jsxs(n.h3,{id:"date-picker-value",children:["Date picker ",e.jsx(n.code,{children:"value"})]}),`
`,e.jsx(n.p,{children:`By default the date picker will set the current date as its value. If you'd like
to start this at a different date, you can pass in a date string or date object.`}),`
`,e.jsx("cds-date-picker",{children:e.jsx("cds-date-picker-input",{kind:"single","label-text":"Value as a date example",placeholder:"mm/dd/yyyy",value:"04/17/2025"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<cds-date-picker>
  <cds-date-picker-input
    kind="single"
    placeholder="mm/dd/yyyy"
    value="04/17/2025"></cds-date-picker-input>
</cds-date-picker>
`})}),`
`,e.jsx(n.h2,{id:"architecture",children:"Architecture"}),`
`,e.jsx(n.h3,{id:"modern-implementation",children:"Modern implementation"}),`
`,e.jsxs(n.p,{children:["This date picker implementation uses modern web platform APIs and has ",e.jsx(n.strong,{children:"zero external dependencies"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Temporal API"})," - Modern date/time handling (polyfilled for browser compatibility)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Popover API"})," - Native browser popover for the calendar dropdown"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"CSS Anchor Positioning"})," - Smart positioning relative to the input field"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"State Machine"})," - Predictable state management for all interactions"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Benefits:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["🎯 ",e.jsx(n.strong,{children:"84% less code"})," compared to Flatpickr-based implementation"]}),`
`,e.jsxs(n.li,{children:["📦 ",e.jsx(n.strong,{children:"~20-30% smaller bundle"})," size"]}),`
`,e.jsxs(n.li,{children:["🚀 ",e.jsx(n.strong,{children:"Zero external dependencies"})," to maintain"]}),`
`,e.jsxs(n.li,{children:["🎨 ",e.jsx(n.strong,{children:"Full customization"})," control"]}),`
`,e.jsxs(n.li,{children:["♿ ",e.jsx(n.strong,{children:"Enhanced accessibility"})," with comprehensive keyboard navigation"]}),`
`]}),`
`,e.jsx(n.h3,{id:"state-machine",children:"State machine"}),`
`,e.jsx(n.p,{children:`The date picker uses a finite state machine to manage all interactions and state transitions.
This provides:`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Predictable behavior"})," - All state changes are explicit and testable"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Clear event handling"})," - Events trigger specific state transitions"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Maintainable code"})," - State logic is centralized and documented"]}),`
`]}),`
`,e.jsxs(n.p,{children:["States include: ",e.jsx(n.code,{children:"IDLE"}),", ",e.jsx(n.code,{children:"FOCUSED"}),", ",e.jsx(n.code,{children:"CALENDAR_OPEN"}),", ",e.jsx(n.code,{children:"DATE_SELECTED"}),", ",e.jsx(n.code,{children:"RANGE_START_SELECTED"}),", ",e.jsx(n.code,{children:"RANGE_SELECTING"})]}),`
`,e.jsxs(n.p,{children:["For detailed state machine documentation, see the ",e.jsx(n.a,{href:"https://github.com/carbon-design-system/carbon/tree/main/packages/web-components/src/components/date-picker/state-machine/README.md",rel:"nofollow",children:"state machine README"}),"."]}),`
`,e.jsx(n.h3,{id:"keyboard-navigation",children:"Keyboard navigation"}),`
`,e.jsx(n.p,{children:"The calendar supports comprehensive keyboard navigation:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Arrow keys"})," - Navigate between dates"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Enter"})," - Select the focused date"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Escape"})," - Close the calendar"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tab"})," - Navigate through the date picker interface",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Single mode"}),": Input field → Calendar (when open) → Outside the component"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Range mode"}),": First input → Calendar (when open) → Second input → Calendar (when open) → Outside the component"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Shift+Tab"})," - Reverse navigation through the same flow"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Page Up/Down"})," - Navigate between months"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Home/End"})," - Jump to start/end of week"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Tab Navigation Flow:"})}),`
`,e.jsxs(n.p,{children:["In ",e.jsx(n.strong,{children:"single date mode"}),", pressing Tab follows this pattern:"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Focus on input field"}),`
`,e.jsx(n.li,{children:"If calendar is open, Tab moves focus to the calendar"}),`
`,e.jsx(n.li,{children:"Tab again moves focus outside the date picker"}),`
`]}),`
`,e.jsxs(n.p,{children:["In ",e.jsx(n.strong,{children:"range date mode"}),", pressing Tab follows this pattern:"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Focus on first input field (start date)"}),`
`,e.jsx(n.li,{children:"If calendar is open, Tab moves focus to the calendar"}),`
`,e.jsx(n.li,{children:"Tab again moves focus to second input field (end date)"}),`
`,e.jsx(n.li,{children:"If calendar is open, Tab moves focus to the calendar again"}),`
`,e.jsx(n.li,{children:"Tab again moves focus outside the date picker"}),`
`]}),`
`,e.jsx(n.p,{children:"Shift+Tab reverses this flow, allowing you to navigate backward through the same sequence."}),`
`,e.jsx(n.p,{children:`When the calendar opens without a selected date, focus automatically moves to today's date
for easy keyboard navigation.`}),`
`,e.jsx(n.h2,{id:"references",children:"References"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The date picker uses the ",e.jsx(n.a,{href:"https://tc39.es/proposal-temporal/docs/",rel:"nofollow",children:"Temporal API"})," for modern date handling"]}),`
`,e.jsxs(n.li,{children:["The calendar uses the ",e.jsx(n.a,{href:"https://developer.mozilla.org/en-US/docs/Web/API/Popover_API",rel:"nofollow",children:"Popover API"})," for dropdown behavior"]}),`
`,e.jsxs(n.li,{children:["Positioning uses ",e.jsx(n.a,{href:"https://developer.chrome.com/blog/tether-elements-to-each-other-with-css-anchor-positioning",rel:"nofollow",children:"CSS Anchor Positioning"})," for smart placement"]}),`
`,e.jsxs(n.li,{children:["The ",e.jsx(n.code,{children:"cds-date-picker-input"}),` component takes in similar attributes to the
`,e.jsx(n.code,{children:"cds-text-input"})," component, such as ",e.jsx(n.code,{children:"size"})," and ",e.jsx(n.code,{children:"placeholder"}),`. For more
information on these attributes, check out the
`,e.jsx(n.a,{href:"../?path=/docs/components-text-input--overview",children:"text input"})," page."]}),`
`]}),`
`,e.jsx(n.h2,{id:"feedback",children:"Feedback"}),`
`,e.jsxs(n.p,{children:[`Help us improve this component by providing feedback, asking questions on Slack,
or updating this file on
`,e.jsx(n.a,{href:"https://github.com/carbon-design-system/carbon/edit/main/packages/web-components/src/components/date-picker/date-picker.mdx",rel:"nofollow",children:"GitHub"}),"."]})]})}function U(i={}){const{wrapper:n}={...c(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{U as default};
