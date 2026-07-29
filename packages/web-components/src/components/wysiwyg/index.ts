/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Main component export
export { default as ClabsWysiwyg } from './components/wysiwyg/wysiwyg.js';

// Constants
export {
  BASE_CLASS,
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from './components/wysiwyg/src/constants';

// Type exports
export type {
  EditorComponent,
  ExtensionWithToolbar,
  ToolbarSize,
} from './components/wysiwyg/src/types';
export { hasToolbarRender } from './components/wysiwyg/src/types';

// Extension exports
export { History } from './components/wysiwyg/src/extensions/history';
export { TextFormatting } from './components/wysiwyg/src/extensions/text-formatting';
export { Typography } from './components/wysiwyg/src/extensions/typography';
export { Lists } from './components/wysiwyg/src/extensions/lists';
export { Tables } from './components/wysiwyg/src/extensions/tables';
export { Alignment } from './components/wysiwyg/src/extensions/alignment';
export { TextColor } from './components/wysiwyg/src/extensions/text-color';
export { Search } from './components/wysiwyg/src/extensions/search';
export { Blocks } from './components/wysiwyg/src/extensions/blocks';
export { Insert } from './components/wysiwyg/src/extensions/insert';
export { Typeface } from './components/wysiwyg/src/extensions/typeface';
export { Clipboard } from './components/wysiwyg/src/extensions/clipboard';
