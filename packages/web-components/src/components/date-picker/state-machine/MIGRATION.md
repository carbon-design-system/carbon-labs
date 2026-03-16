# Migration Guide: Integrating State Machine into Date Picker

This guide explains how to integrate the new state machine into the existing Carbon Web Components date picker implementation.

## Overview

The state machine refactor extracts the complex state management logic from the date picker component into a lightweight, testable, and framework-agnostic state machine. This provides:

- **Better Testability**: State logic can be tested independently of the DOM
- **Clearer State Management**: Explicit states and transitions
- **Framework Portability**: Core logic can be reused in React/Angular wrappers
- **Maintainability**: Separation of concerns between UI and business logic

## Migration Strategy

The migration can be done incrementally without breaking existing functionality:

### Phase 1: Add State Machine (Non-Breaking)

1. The state machine is added alongside existing logic
2. Both systems run in parallel
3. State machine tracks state but doesn't control behavior yet
4. Validate that state machine stays in sync with component

### Phase 2: Delegate to State Machine (Gradual)

1. Gradually replace direct state manipulation with state machine events
2. Start with simple states (open/close, focus/blur)
3. Move to complex logic (range selection, validation)
4. Remove redundant state tracking from component

### Phase 3: Complete Migration (Breaking Changes)

1. Remove old state management code
2. State machine becomes single source of truth
3. Plugins updated to work with state machine
4. Full test coverage of state machine

## Integration Steps

### Step 1: Initialize State Machine in Component

```typescript
// In date-picker.ts
import { WebComponentAdapter } from './state-machine/adapters/web-component-adapter';
import type { DatePickerContext } from './state-machine';

class CDSDatePicker extends HostListenerMixin(FormMixin(LitElement)) {
  /**
   * State machine adapter
   */
  private _stateMachineAdapter?: WebComponentAdapter;

  /**
   * Initialize the state machine
   */
  private _initializeStateMachine() {
    const initialContext: Partial<DatePickerContext> = {
      mode: this._mode,
      value: this.value || '',
      dateFormat: this.dateFormat || CDSDatePicker.defaultDateFormat,
      minDate: this.minDate ? new Date(this.minDate) : null,
      maxDate: this.maxDate ? new Date(this.maxDate) : null,
      isDisabled: this.disabled,
      isReadonly: this.readonly,
      isOpen: this.open,
      allowInput: this.allowInput,
      closeOnSelect: this.closeOnSelect,
    };

    this._stateMachineAdapter = new WebComponentAdapter({
      component: this,
      initialContext,
      onStateChange: (transition) => {
        // Log state changes in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('DatePicker state:', transition.from, '->', transition.to);
        }
      },
      onCalendarOpen: () => {
        // Handle calendar opening
        this._handleCalendarOpen();
      },
      onCalendarClose: () => {
        // Handle calendar closing
        this._handleCalendarClose();
      },
      onDateSelect: (context) => {
        // Handle date selection
        this._handleDateSelect(context);
      },
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._initializeStateMachine();
    this._instantiateDatePicker();
  }

  disconnectedCallback() {
    this._stateMachineAdapter?.destroy();
    this._releaseDatePicker();
    super.disconnectedCallback();
  }
}
```

### Step 2: Update Calendar Integration

```typescript
// In date-picker.ts
private _instantiateDatePicker() {
  this._releaseDatePicker();
  const { _dateInteractNode: dateInteractNode } = this;
  
  if (dateInteractNode && dateInteractNode.input && this._mode !== 'simple') {
    this.calendar = createCalendar(
      dateInteractNode.input as any,
      {
        ...this._datePickerOptions,
        // Add state machine callbacks
        onChange: (selectedDates) => {
          // Delegate to state machine
          this._stateMachineAdapter?.handleCalendarChange(selectedDates);
          
          // Keep existing behavior for now (Phase 1)
          this._value = selectedDates
            .map((date) => getISODateString(date))
            .join('/');
        },
        onOpen: () => {
          // Delegate to state machine
          this._stateMachineAdapter?.handleCalendarOpen();
          
          // Keep existing behavior for now (Phase 1)
          // Will be removed in Phase 3
        },
        onClose: () => {
          // Delegate to state machine
          this._stateMachineAdapter?.handleCalendarClose();
          
          // Keep existing behavior for now (Phase 1)
          // Will be removed in Phase 3
        },
      }
    );
  }
  
  // ... rest of initialization
}
```

### Step 3: Update Event Handlers

```typescript
// In date-picker.ts

/**
 * Handles input focus
 */
private _handleInputFocus(event: FocusEvent) {
  const target = event.target as CDSDatePickerInput;
  const inputType = target.kind === 'to' ? 'to' : 'from';
  
  // Delegate to state machine
  this._stateMachineAdapter?.handleInputFocus(inputType);
}

/**
 * Handles input blur
 */
private _handleInputBlur(event: FocusEvent) {
  // Delegate to state machine
  this._stateMachineAdapter?.handleInputBlur();
}

/**
 * Handles keyboard events
 */
private _handleKeydown(event: KeyboardEvent) {
  const { key, shiftKey } = event;
  
  // Delegate to state machine
  this._stateMachineAdapter?.handleKeyboard(key, shiftKey);
  
  // Keep existing keyboard handling for now
  // Will be removed in Phase 3
}
```

### Step 4: Update Property Setters

```typescript
// In date-picker.ts

@property({ type: Boolean, reflect: true })
set disabled(value: boolean) {
  const oldValue = this._disabled;
  this._disabled = value;
  
  // Update state machine
  if (this._stateMachineAdapter) {
    if (value) {
      this._stateMachineAdapter.send('DISABLE');
    } else {
      this._stateMachineAdapter.send('ENABLE');
    }
  }
  
  this.requestUpdate('disabled', oldValue);
}

@property({ type: Boolean, reflect: true })
set readonly(value: boolean) {
  const oldValue = this._readonly;
  this._readonly = value;
  
  // Update state machine
  if (this._stateMachineAdapter) {
    if (value) {
      this._stateMachineAdapter.send('SET_READONLY');
    } else {
      this._stateMachineAdapter.send('UNSET_READONLY');
    }
  }
  
  this.requestUpdate('readonly', oldValue);
}

@property({ type: Boolean, reflect: true })
set open(value: boolean) {
  const oldValue = this._open;
  this._open = value;
  
  // Update state machine
  if (this._stateMachineAdapter) {
    if (value) {
      this._stateMachineAdapter.send('CALENDAR_OPEN');
    } else {
      this._stateMachineAdapter.send('CALENDAR_CLOSE');
    }
  }
  
  this.requestUpdate('open', oldValue);
}
```

### Step 5: Update Plugins (Gradual)

Plugins can be updated to work with the state machine:

```typescript
// In state-handshake-plugin.ts
export default (datePicker: CDSDatePicker): CalendarPlugin =>
  (calendar: CalendarInstance) => {
    const handleChange = (selectedDates: Date[]) => {
      // Use state machine if available
      if (datePicker._stateMachineAdapter) {
        datePicker._stateMachineAdapter.handleCalendarChange(selectedDates);
      }
      
      // Keep existing event dispatch for backward compatibility
      const { eventChange } = datePicker.constructor as typeof CDSDatePicker;
      datePicker.dispatchEvent(
        new CustomEvent(eventChange, {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: { selectedDates },
        })
      );
    };

    return {
      onOpen: () => {
        if (datePicker._stateMachineAdapter) {
          datePicker._stateMachineAdapter.handleCalendarOpen();
        }
        datePicker.open = true;
      },
      onClose: () => {
        if (datePicker._stateMachineAdapter) {
          datePicker._stateMachineAdapter.handleCalendarClose();
        }
        datePicker.open = false;
      },
      onChange: handleChange,
      onReady: [register],
    };
  };
```

## Testing Strategy

### Unit Tests for State Machine

```typescript
// state-machine.test.ts
import { DatePickerStateMachine, DatePickerState, DatePickerEvent } from './state-machine';

describe('DatePickerStateMachine', () => {
  describe('Range Selection', () => {
    it('should handle complete range selection flow', () => {
      const machine = new DatePickerStateMachine({
        mode: 'range',
        closeOnSelect: true,
      });

      // Open calendar
      machine.send(DatePickerEvent.CALENDAR_OPEN);
      expect(machine.getState()).toBe(DatePickerState.CALENDAR_OPEN);

      // Select start date
      const startDate = new Date('2024-01-15');
      machine.send(DatePickerEvent.RANGE_START_SELECT, { date: startDate });
      expect(machine.getState()).toBe(DatePickerState.SELECTING_END);
      expect(machine.getContext().startDate).toEqual(startDate);

      // Select end date
      const endDate = new Date('2024-01-20');
      machine.send(DatePickerEvent.RANGE_END_SELECT, { date: endDate });
      expect(machine.getState()).toBe(DatePickerState.DATE_SELECTED);
      expect(machine.getContext().endDate).toEqual(endDate);
      expect(machine.getContext().isOpen).toBe(false); // closeOnSelect
    });

    it('should swap dates if end date is before start date', () => {
      const machine = new DatePickerStateMachine({ mode: 'range' });

      machine.send(DatePickerEvent.CALENDAR_OPEN);
      machine.send(DatePickerEvent.RANGE_START_SELECT, {
        date: new Date('2024-01-20'),
      });
      machine.send(DatePickerEvent.RANGE_END_SELECT, {
        date: new Date('2024-01-15'),
      });

      const context = machine.getContext();
      expect(context.startDate).toEqual(new Date('2024-01-15'));
      expect(context.endDate).toEqual(new Date('2024-01-20'));
    });
  });

  describe('Guards', () => {
    it('should prevent date selection outside allowed range', () => {
      const machine = new DatePickerStateMachine({
        mode: 'single',
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-12-31'),
      });

      machine.send(DatePickerEvent.CALENDAR_OPEN);
      
      // Try to select date before minDate
      machine.send(DatePickerEvent.DATE_SELECT, {
        date: new Date('2023-12-31'),
      });
      
      // Should not transition to DATE_SELECTED
      expect(machine.getState()).toBe(DatePickerState.CALENDAR_OPEN);
      expect(machine.getContext().startDate).toBeNull();
    });
  });
});
```

### Integration Tests

```typescript
// date-picker-integration.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import CDSDatePicker from './date-picker';

describe('CDSDatePicker with State Machine', () => {
  it('should sync state machine with component properties', async () => {
    const el = await fixture<CDSDatePicker>(html`
      <cds-date-picker>
        <cds-date-picker-input kind="from" label-text="Start date">
        </cds-date-picker-input>
      </cds-date-picker>
    `);

    // State machine should be initialized
    expect(el._stateMachineAdapter).to.exist;
    expect(el._stateMachineAdapter.getState()).to.equal('idle');

    // Change component property
    el.disabled = true;
    await el.updateComplete;

    // State machine should be updated
    expect(el._stateMachineAdapter.getContext().isDisabled).to.be.true;
    expect(el._stateMachineAdapter.getState()).to.equal('disabled');
  });
});
```

## Rollback Plan

If issues arise during migration:

1. **Phase 1**: Simply remove state machine initialization - no breaking changes
2. **Phase 2**: Revert specific event handlers to old implementation
3. **Phase 3**: Keep state machine but add feature flag to disable it

```typescript
// Feature flag approach
private _useStateMachine = true; // Can be set via property

private _handleInputFocus(event: FocusEvent) {
  if (this._useStateMachine && this._stateMachineAdapter) {
    this._stateMachineAdapter.handleInputFocus(inputType);
  } else {
    // Old implementation
    this._isFocused = true;
  }
}
```

## Benefits After Migration

1. **Testability**: State logic tested independently of DOM
2. **Maintainability**: Clear state transitions and business logic
3. **Portability**: Easy to create React/Angular wrappers
4. **Debugging**: Clear state history and transitions
5. **Documentation**: Self-documenting state machine

## Timeline

- **Week 1**: Phase 1 - Add state machine (non-breaking)
- **Week 2-3**: Phase 2 - Gradual delegation to state machine
- **Week 4**: Phase 3 - Complete migration and cleanup
- **Week 5**: Testing and documentation

## Support

For questions or issues during migration:
- Review the state machine README.md
- Check the example integration code
- Consult the state machine tests for usage patterns