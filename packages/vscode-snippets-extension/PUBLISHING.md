# Publishing Guide

This document explains how to build and publish the Carbon Token Snippets VSCode
extension.

## Publishing Overview

### VSCode Marketplace vs npm

This extension publishes to the **VSCode Marketplace**, which is separate from
the monorepo's automated npm publishing:

- ✅ **Monorepo npm packages**: Automatically published via GitHub Actions
  (`.github/workflows/release.yml`) using Lerna
- ✅ **This VSCode extension**: Manually published to VSCode Marketplace
  (different platform, different credentials)
- ✅ **No conflict**: Package is marked `"private": true` so Lerna ignores it

### Publishing Options

**Option 1: Manual Publishing (Recommended)**

- You control when to publish
- Simple and straightforward
- No additional CI/CD setup needed
- Follow the steps in this guide

**Option 2: Automated via GitHub Actions (Advanced)**

- Requires additional workflow setup
- Needs VSCode PAT stored as GitHub secret
- More complex to maintain
- Consider if you need frequent automated releases

This guide covers **Option 1 (Manual Publishing)**.

## Prerequisites

1. **Install dependencies**

   ```bash
   cd packages/vscode-snippets-extension
   yarn install
   ```

2. **VSCode Extension Manager (vsce)** The `@vscode/vsce` package is included as
   a dev dependency.

3. **Publisher Account** You need a publisher account on the
   [Visual Studio Marketplace](https://marketplace.visualstudio.com/).
   - Create an account at https://marketplace.visualstudio.com/manage
   - Publisher ID: `Lee Chase`
   - Generate a Personal Access Token (PAT) from Azure DevOps

## Building the Extension

The extension needs to copy snippet files from the npm package before packaging:

```bash
# Build (copy snippets from ../vscode-snippets/src)
yarn build

# Clean build artifacts
yarn clean
```

## Local Testing

To test the extension locally before publishing:

1. **Build the extension**

   ```bash
   yarn build
   ```

2. **Package the extension**

   ```bash
   yarn package
   ```

   This creates a `.vsix` file (e.g., `carbon-token-snippets-0.1.0.vsix`)

3. **Install locally in VSCode**

   - Open VSCode
   - Go to Extensions view (Cmd+Shift+X / Ctrl+Shift+X)
   - Click the "..." menu → "Install from VSIX..."
   - Select the generated `.vsix` file

4. **Test the snippets**
   - Create a new `.scss` file
   - Type snippet prefixes like `$spacing-05` or `type`
   - Verify snippets appear and work correctly

## Publishing to Marketplace

### First-Time Setup

1. **Update package.json**

   - Ensure `publisher` field matches your Marketplace publisher ID
   - Update version number if needed

2. **Add Extension Icon** (Optional but recommended)

   - Create a 128x128 PNG icon named `icon.png`
   - Place it in the package root
   - Or remove the `"icon": "icon.png"` line from package.json

3. **Login to vsce**
   ```bash
   npx vsce login <publisher-name>
   ```
   Enter your Personal Access Token when prompted.

### Publishing

```bash
# Publish to Marketplace
yarn publish
```

This will:

1. Run the build script (copy snippets)
2. Package the extension
3. Publish to the VSCode Marketplace

### Manual Publishing

If you prefer more control:

```bash
# Build and package
yarn build
yarn package

# Publish the .vsix file manually
npx vsce publish
```

## Version Management

Update the version in `package.json` before publishing:

```json
{
  "version": "0.2.0"
}
```

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Marketplace Listing

After publishing, your extension will be available at:

```
https://marketplace.visualstudio.com/items?itemName=Lee-Chase.carbon-token-snippets
```

## Updating the Extension

1. Make changes to snippet files in `../vscode-snippets/src/`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Build and publish:
   ```bash
   yarn build
   yarn publish
   ```

## Troubleshooting

### "Publisher not found"

- Verify your publisher ID in package.json matches your Marketplace account
- Login with `npx vsce login <publisher-name>`

### "Missing icon.png"

- Either add a 128x128 PNG icon file
- Or remove the `"icon"` field from package.json

### Snippets not updating

- Run `yarn clean && yarn build` to ensure fresh copy
- Check that snippet files exist in `./snippets/` directory

## Related Documentation

- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
