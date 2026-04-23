# Carbon Labs Contribution Agent Guide

Use this guide when a user asks how to contribute to Carbon Labs, asks to
contribute a component, or says something like "Contribute to Carbon" in this
repository.

## Default Contribution Path

Prefer `@carbon-labs/create` for new component contributions. It follows common
starter conventions used by tools like Next, Vite, TanStack, and Storybook.

From the root of a Carbon Labs checkout:

```bash
npx @carbon-labs/create@latest <ComponentName>
```

This should be the only command needed to create the generated files for the
first component contribution.

Use React by default. Use the web component flow only when the user explicitly
asks for a web component:

```bash
npx @carbon-labs/create@latest <component-name> --type web-component
```

By default, the create utility must not run Git commands. If the user wants the
tool to handle fork detection, clone/update, branch creation, and the initial
scaffold commit, pass `--with-git`:

```bash
npx @carbon-labs/create@latest <ComponentName> --with-git
```

If the user wants to preview the process without changing files:

```bash
npx @carbon-labs/create@latest <ComponentName> --dry-run
```

## What The Create Utility Handles

The create utility:

- validates the component name
- optionally handles fork/clone/update/branch/commit when `--with-git` is passed
- runs `yarn install`
- runs `yarn build`
- runs `yarn generate <name>` in the correct package
- runs `yarn scaffold`
- opens the generated component folder
- starts Storybook in the background

Do not recreate this flow manually unless `@carbon-labs/create` is unavailable
or the user explicitly asks for a manual setup.

## What `yarn scaffold` Handles

`yarn scaffold` is the repo-local post-generation step. It:

- injects owners into the generated MDX maintainer block
- injects the problem-statement scaffold
- tags the Storybook story for squad/incubating contribution review
- adds the IBM copyright header to generated source files

Future repo-local contribution commands should be added to the root
`package.json` and run as `yarn <script-name>`.

## Prerequisites To Check

Before running the contribution flow, make sure the contributor has:

- Node matching the repo's `.nvmrc`
- Yarn available through the repo's configured package manager
- GitHub CLI installed and authenticated with `gh auth login` when using
  `--with-git`
- SSO authorized for the `carbon-design-system` GitHub organization when using
  `--with-git` and required by GitHub

If GitHub CLI reports an SSO error, ask the user to authorize GitHub CLI for the
`carbon-design-system` organization, then retry the command.

## Team Defaults

For repeat contributions, use `.carbon-labs-create.json` at the root of the
contributor's Carbon Labs fork:

```json
{
  "squad": "carbon-core",
  "defaultOwners": ["@github-handle"],
  "defaultType": "react",
  "editorCommand": "code"
}
```

CLI flags override `.carbon-labs-create.json`.

Use `--owners` when the contributor provides maintainers explicitly:

```bash
npx @carbon-labs/create@latest <ComponentName> --owners @user1,@user2
```

## After Scaffolding

After the create utility completes:

1. Open the generated component folder printed by the CLI.
2. Fill in the problem statement in the generated MDX file.
3. Implement the component in the generated source files.
4. Review the Storybook story and tags.
5. Add meaningful implementation commits.

If Storybook did not start automatically, run Storybook from the package that
contains the generated component.

For React components:

```bash
cd packages/react
yarn storybook
```

## Before Opening A PR

When the contribution is ready for PR review, run one repo-local prep command:

```bash
yarn prep
```

This is the required PR prep path. It:

- adds the IBM copyright header to added source files
- runs `yarn format`
- runs `yarn dedupe`
- runs `yarn lint:license`

Do not ask contributors to run additional cleanup commands for normal component
contributions unless a command fails and you are helping debug the failure.

Before opening a PR, confirm:

- confirm the generated MDX problem statement is complete
- confirm maintainers are listed correctly
- confirm the Storybook story title and tags are appropriate
- push the feature branch to the contributor's fork
- open a draft PR against `carbon-design-system/carbon-labs`

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

## When Not To Use `@carbon-labs/create`

Do not use the create utility for changes that are not new component
contributions, such as documentation-only fixes, bug fixes to existing
components, dependency maintenance, or repo infrastructure changes.

For those changes, use normal Git workflow and add any repo-local automation as
a root `package.json` script.
