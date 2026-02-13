# Publishing Guide

This document explains how to build and publish the Carbon Token Snippets VSCode
extension.

## Publishing Overview

### Extension Marketplaces

This extension can be published to multiple marketplaces:

1. **VSCode Marketplace** (Microsoft) - For VSCode, IBM Bob, and most forks
2. **Open VSX Registry** - For VSCodium, Gitpod, and other open-source editors

### VSCode Marketplace vs npm

This extension publishes to extension marketplaces, which are separate from the
monorepo's automated npm publishing:

- ✅ **Monorepo npm packages**: Automatically published via GitHub Actions
  (`.github/workflows/release.yml`) using Lerna
- ✅ **This VSCode extension**: Manually published to extension marketplaces
  (different platforms, different credentials)
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

## Publishing to VSCode Marketplace

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
   npx vsce login Lee-Chase
   ```
   Enter your Personal Access Token when prompted.

### Publishing to VSCode Marketplace

```bash
# Publish to VSCode Marketplace
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

## Publishing to Open VSX Registry

Open VSX is used by VSCodium, Gitpod, Eclipse Theia, and other open-source
editors.

### First-Time Setup

1. **Create an Open VSX account**

   - Go to https://open-vsx.org/
   - Sign in with GitHub
   - Create a namespace (e.g., "lee-chase")

2. **Generate an Access Token**

   - Go to https://open-vsx.org/user-settings/tokens
   - Create a new access token
   - Save it securely

3. **Install ovsx CLI**
   ```bash
   npm install -g ovsx
   ```

### Publishing to Open VSX

```bash
# Build the extension first
yarn build
yarn package

# Publish to Open VSX
npx ovsx publish carbon-token-snippets-0.1.0.vsix -p YOUR_ACCESS_TOKEN
```

Or create a namespace and publish:

```bash
# Create namespace (first time only)
npx ovsx create-namespace lee-chase -p YOUR_ACCESS_TOKEN

# Publish
npx ovsx publish -p YOUR_ACCESS_TOKEN
```

### Publishing to Both Marketplaces

To publish to both VSCode Marketplace and Open VSX:

```bash
# Build once
yarn build
yarn package

# Publish to VSCode Marketplace
npx vsce publish

# Publish to Open VSX
npx ovsx publish -p YOUR_OPENVSX_TOKEN
```

**Tip:** Store your Open VSX token as an environment variable:

```bash
export OVSX_PAT=your_token_here
npx ovsx publish -p $OVSX_PAT
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

## Marketplace Listings

After publishing, your extension will be available at:

**VSCode Marketplace:**

```
https://marketplace.visualstudio.com/items?itemName=Lee-Chase.carbon-token-snippets
```

**Open VSX Registry:**

```
https://open-vsx.org/extension/lee-chase/carbon-token-snippets
```

## Updating the Extension

1. Make changes to snippet files in `../vscode-snippets/src/`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Build and publish to both marketplaces:

   ```bash
   yarn build
   yarn package

   # Publish to VSCode Marketplace
   npx vsce publish

   # Publish to Open VSX
   npx ovsx publish -p $OVSX_PAT
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
