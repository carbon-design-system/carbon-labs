# @carbon-labs/labs-kit

> **Status: v0** — the API may change before v1.

Collapse the Carbon Labs contribution ceremony into focused commands. Go from
idea to a live Storybook preview branch, then prepare the finished branch for PR
review.

## What it does

```bash
yarn labs-kit new <component-name>
yarn labs-kit prep
```

`labs-kit new`:

1. Checks your `gh` CLI auth
2. Finds (or creates) your fork of `carbon-design-system/carbon-labs`
3. Clones or updates the fork locally
4. Ensures `upstream` points to the canonical repo
5. Runs `yarn install && yarn build`
6. Runs `yarn generate <name>` in the right package
7. Re-links the workspace
8. Injects owners and a problem-statement scaffold into the generated MDX
9. Tags the Storybook story as `squad / incubating` (groups it in the sidebar)
10. Creates a `feat/<component-name>` branch and makes an initial Conventional
    Commit
11. Opens the component folder in your editor
12. Spawns Storybook in the background
13. Prints the draft PR URL

`labs-kit prep`:

1. Finds source files added on the current branch
2. Adds the IBM copyright header where needed
3. Runs `yarn format` from the repo root
4. Runs `yarn dedupe` from the repo root

## Prerequisites

- Node 20+
- [GitHub CLI (`gh`)](https://cli.github.com) — authenticated via
  `gh auth login`
- `yarn` available in your shell

## Running from Carbon Labs

```bash
# From the root of your carbon-labs fork:
yarn labs-kit new my-component
yarn labs-kit prep

# Or run the binary directly from the tool workspace:
cd tools/labs-kit
yarn labs-kit new my-component
```

## Usage

```
labs-kit new <component-name> [options]
labs-kit prep [options]

Options:
  --type <type>       Component type: "react" or "web-component"  [default: react]
  --owners <handles>  Comma-separated GitHub handles, e.g. @user1,@user2
  --path <path>       Local clone path                            [default: ~/carbon-labs]
  --no-storybook      Skip spawning Storybook
  --no-editor         Skip opening your editor
  --dry-run           Print every step without making changes
  -h, --help          Display help

Prep options:
  --path <path>       Repo root to prepare                         [default: cwd]
  --base <ref>        Base ref used to find newly added files       [default: upstream/main]
  --dry-run           Print every step without making changes
```

### Examples

```bash
# React component (default)
labs-kit new DataTableFilter

# Web Component
labs-kit new data-table-filter --type web-component

# With explicit owners
labs-kit new MyWidget --owners @ajcase,@kenny-handle

# Preview what would happen without touching anything
labs-kit new MyWidget --dry-run

# Custom local path
labs-kit new MyWidget --path ~/projects/carbon-labs

# Prepare your branch before opening a PR
labs-kit prep

# Preview PR prep steps
labs-kit prep --dry-run
```

## Config file

Create `.labs-kit.json` at the root of your carbon-labs fork to set team-wide
defaults:

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
cd tools/labs-kit
yarn install
yarn test           # vitest run
yarn test:watch     # vitest watch mode
```

## Roadmap

| Milestone                   | Status  | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| 1 — CLI MVP                 | ✅ Done | fork/clone/generate/branch flow                       |
| 2 — Squad namespace         | Dropped | Replaced by Storybook `tags` (see step 9 above)       |
| 3 — MDX auto-fill           | ✅ Done | Maintainer block + problem-statement scaffold         |
| 4 — Issue template + Action | Planned | Zero-click path for designers and PMs                 |
| 5 — `yarn graduate`         | Stretch | Promote component to Labs proper and open upstream PR |

## Notes

- **Does not replace `yarn generate`** — wraps it. If the upstream generator
  changes, labs-kit inherits the change automatically.
- The `storybook-publish` workflow in carbon-labs only runs on pushes to `main`
  (GitHub Pages). There is no per-PR preview — a draft PR link is the best we
  can provide until the component merges.
