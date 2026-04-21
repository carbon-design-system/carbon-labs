# @carbon-labs/carbon-labs-init

> **Status: v0** — the API may change before v1.

Collapse the Carbon Labs contribution ceremony into a single command. Go from idea to a live Storybook preview branch in under 5 minutes.

## What it does

```bash
yarn carbon-labs-init new <component-name>
```

One command that:

1. Checks your `gh` CLI auth
2. Finds (or creates) your fork of `carbon-design-system/carbon-labs`
3. Clones or updates the fork locally
4. Ensures `upstream` points to the canonical repo
5. Runs `yarn install && yarn build`
6. Runs `yarn generate <name>` in the right package
7. Re-links the workspace
8. Injects owners and a problem-statement scaffold into the generated MDX
9. Tags the Storybook story as `squad / incubating` (groups it in the sidebar)
10. Creates a `feat/<component-name>` branch and makes an initial Conventional Commit
11. Opens the component folder in your editor
12. Spawns Storybook in the background
13. Prints the draft PR URL

## Prerequisites

- Node 20+
- [GitHub CLI (`gh`)](https://cli.github.com) — authenticated via `gh auth login`
- `yarn` available in your shell

## Running from Carbon Labs

```bash
# From the root of your carbon-labs fork:
yarn carbon-labs-init new my-component

# Or run the binary directly from the tool workspace:
cd tools/carbon-labs-init
yarn carbon-labs-init new my-component
```

## Usage

```
carbon-labs-init new <component-name> [options]

Options:
  --type <type>       Component type: "react" or "web-component"  [default: react]
  --owners <handles>  Comma-separated GitHub handles, e.g. @user1,@user2
  --path <path>       Local clone path                            [default: ~/carbon-labs]
  --no-storybook      Skip spawning Storybook
  --no-editor         Skip opening your editor
  --dry-run           Print every step without making changes
  -h, --help          Display help
```

### Examples

```bash
# React component (default)
carbon-labs-init new DataTableFilter

# Web Component
carbon-labs-init new data-table-filter --type web-component

# With explicit owners
carbon-labs-init new MyWidget --owners @ajcase,@kenny-handle

# Preview what would happen without touching anything
carbon-labs-init new MyWidget --dry-run

# Custom local path
carbon-labs-init new MyWidget --path ~/projects/carbon-labs
```

## Config file

Create `.carbon-labs-init.json` at the root of your carbon-labs fork to set team-wide defaults:

```json
{
  "squad": "carbon-core",
  "defaultOwners": ["@ajcase", "@kenny-handle", "@scott-handle", "@olivia-handle"],
  "defaultType": "react",
  "editorCommand": "code"
}
```

CLI flags always override config values. Config values override built-in defaults.

| Field | Default | Description |
|---|---|---|
| `squad` | `"carbon-squad"` | Squad identifier (informational) |
| `defaultOwners` | `[]` | Owners pre-filled in MDX maintainer block |
| `defaultType` | `"react"` | Component type when `--type` is omitted |
| `editorCommand` | `"code"` | Editor binary for `--editor` step |

## Development

```bash
cd tools/carbon-labs-init
yarn install
yarn test           # vitest run
yarn test:watch     # vitest watch mode
```

## Roadmap

| Milestone | Status | Description |
|---|---|---|
| 1 — CLI MVP | ✅ Done | fork/clone/generate/branch flow |
| 2 — Squad namespace | Dropped | Replaced by Storybook `tags` (see step 9 above) |
| 3 — MDX auto-fill | ✅ Done | Maintainer block + problem-statement scaffold |
| 4 — Issue template + Action | Planned | Zero-click path for designers and PMs |
| 5 — `yarn graduate` | Stretch | Promote component to Labs proper and open upstream PR |

## Notes

- **Does not replace `yarn generate`** — wraps it. If the upstream generator changes, carbon-labs-init inherits the change automatically.
- The `storybook-publish` workflow in carbon-labs only runs on pushes to `main` (GitHub Pages). There is no per-PR preview — a draft PR link is the best we can provide until the component merges.
