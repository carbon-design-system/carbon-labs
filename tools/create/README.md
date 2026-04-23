# @carbon-labs/create

> **Status: v0** — the API may change before v1.

Create a Carbon Labs component contribution from the command line. The package
follows starter conventions used by tools like Next, Vite, TanStack, and
Storybook.

## What it does

```bash
npx @carbon-labs/create@latest <component-name>
```

By default, the command works in the current Carbon Labs checkout and does not
run any Git commands.

The create flow:

1. Validates the component name
2. Runs `yarn install`
3. Runs `yarn build`
4. Runs `yarn generate <name>` in the correct package
5. Runs `yarn scaffold` to inject owners, Storybook tags, the problem-statement
   scaffold, and copyright headers
6. Opens the component folder in your editor
7. Starts Storybook in the background

Pass `--with-git` to opt in to fork detection, clone/update, branch creation,
and the initial scaffold commit:

```bash
npx @carbon-labs/create@latest <component-name> --with-git
```

## Prerequisites

- Node 20+
- [GitHub CLI (`gh`)](https://cli.github.com) — authenticated via
  `gh auth login` when using `--with-git`
- `yarn` available in your shell

## Running from Carbon Labs

```bash
# From the root of your carbon-labs fork
npx @carbon-labs/create@latest my-component

# Or run the binary directly from the tool workspace:
yarn workspace @carbon-labs/create create-carbon-labs my-component
```

## Usage

```
create-carbon-labs <component-name> [options]

Options:
  --type <type>       Component type: "react" or "web-component"  [default: react]
  --owners <handles>  Comma-separated GitHub handles, e.g. @user1,@user2
  --path <path>       Carbon Labs repo path                       [default: cwd]
  --with-git          Opt into fork setup, clone/update, branch, and commit
  --no-storybook      Skip spawning Storybook
  --no-editor         Skip opening your editor
  --dry-run           Print every step without making changes
  -h, --help          Display help
```

### Examples

```bash
# React component (default)
npx @carbon-labs/create@latest DataTableFilter

# Web Component
npx @carbon-labs/create@latest data-table-filter --type web-component

# With explicit owners
npx @carbon-labs/create@latest MyWidget --owners @ajcase,@kenny-handle

# Opt into fork/clone/update/branch/commit handling
npx @carbon-labs/create@latest MyWidget --with-git

# Preview what would happen without touching anything
npx @carbon-labs/create@latest MyWidget --dry-run

# Custom local path
npx @carbon-labs/create@latest MyWidget --path ~/projects/carbon-labs
```

## Config file

Create `.carbon-labs-create.json` at the root of your carbon-labs fork to set
team-wide defaults:

```json
{
  "squad": "carbon-core",
  "defaultOwners": [
    "@ajcase",
    "@kenny-handle",
    "@scott-handle",
    "@olivia-handle"
  ],
  "defaultType": "react",
  "editorCommand": "code"
}
```

CLI flags always override config values. Config values override built-in
defaults.

| Field           | Default          | Description                               |
| --------------- | ---------------- | ----------------------------------------- |
| `squad`         | `"carbon-squad"` | Squad identifier (informational)          |
| `defaultOwners` | `[]`             | Owners pre-filled in MDX maintainer block |
| `defaultType`   | `"react"`        | Component type when `--type` is omitted   |
| `editorCommand` | `"code"`         | Editor binary for `--editor` step         |

## Development

```bash
cd tools/create
yarn install
yarn test           # vitest run
yarn test:watch     # vitest watch mode
```

## Roadmap

| Milestone                   | Status  | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| 1 — CLI MVP                 | ✅ Done | install/build/generate/scaffold flow                  |
| 2 — Squad namespace         | Dropped | Replaced by Storybook `tags` (see step 9 above)       |
| 3 — MDX auto-fill           | ✅ Done | Maintainer block + problem-statement scaffold         |
| 4 — Issue template + Action | Planned | Zero-click path for designers and PMs                 |
| 5 — `yarn graduate`         | Stretch | Promote component to Labs proper and open upstream PR |

## Notes

- **Does not replace `yarn generate`** — wraps it. If the upstream generator
  changes, `@carbon-labs/create` inherits the change automatically.
- The `storybook-publish` workflow in carbon-labs only runs on pushes to `main`
  (GitHub Pages). There is no per-PR preview — a draft PR link is the best we
  can provide until the component merges.
