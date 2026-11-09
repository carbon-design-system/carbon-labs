/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

/**
 * Hand the worker's event loop a turn after every test.
 *
 * Most suites here are synchronous (rasterise every frame, fake clock, no real
 * timers), so a file can run for minutes on microtasks alone. Vitest's worker
 * sends its test results to the main process every 100ms and waits for the
 * reply with a 60s timer; the reply is a message, read only when the event loop
 * gets a turn, and once the loop does turn the overdue timer fires first. Any
 * file that ran past 60s without a turn (devicesPlaces, dataMisc, … under a full
 * worker count) ended in `Timeout calling "onTaskUpdate"` and exit 1 with every
 * test green. One turn per test lets the reply in.
 *
 * The real setImmediate, taken before any test fakes the clock.
 */
const turn = globalThis.setImmediate;
afterEach(() => new Promise<void>((resolve) => turn(() => resolve())));
