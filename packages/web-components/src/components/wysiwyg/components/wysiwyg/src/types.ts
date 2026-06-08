/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Editor, Extension } from '@tiptap/core';
import type { TemplateResult } from 'lit';

/**
 * Interface for the WYSIWYG component that extensions can access.
 * Provides methods for updating the component and accessing its shadow root.
 */
export interface EditorComponent {
  /**
   * The TipTap editor instance
   */
  editor: Editor | null;

  /**
   * The shadow root of the component
   */
  shadowRoot: ShadowRoot | null;

  /**
   * Request an update to re-render the component
   */
  requestUpdate(): void;

  /**
   * Dispatch a content change event
   */
  dispatchContentChange?(): void;

  /**
   * Current content as HTML
   */
  content?: string;
}

/**
 * Toolbar button size options
 */
export type ToolbarSize = 'sm' | 'md' | 'lg';

/**
 * Interface for extensions that provide toolbar rendering.
 * Extends the base TipTap Extension with a toolbarRender method.
 */
export interface ExtensionWithToolbar<T = any> extends Extension<T> {
  /**
   * Renders the toolbar controls for this extension.
   * @param editor - The TipTap editor instance
   * @param toolbarSize - Size of the toolbar buttons
   * @returns Lit template for the toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Type guard to check if an extension has toolbar rendering capability.
 * @param {Extension<any>} extension - Extension to check
 * @returns {boolean} True if the extension has a toolbarRender method
 */
export function hasToolbarRender(
  extension: Extension<any>
): extension is ExtensionWithToolbar {
  return (
    'toolbarRender' in extension &&
    typeof extension.toolbarRender === 'function'
  );
}

/**
 * Helper to safely access the component from an editor instance.
 * @param {Editor} editor - The TipTap editor instance
 * @returns {EditorComponent | undefined} The component if available, undefined otherwise
 */
export function getEditorComponent(
  editor: Editor
): EditorComponent | undefined {
  return (editor as any).component as EditorComponent | undefined;
}
