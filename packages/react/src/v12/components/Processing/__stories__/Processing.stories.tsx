/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import {
  Processing,
  type ProcessingHandle,
  type ProcessingMode,
} from '../index';
import mdx from './Processing.mdx';

// Under reduced motion each mode is its still picture, out hides the dots at
// once and the wiggle does nothing: every pattern lands at once.
const PATTERNS = [
  'load-in',
  'pulse',
  'swing',
  'swing-clock',
  'spin',
  'square-s-fourth-dot',
  'wiggle',
  'out',
  'shared-clock',
  'interruption',
];

export default {
  title: 'V12/Processing',
  component: Processing,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: PATTERNS,
      reduced: Object.fromEntries(PATTERNS.map((p) => [p, 'at-once'])),
      states: ['loading', 'triangle', 'square', 'out'],
    },
  },
};

const MODES: ProcessingMode[] = ['loading', 'triangle', 'square', 'out'];

/** The mark at both sizes, each mode a button, and the handle's wiggle. */
function Working() {
  const [mode, setMode] = useState<ProcessingMode>('loading');
  const large = useRef<ProcessingHandle>(null);
  const small = useRef<ProcessingHandle>(null);
  const wiggle = () => {
    large.current?.triggerWiggle();
    small.current?.triggerWiggle();
  };
  return (
    <div style={{ display: 'grid', gap: '1.5rem', justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Processing ref={large} mode={mode} />
        <Processing ref={small} mode={mode} size={16} />
        <Processing mode={mode} variant="hero" />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {MODES.map((m) => (
          <Button
            key={m}
            kind={m === mode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode(m)}>
            {m}
          </Button>
        ))}
        <Button frame="ghost" size="sm" onClick={wiggle}>
          Wiggle
        </Button>
      </div>
    </div>
  );
}

/** The mark, neutral and hero, at 32 and 16px. */
export const Default = {
  render: () => <Working />,
};
