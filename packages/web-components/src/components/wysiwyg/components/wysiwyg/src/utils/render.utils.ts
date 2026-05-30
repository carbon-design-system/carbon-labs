/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import { CSS_CLASSES, TOOLTIP_CONFIG } from '../constants/editor.constants.js';
import type { ToolbarOptions } from '../types/editor.types.js';

/**
 * Utility functions for theme and color management
 */
export class ThemeUtils {
  /**
   * Get computed color value from CSS custom property token
   * @param {string} token - The token name (e.g., 'text-primary')
   * @returns {string} The computed color value
   */
  public static getTokenColor(token: string): string {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue(`--cds-${token}`).trim();
  }

  /**
   * Get the default text color from theme
   * @returns {string} The default text color value
   */
  public static getDefaultTextColor(): string {
    return this.getTokenColor('text-primary');
  }
}

/**
 * Utility functions for rendering UI elements
 */
export class RenderUtils {
  /**
   * Render a toolbar icon button with consistent styling
   * @param {any} icon - Carbon icon descriptor
   * @param {string} tooltip - Tooltip text
   * @param {(e?: Event) => void} onClick - Click handler
   * @param {boolean} isActive - Whether button is selected
   * @param {boolean} isDisabled - Whether button is disabled
   * @returns {TemplateResult} Icon button template
   */
  public static renderIconButton(
    icon: any,
    tooltip: string,
    onClick: (e?: Event) => void,
    isActive = false,
    isDisabled = false
  ): TemplateResult {
    return html`
      <cds-icon-button
        size="md"
        autoalign
        kind="ghost"
        class="${CSS_CLASSES.toolbarButton}"
        enter-delay-ms="${TOOLTIP_CONFIG.enterDelayMs}"
        leave-delay-ms="${TOOLTIP_CONFIG.leaveDelayMs}"
        align="${TOOLTIP_CONFIG.align}"
        ?isselected=${isActive}
        ?disabled=${isDisabled}
        @click=${onClick}>
        ${iconLoader(icon, { slot: 'icon' })}
        <span slot="tooltip-content">${tooltip}</span>
      </cds-icon-button>
    `;
  }

  /**
   * Render a toolbar group wrapper
   * @param {TemplateResult} content - Group content
   * @param {string} className - CSS class name for the group
   * @returns {TemplateResult} Toolbar group template
   */
  public static renderToolbarGroup(
    content: TemplateResult,
    className: string
  ): TemplateResult {
    return html`
      <div class="${className}" role="presentation">${content}</div>
    `;
  }
}

/**
 * Utility functions for toolbar configuration
 */
export class ToolbarUtils {
  /**
   * Find a toolbar group configuration by name
   * @param {ToolbarOptions | undefined} toolbarOptions - Toolbar configuration array
   * @param {string} groupName - Name of the toolbar group
   * @returns {ToolbarGroup | undefined} The group configuration if found
   */
  private static findGroup(
    toolbarOptions: ToolbarOptions | undefined,
    groupName: string
  ): any {
    if (!toolbarOptions) {
      return undefined;
    }
    return toolbarOptions.find((group) =>
      'name' in group ? group.name === groupName : group.id === groupName
    );
  }

  /**
   * Check if a toolbar group should be rendered based on configuration
   * @param {ToolbarOptions | undefined} toolbarOptions - Toolbar configuration array
   * @param {string} groupName - Name of the toolbar group
   * @returns {boolean} True if the group should be rendered
   */
  public static shouldRenderGroup(
    toolbarOptions: ToolbarOptions | undefined,
    groupName: string
  ): boolean {
    const groupConfig = this.findGroup(toolbarOptions, groupName);

    // If no config provided, render by default
    if (!groupConfig) {
      return true;
    }

    // If enabled is explicitly set, use that value
    if (groupConfig.enabled !== undefined) {
      return groupConfig.enabled;
    }

    // Default to true if enabled is not specified
    return true;
  }

  /**
   * Check if a specific item within a group should be rendered
   * @param {ToolbarOptions | undefined} toolbarOptions - Toolbar configuration array
   * @param {string} groupName - Name of the toolbar group
   * @param {string} itemName - Name of the item within the group
   * @returns {boolean} True if the item should be rendered
   */
  public static shouldRenderItem(
    toolbarOptions: ToolbarOptions | undefined,
    groupName: string,
    itemName: string
  ): boolean {
    const groupConfig = this.findGroup(toolbarOptions, groupName);

    // If no group config or no items config, render by default
    if (!groupConfig?.items) {
      return true;
    }

    // If item is explicitly configured, use that value
    if (groupConfig.items[itemName] !== undefined) {
      return groupConfig.items[itemName];
    }

    // Default to true if item is not specified
    return true;
  }
}

/**
 * Utility functions for color picker interactions
 */
export class ColorPickerUtils {
  /**
   * Toggle color picker open/closed state
   * @param {ShadowRoot} renderRoot - The shadow root containing the color picker
   * @param {Event} event - Click event from the trigger button
   */
  public static toggleColorPicker(renderRoot: ShadowRoot, event: Event): void {
    event.stopPropagation();
    const picker = renderRoot.querySelector('clabs-style-picker');
    if (picker) {
      picker.toggleAttribute('open');
    }
  }
}
