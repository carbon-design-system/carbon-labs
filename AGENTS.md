# Carbon Labs Contribution Agent Guide

Use this guide when a user asks how to contribute to Carbon Labs, asks to
contribute a component, or says something like "Contribute to Carbon" in this
repository.

## Default Contribution Path

Prefer the repo-local `labs-kit` utility for new component contributions. It
wraps the Carbon Labs generator and handles the setup work that contributors
usually have to do by hand.

From the repo root:

```bash
yarn labs-kit new <ComponentName>
```

Use React by default. Use the web component flow only when the user explicitly
asks for a web component:

```bash
yarn labs-kit new <component-name> --type web-component
```

If the user wants to preview the process without changing files:

```bash
yarn labs-kit new <ComponentName> --dry-run
```

## What `labs-kit new` Handles

`labs-kit new` is the preferred scaffold path because it:

- checks GitHub CLI authentication
- finds or creates the contributor's fork of `carbon-design-system/carbon-labs`
- clones or updates the local fork
- ensures the `upstream` remote points to the canonical Carbon Labs repo
- runs install and build steps needed by the generator
- runs `yarn generate` in the correct package
- injects owners and a problem-statement scaffold into the generated MDX
- tags the Storybook story for squad/incubating contribution review
- creates a `feat/<component-name>` branch
- makes an initial Conventional Commit
- opens the generated component folder
- starts Storybook
- prints a draft PR URL

Do not recreate this flow manually unless `labs-kit` is unavailable or the user
explicitly asks for a manual setup.

## Prerequisites To Check

Before running the contribution flow, make sure the contributor has:

- Node matching the repo's `.nvmrc`
- Yarn available through the repo's configured package manager
- GitHub CLI installed and authenticated with `gh auth login`
- SSO authorized for the `carbon-design-system` GitHub organization when
  required

If GitHub CLI reports an SSO error, ask the user to authorize GitHub CLI for the
`carbon-design-system` organization, then retry the command.

## Team Defaults

For repeat contributions, use `.labs-kit.json` at the root of the contributor's
Carbon Labs fork:

```json
{
  "squad": "carbon-core",
  "defaultOwners": ["@github-handle"],
  "defaultType": "react",
  "editorCommand": "code"
}
```

CLI flags override `.labs-kit.json`.

Use `--owners` when the contributor provides maintainers explicitly:

```bash
yarn labs-kit new <ComponentName> --owners @user1,@user2
```

## After Scaffolding

After `labs-kit new` completes:

1. Open the generated component folder printed by the CLI.
2. Fill in the problem statement in the generated MDX file.
3. Implement the component in the generated source files.
4. Review the Storybook story and tags.
5. Keep the initial scaffold commit and add follow-up commits for meaningful
   implementation work.

If Storybook did not start automatically, run Storybook from the package that
contains the generated component.

For React components:

```bash
cd packages/react
yarn storybook
```

## Preparing A Branch For PR

When the user says the contribution is ready for review, use:

```bash
yarn labs-kit prep
```

`labs-kit prep` prepares the branch by:

- adding the IBM copyright header to newly added source files
- running `yarn format` from the repo root
- running `yarn dedupe` from the repo root

To preview the prep actions:

```bash
yarn labs-kit prep --dry-run
```

Run tests or build commands relevant to the changed package after prep. At
minimum, verify the utility or component-specific tests the user changed.

## PR Checklist

Before opening a PR:

- run `yarn labs-kit prep`
- run the relevant tests
- run `yarn lint:license` when files were added
- confirm the generated MDX problem statement is complete
- confirm maintainers are listed correctly
- confirm the Storybook story title and tags are appropriate
- push the feature branch to the contributor's fork
- open a draft PR against `carbon-design-system/carbon-labs`

Use the PR URL printed by `labs-kit new` when available.

## PR Template

Use this structure when drafting the PR body:

```md
Closes #

<short description>

#### Changelog

**New**

- <new thing>

**Changed**

- <changed thing>

**Removed**

- <removed thing, or "Nothing.">

#### Testing / Reviewing

- <verification step>
- <verification step>
```

## When Not To Use `labs-kit`

Do not use `labs-kit new` for changes that are not new component contributions,
such as documentation-only fixes, bug fixes to existing components, dependency
maintenance, or repo infrastructure changes.

For those changes, use normal Git workflow and still run:

```bash
yarn labs-kit prep
```

before opening the PR when the branch adds source files or changes dependency
resolution.
