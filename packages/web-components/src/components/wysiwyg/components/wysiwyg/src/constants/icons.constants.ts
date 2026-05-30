/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Carbon icons used in the WYSIWYG editor
import Undo from '@carbon/icons/es/undo/16.js';
import Redo from '@carbon/icons/es/redo/16.js';
import Cut from '@carbon/icons/es/cut/16.js';
import Copy from '@carbon/icons/es/copy/16.js';
import Paste from '@carbon/icons/es/paste/16.js';
import TextBold from '@carbon/icons/es/text--bold/16.js';
import TextItalic from '@carbon/icons/es/text--italic/16.js';
import TextUnderline from '@carbon/icons/es/text--underline/16.js';
import TextStrikethrough from '@carbon/icons/es/text--strikethrough/16.js';
import Code from '@carbon/icons/es/code/16.js';
import CodeBlock from '@carbon/icons/es/code-block/16.js';
import ListBulleted from '@carbon/icons/es/list--bulleted/16.js';
import ListNumbered from '@carbon/icons/es/list--numbered/16.js';
import ListChecked from '@carbon/icons/es/list--checked/16.js';
import TextAlignLeft from '@carbon/icons/es/text--align--left/16.js';
import TextAlignCenter from '@carbon/icons/es/text--align--center/16.js';
import TextAlignRight from '@carbon/icons/es/text--align--right/16.js';
import TextAlignJustify from '@carbon/icons/es/text--align--justify/16.js';
import IndentMore from '@carbon/icons/es/text--indent--more/16.js';
import IndentLess from '@carbon/icons/es/text--indent--less/16.js';
import TextColor from '@carbon/icons/es/text--color/16.js';
import Quotes from '@carbon/icons/es/quotes/16.js';
import Table16 from '@carbon/icons/es/table/16.js';
import Image16 from '@carbon/icons/es/image/16.js';
import Link16 from '@carbon/icons/es/link/16.js';
import Attachment from '@carbon/icons/es/attachment/16.js';
import OverflowMenuVertical from '@carbon/icons/es/overflow-menu--vertical/16.js';

/**
 * Centralized icon exports for the WYSIWYG editor
 */
export const EDITOR_ICONS = {
  // History
  Undo,
  Redo,

  // Clipboard
  Cut,
  Copy,
  Paste,

  // Text formatting
  TextBold,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  Code,
  CodeBlock,

  // Lists
  ListBulleted,
  ListNumbered,
  ListChecked,

  // Alignment
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,

  // Indentation
  IndentMore,
  IndentLess,

  // Color
  TextColor,

  // Blocks
  Quotes,

  // Insert
  Table: Table16,
  Image: Image16,
  Link: Link16,
  Attachment,

  // Menu
  OverflowMenuVertical,
} as const;
