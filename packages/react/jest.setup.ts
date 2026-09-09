/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

// jsdom doesn't provide TextEncoder/TextDecoder, which `react-dom/server`
// requires. Polyfill them so server-rendering and hydration tests can run.
const globalWithEncoders = globalThis as unknown as {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
};
globalWithEncoders.TextEncoder ??= TextEncoder;
globalWithEncoders.TextDecoder ??= TextDecoder;
