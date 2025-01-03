# Developing

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Setup](#setup)
- [Installing dependencies](#installing-dependencies)
- [Running Storybook](#running-storybook)
- [Common tasks](#common-tasks)
- [Building a React Component](#building-a-react-component)
- [Building a Web Component](#building-a-web-component)
- [Submitting a Pull Request](#submitting-a-pull-request)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Setup

Our repository requires that a forked repo is used for any work before
contributing back to the repository. This includes regular team
members/maintainers.

1. Fork the project by navigating to the main
   [repository](https://github.com/carbon-design-system/carbon-labs) and
   clicking the **Fork** button on the top-right corner.

2. Navigate to your forked repository and copy the **SSH url**. Clone your fork
   by running the following in your terminal:

   ```
   $ git clone git@github.com:{ YOUR_USERNAME }/carbon-labs.git
   $ cd carbon-labs
   ```

   See [GitHub docs](https://help.github.com/articles/fork-a-repo/) for more
   details on forking a repository.

3. Once cloned, you will see `origin` as your default remote, pointing to your
   personal forked repository. Add a remote named `upstream` pointing to the
   main `carbon-labs`:

   ```
   $ git remote add upstream git@github.com:carbon-design-system/carbon-labs.git
   $ git remote -v
   ```

4. Switch to our version of Node. The currently supported node versions are
   listed within the package.json file under the "engines" key.

## Installing dependencies

Carbon Labs is a collection of components, each as its own package, in the same
git repository. You might have heard this setup described as a
[monorepo](https://en.wikipedia.org/wiki/Monorepo).

As a result, we use two pieces of tooling to help us managing installing
dependencies and publishing our packages. These include:

- [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) for handling
  dependencies across all packages
- [Lerna](https://lerna.js.org/) for publishing packages, tagging versions, and
  more

In order for you to install all the dependencies in this project, you'll need to
[install Yarn](https://yarnpkg.com/en/docs/install) and run the following
command in your terminal:

```bash
yarn install
```

This will install all of the dependencies for every package in our project. In
addition, it allows us to link between packages that we are developing.

This strategy is particularly useful during development, and tooling like Lerna
will pick up on when packages are linked in this way and will automatically
update versions when publishing new versions of packages.

Next up, you'll most likely want to build all of the package files so that
things don't fail while you are working on a package. To do this, you can run
the following command:

```bash
yarn build
```

Afterwards, you should be good to go!

## Running Storybook

To get your development server running and to start coding, you just have to
run:

```bash
yarn storybook
```

This will start a development server where you can see any changes you are
making to components in Storybook.

## Common tasks

While working on Carbon Labs, here are some of the top-level tasks that you
might want to run:

| Command                            | Usage                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `yarn build`                       | Runs the gulp `build` tasks and uses lerna to run the `build` script for the `@carbon-labs/utilities` package |
| `yarn build:dist`                  | Runs the rollup `dist` config and generates the CDN artifacts                                                 |
| `yarn format`, `yarn format:write` | Check if files have been formatted, format files using prettier                                               |
| `yarn ci-check`                    | Runs the ci-checks                                                                                            |
| `yarn ci-check:build`              | Runs the ci-checks along with the build and build:dist commands                                               |

## Building a React Component

1. Start by copying and pasting the
   [`ExampleButton` template component folder](https://github.com/carbon-design-system/carbon-labs/tree/main/packages/react/src/components/ExampleButton),
   renaming the copy to your desired component name.

2. Adjust the naming in the files, most importantly these lines in the
   `package.json` file:

   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/ExampleButton/package.json#L2
   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/ExampleButton/package.json#L9
   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/ExampleButton/package.json#L14

3. Build your component. You can run the build for your new component within the
   component folder or in the root of the project using the `yarn build`
   command.

4. For testing and documentation purposes, a stackblitz example can be created
   and linked in the component's storybook documentation as shown in the
   [`ExampleButton` storybook docs](https://labs.carbondesignsystem.com/react/?path=/docs/components-examplebutton--overview).
   - To do this, copy and paste the
     [`ExampleButton` example folder](https://github.com/carbon-design-system/carbon-labs/tree/main/examples/react/example-button)
     under the `carbon-labs/examples/react` folder and rename the copy to your
     component name.
   - [Add the stackblitz link](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/ExampleButton/__stories__/ExampleButton.mdx?plain=1#L11-L15)
     to your component storybook doc, making sure the link is pointing correctly
     to your example folder. **Note:** The example needs to be merged into
     `main` first before the stackblitz link is viewable.

## Building a Web Component

1. Start by copying and pasting the
   [`example-button` template component folder](https://github.com/carbon-design-system/carbon-labs/tree/main/packages/web-components/src/components/example-button),
   renaming the copy to your desired component name.

2. Adjust the naming in the files, most importantly these lines in the
   `package.json` file:

   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/web-components/src/components/example-button/package.json#L2
   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/web-components/src/components/example-button/package.json#L8
   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/web-components/src/components/example-button/package.json#L13
   - https://github.com/carbon-design-system/carbon-labs/blob/main/packages/web-components/src/components/example-button/package.json#L32

3. Build your component. You can run the build for your new component from the
   root of the project using the `yarn build` command.

4. For testing and documentation purposes, a stackblitz example can be created
   and linked in the component's storybook documentation as shown in the
   [`example-button` storybook docs](https://labs.carbondesignsystem.com/react/?path=/docs/components-example-button--overview).
   - To do this, copy and paste the
     [`ExampleButton` example folder](https://github.com/carbon-design-system/carbon-labs/tree/main/examples/web-components/example-button)
     under the `carbon-labs/examples/web-components` folder and rename the copy
     to your component name.
   - [Add the stackblitz link](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/web-components/src/components/example-button/__stories__/example-button.mdx?plain=1#16-#L20)
     to your component storybook doc, making sure the link is pointing correctly
     to your example folder. **Note:** The example needs to be merged into
     `main` first before the stackblitz link is viewable.

## Submitting a Pull Request

1. Pull the latest main branch from `upstream`:

   ```
   $ git pull upstream main
   ```

2. Always work and submit pull requests from a branch. _Do not submit pull
   requests from the `main` branch of your fork_.

   ```
   $ git checkout -b { YOUR_BRANCH_NAME } main
   ```

3. Create your patch or feature.

4. Test your branch and add new test cases where appropriate.

5. Commit your changes using a descriptive commit message.

   ```
   $ git commit -m "chore(header): Update header with newest designs"
   ```

   **Note:** See
   [writing good commit messages](https://github.com/erlang/otp/wiki/Writing-good-commit-messages)
   for more details on commit messages.

   Carbon Labs also uses a commit format called
   [Conventional Commits](https://www.conventionalcommits.org). This format is
   used to help automate details about our project and how it changes. When
   committing changes, there will be a tool that automatically looks at commits
   and will check to see if the commit matches the format defined by
   Conventional Commits.

6. Once ready for feedback from other contributors and maintainers, **push your
   commits to your fork** (be sure to run `yarn ci-check` before pushing, to
   make sure your code passes linting and unit tests):

   ```
   $ git push origin { YOUR_BRANCH_NAME }
   ```

7. In Github, navigate to
   [carbon-design-system/carbon-labs](https://github.com/carbon-design-system/carbon-labs)
   and click the button that reads "Compare & pull request".

8. Write a title and description, then click "Create pull request".

   See
   [how to write the perfect pull request](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)
   for more details on writing good PRs.

9. Stay up to date with the activity in your pull request. Maintainers will be
   reviewing your work and making comments, asking questions and suggesting
   changes to be made before they merge your code. When you need to make a
   change, add, commit and push to your branch normally.

   Once all revisions to your pull request are complete, a maintainer will
   squash and merge your commits for you.
