# Carbon Labs v12 Storybook Dual-Build Architecture

## Overview

This document describes the dual-build Storybook architecture that supports both the current Carbon Labs components and the new v12 migration components.

## Architecture

### Directory Structure

```
storybook-static/
├── index.html                    # Root Storybook (standard)
├── web-components/               # Web Components package (standard)
├── react/                        # React package (standard)
└── v12/                          # V12 root directory
    ├── index.html                # Root Storybook (v12)
    ├── web-components/           # Web Components package (v12)
    └── react/                    # React package (v12)
```

### URL Structure (GitHub Pages)

- **Standard (Public):**
  - Root: `https://labs.carbondesignsystem.com/`
  - Web Components: `https://labs.carbondesignsystem.com/web-components/`
  - React: `https://labs.carbondesignsystem.com/react/`

- **V12 (Internal):**
  - Root: `https://labs.carbondesignsystem.com/v12/`
  - Web Components: `https://labs.carbondesignsystem.com/v12/web-components/`
  - React: `https://labs.carbondesignsystem.com/v12/react/`

## Development Workflow

### Port Assignments

**Standard Storybooks:**
- Root: `6006`
- Web Components: `6007`
- React: `6008`

**V12 Storybooks:**
- Root: `6016`
- Web Components: `6017`
- React: `6018`

### Running Storybooks

**Standard (Public):**
```bash
# Root
yarn storybook

# Web Components
yarn workspace @carbon-labs/web-components storybook

# React
yarn workspace @carbon-labs/react storybook
```

**V12 (Internal):**
```bash
# Root
yarn storybook:v12

# Web Components
yarn workspace @carbon-labs/web-components storybook:v12

# React
yarn workspace @carbon-labs/react storybook:v12
```

## Build Process

### Single Command Build

```bash
yarn storybook:build:full
```

This command:
1. Builds root Storybook (standard)
2. Builds root Storybook (v12) to `storybook-static/v12/`
3. Builds Web Components package (standard)
4. Builds Web Components package (v12) to `packages/web-components/storybook-static/v12/`
5. Builds React package (standard)
6. Builds React package (v12) to `packages/react/storybook-static/v12/`
7. Copies package builds to root structure:
   - `packages/web-components/storybook-static/` → `storybook-static/web-components/`
   - `packages/react/storybook-static/` → `storybook-static/react/`
   - `packages/web-components/storybook-static/v12/` → `storybook-static/v12/web-components/`
   - `packages/react/storybook-static/v12/` → `storybook-static/v12/react/`

### Individual Build Commands

**Standard:**
```bash
yarn storybook:build                                    # Root
yarn workspace @carbon-labs/web-components storybook:build  # Web Components
yarn workspace @carbon-labs/react storybook:build          # React
```

**V12:**
```bash
yarn storybook:build:v12                                    # Root
yarn workspace @carbon-labs/web-components storybook:build:v12  # Web Components
yarn workspace @carbon-labs/react storybook:build:v12          # React
```

## Component Organization

### Standard Components

Located in:
- `packages/react/src/components/`
- `packages/web-components/src/components/`

### V12 Components

Located in:
- `packages/react/src/v12/components/`
- `packages/web-components/src/v12/components/`

### Story Titles

**Standard components:**
- Use natural component names (e.g., `'Components/Button'`)

**V12 components:**
- Must be prefixed with `'V12/'` (e.g., `'V12/DatePicker'`)
- This ensures they appear in a separate "V12" section in the sidebar

## Configuration Details

### Conditional Story Loading

Both package Storybooks use the `STORYBOOK_INCLUDE_V12` environment variable to control which stories are loaded:

**Standard build** (`STORYBOOK_INCLUDE_V12` not set):
- Loads stories from `src/components/` only
- Excludes `src/v12/` directory

**V12 build** (`STORYBOOK_INCLUDE_V12=true`):
- Loads stories from all `src/` subdirectories
- Includes both standard and v12 components

### Root Storybook Refs

The root Storybook uses Storybook's `refs` feature to link to package Storybooks:

**Development mode:**
- Standard root (port 6006) → points to ports 6007, 6008
- V12 root (port 6016) → points to ports 6017, 6018

**Production mode:**
- Both use relative paths (`./web-components`, `./react`)
- Standard root at `/` → resolves to `/web-components`, `/react`
- V12 root at `/v12/` → resolves to `/v12/web-components`, `/v12/react`

### Sidebar Sorting

V12 components are pinned to the top of the navigation using `storySort`:

```javascript
storySort: {
  order: ['V12', ['Components', '*'], '*'],
}
```

## CI/CD Deployment

The GitHub Actions workflow (`.github/workflows/storybook-publish.yml`) runs:

```yaml
- name: Build all Storybooks
  run: yarn storybook:build:full

- name: Deploy to GitHub Pages
  # Deploys entire storybook-static/ directory
```

This ensures both standard and v12 builds are deployed together.

## Adding New V12 Components

1. Create component in `src/v12/components/<ComponentName>/`
2. Set story title to `'V12/<ComponentName>'`
3. Component will automatically appear in v12 builds only
4. Standard builds will not include the component

## Testing Locally

After building:

```bash
# Serve the built Storybooks
cd storybook-static
python3 -m http.server 8080

# Test URLs:
# Standard root: http://localhost:8080/
# V12 root: http://localhost:8080/v12/
# Standard Web Components: http://localhost:8080/web-components/
# V12 Web Components: http://localhost:8080/v12/web-components/
# Standard React: http://localhost:8080/react/
# V12 React: http://localhost:8080/v12/react/
```

## Key Benefits

1. **No Breaking Changes**: Standard builds remain unchanged
2. **Parallel Development**: Work on v12 without affecting production
3. **Easy Testing**: Compare standard vs v12 side-by-side
4. **Clean Separation**: V12 components isolated in dedicated directory
5. **Flexible Deployment**: Can deploy both or just standard
6. **GitHub Pages Compatible**: Works with subdirectory routing

## Migration Path

When v12 is ready for production:

1. Move components from `src/v12/components/` to `src/components/`
2. Update story titles to remove `'V12/'` prefix
3. Remove v12 build scripts and configuration
4. Components automatically appear in standard builds