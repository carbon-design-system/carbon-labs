# @carbon-labs/vscode-snippets

> VSCode snippets for Carbon Design System SCSS

This package provides code snippets for Carbon Design System SCSS development,
compatible with VSCode, IBM Bob, and other VSCode-based IDEs.

## Installation

```bash
npm install @carbon-labs/vscode-snippets
```

or

```bash
yarn add @carbon-labs/vscode-snippets
```

The package will automatically install snippet files to your project's `.vscode`
folder via a post-install script.

### Viewing Installation Output

To see the installation output, use the `--foreground-scripts` flag:

```bash
npm install @carbon-labs/vscode-snippets --foreground-scripts
```

## Snippet Files

The package installs the following organized snippet files:

- **carbon-general.code-snippets** - Block class BEM pattern and @use imports
- **carbon-linter-disables.code-snippets** - Stylelint disable comments
- **carbon-spacing.code-snippets** - Spacing tokens
  ($spacing-01 through
  $spacing-13)
- **carbon-typography.code-snippets** - Typography styles (@include type-style)
- **carbon-motion.code-snippets** - Duration tokens and motion mixins
- **carbon-theme.code-snippets** - Theme-related snippets

## Usage

After installation, the snippets are immediately available in your SCSS files.
Simply start typing the snippet prefix and the IDE will suggest the completion.

### Example Snippets

- Type `block-class` to generate a BEM block class structure
- Type `@use spacing` to import Carbon spacing utilities
- Type `$spacing-05` to insert the spacing-05 token
- Type `type` to access typography style mixins

## How It Works

1. After installation, the package automatically runs a post-install script
2. The script copies all snippet files from the package to your project's
   `.vscode/` folder
3. VSCode and compatible IDEs automatically load all `.code-snippets` files from
   `.vscode/`
4. The snippets become immediately available in your SCSS files

## Compatibility

This package works with:

- **Visual Studio Code** - Microsoft's official IDE
- **IBM Bob** - IBM's VSCode-based IDE
- **VSCodium** - Open-source VSCode builds
- **Cursor** - AI-powered VSCode-based IDE
- Any other VSCode-based IDE that supports `.code-snippets` files

## Notes

- Snippets are installed at the workspace level (`.vscode/` folder)
- Re-running package installation will overwrite any local modifications to the
  snippet files
- The `.vscode/` folder will be created automatically if it doesn't exist
- Existing Carbon snippet files (from previous versions) are automatically
  removed before installation

## Development

### Running Tests

The package includes comprehensive tests for the installation logic:

```bash
cd packages/vscode-snippets
yarn test
```

Tests cover:

- Removing old snippet files (both old and new package name formats)
- Copying snippet files to `.vscode` directory
- Error handling for file system operations
- Integration testing of the complete installation flow

All tests use mocked file system operations and run with Node's experimental VM
modules for ES module support.

### Test Coverage

- 12 tests covering all installation scenarios
- Tests run automatically in CI on every PR and merge
- Uses Jest with ES module support

## License

Apache-2.0

## Contributing

This package is part of the
[Carbon Labs](https://github.com/carbon-design-system/carbon-labs) monorepo.
