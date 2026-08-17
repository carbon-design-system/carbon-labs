<p align="center">
  <a href="https://www.carbondesignsystem.com">
    <img alt="Carbon Design System" src="https://user-images.githubusercontent.com/3901764/57545698-ce5f2380-7320-11e9-8682-903df232d7b0.png" width="100%" />
  </a>
</p>
<h1 align="center">
  Carbon Labs WYSIWYG Editor
</h1>

> A Carbon-styled rich text editor built on [TipTap](https://tiptap.dev/).

## Overview

`clabs-wysiwyg` is a web component that hosts a TipTap editor and renders a
Carbon toolbar from the extensions you pass in. Core document nodes (`document`,
`paragraph`, `text`) are always present. Everything else e.g: formatting, lists,
tables, search, attachments... is opt-in via `extensions`.

## What is included

- **Text formatting** — bold, italic, underline, strikethrough, inline code
- **Typography** — paragraph and heading levels 1–6
- **Lists** — bullet, numbered, and task lists with indent/outdent
- **Tables** — insert, row/column add/delete, merge/split, resizable columns
- **Alignment** — left, center, right, justify
- **Color** — Carbon token text colors and highlight
- **Typeface and font size** — IBM Plex plus a few system fonts; 12px–32px
- **Blocks** — code block, blockquote, horizontal rule (via input rules)
- **Insert** — link and image-by-URL, with image resize handles
- **Search** — find in the document, highlight matches, cycle to next
- **History** — undo/redo
- **Clipboard toolbar** — copy/cut/paste of **plain text** (native Ctrl/Cmd+V
  still goes through TipTap’s default paste)
- **FileUpload** — attach files next to the document (not stored in the HTML)
- **Readonly** — hides the toolbar and sets `editor.setEditable(false)`
- **Markdown-as-you-type** — TipTap input rules (`# `, `- `, ` ``` `, and so
  on). There is no built-in HTML or Markdown **source mode**.

## Getting started

```bash
npm install @carbon-labs/wc-wysiwyg
```

or

```bash
yarn add @carbon-labs/wc-wysiwyg
```

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  TextFormatting,
  Typography,
  Lists,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

const editor = document.querySelector('clabs-wysiwyg');
editor.extensions = [History, TextFormatting, Typography, Lists];
editor.content = '<p>Start typing...</p>';

editor.addEventListener('content-change', (e) => {
  console.log(e.detail.editor.getHTML());
});
```

```html
<clabs-wysiwyg
  toolbar-size="md"
  content="<p>Initial content</p>"></clabs-wysiwyg>
```

Set `extensions` before the element upgrades (or immediately in the same turn as
first render). The TipTap instance is created in `firstUpdated`; changing
`extensions` afterward does not rebuild the editor.

## API

### Properties

| Property      | Attribute      | Type                   | Default | Description                                                                                                                         |
| ------------- | -------------- | ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `content`     | `content`      | `string`               | `''`    | HTML. Updating it replaces the document when it differs from `editor.getHTML()`.                                                    |
| `extensions`  | —              | `Extension[]`          | `[]`    | TipTap extensions, typically with `toolbarRender`. Applied on first render only.                                                    |
| `toolbarSize` | `toolbar-size` | `'sm' \| 'md' \| 'lg'` | `'md'`  | Toolbar control size.                                                                                                               |
| `readonly`    | `readonly`     | `boolean`              | `false` | Disables editing and hides the toolbar. Selection and copy still work. File attachments, if any, are shown without delete controls. |

### Events

#### `content-change`

Fired from TipTap `onUpdate` when the document changes.

```typescript
{
  editor: Editor;
}
```

Read HTML with `event.detail.editor.getJSON()` / `getHTML()`. The event does not
include a precomputed `content` or `markdown` string.

#### `files-change`

Fired by the `FileUpload` extension when the attachment list changes.

```typescript
{
  files: File[];
  attachments: { id: string; name: string; size: number }[];
}
```

Attachments live in editor storage, not in the document HTML.

### TipTap instance

```javascript
const editorInstance = document.querySelector('clabs-wysiwyg').editor;

editorInstance.getHTML();
editorInstance.getJSON();
editorInstance.commands.setContent('<p>New content</p>');
editorInstance.chain().focus().toggleBold().run();
```

## Extensions

Import only what you need from `@carbon-labs/wc-wysiwyg`:

| Export           | Adds                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| `History`        | Undo/redo (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z` or `Y`)                           |
| `Clipboard`      | Toolbar copy/cut/paste of selected plain text                                 |
| `TextFormatting` | Bold, italic, underline, strikethrough, inline code                           |
| `Typography`     | Paragraph and H1–H6 dropdown                                                  |
| `Lists`          | Bullet, numbered, and task lists                                              |
| `Tables`         | Table insert and cell/row/column operations                                   |
| `Alignment`      | Left, center, right, justify                                                  |
| `TextColor`      | Carbon text colors, highlight, insert/delete marks                            |
| `Search`         | Toolbar search, match highlight, next-match cycle (`Ctrl/Cmd+F` to open)      |
| `Blocks`         | Code block and blockquote                                                     |
| `Insert`         | Link and image URL popovers; image resize                                     |
| `Typeface`       | Font family dropdown                                                          |
| `FontSize`       | Font size dropdown (12px–32px)                                                |
| `FileUpload`     | Toolbar upload, drag-and-drop, attachment strip. Optional `FileUpload.accept` |

### Example with the current exports

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  Clipboard,
  TextFormatting,
  Typography,
  Lists,
  Tables,
  Alignment,
  TextColor,
  Search,
  Blocks,
  Insert,
  Typeface,
  FontSize,
  FileUpload,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

const editor = document.querySelector('clabs-wysiwyg');
editor.extensions = [
  History,
  Clipboard,
  Typeface,
  FontSize,
  TextFormatting,
  TextColor,
  Insert,
  FileUpload,
  Blocks,
  Typography,
  Lists,
  Alignment,
  Tables,
  Search,
];
```

## Custom extensions

You can pass any TipTap extension. To show Carbon toolbar controls, add
`toolbarRender`:

```javascript
import { Extension, Mark } from '@tiptap/core';
import { html } from 'lit';

const HighlightMark = Mark.create({
  name: 'highlight',
  parseHTML() {
    return [{ tag: 'mark' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', HTMLAttributes, 0];
  },
});

const HighlightExtension = Extension.create({
  name: 'highlightExtension',
  addExtensions: () => [HighlightMark],
});

HighlightExtension.toolbarRender = (editor, toolbarSize) => {
  return html`
    <div class="clabs-wysiwyg__toolbar-group">
      <cds-icon-button
        kind="ghost"
        .size=${toolbarSize}
        @click=${() => editor?.chain().focus().toggleMark('highlight').run()}>
        <span slot="tooltip-content">Highlight</span>
      </cds-icon-button>
    </div>
  `;
};

editor.extensions = [HighlightExtension, ...otherExtensions];
```

The Storybook AI story is an example of this pattern, not a packaged AI
extension.

## Accessibility

The editor contenteditable has `aria-label="Rich text editor"`. The toolbar uses
a roving tabindex and tooltips. Search and formatting controls have
visible labels or `label-text`.

Keyboard shortcuts for the bundled extensions are listed in the Storybook MDX.

## Storybook

You can view the current state of the component in our
[Storybook](https://labs.carbondesignsystem.com/?path=/docs/web-components_components-wysiwyg--docs).

## Contributing

We welcome contributions! Please see our
[contributing guidelines](https://github.com/carbon-design-system/carbon-labs/blob/main/CONTRIBUTING.md).

## 📝 License

Licensed under the
[Apache 2.0 License](https://github.com/carbon-design-system/carbon-labs/blob/main/LICENSE).

## <picture><source height="20" width="20" media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-dark.svg"><source height="20" width="20" media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-light.svg"><img height="20" width="20" alt="IBM Telemetry" src="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-light.svg"></picture> IBM Telemetry

This package uses IBM Telemetry to collect de-identified and anonymized metrics
data. By installing this package as a dependency you are agreeing to telemetry
collection. To opt out, see
[Opting out of IBM Telemetry data collection](https://github.com/ibm-telemetry/telemetry-js/tree/main#opting-out-of-ibm-telemetry-data-collection).
For more information on the data being collected, please see the
[IBM Telemetry documentation](https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics).
