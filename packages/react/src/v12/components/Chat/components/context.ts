/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext } from 'react';
import type { SelectionVariant } from '@carbon-labs/react-selection-kit';

// The enclosing ChatShell's corners and variant, for every part inside that doesn't name its own.
// Its own module, so the parts read it without importing the shell.

export type ChatCorners = 'rounded' | 'full' | 'square';
// Not hero: the chat's variant paints every emphasis surface in it, and hero is for one control on a page.
export type ChatVariant = Exclude<SelectionVariant, 'hero'>;

export interface ChatShellValue {
  corners: ChatCorners;
  variant: ChatVariant;
}

export const ChatShellContext = createContext<ChatShellValue | null>(null);
export const useChatShell = () => useContext(ChatShellContext);

/** The family's default look. */
export const DEFAULT_CHAT_VARIANT: ChatVariant = 'inverse';

/** A part's variant: its own, else the shell's, else the family's default. */
export const useChatVariant = (own?: ChatVariant): ChatVariant => {
  const shell = useChatShell();
  return own ?? shell?.variant ?? DEFAULT_CHAT_VARIANT;
};
