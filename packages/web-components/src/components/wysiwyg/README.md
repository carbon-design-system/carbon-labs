<p align="center">
  <a href="https://www.carbondesignsystem.com">
    <img alt="Carbon Design System" src="https://user-images.githubusercontent.com/3901764/57545698-ce5f2380-7320-11e9-8682-903df232d7b0.png" width="100%" />
  </a>
</p>
<h1 align="center">
  Carbon Labs WYSIWYG Editor
</h1>

> A rich text editor component built with TipTap and Carbon Design System

## Overview

The WYSIWYG (What You See Is What You Get) editor is a comprehensive rich text
editing component that provides a full-featured editing experience with Carbon
Design System styling. Built on [TipTap](https://tiptap.dev/), it offers
extensibility, accessibility, and seamless integration with Carbon components.

## Features

- **Rich Text Editing** - Bold, italic, underline, strikethrough, inline code
- **Typography** - Six heading levels and paragraph formatting
- **Lists** - Bullet lists, numbered lists, and interactive task lists
- **Tables** - Full table editing with merge/split and row/column operations
- **Styling** - Text alignment, colors using Carbon tokens, highlighting
- **Search** - Real-time in-editor search with match highlighting
- **Code & Quotes** - Code blocks and blockquotes
- **Media** - Insert and edit links and images with resizing
- **Source Editing** - Toggle between visual, HTML, and Markdown modes
- **History** - Full undo/redo with keyboard shortcuts
- **Accessible** - Keyboard navigation, ARIA labels, screen reader support
- **Extensible** - Built on TipTap's extension system

## Getting started

### Installation

Install `@carbon-labs/wc-wysiwyg` to use this component.

```bash
npm install @carbon-labs/wc-wysiwyg
```

or

```bash
yarn add @carbon-labs/wc-wysiwyg
```

### Basic Usage

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  TextFormatting,
  Typography,
  Lists,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

// Get the editor element
const editor = document.querySelector('clabs-wysiwyg');

// Configure extensions
editor.extensions = [History, TextFormatting, Typography, Lists];

// Set initial content
editor.content = '<p>Start typing...</p>';

// Listen for changes
editor.addEventListener('content-change', (e) => {
  console.log('Content:', e.detail.content);
});
```

### HTML

```html
<clabs-wysiwyg toolbar-size="md" content="<p>Initial content</p>">
</clabs-wysiwyg>
```

## Extensions

The editor's functionality is provided through extensions. Import and use only
the extensions you need:

### Core Extensions

```javascript
import {
  History, // Undo/redo
  TextFormatting, // Bold, italic, underline, etc.
  Typography, // Headings and paragraphs
} from '@carbon-labs/wc-wysiwyg/es/index.js';
```

### List Extensions

```javascript
import {
  Lists, // Bullet, numbered, and task lists
} from '@carbon-labs/wc-wysiwyg/es/index.js';
```

### Advanced Extensions

```javascript
import {
  Tables, // Table editing
  Alignment, // Text alignment
  TextColor, // Colors and highlighting
  Search, // In-editor search
  Blocks, // Code blocks and blockquotes
  Insert, // Links and images
  Typeface, // Font family selection
} from '@carbon-labs/wc-wysiwyg/es/index.js';
```

### Source Editing Extensions

```javascript
import {
  Html, // HTML source editing
  Markdown, // Markdown editing
} from '@carbon-labs/wc-wysiwyg/es/index.js';
```

### Complete Example

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  TextFormatting,
  Typography,
  Lists,
  Tables,
  Alignment,
  TextColor,
  Search,
  Html,
  Markdown,
  Blocks,
  Insert,
  Typeface,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

const editor = document.querySelector('clabs-wysiwyg');

// Use all extensions
editor.extensions = [
  History,
  TextFormatting,
  Typography,
  Lists,
  Tables,
  Alignment,
  TextColor,
  Search,
  Html,
  Markdown,
  Blocks,
  Insert,
  Typeface,
];
```

## API

### Properties

| Property      | Type                   | Default | Description                |
| ------------- | ---------------------- | ------- | -------------------------- |
| `content`     | `string`               | `''`    | HTML content of the editor |
| `extensions`  | `Array<Extension>`     | `[]`    | Array of extension objects |
| `toolbarSize` | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size of toolbar buttons    |

### Events

#### `content-change`

Fired when editor content changes.

**Event Detail:**

```typescript
{
  content: string; // HTML content
  markdown: string; // Markdown (if Markdown extension enabled)
}
```

**Example:**

```javascript
editor.addEventListener('content-change', (event) => {
  const { content, markdown } = event.detail;
  console.log('HTML:', content);
  console.log('Markdown:', markdown);
});
```

### Methods

The editor exposes the TipTap editor instance through the `editor` property:

```javascript
const editorInstance = document.querySelector('clabs-wysiwyg').editor;

// Get content
const html = editorInstance.getHTML();
const json = editorInstance.getJSON();

// Set content
editorInstance.commands.setContent('<p>New content</p>');

// Execute commands
editorInstance.chain().focus().toggleBold().run();
```

## Extension Details

### History

Provides undo/redo functionality with keyboard shortcuts.

**Keyboard Shortcuts:**

- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo

### TextFormatting

Basic text formatting options.

**Features:**

- Bold (`Ctrl+B` / `Cmd+B`)
- Italic (`Ctrl+I` / `Cmd+I`)
- Underline (`Ctrl+U` / `Cmd+U`)
- Strikethrough
- Inline code

### Typography

Heading levels and paragraph formatting.

**Features:**

- Heading 1-6
- Paragraph
- Dropdown selector

### Lists

List formatting with nesting support.

**Features:**

- Bullet lists
- Numbered lists
- Task lists (checkboxes)
- Indent/outdent

### Tables

Complete table editing capabilities.

**Features:**

- Insert tables
- Add/delete rows and columns
- Merge/split cells
- Resizable columns

### Alignment

Text alignment options.

**Features:**

- Left align
- Center align
- Right align
- Justify

### TextColor

Text colors and highlighting using Carbon tokens.

**Features:**

- Primary/secondary text colors
- Link colors
- Status colors (success, error, warning, info)
- Text highlighting
- Semantic marks (insert, delete)

### Search

Real-time search within the editor.

**Features:**

- Live search as you type
- Match highlighting
- Match count display
- Case-insensitive

### Html

HTML source editing mode.

**Features:**

- Toggle to HTML view
- Syntax formatting
- Direct HTML editing

### Markdown

Markdown editing mode.

**Features:**

- Toggle to Markdown view
- Full Markdown syntax support
- Converts between Markdown and HTML

### Blocks

Code blocks and blockquotes.

**Features:**

- Code blocks with syntax preservation
- Blockquotes
- Citation support

### Insert

Insert links and images.

**Features:**

- Link insertion and editing
- Image insertion by URL
- Image resizing with drag handles
- Link validation

### Typeface

Font family selection.

**Features:**

- IBM Plex Sans (default)
- IBM Plex Serif
- IBM Plex Mono
- Common system fonts

## Creating Custom Extensions

You can create custom extensions using TipTap's extension API:

```javascript
import { Extension, Mark } from '@tiptap/core';
import { html } from 'lit';

// Create a custom mark
const HighlightMark = Mark.create({
  name: 'highlight',

  parseHTML() {
    return [{ tag: 'mark' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', HTMLAttributes, 0];
  },
});

// Create extension
const HighlightExtension = Extension.create({
  name: 'highlightExtension',
  addExtensions: () => [HighlightMark],
});

// Add toolbar UI
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

// Use it
editor.extensions = [HighlightExtension, ...otherExtensions];
```

## Styling

The editor uses Carbon Design System tokens. You can customize appearance using
CSS custom properties:

```css
clabs-wysiwyg {
  /* Override Carbon tokens */
  --cds-layer-01: #f4f4f4;
  --cds-text-primary: #161616;
  --cds-border-strong: #8d8d8d;
}
```

## Accessibility

The editor is built with accessibility in mind:

- ✅ Keyboard navigation for all controls
- ✅ ARIA labels on interactive elements
- ✅ Descriptive tooltips
- ✅ Proper focus management
- ✅ Screen reader support
- ✅ Semantic HTML output

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

For optimal performance with large documents:

1. Use only the extensions you need
2. Consider pagination for very long documents
3. Disable real-time search for documents >10,000 words
4. Limit history depth if needed

## Examples

### Minimal Editor

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  TextFormatting,
  Typography,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

editor.extensions = [History, TextFormatting, Typography];
```

### Full-Featured Editor

```javascript
import '@carbon-labs/wc-wysiwyg/es/index.js';
import {
  History,
  TextFormatting,
  Typography,
  Lists,
  Tables,
  Alignment,
  TextColor,
  Search,
  Html,
  Markdown,
  Blocks,
  Insert,
} from '@carbon-labs/wc-wysiwyg/es/index.js';

editor.extensions = [
  History,
  TextFormatting,
  Typography,
  Lists,
  Tables,
  Alignment,
  TextColor,
  Search,
  Html,
  Markdown,
  Blocks,
  Insert,
];
```

### With Event Handling

```javascript
const editor = document.querySelector('clabs-wysiwyg');

editor.addEventListener('content-change', (e) => {
  // Auto-save
  localStorage.setItem('draft', e.detail.content);

  // Update character count
  const text = e.detail.content.replace(/<[^>]*>/g, '');
  document.getElementById('char-count').textContent = text.length;
});
```

## Storybook

You can view the current state of the component in our
[Storybook](https://labs.carbondesignsystem.com/web-components/).

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
