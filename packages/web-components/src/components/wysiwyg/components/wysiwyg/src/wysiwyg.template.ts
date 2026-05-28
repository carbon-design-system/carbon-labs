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
import { property, state, query } from 'lit/decorators.js';
import type { Editor } from '@tiptap/core';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/text-input/index.js';

// Carbon icons
import Undo from '@carbon/icons/es/undo/16.js';
import Redo from '@carbon/icons/es/redo/16.js';
import TextBold from '@carbon/icons/es/text--bold/16.js';
import TextItalic from '@carbon/icons/es/text--italic/16.js';
import TextUnderline from '@carbon/icons/es/text--underline/16.js';
import TextStrikethrough from '@carbon/icons/es/text--strikethrough/16.js';
import Code from '@carbon/icons/es/code/16.js';
import ListBulleted from '@carbon/icons/es/list--bulleted/16.js';
import ListNumbered from '@carbon/icons/es/list--numbered/16.js';
import TextAlignLeft from '@carbon/icons/es/text--align--left/16.js';
import TextAlignCenter from '@carbon/icons/es/text--align--center/16.js';
import TextAlignRight from '@carbon/icons/es/text--align--right/16.js';
import Quotes from '@carbon/icons/es/quotes/16.js';
import Table16 from '@carbon/icons/es/table/16.js';
import Image16 from '@carbon/icons/es/image/16.js';
import Link16 from '@carbon/icons/es/link/16.js';
import OverflowMenuVertical from '@carbon/icons/es/overflow-menu--vertical/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

// Services and utilities
import { EditorService } from './services/editor.service';
import { DOMUtils } from './utils/dom.utils';
import { URLUtils } from './utils/url.utils';

// Types and constants
import type {
  EditorOrientation,
  HeadingLevel,
  ModalState,
  EditorContentChangeDetail,
} from './types/editor.types.js';
import {
  DEFAULT_EDITOR_CONFIG,
  DEFAULT_TABLE_OPTIONS,
  NAVIGATION_KEYS,
  FOCUSABLE_SELECTORS,
  TOOLTIP_CONFIG,
  MODAL_LABELS,
  TOOLBAR_LABELS,
  TABLE_MENU_ITEMS,
} from './constants/editor.constants.js';

// @ts-ignore
import styles from './wysiwyg.scss?inline';

/**
 * WYSIWYG Editor Web Component
 * A rich text editor built with TipTap and Carbon Design System
 */
class wysiwyg extends LitElement {
  static styles = styles;

  @property({ type: String })
  content = '';

  @property({ type: String, reflect: true })
  orientation: EditorOrientation =
    DEFAULT_EDITOR_CONFIG.orientation as EditorOrientation;

  @state() private modalState: ModalState = {
    showLinkModal: false,
    showImageModal: false,
    linkUrl: '',
    imageUrl: '',
  };

  @query('.clabs--wysiwyg__toolbar') private toolbarEl?: HTMLElement;

  private editorService = new EditorService();
  private editor: Editor | null = null;

  /**
   * Runs after the component's DOM has been rendered for the first time.
   */
  protected firstUpdated(): void {
    this.setAttribute('role', 'application');
    this.addEventListener('keydown', this.handleKeydown);
    this.initializeEditor();
    this.applyAccessibilityAttributes();
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
   * Syncs external content updates into the editor instance.
   *
   * @param {Map<string, unknown>} changedProperties - Updated reactive properties.
   */
  protected updated(changedProperties: Map<string, unknown>): void {
    if (
      changedProperties.has('content') &&
      this.editor &&
      this.content !== this.editor.getHTML()
    ) {
      this.editorService.setContent(this.content);
    }
  }

  /**
   * Initializes the TipTap editor instance.
   */
  private initializeEditor(): void {
    const editorElement = this.renderRoot.querySelector(
      '.clabs--wysiwyg__editor-content'
    ) as HTMLElement;
    if (!editorElement) {
      return;
    }

    this.editor = this.editorService.initialize(
      editorElement,
      { content: this.content, orientation: this.orientation },
      (editor: Editor) => {
        this.content = editor.getHTML();
        this.dispatchEvent(
          new CustomEvent('content-change', {
            detail: {
              content: this.content,
              editor,
            } satisfies EditorContentChangeDetail,
            bubbles: true,
            composed: true,
          })
        );
      },
      () => this.requestUpdate()
    );
  }

  /**
   * Applies accessibility attributes to internal editor controls.
   */
  private applyAccessibilityAttributes(): void {
    const editorTextbox = this.renderRoot.querySelector(
      '.tiptap.ProseMirror'
    ) as HTMLElement;
    editorTextbox?.setAttribute('aria-label', 'Editor content');

    const dropdown = this.renderRoot.querySelector(
      'cds-dropdown'
    ) as HTMLElement & { shadowRoot?: ShadowRoot };
    if (dropdown) {
      dropdown.setAttribute('aria-label', 'Text style');
      const triggerButton = dropdown.shadowRoot?.querySelector(
        '#trigger-button'
      ) as HTMLElement;
      if (triggerButton) {
        triggerButton.setAttribute('aria-label', 'Text style');
        triggerButton.removeAttribute('aria-labelledby');
      }
    }
  }

  /**
   * Initializes roving tabindex behavior for toolbar controls.
   */
  private initializeFocusableElements(): void {
    requestAnimationFrame(() =>
      DOMUtils.updateTabIndexes(
        DOMUtils.getFocusableElements(
          this.renderRoot as ShadowRoot,
          FOCUSABLE_SELECTORS
        ),
        0
      )
    );
  }

  /**
   * Handles keyboard navigation across toolbar controls.
   *
   * @param {KeyboardEvent} event - Keyboard event from the component root.
   */
  private handleKeydown = (event: KeyboardEvent): void => {
    if (
      !NAVIGATION_KEYS.all.includes(
        event.key as (typeof NAVIGATION_KEYS.all)[number]
      )
    ) {
      return;
    }

    const editorContent = this.renderRoot.querySelector(
      '.clabs--wysiwyg__editor-content'
    );
    const activeElement =
      this.renderRoot instanceof ShadowRoot
        ? this.renderRoot.activeElement
        : document.activeElement;

    if (
      editorContent?.contains(activeElement as Node) ||
      editorContent === activeElement ||
      editorContent
        ?.querySelector('.ProseMirror')
        ?.contains(activeElement as Node)
    ) {
      return;
    }

    const elements = DOMUtils.getFocusableElements(
      this.renderRoot as ShadowRoot,
      FOCUSABLE_SELECTORS
    );
    const current = elements.findIndex(
      (el) => el.getAttribute('tabindex') === '0'
    );
    if (current === -1) {
      return;
    }

    event.preventDefault();
    const horizontal = this.orientation === 'horizontal';
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
        next = horizontal ? (current + 1) % elements.length : current;
        break;
      case 'ArrowLeft':
        next = horizontal
          ? (current - 1 + elements.length) % elements.length
          : current;
        break;
      case 'ArrowDown':
        next = !horizontal ? (current + 1) % elements.length : current;
        break;
      case 'ArrowUp':
        next = !horizontal
          ? (current - 1 + elements.length) % elements.length
          : current;
        break;
      default:
        next = current;
    }

    DOMUtils.updateTabIndexes(elements, next);
    elements[next].focus();
  };

  /**
   * Returns the currently active heading value for the dropdown.
   */
  private getHeadingValue(): 'p' | `h${HeadingLevel}` {
    const headingValues: Array<`h${HeadingLevel}`> = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];

    for (const value of headingValues) {
      const level = Number.parseInt(value.replace('h', ''), 10) as HeadingLevel;
      if (this.editorService.isActive('heading', { level })) {
        return value;
      }
    }

    return 'p';
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
    if (value === 'p') {
      this.editorService.setParagraph();
    } else {
      this.editorService.setHeading(
        Number.parseInt(value.replace('h', ''), 10) as HeadingLevel
      );
    }
  };

  /**
   * Updates link modal state from text input changes.
   *
   * @param {InputEvent} e - Input event from the link URL field.
   */
  private handleLinkInput = (e: InputEvent): void => {
    this.modalState = {
      ...this.modalState,
      linkUrl: (e.target as HTMLInputElement).value,
    };
  };

  /**
   * Updates image modal state from text input changes.
   *
   * @param {InputEvent} e - Input event from the image URL field.
   */
  private handleImageInput = (e: InputEvent): void => {
    this.modalState = {
      ...this.modalState,
      imageUrl: (e.target as HTMLInputElement).value,
    };
  };

  /**
   * Opens the link modal and preloads the current link value.
   */
  private openLinkModal = (): void => {
    this.modalState = {
      ...this.modalState,
      showLinkModal: true,
      linkUrl: this.editorService.getLinkAttributes()?.href || '',
    };
  };

  /**
   * Closes the link modal and resets its input state.
   */
  private closeLinkModal = (): void => {
    this.modalState = { ...this.modalState, showLinkModal: false, linkUrl: '' };
  };

  /**
   * Applies the current link modal value to the editor selection.
   */
  private setLink = (): void => {
    if (!this.modalState.linkUrl) {
      this.editorService.unsetLink();
    } else if (URLUtils.isValidURL(this.modalState.linkUrl)) {
      this.editorService.setLink({ href: this.modalState.linkUrl });
    }
    this.closeLinkModal();
  };

  /**
   * Removes the current link from the editor selection.
   */
  private unsetLink = (): void => {
    this.editorService.unsetLink();
    this.closeLinkModal();
  };

  /**
   * Opens the image insertion modal.
   */
  private openImageModal = (): void => {
    this.modalState = { ...this.modalState, showImageModal: true };
  };

  /**
   * Closes the image modal and resets its input state.
   */
  private closeImageModal = (): void => {
    this.modalState = {
      ...this.modalState,
      showImageModal: false,
      imageUrl: '',
    };
  };

  /**
   * Inserts an image when the modal contains a valid URL.
   */
  private insertImage = (): void => {
    if (
      this.modalState.imageUrl &&
      URLUtils.isValidURL(this.modalState.imageUrl)
    ) {
      this.editorService.insertImage({ src: this.modalState.imageUrl });
      this.closeImageModal();
    }
  };

  /**
   * Renders a toolbar icon button.
   *
   * @param {any} icon - Carbon icon descriptor passed to the icon loader.
   * @param {string} tooltip - Tooltip text for the button.
   * @param {() => void} onClick - Click handler for the button.
   * @param {boolean} [isActive=false] - Whether the button is in the selected state.
   * @param {boolean} [isDisabled=false] - Whether the button is disabled.
   */
  private renderIconButton(
    icon: any,
    tooltip: string,
    onClick: () => void,
    isActive = false,
    isDisabled = false
  ): TemplateResult {
    return html`
      <cds-icon-button
        size="md"
        autoalign
        kind="ghost"
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
   * Renders a toolbar group wrapper.
   *
   * @param {TemplateResult} content - Toolbar group content.
   */
  private renderToolbarGroup(content: TemplateResult): TemplateResult {
    return html`
      <div
        class="clabs--wysiwyg__toolbar-group"
        orientation=${this.orientation}>
        ${content}
      </div>
    `;
  }

  /**
   * Renders undo and redo controls.
   */
  private renderUndoRedoGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(
        Undo,
        TOOLBAR_LABELS.undo,
        () => this.editorService.undo(),
        false,
        !this.editorService.canUndo()
      )}
      ${this.renderIconButton(
        Redo,
        TOOLBAR_LABELS.redo,
        () => this.editorService.redo(),
        false,
        !this.editorService.canRedo()
      )}
    `);
  }

  /**
   * Renders inline text formatting controls.
   */
  private renderTextFormattingGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(
        TextBold,
        TOOLBAR_LABELS.bold,
        () => this.editorService.toggleBold(),
        this.editorService.isActive('bold')
      )}
      ${this.renderIconButton(
        TextItalic,
        TOOLBAR_LABELS.italic,
        () => this.editorService.toggleItalic(),
        this.editorService.isActive('italic')
      )}
      ${this.renderIconButton(
        TextUnderline,
        TOOLBAR_LABELS.underline,
        () => this.editorService.toggleUnderline(),
        this.editorService.isActive('underline')
      )}
      ${this.renderIconButton(
        TextStrikethrough,
        TOOLBAR_LABELS.strikethrough,
        () => this.editorService.toggleStrike(),
        this.editorService.isActive('strike')
      )}
      ${this.renderIconButton(
        Code,
        TOOLBAR_LABELS.code,
        () => this.editorService.toggleCode(),
        this.editorService.isActive('code')
      )}
    `);
  }

  /**
   * Renders the heading selection control.
   */
  private renderHeadingsGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      <cds-dropdown
        type="inline"
        label="Text style"
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
    `);
  }

  /**
   * Renders list formatting controls.
   */
  private renderListsGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(
        ListBulleted,
        TOOLBAR_LABELS.bulletList,
        () => this.editorService.toggleBulletList(),
        this.editorService.isActive('bulletList')
      )}
      ${this.renderIconButton(
        ListNumbered,
        TOOLBAR_LABELS.numberedList,
        () => this.editorService.toggleOrderedList(),
        this.editorService.isActive('orderedList')
      )}
    `);
  }

  /**
   * Renders text alignment controls.
   */
  private renderAlignmentGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(
        TextAlignLeft,
        TOOLBAR_LABELS.alignLeft,
        () => this.editorService.setTextAlign('left'),
        this.editorService.isActive('textAlign', { textAlign: 'left' })
      )}
      ${this.renderIconButton(
        TextAlignCenter,
        TOOLBAR_LABELS.alignCenter,
        () => this.editorService.setTextAlign('center'),
        this.editorService.isActive('textAlign', { textAlign: 'center' })
      )}
      ${this.renderIconButton(
        TextAlignRight,
        TOOLBAR_LABELS.alignRight,
        () => this.editorService.setTextAlign('right'),
        this.editorService.isActive('textAlign', { textAlign: 'right' })
      )}
    `);
  }

  /**
   * Renders block-level formatting controls.
   */
  private renderBlocksGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(
        Quotes,
        TOOLBAR_LABELS.blockquote,
        () => this.editorService.toggleBlockquote(),
        this.editorService.isActive('blockquote')
      )}
      ${this.renderIconButton(
        Code,
        TOOLBAR_LABELS.codeBlock,
        () => this.editorService.toggleCodeBlock(),
        this.editorService.isActive('codeBlock')
      )}
    `);
  }

  /**
   * Renders insert actions for tables, links, and images.
   */
  private renderInsertGroup(): TemplateResult {
    return this.renderToolbarGroup(html`
      ${this.renderIconButton(Table16, TOOLBAR_LABELS.insertTable, () =>
        this.editorService.insertTable(DEFAULT_TABLE_OPTIONS)
      )}
      ${this.renderIconButton(
        Link16,
        TOOLBAR_LABELS.insertLink,
        this.openLinkModal,
        this.editorService.isActive('link')
      )}
      ${this.renderIconButton(
        Image16,
        TOOLBAR_LABELS.insertImage,
        this.openImageModal
      )}
    `);
  }

  /**
   * Renders table-specific operations when the selection is inside a table.
   */
  private renderTableOperations(): TemplateResult | typeof nothing {
    if (!this.editorService.isActive('table')) {
      return nothing;
    }

    return this.renderToolbarGroup(html`
      <div data-floating-menu-container style="position: relative;">
        <cds-overflow-menu
          autoalign
          enter-delay-ms="${TOOLTIP_CONFIG.enterDelayMs}"
          leave-delay-ms="${TOOLTIP_CONFIG.leaveDelayMs}">
          ${iconLoader(OverflowMenuVertical, {
            class: 'cds--overflow-menu__icon',
            slot: 'icon',
          })}
          <span slot="tooltip-content">${TOOLBAR_LABELS.tableOptions}</span>
          <cds-overflow-menu-body>
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
    `);
  }

  /**
   * Renders the link modal when active.
   */
  private renderLinkModal(): TemplateResult | typeof nothing {
    if (!this.modalState.showLinkModal) {
      return nothing;
    }

    return html`
      <cds-modal open @cds-modal-closed=${this.closeLinkModal}>
        <cds-modal-header>
          <cds-modal-heading>${MODAL_LABELS.link.title}</cds-modal-heading>
        </cds-modal-header>
        <cds-modal-body>
          <div class="clabs--wysiwyg__modal-content">
            <cds-text-input
              label="${MODAL_LABELS.link.urlLabel}"
              placeholder="${MODAL_LABELS.link.urlPlaceholder}"
              .value=${this.modalState.linkUrl}
              @input=${this.handleLinkInput}></cds-text-input>
          </div>
        </cds-modal-body>
        <cds-modal-footer>
          <cds-button size="md" kind="secondary" @click=${this.unsetLink}>
            ${MODAL_LABELS.link.removeButton}
          </cds-button>
          <cds-button size="md" kind="primary" @click=${this.setLink}>
            ${MODAL_LABELS.link.insertButton}
          </cds-button>
        </cds-modal-footer>
      </cds-modal>
    `;
  }

  /**
   * Renders the image modal when active.
   */
  private renderImageModal(): TemplateResult | typeof nothing {
    if (!this.modalState.showImageModal) {
      return nothing;
    }

    return html`
      <cds-modal open @cds-modal-closed=${this.closeImageModal}>
        <cds-modal-header>
          <cds-modal-heading>${MODAL_LABELS.image.title}</cds-modal-heading>
        </cds-modal-header>
        <cds-modal-body>
          <div class="clabs--wysiwyg__modal-content">
            <cds-text-input
              label="${MODAL_LABELS.image.urlLabel}"
              placeholder="${MODAL_LABELS.image.urlPlaceholder}"
              .value=${this.modalState.imageUrl}
              @input=${this.handleImageInput}></cds-text-input>
          </div>
        </cds-modal-body>
        <cds-modal-footer>
          <cds-button size="md" kind="secondary" @click=${this.closeImageModal}>
            ${MODAL_LABELS.image.cancelButton}
          </cds-button>
          <cds-button size="md" kind="primary" @click=${this.insertImage}>
            ${MODAL_LABELS.image.insertButton}
          </cds-button>
        </cds-modal-footer>
      </cds-modal>
    `;
  }

  /**
   * Renders the editor toolbar, content area, and active modals.
   */
  protected render(): TemplateResult {
    return html`
      <div class="clabs--wysiwyg__editor-container">
        <div class="clabs--wysiwyg__toolbar" orientation=${this.orientation}>
          ${this.renderUndoRedoGroup()} ${this.renderTextFormattingGroup()}
          ${this.renderHeadingsGroup()} ${this.renderListsGroup()}
          ${this.renderAlignmentGroup()} ${this.renderBlocksGroup()}
          ${this.renderInsertGroup()} ${this.renderTableOperations()}
        </div>

        <div
          class="clabs--wysiwyg__editor-content"
          role="region"
          aria-label="Editor content"></div>
      </div>

      ${this.renderLinkModal()} ${this.renderImageModal()}
    `;
  }
}

export default wysiwyg;
