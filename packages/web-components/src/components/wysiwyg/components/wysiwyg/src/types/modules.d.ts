/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '*.scss?lit' {
  import { CSSResult } from 'lit';
  const styles: CSSResult;
  export default styles;
}

declare module '*.scss' {
  const content: string;
  export default content;
}
