# @carbon-labs/react-date-picker

A React date picker: a text field for a date with, in `single` and `range`, a
calendar under it. Prop names follow Carbon React's `DatePicker`, but this is
its own implementation and not every Carbon prop is supported.

## Usage

```tsx
import { DatePicker, DatePickerInput } from '@carbon-labs/react-date-picker';
import '@carbon-labs/react-date-picker/scss/date-picker.scss';

<DatePicker datePickerType="single" onChange={(dates) => console.log(dates)}>
  <DatePickerInput id="date" labelText="Date" />
</DatePicker>;
```

The component uses the `Temporal` API and needs `Temporal` in the global scope.
The package doesn't include a polyfill.

## What's in the package

- `DatePicker`: holds the state and the calendar. `datePickerType` is `simple`
  (a field, no calendar), `single` or `range` (two fields).
- `DatePickerInput`: the field, with its label, calendar icon, helper, warning
  and error text, and an optional `decorator` such as an AI label.
- `Calendar`: the month grid `DatePicker` renders.
- `DatePickerSkeleton`: the loading placeholder; `range` draws two fields.
- `useDatePicker`: the hook `DatePicker` is built on.
- `DatePickerState`, `DatePickerEvent` and the state machine's types,
  re-exported from `@carbon-labs/primitives/date-picker`.

## Props

`DatePicker` reads `children`, `className`, `closeOnSelect`, `dateFormat`,
`datePickerType`, `light`, `maxDate`, `minDate`, `onChange`, `onClose`,
`onOpen`, `readOnly`, `short` and `value`.

`DatePickerInput` reads `autoComplete`, `className`, `decorator`, `disabled`,
`helperText`, `hideIcon`, `hideLabel`, `iconDescription`, `id` (required),
`invalid`, `invalidText`, `labelText`, `name`, `onBlur`, `onChange`, `onClick`,
`onFocus`, `onIconClick`, `onKeyDown`, `pattern`, `placeholder`, `readOnly`,
`required`, `size`, `slug` (deprecated), `type`, `value`, `warn` and `warnText`.
Other props are passed to the `<input>`.

The Storybook page, `__stories__/date-picker-react.mdx`, describes each prop.

## Motion

None. The calendar appears and disappears at once. With reduced motion it is the
same.

## Known issues

- Typed text isn't kept: the field shows only a date chosen in the calendar or a
  `value` passed to `DatePickerInput`. In `simple` this means the field can't be
  filled.
- In `simple`, Tab doesn't move focus out of the field.
- `value` on `DatePicker` doesn't choose a date or fill the field.
- Inside `DatePicker` the field is always controlled, so `defaultValue` has no
  effect there.
- `DatePickerProps` declares `appendTo`, `allowInput` and `locale`, but the
  component doesn't read them.
- Month and weekday names are in English only.

## Dependencies

`@carbon-labs/primitives` (the state machine, date helpers and styles),
`classnames` and `@ibm/telemetry-js`.
