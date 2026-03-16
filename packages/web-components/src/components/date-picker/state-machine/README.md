# Date Picker State Machine

A lightweight, framework-agnostic state machine for managing date picker logic including focus management, range selection, and calendar toggling.

## Architecture

The state machine is designed with the following principles:

- **Zero Dependencies**: Uses only TypeScript standard library
- **Framework Agnostic**: Core logic is pure TypeScript, easily portable to React/Angular/Vue
- **Immutable Updates**: All state changes return new context objects
- **Type Safe**: Full TypeScript coverage with strict mode
- **Testable**: Easy to unit test without DOM dependencies

## Directory Structure

```
state-machine/
├── types.ts           # Type definitions
├── states.ts          # State and event enums
├── guards.ts          # Transition guards (validation)
├── actions.ts         # State update actions
├── effects.ts         # Side effects
├── machine.ts         # Core state machine
├── index.ts           # Public API
└── adapters/
    └── web-component-adapter.ts  # Web Component integration
```

## States

The date picker has the following states:

- `IDLE` - Initial state, calendar closed, no focus
- `FOCUSED` - Input has focus, calendar closed
- `CALENDAR_OPEN` - Calendar dropdown is open
- `SELECTING_START` - User is selecting start date (range mode)
- `SELECTING_END` - User is selecting end date (range mode)
- `DATE_SELECTED` - Date(s) have been selected
- `DISABLED` - Component is disabled
- `READONLY` - Component is read-only
- `ERROR` - Component is in an error state

## Events

Key events that trigger state transitions:

- `INPUT_FOCUS` / `INPUT_BLUR` - Input focus changes
- `CALENDAR_OPEN` / `CALENDAR_CLOSE` - Calendar visibility changes
- `DATE_SELECT` - Single date selected
- `RANGE_START_SELECT` / `RANGE_END_SELECT` - Range dates selected
- `OUTSIDE_CLICK` - Click outside component
- `ESCAPE_KEY` / `TAB_KEY` / `ENTER_KEY` - Keyboard events
- `DISABLE` / `ENABLE` - Disabled state changes
- `SET_READONLY` / `UNSET_READONLY` - Readonly state changes

## Usage

### Basic Usage

```typescript
import { DatePickerStateMachine, DatePickerEvent } from './state-machine';

// Create a new state machine
const machine = new DatePickerStateMachine({
  mode: 'single',
  dateFormat: 'm/d/Y',
  closeOnSelect: true
});

// Send events
machine.send(DatePickerEvent.INPUT_FOCUS);
machine.send(DatePickerEvent.CALENDAR_OPEN);
machine.send(DatePickerEvent.DATE_SELECT, { date: new Date() });

// Get current state and context
const state = machine.getState();
const context = machine.getContext();

// Subscribe to state changes
const unsubscribe = machine.subscribe((transition) => {
  console.log('State changed:', transition.from, '->', transition.to);
  console.log('New context:', transition.context);
});

// Cleanup
unsubscribe();
```

### With Web Component Adapter

```typescript
import { WebComponentAdapter } from './state-machine/adapters/web-component-adapter';

// In your Web Component
class CDSDatePicker extends LitElement {
  private adapter?: WebComponentAdapter;

  connectedCallback() {
    super.connectedCallback();
    
    this.adapter = new WebComponentAdapter({
      component: this,
      initialContext: {
        mode: this._mode,
        dateFormat: this.dateFormat,
        minDate: this.minDate ? new Date(this.minDate) : null,
        maxDate: this.maxDate ? new Date(this.maxDate) : null,
      },
      onStateChange: (transition) => {
        // Handle state changes
      },
      onCalendarOpen: () => {
        // Handle calendar opening
      },
      onDateSelect: (context) => {
        // Handle date selection
      }
    });
  }

  disconnectedCallback() {
    this.adapter?.destroy();
    super.disconnectedCallback();
  }

  // Handle calendar events
  private setupCalendar() {
    this.calendar = createCalendar(input, {
      onChange: (selectedDates) => {
        this.adapter?.handleCalendarChange(selectedDates);
      },
      onOpen: () => {
        this.adapter?.handleCalendarOpen();
      },
      onClose: () => {
        this.adapter?.handleCalendarClose();
      }
    });
  }
}
```

## Range Selection Logic

The state machine handles range selection with the following flow:

1. User opens calendar → `CALENDAR_OPEN` state
2. User selects first date → `RANGE_START_SELECT` event → `SELECTING_END` state
3. User selects second date → `RANGE_END_SELECT` event → `DATE_SELECTED` state
4. If end date < start date, dates are automatically swapped
5. Calendar closes (if `closeOnSelect` is true)

### Example

```typescript
// Range mode
const machine = new DatePickerStateMachine({
  mode: 'range',
  closeOnSelect: true
});

// Open calendar
machine.send(DatePickerEvent.CALENDAR_OPEN);
// State: CALENDAR_OPEN

// Select start date
machine.send(DatePickerEvent.RANGE_START_SELECT, {
  date: new Date('2024-01-15')
});
// State: SELECTING_END
// Context: { startDate: 2024-01-15, endDate: null }

// Select end date
machine.send(DatePickerEvent.RANGE_END_SELECT, {
  date: new Date('2024-01-20')
});
// State: DATE_SELECTED
// Context: { startDate: 2024-01-15, endDate: 2024-01-20, value: '2024-01-15/2024-01-20' }
// Calendar closes automatically
```

## Guards

Guards determine if a transition is allowed:

```typescript
// Example: Only allow date selection if date is in range
{
  DATE_SELECT: (context, event) => {
    const date = event.payload?.date;
    if (!date) return false;
    
    if (context.minDate && date < context.minDate) return false;
    if (context.maxDate && date > context.maxDate) return false;
    
    return true;
  }
}
```

## Actions

Actions update the context during transitions:

```typescript
// Example: Update context when range end is selected
{
  RANGE_END_SELECT: (context, event) => {
    const endDate = event.payload?.date;
    const { startDate } = context;
    
    // Swap if needed
    if (endDate < startDate) {
      return {
        startDate: endDate,
        endDate: startDate,
        value: `${formatDate(endDate)}/${formatDate(startDate)}`
      };
    }
    
    return {
      endDate,
      value: `${formatDate(startDate)}/${formatDate(endDate)}`
    };
  }
}
```

## Testing

The state machine is designed to be easily testable:

```typescript
import { DatePickerStateMachine, DatePickerState, DatePickerEvent } from './state-machine';

describe('DatePickerStateMachine', () => {
  it('should transition from IDLE to FOCUSED on INPUT_FOCUS', () => {
    const machine = new DatePickerStateMachine();
    
    expect(machine.getState()).toBe(DatePickerState.IDLE);
    
    machine.send(DatePickerEvent.INPUT_FOCUS);
    
    expect(machine.getState()).toBe(DatePickerState.FOCUSED);
    expect(machine.getContext().isFocused).toBe(true);
  });

  it('should handle range selection correctly', () => {
    const machine = new DatePickerStateMachine({ mode: 'range' });
    
    machine.send(DatePickerEvent.CALENDAR_OPEN);
    machine.send(DatePickerEvent.RANGE_START_SELECT, {
      date: new Date('2024-01-15')
    });
    
    expect(machine.getState()).toBe(DatePickerState.SELECTING_END);
    
    machine.send(DatePickerEvent.RANGE_END_SELECT, {
      date: new Date('2024-01-20')
    });
    
    expect(machine.getState()).toBe(DatePickerState.DATE_SELECTED);
    
    const context = machine.getContext();
    expect(context.startDate).toEqual(new Date('2024-01-15'));
    expect(context.endDate).toEqual(new Date('2024-01-20'));
  });
});
```

## Future Enhancements

- Add more sophisticated date validation
- Support for custom date formats
- Support for disabled dates
- Support for multiple date selection
- Performance optimizations for large date ranges