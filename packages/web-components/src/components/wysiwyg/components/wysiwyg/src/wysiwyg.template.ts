/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Editor, Extensions } from '@tiptap/core';
import { settings } from '@carbon-labs/utilities';

const { stablePrefix: clabsPrefix } = settings;

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/file-uploader/index.js';
import '@carbon/web-components/es/components/search/index.js';
import '@carbon-labs/wc-style-picker/es/index.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

// Services and utilities
import { EditorService } from './services/editor.service';
import { PopoverService } from './services/popover.service';
import { DOMUtils } from './utils/dom.utils';
import { EditorUtils } from './utils/editor.utils';
import { FileUtils, FileMetadata } from './utils/file.utils';
import {
  ThemeUtils,
  RenderUtils,
  ToolbarUtils,
  ColorPickerUtils,
} from './utils/render.utils';

// Types and constants
import type {
  HeadingLevel,
  PopoverState,
  EditorContentChangeDetail,
  ToolbarOptions,
  CustomToolbarGroup,
} from './types/editor.types.js';
import {
  DEFAULT_TABLE_OPTIONS,
  NAVIGATION_KEYS,
  FOCUSABLE_SELECTORS,
  TOOLTIP_CONFIG,
  POPOVER_LABELS,
  TOOLBAR_LABELS,
  TABLE_MENU_ITEMS,
  FONT_FAMILIES,
  TEXT_COLOR_GROUPS,
  CSS_CLASSES,
  FILE_ATTACHMENT_CONFIG,
  TEXT_FORMATTING_BUTTONS,
  CLIPBOARD_BUTTONS,
  LIST_BUTTONS,
  BLOCK_BUTTONS,
  type ButtonConfig,
} from './constants/editor.constants.js';
import { EDITOR_ICONS } from './constants/icons.constants.js';

// @ts-ignore
import styles from './wysiwyg.scss?inline';

/**
 * Default order for toolbar groups when no custom configuration is provided
 */
export const DEFAULT_GROUP_ORDER = [
  'clipboard',
  'fontFamily',
  'textFormatting',
  'blocks',
  'headings',
  'colorPicker',
  'lists',
  'alignment',
  'insert',
  'search',
  'tableOperations',
] as const;

/**
 * WYSIWYG Editor Web Component
 * A rich text editor built with TipTap and Carbon Design System
 */
class wysiwyg extends LitElement {
  static styles = styles;

  @property({ type: String })
  content = '';

  @property({ type: Array })
  toolbarOptions?: ToolbarOptions;

  @property({ type: Array })
  extensions?: Extensions;

  @property({ type: Array })
  files: FileMetadata[] = [];

  @state() private popoverState: PopoverState =
    PopoverService.createInitialState();

  @state() private selectedColor = ThemeUtils.getDefaultTextColor();

  private editorService = new EditorService();
  private editor: Editor | null = null;
  private isUpdatingFromEditor = false; // Flag to track editor-initiated updates

  /**
   * Get the TipTap editor instance
   * Allows users to call custom methods on the editor
   * @returns {Editor | null} The editor instance or null if not initialized
   * @example
   * const editor = document.querySelector('clabs-wysiwyg').editorInstance;
   * if (editor) {
   *   editor.chain().focus().toggleBold().run();
   * }
   */
  public get editorInstance(): Editor | null {
    return this.editor;
  }

  /**
   * Runs after the component's DOM has been rendered for the first time.
   */
  protected firstUpdated(): void {
    this.setAttribute('role', 'application');
    this.addEventListener('keydown', this.handleKeydown);
    this.initializeEditor();
    this.initializeFocusableElements();
  }

  /**
   * Cleans up editor resources and event listeners when disconnected.
   */
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.editorService.destroy();
    this.removeEventListener('keydown', this.handleKeydown);
  }

  /**
   * Called before update to handle property changes.
   * Syncs external content updates into the editor instance.
   *
   * @param {Map<string, unknown>} changedProperties - Changed reactive properties.
   */
  protected willUpdate(changedProperties: Map<string, unknown>): void {
    if (
      changedProperties.has('content') &&
      this.editor &&
      this.content !== this.editor.getHTML() &&
      !this.isUpdatingFromEditor
    ) {
      // Update editor content without triggering another update cycle
      this.editorService.setContent(this.content);
    }
  }

  /**
   * Initializes the TipTap editor instance.
   */
  private initializeEditor(): void {
    const editorElement = this.renderRoot.querySelector(
      `.${CSS_CLASSES.editorContent}`
    ) as HTMLElement;
    if (!editorElement) {
      return;
    }

    // Destroy existing editor if any to prevent duplicate extensions
    if (this.editor) {
      this.editorService.destroy();
    }

    this.editor = this.editorService.initialize(
      editorElement,
      {
        content: this.content,
        orientation: 'horizontal',
        extensions: this.extensions,
      },
      (editor: Editor) => {
        // Mark that this update is coming from the editor to prevent circular updates
        this.isUpdatingFromEditor = true;
        this.content = editor.getHTML();
        this.dispatchEvent(
          new CustomEvent(`${clabsPrefix}-wysiwyg-on-change`, {
            detail: {
              content: this.content,
              editor,
            } satisfies EditorContentChangeDetail,
            bubbles: true,
            composed: true,
          })
        );
        // Reset flag after the current microtask completes
        queueMicrotask(() => {
          this.isUpdatingFromEditor = false;
        });
      },
      () => {
        // Use requestAnimationFrame to defer update and avoid scheduling during update
        requestAnimationFrame(() => this.requestUpdate());
      }
    );
  }

  /**
   * Initializes roving tabindex behavior for toolbar controls.
   * Sets focus on the first non-disabled element.
   */
  private initializeFocusableElements(): void {
    requestAnimationFrame(() => {
      const elements = DOMUtils.getFocusableElements(
        this.renderRoot as ShadowRoot,
        FOCUSABLE_SELECTORS
      );
      const firstEnabledIndex = DOMUtils.findFirstEnabledIndex(elements);
      DOMUtils.updateTabIndexes(elements, firstEnabledIndex);
    });
  }

  /**
   * Handles keyboard navigation across toolbar controls.
   *
   * @param {KeyboardEvent} event - Keyboard event from the component root.
   */
  private handleKeydown = (event: KeyboardEvent): void => {
    // Only handle arrow keys
    if (
      !NAVIGATION_KEYS.all.includes(
        event.key as (typeof NAVIGATION_KEYS.all)[number]
      )
    ) {
      return;
    }

    const activeElement =
      this.renderRoot instanceof ShadowRoot
        ? this.renderRoot.activeElement
        : document.activeElement;

    // Only handle keyboard navigation when focus is on toolbar elements
    // Do not interfere with arrow key navigation in the editor content
    const toolbar = this.renderRoot.querySelector(`.${CSS_CLASSES.toolbar}`);
    const isInToolbar = toolbar?.contains(activeElement as Node);

    if (!isInToolbar) {
      return;
    }

    const elements = DOMUtils.getFocusableElements(
      this.renderRoot as ShadowRoot,
      FOCUSABLE_SELECTORS
    );
    const current = elements.findIndex((el) => {
      // For cds-icon-button, check the button inside shadow DOM
      if (el.tagName.toLowerCase() === 'cds-icon-button') {
        const button = el.shadowRoot?.querySelector('button');
        return button?.getAttribute('tabindex') === '0';
      }
      // For other elements, check the element itself
      return el.getAttribute('tabindex') === '0';
    });
    if (current === -1) {
      return;
    }

    event.preventDefault();
    const next = DOMUtils.getNextFocusIndex(
      event.key,
      current,
      elements.length,
      'horizontal'
    );

    DOMUtils.updateTabIndexes(elements, next);
    elements[next].focus();
  };

  /**
   * Returns the currently active heading value for the dropdown.
   */
  private getHeadingValue(): 'p' | `h${HeadingLevel}` {
    return EditorUtils.getCurrentHeadingValue(this.editorService);
  }

  /**
   * Handles heading dropdown selection changes.
   *
   * @param {CustomEvent} e - Dropdown selection event.
   */
  private handleHeadingChange = (
    e: CustomEvent<{ item: { value: 'p' | `h${HeadingLevel}` } }>
  ): void => {
    const value = e.detail.item.value;
    const level = EditorUtils.parseHeadingLevel(value);
    if (level === null) {
      this.editorService.setParagraph();
    } else {
      this.editorService.setHeading(level);
    }
  };

  /**
   * Generic handler for popover input changes.
   * @param {keyof PopoverState} field - The field to update
   * @param {InputEvent} e - Input event
   */
  private handlePopoverInput = (
    field: keyof PopoverState,
    e: InputEvent
  ): void => {
    this.popoverState = PopoverService.update(this.popoverState, {
      [field]: (e.target as HTMLInputElement).value,
    } as Partial<PopoverState>);
  };

  /**
   * Opens the link popover and preloads the current link value.
   */
  private openLinkPopover = (): void => {
    this.popoverState = PopoverService.update(this.popoverState, {
      showLinkPopover: true,
      linkUrl: this.editorService.getLinkAttributes()?.href || '',
    });
  };

  /**
   * Closes the link popover and resets its input state.
   */
  private closeLinkPopover = (): void => {
    this.popoverState = PopoverService.reset(
      PopoverService.update(this.popoverState, { showLinkPopover: false }),
      'linkUrl'
    );
  };

  /**
   * Applies the current link popover value to the editor selection.
   */
  private setLink = (): void => {
    if (!this.popoverState.linkUrl) {
      this.editorService.unsetLink();
    } else if (EditorUtils.isValidURL(this.popoverState.linkUrl)) {
      this.editorService.setLink({ href: this.popoverState.linkUrl });
    }
    this.closeLinkPopover();
  };

  /**
   * Removes the current link from the editor selection.
   */
  private unsetLink = (): void => {
    this.editorService.unsetLink();
    this.closeLinkPopover();
  };

  /**
   * Opens the image insertion popover.
   */
  private openImagePopover = (): void => {
    this.popoverState = PopoverService.update(this.popoverState, {
      showImagePopover: true,
    });
  };

  /**
   * Closes the image popover and resets its input state.
   */
  private closeImagePopover = (): void => {
    this.popoverState = PopoverService.reset(
      PopoverService.update(this.popoverState, { showImagePopover: false }),
      'imageUrl',
      'imageAlt',
      'imageTitle'
    );
  };

  /**
   * Inserts an image when the popover contains a valid URL.
   */
  private insertImage = (): void => {
    if (
      this.popoverState.imageUrl &&
      EditorUtils.isValidURL(this.popoverState.imageUrl)
    ) {
      this.editorService.insertImage({
        src: this.popoverState.imageUrl,
        alt: this.popoverState.imageAlt || undefined,
        title: this.popoverState.imageTitle || undefined,
      });
      this.closeImagePopover();
    }
  };

  /**
   * Renders undo and redo controls.
   */
  private renderUndoRedoGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        ${RenderUtils.renderIconButton(
          EDITOR_ICONS.Undo,
          TOOLBAR_LABELS.undo,
          () => this.editorService.undo(),
          false,
          !this.editorService.canUndo()
        )}
        ${RenderUtils.renderIconButton(
          EDITOR_ICONS.Redo,
          TOOLBAR_LABELS.redo,
          () => this.editorService.redo(),
          false,
          !this.editorService.canRedo()
        )}
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Helper to render conditional toolbar button.
   * @param {string} group - Toolbar group name
   * @param {string} item - Item name within the group
   * @param {string} icon - Icon to display
   * @param {string} label - Button label/tooltip
   * @param {() => void} onClick - Click handler
   * @param {boolean} [isActive] - Whether button is in active state
   * @returns {TemplateResult | typeof nothing} Button template or nothing
   */
  /**
   * Render a button from configuration
   * @param {string} group - The toolbar group name
   * @param {ButtonConfig} config - Button configuration
   */
  private renderButtonFromConfig(
    group: string,
    config: ButtonConfig
  ): TemplateResult | typeof nothing {
    if (!ToolbarUtils.shouldRenderItem(this.toolbarOptions, group, config.id)) {
      return nothing;
    }

    const icon = EDITOR_ICONS[config.icon];
    const isActive = config.checkActive
      ? this.editorService.isActive(config.checkActive)
      : undefined;

    return RenderUtils.renderIconButton(
      icon,
      config.label,
      () => this.editorService[config.action](),
      isActive
    );
  }

  /**
   * Render buttons from configuration array
   * @param {string} group - The toolbar group name
   * @param {Array} buttons - Array of button configurations
   */
  private renderButtonGroup(
    group: string,
    buttons: readonly ButtonConfig[]
  ): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`${buttons.map((btn) => this.renderButtonFromConfig(group, btn))}`,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Render a conditional button
   * @param {string} group - The toolbar group name
   * @param {string} item - Item name within group
   * @param {string} icon - Icon to display
   * @param {string} label - Button label/tooltip
   * @param {() => void} onClick - Click handler
   * @param {boolean} [isActive] - Whether button is in active state
   * @returns {TemplateResult | typeof nothing} Button template or nothing
   */
  private renderConditionalButton(
    group: string,
    item: string,
    icon: string,
    label: string,
    onClick: () => void,
    isActive?: boolean
  ): TemplateResult | typeof nothing {
    return ToolbarUtils.shouldRenderItem(this.toolbarOptions, group, item)
      ? RenderUtils.renderIconButton(icon, label, onClick, isActive)
      : nothing;
  }

  /** Renders cut, copy, paste controls */
  private renderClipboardGroup(): TemplateResult {
    return this.renderButtonGroup('clipboard', CLIPBOARD_BUTTONS);
  }

  /** Renders inline text formatting controls */
  private renderTextFormattingGroup(): TemplateResult {
    return this.renderButtonGroup('textFormatting', TEXT_FORMATTING_BUTTONS);
  }

  /**
   * Renders the heading selection control.
   */
  private renderHeadingsGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        <cds-dropdown
          label="Text style"
          title="Text style"
          value=${this.getHeadingValue()}
          @cds-dropdown-selected=${this.handleHeadingChange}>
          <cds-dropdown-item value="p">Paragraph</cds-dropdown-item>
          <cds-dropdown-item value="h1">Heading 1</cds-dropdown-item>
          <cds-dropdown-item value="h2">Heading 2</cds-dropdown-item>
          <cds-dropdown-item value="h3">Heading 3</cds-dropdown-item>
          <cds-dropdown-item value="h4">Heading 4</cds-dropdown-item>
          <cds-dropdown-item value="h5">Heading 5</cds-dropdown-item>
          <cds-dropdown-item value="h6">Heading 6</cds-dropdown-item>
        </cds-dropdown>
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Renders the font family selection control.
   */
  private renderFontFamilyGroup(): TemplateResult {
    const currentFont =
      this.editor?.getAttributes('textStyle')?.fontFamily || 'IBM Plex Sans';

    return RenderUtils.renderToolbarGroup(
      html`
        <cds-dropdown
          label="Typeface"
          title="Typeface"
          value=${currentFont}
          @cds-dropdown-selected=${(
            e: CustomEvent<{ item: { value: string } }>
          ) => {
            const value = e.detail.item.value;
            if (value) {
              this.editorService.setFontFamily(value);
            } else {
              this.editorService.unsetFontFamily();
            }
          }}>
          ${FONT_FAMILIES.map(
            (font) => html`
              <cds-dropdown-item value=${font.value}
                >${font.label}</cds-dropdown-item
              >
            `
          )}
        </cds-dropdown>
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Renders list formatting controls including task list.
   */
  /** Renders list controls */
  private renderListsGroup(): TemplateResult {
    return this.renderButtonGroup('lists', LIST_BUTTONS);
  }

  /**
   * Renders text alignment controls including justify.
   */
  /**
   * Helper to render alignment button with toggle logic.
   * @param {string} item - Item name within alignment group
   * @param {string} icon - Icon to display
   * @param {string} label - Button label/tooltip
   * @param {'left' | 'center' | 'right' | 'justify'} alignment - Text alignment value
   * @returns {TemplateResult | typeof nothing} Button template or nothing
   */
  private renderAlignmentButton(
    item: string,
    icon: string,
    label: string,
    alignment: 'left' | 'center' | 'right' | 'justify'
  ): TemplateResult | typeof nothing {
    return this.renderConditionalButton(
      'alignment',
      item,
      icon,
      label,
      () => {
        const isActive = this.editorService.isActive('textAlign', {
          textAlign: alignment,
        });
        this.editorService.setTextAlign(isActive ? 'left' : alignment);
      },
      this.editorService.isActive('textAlign', { textAlign: alignment })
    );
  }

  /**
   * Renders text alignment controls including justify.
   */
  private renderAlignmentGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        ${this.renderAlignmentButton(
          'left',
          EDITOR_ICONS.TextAlignLeft,
          TOOLBAR_LABELS.alignLeft,
          'left'
        )}
        ${this.renderAlignmentButton(
          'center',
          EDITOR_ICONS.TextAlignCenter,
          TOOLBAR_LABELS.alignCenter,
          'center'
        )}
        ${this.renderAlignmentButton(
          'right',
          EDITOR_ICONS.TextAlignRight,
          TOOLBAR_LABELS.alignRight,
          'right'
        )}
        ${this.renderAlignmentButton(
          'justify',
          EDITOR_ICONS.TextAlignJustify,
          TOOLBAR_LABELS.alignJustify,
          'justify'
        )}
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Toggles the color picker open/closed state.
   *
   * @param {Event} e - Click event from the trigger button.
   */
  private toggleColorPicker = (e: Event): void => {
    ColorPickerUtils.toggleColorPicker(this.renderRoot as ShadowRoot, e);
  };

  /**
   * Renders text color picker control using clabs-style-picker.
   */
  private renderColorPickerGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        <clabs-style-picker kind="single" heading="Text Color">
          <cds-icon-button
            slot="trigger"
            size="md"
            kind="ghost"
            class="${CSS_CLASSES.textColorButton}"
            style="--selected-text-color: ${this.selectedColor ||
            ThemeUtils.getDefaultTextColor()}"
            enter-delay-ms="${TOOLTIP_CONFIG.enterDelayMs}"
            leave-delay-ms="${TOOLTIP_CONFIG.leaveDelayMs}"
            align="${TOOLTIP_CONFIG.align}"
            @click=${this.toggleColorPicker}>
            ${iconLoader(EDITOR_ICONS.TextColor, { slot: 'icon' })}
            <span slot="tooltip-content">${TOOLBAR_LABELS.textColor}</span>
          </cds-icon-button>
          <clabs-style-picker-group heading="Colors">
            ${TEXT_COLOR_GROUPS.map((group) =>
              group.items.map((option) => {
                const colorValue = ThemeUtils.getTokenColor(option.token);
                return html`
                  <clabs-style-picker-option
                    value=${colorValue}
                    title=${option.label}
                    ?selected=${this.selectedColor === colorValue}
                    @clabs-style-picker-option-select=${(e: CustomEvent) => {
                      const color = e.detail.value;
                      if (color) {
                        this.selectedColor = color;
                        this.editorService.setColor(color);
                      }
                    }}>
                    <clabs-style-picker-color
                      label=${option.label}
                      color=${colorValue}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                `;
              })
            )}
          </clabs-style-picker-group>
        </clabs-style-picker>
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Renders block-level formatting controls.
   */
  /** Renders block controls */
  private renderBlocksGroup(): TemplateResult {
    return this.renderButtonGroup('blocks', BLOCK_BUTTONS);
  }

  /**
   * Renders insert actions for tables, links, and images.
   */
  private renderInsertGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        ${this.renderConditionalButton(
          'insert',
          'table',
          EDITOR_ICONS.Table,
          TOOLBAR_LABELS.insertTable,
          () => this.editorService.insertTable(DEFAULT_TABLE_OPTIONS)
        )}
        ${ToolbarUtils.shouldRenderItem(this.toolbarOptions, 'insert', 'link')
          ? html`
              <cds-popover
                tabtip
                autoalign
                ?open=${this.popoverState.showLinkPopover}
                align="bottom"
                @cds-popover-closed=${this.closeLinkPopover}>
                ${RenderUtils.renderIconButton(
                  EDITOR_ICONS.Link,
                  TOOLBAR_LABELS.insertLink,
                  this.openLinkPopover,
                  this.editorService.isActive('link')
                )}
                <cds-popover-content>
                  <div class="${CSS_CLASSES.popoverContent}">
                    <cds-text-input
                      label="${POPOVER_LABELS.link.urlLabel}"
                      placeholder="${POPOVER_LABELS.link.urlPlaceholder}"
                      .value=${this.popoverState.linkUrl}
                      @input=${(e: InputEvent) =>
                        this.handlePopoverInput('linkUrl', e)}></cds-text-input>
                    <div class="${CSS_CLASSES.popoverActions}">
                      <cds-button
                        size="sm"
                        kind="secondary"
                        @click=${this.unsetLink}>
                        ${POPOVER_LABELS.link.removeButton}
                      </cds-button>
                      <cds-button
                        size="sm"
                        kind="primary"
                        @click=${this.setLink}>
                        ${POPOVER_LABELS.link.insertButton}
                      </cds-button>
                    </div>
                  </div>
                </cds-popover-content>
              </cds-popover>
            `
          : nothing}
        ${ToolbarUtils.shouldRenderItem(this.toolbarOptions, 'insert', 'image')
          ? html`
              <cds-popover
                ?open=${this.popoverState.showImagePopover}
                align="bottom"
                tabtip
                autoalign
                @cds-popover-closed=${this.closeImagePopover}>
                ${RenderUtils.renderIconButton(
                  EDITOR_ICONS.Image,
                  TOOLBAR_LABELS.insertImage,
                  this.openImagePopover
                )}
                <cds-popover-content>
                  <div class="${CSS_CLASSES.popoverContent}">
                    <cds-text-input
                      size="sm"
                      label="${POPOVER_LABELS.image.urlLabel}"
                      placeholder="${POPOVER_LABELS.image.urlPlaceholder}"
                      .value=${this.popoverState.imageUrl}
                      @input=${(e: InputEvent) =>
                        this.handlePopoverInput(
                          'imageUrl',
                          e
                        )}></cds-text-input>
                    <cds-text-input
                      size="sm"
                      label="${POPOVER_LABELS.image.altLabel}"
                      placeholder="${POPOVER_LABELS.image.altPlaceholder}"
                      .value=${this.popoverState.imageAlt}
                      @input=${(e: InputEvent) =>
                        this.handlePopoverInput(
                          'imageAlt',
                          e
                        )}></cds-text-input>
                    <cds-text-input
                      size="sm"
                      label="${POPOVER_LABELS.image.titleLabel}"
                      placeholder="${POPOVER_LABELS.image.titlePlaceholder}"
                      .value=${this.popoverState.imageTitle}
                      @input=${(e: InputEvent) =>
                        this.handlePopoverInput(
                          'imageTitle',
                          e
                        )}></cds-text-input>
                    <div class="${CSS_CLASSES.popoverActions}">
                      <cds-button
                        size="sm"
                        kind="secondary"
                        @click=${this.closeImagePopover}>
                        ${POPOVER_LABELS.image.cancelButton}
                      </cds-button>
                      <cds-button
                        size="sm"
                        kind="primary"
                        @click=${this.insertImage}>
                        ${POPOVER_LABELS.image.insertButton}
                      </cds-button>
                    </div>
                  </div>
                </cds-popover-content>
              </cds-popover>
            `
          : nothing}
        ${this.renderConditionalButton(
          'insert',
          'attachment',
          EDITOR_ICONS.Attachment,
          TOOLBAR_LABELS.attachment,
          () => this.handleFileAttachment()
        )}
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Handles file attachment logic.
   */
  private handleFileAttachment(): void {
    FileUtils.triggerFileSelection(true, async (selectedFiles) => {
      const newFiles = FileUtils.fileListToMetadata(selectedFiles);
      this.files = [...this.files, ...newFiles];

      const filesArray = Array.from(selectedFiles);
      const imageFiles = filesArray.filter((file) =>
        FileUtils.isImageFile(file)
      );
      const nonImageFiles = filesArray.filter(
        (file) => !FileUtils.isImageFile(file)
      );

      // Insert images as actual images
      for (const imageFile of imageFiles) {
        try {
          const dataURL = await FileUtils.fileToDataURL(imageFile);
          this.editorService.insertImage({
            src: dataURL,
            alt: imageFile.name,
          });
        } catch (error) {
          console.error('Failed to insert image:', error);
        }
      }

      // Insert non-image files as text
      if (nonImageFiles.length > 0) {
        const fileNames = nonImageFiles.map((f) => f.name).join(', ');
        this.editor
          ?.chain()
          .focus()
          .insertContent(
            `<p>${FILE_ATTACHMENT_CONFIG.attachmentPrefix}${fileNames}</p>`
          )
          .run();
      }
    });
  }

  /**
   * Renders search component for finding text in the editor.
   */
  private renderSearchGroup(): TemplateResult {
    return RenderUtils.renderToolbarGroup(
      html`
        <cds-search placeholder="No Integration yet" size="md"> </cds-search>
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Renders table-specific operations when the selection is inside a table.
   */
  private renderTableOperations(): TemplateResult | typeof nothing {
    if (!this.editorService.isActive('table')) {
      return nothing;
    }

    return RenderUtils.renderToolbarGroup(
      html`
        <div data-floating-menu-container class="${CSS_CLASSES.popoverWrapper}">
          <cds-overflow-menu
            autoalign
            enter-delay-ms="${TOOLTIP_CONFIG.enterDelayMs}"
            leave-delay-ms="${TOOLTIP_CONFIG.leaveDelayMs}">
            ${iconLoader(EDITOR_ICONS.OverflowMenuVertical, {
              class: 'cds--overflow-menu__icon',
              slot: 'icon',
            })}
            <span slot="tooltip-content">${TOOLBAR_LABELS.tableOptions}</span>
            <cds-overflow-menu-body flipped>
              <cds-overflow-menu-item
                @click=${() => this.editorService.addColumnBefore()}>
                ${TABLE_MENU_ITEMS.addColumnBefore}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                @click=${() => this.editorService.addColumnAfter()}>
                ${TABLE_MENU_ITEMS.addColumnAfter}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                @click=${() => this.editorService.deleteColumn()}>
                ${TABLE_MENU_ITEMS.deleteColumn}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                divider
                @click=${() => this.editorService.addRowBefore()}>
                ${TABLE_MENU_ITEMS.addRowBefore}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                @click=${() => this.editorService.addRowAfter()}>
                ${TABLE_MENU_ITEMS.addRowAfter}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                @click=${() => this.editorService.deleteRow()}>
                ${TABLE_MENU_ITEMS.deleteRow}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                divider
                @click=${() => this.editorService.toggleHeaderRow()}>
                ${TABLE_MENU_ITEMS.toggleHeaderRow}
              </cds-overflow-menu-item>
              <cds-overflow-menu-item
                divider
                danger
                @click=${() => this.editorService.deleteTable()}>
                ${TABLE_MENU_ITEMS.deleteTable}
              </cds-overflow-menu-item>
            </cds-overflow-menu-body>
          </cds-overflow-menu>
        </div>
      `,
      CSS_CLASSES.toolbarGroup
    );
  }

  /**
   * Renders attached files as file uploader items.
   */
  private renderAttachedFiles(): TemplateResult | typeof nothing {
    if (this.files.length === 0) {
      return nothing;
    }

    return html`
      <div class="${CSS_CLASSES.attachments}">
        ${this.files.map(
          (file, index) => html`
            <cds-file-uploader-item
              state="edit"
              @cds-file-uploader-item-deleted=${() => {
                this.files = this.files.filter((_, i) => i !== index);
              }}>
              ${file.name}
            </cds-file-uploader-item>
          `
        )}
      </div>
    `;
  }

  /**
   * Default order for toolbar groups when no custom configuration is provided
   */
  private readonly DEFAULT_GROUP_ORDER = DEFAULT_GROUP_ORDER;

  /**
   * Map of group names to their render methods
   */
  private groupRenderMap: Record<
    string,
    () => TemplateResult | typeof nothing
  > = {
    /** Clipboard group render method */
    clipboard: () => this.renderClipboardGroup(),
    /** Font family group render method */
    fontFamily: () => this.renderFontFamilyGroup(),
    /** Text formatting group render method */
    textFormatting: () => this.renderTextFormattingGroup(),
    /** Blocks group render method */
    blocks: () => this.renderBlocksGroup(),
    /** Headings group render method */
    headings: () => this.renderHeadingsGroup(),
    /** Color picker group render method */
    colorPicker: () => this.renderColorPickerGroup(),
    /** Lists group render method */
    lists: () => this.renderListsGroup(),
    /** Alignment group render method */
    alignment: () => this.renderAlignmentGroup(),
    /** Insert group render method */
    insert: () => this.renderInsertGroup(),
    /** Search group render method */
    search: () => this.renderSearchGroup(),
    /** Table operations group render method */
    tableOperations: () => this.renderTableOperations(),
  };

  /**
   * Render all toolbar groups (standard + custom) in the correct order
   * @returns {Array<TemplateResult | typeof nothing>} Array of toolbar group templates
   */
  private renderAllToolbarGroups(): Array<TemplateResult | typeof nothing> {
    const result: Array<TemplateResult | typeof nothing> = [];

    // Determine which groups to render
    const groupsToRender = !this.toolbarOptions
      ? this.DEFAULT_GROUP_ORDER.map((name) => ({ name, enabled: true }))
      : this.toolbarOptions.filter((group) => {
          const groupIdentifier = 'name' in group ? group.name : group.id;
          return ToolbarUtils.shouldRenderGroup(
            this.toolbarOptions,
            groupIdentifier
          );
        });

    // Render each group in order (standard or custom)
    groupsToRender.forEach((group) => {
      // Check if this is a custom group (has 'id' and 'items' properties)
      const isCustomGroup = 'id' in group && 'items' in group;

      if (isCustomGroup) {
        const customGroup = group as CustomToolbarGroup;
        // Render custom group
        result.push(
          html`<div
            class="${CSS_CLASSES.toolbarGroup}"
            data-custom-group="${customGroup.id}">
            ${customGroup.items.map((item) => item.render(this.editor))}
          </div>`
        );
      } else {
        // Render standard group
        const standardGroup = group as {
          name: string;
          enabled?: boolean;
          items?: Record<string, boolean>;
        };
        const renderMethod = this.groupRenderMap[standardGroup.name];
        if (renderMethod) {
          result.push(renderMethod());
        }
      }
    });

    return result;
  }

  /**
   * Render the complete editor component
   * @returns {TemplateResult} The editor template
   */
  protected render(): TemplateResult {
    const shouldRenderToolbar =
      !this.toolbarOptions || this.toolbarOptions.length > 0;

    return html`
      <div class="${CSS_CLASSES.editorContainer}">
        ${shouldRenderToolbar
          ? html`
              <div
                part="toolbar"
                class="${CSS_CLASSES.toolbar}"
                orientation="horizontal">
                ${this.renderUndoRedoGroup()} ${this.renderAllToolbarGroups()}
              </div>
            `
          : nothing}

        <div
          part="editor"
          class="${CSS_CLASSES.editorContent}"
          role="region"></div>

        ${this.renderAttachedFiles()}
      </div>
    `;
  }
}

export default wysiwyg;
