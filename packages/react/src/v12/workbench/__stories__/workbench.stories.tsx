/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The workbench shown on real pieces: a content swap from the seam (the
// toolbar's clock and reduced-motion picks act on it, the Motion panel lists
// its tokens), the DatePicker's states as a matrix, and two of its stories
// compared.

import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@carbon/react';
import {
  playContentSwap,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { compareStory, matrixStory } from '@carbon-labs/v12-workbench';
import { DatePicker, DatePickerInput } from '../../components/DatePicker';
import '../../components/DatePicker/components/date-picker.scss';

export default {
  title: 'V12/Workbench',
  parameters: {
    v12: {
      motion: ['content-swap'],
      reduced: { 'content-swap': 'at-once' },
      states: ['rest'],
    },
  },
};

/** A label that swaps its text, out then in, with the seam's content swap. */
function SwapDemo() {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [count, setCount] = useState(0);
  const even = useRef<HTMLSpanElement>(null);
  const odd = useRef<HTMLSpanElement>(null);

  // The odd span starts hidden, the way a finished swap leaves what left.
  useLayoutEffect(() => {
    odd.current?.animate([{ opacity: 0 }, { opacity: 0 }], {
      duration: 0,
      fill: 'forwards',
    });
  }, []);

  useLayoutEffect(() => {
    if (count === 0) return;
    const [out, incoming] =
      count % 2 ? [even.current, odd.current] : [odd.current, even.current];
    if (out && incoming) {
      playContentSwap({
        out,
        in: incoming,
        direction: 1,
        reduced: reducedRef.current,
      });
    }
  }, [count]);

  const evenStep = count - (count % 2);
  const oddStep = count % 2 ? count : Math.max(1, count - 1);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <p style={{ display: 'grid', margin: 0 }}>
        <span ref={even} style={{ gridArea: '1 / 1' }}>
          Step {evenStep}
        </span>
        <span ref={odd} style={{ gridArea: '1 / 1' }}>
          Step {oddStep}
        </span>
      </p>
      <Button kind="tertiary" size="sm" onClick={() => setCount((c) => c + 1)}>
        Next step
      </Button>
    </div>
  );
}

export const ContentSwap = () => <SwapDemo />;

ContentSwap.decorators = [
  (Story: React.ComponentType) => (
    <div style={{ padding: '3rem' }}>
      <Story />
    </div>
  ),
];

interface PickerStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}

/** One single date picker, with an id of its own for each matrix cell. */
function SinglePicker({ readOnly, ...state }: PickerStateProps) {
  const id = `date-${useId().replace(/:/g, '')}`;
  return (
    <DatePicker datePickerType="single" readOnly={readOnly}>
      <DatePickerInput
        id={id}
        labelText="Date"
        placeholder="mm/dd/yyyy"
        readOnly={readOnly}
        {...state}
      />
    </DatePicker>
  );
}

export const Matrix = matrixStory(SinglePicker, {
  states: ['enabled', 'disabled', 'readOnly', 'invalid'],
});

export const Compare = compareStory({
  before: 'v12-datepicker--simple',
  after: 'v12-datepicker--single-with-calendar',
  labels: ['Simple', 'Single with calendar'],
});
