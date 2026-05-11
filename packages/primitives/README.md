# @carbon-labs/primitives

Framework-agnostic primitives for Carbon Labs components.

## Overview

This package contains shared, framework-agnostic logic that can be used across
different Carbon Labs implementations (Web Components, React, Vue, etc.). It
includes state machines, utilities, and other reusable primitives.

## Installation

```bash
npm install @carbon-labs/primitives
# or
yarn add @carbon-labs/primitives
```

## Primitives

### Date Picker State Machine

A comprehensive state machine for managing date picker behavior, including:

- Single and range date selection
- Calendar navigation
- Keyboard interactions
- Input validation
- Accessibility features

#### Usage

```typescript
import { DatePickerStateMachine } from '@carbon-labs/primitives/date-picker';

// Create a new state machine instance
const machine = new DatePickerStateMachine({
  mode: 'single',
  value: '',
  minDate: '2024-01-01',
  maxDate: '2024-12-31',
});

// Subscribe to state changes
machine.subscribe((transition) => {
  console.log('State changed:', transition);
});

// Send events
machine.send('CALENDAR_OPEN');
machine.send('DATE_SELECT', { date: { year: 2024, month: 3, day: 15 } });
```

#### API

See the [Date Picker documentation](./src/date-picker/README.md) for detailed
API information.

## Framework Integration

### Web Components

```typescript
import { DatePickerStateMachine } from '@carbon-labs/primitives/date-picker';

class MyDatePicker extends HTMLElement {
  private machine: DatePickerStateMachine;

  constructor() {
    super();
    this.machine = new DatePickerStateMachine({
      mode: 'single',
    });
  }
}
```

### React

```typescript
import { useMemo } from 'react';
import { DatePickerStateMachine } from '@carbon-labs/primitives/date-picker';

function useDatePicker(config) {
  const machine = useMemo(() => new DatePickerStateMachine(config), [config]);

  // Use machine in your component
  return machine;
}
```

## Development

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

## Contributing

See the main [Carbon Labs contributing guide](../../CONTRIBUTING.md).

## License

Apache-2.0
