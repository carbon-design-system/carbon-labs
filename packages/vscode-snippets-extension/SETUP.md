# VSCode Extension Setup Summary

This package contains a VSCode extension for Carbon Design System SCSS snippets.

## Package Structure

```
packages/vscode-snippets-extension/
├── package.json              # VSCode extension manifest
├── README.md                 # Extension documentation (shown in Marketplace)
├── CHANGELOG.md              # Version history
├── PUBLISHING.md             # Publishing guide
├── .gitignore                # Git ignore (snippets/, node_modules, *.vsix)
├── .vscodeignore             # Files to exclude from extension package
├── icon.png.md               # Instructions for adding extension icon
├── scripts/
│   └── copy-snippets.js      # Build script to copy snippets from npm package
└── snippets/                 # Generated directory (not in git)
    ├── carbon-general.code-snippets
    ├── carbon-linter-disables.code-snippets
    ├── carbon-motion.code-snippets
    ├── carbon-spacing.code-snippets
    ├── carbon-theme.code-snippets
    └── carbon-typography.code-snippets
```

## Key Features

- **Extension ID**: `carbon-token-snippets`
- **Display Name**: Carbon Token Snippets
- **Publisher**: Lee Chase
- **Private Package**: Not published to npm (only to VSCode Marketplace)
- **Snippet Source**: Copies from `../vscode-snippets/src/`

## Quick Start

### 1. Install Dependencies

```bash
cd packages/vscode-snippets-extension
yarn install
```

### 2. Build (Copy Snippets)

```bash
yarn build
```

### 3. Test Locally

```bash
# Package the extension
yarn package

# This creates: carbon-token-snippets-0.1.0.vsix
```

Install the `.vsix` file in VSCode:

- Extensions view → "..." menu → "Install from VSIX..."

### 4. Publish to Marketplace

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions.

## Relationship to npm Package

This extension is a companion to the `@carbon-labs/vscode-snippets` npm package:

| Feature            | npm Package                     | VSCode Extension        |
| ------------------ | ------------------------------- | ----------------------- |
| **Distribution**   | npm registry                    | VSCode Marketplace      |
| **Installation**   | `npm install`                   | Extensions panel        |
| **Scope**          | Project-level                   | IDE-level (global)      |
| **Use Case**       | Team consistency                | Individual developers   |
| **Snippet Source** | `packages/vscode-snippets/src/` | Copies from npm package |

Both share the same snippet files, ensuring consistency across distribution
methods.

## Next Steps

1. **Add Demo GIF** (Recommended)

   - Record a 15-30 second demo showing snippets in action
   - Optimize to < 5MB
   - Save as `demo.gif` in package root
   - See [demo.gif.md](./demo.gif.md) for detailed instructions
   - README already references it

2. **Configure Publisher**

   - Create a publisher account on VSCode Marketplace
   - Update `"publisher"` field in package.json if needed
   - Generate a Personal Access Token

3. **Test Thoroughly**

   - Build and package locally
   - Install the .vsix file
   - Test all snippet categories
   - Verify snippets work in SCSS files

4. **Publish**
   - Follow instructions in [PUBLISHING.md](./PUBLISHING.md)
   - Extension will be available at:
     `marketplace.visualstudio.com/items?itemName=Lee-Chase.carbon-token-snippets`

## Maintenance

When updating snippets:

1. Edit files in `../vscode-snippets/src/`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Run `yarn build` to copy updated snippets
5. Publish new version

## Scripts

- `yarn build` - Copy snippet files from npm package
- `yarn clean` - Remove generated snippets directory
- `yarn package` - Build and create .vsix file
- `yarn publish` - Build and publish to Marketplace

## Documentation

- [README.md](./README.md) - User-facing documentation
- [PUBLISHING.md](./PUBLISHING.md) - Publishing guide
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [icon.png.md](./icon.png.md) - Icon requirements

## Support

This extension is part of
[Carbon Labs](https://github.com/carbon-design-system/carbon-labs).
