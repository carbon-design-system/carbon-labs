# Support for Carbon v10

Carbon for AI is built on the latest major version of Carbon, v11. The most
streamlined path for usage of Carbon for AI and related assets such as the
`Slug` from `@carbon/react` is to have your project using v11. If your project
is not on v11, we first and foremost recommend migrating to v11 as soon as
possible.

For projects using Carbon v10 that can not yet migrate to v11, this document
outlines some "bridge solutions" - approaches a project can use to include
Carbon for AI and Carbon v11 assets in a project still using Carbon v10.

> [!CAUTION] This guidance largely pertains to the consumption of AI features
> that are enhancements of existing components in `@carbon/react` and
> `@carbon/web-components`. AI patterns that do not exist in these core Carbon
> libraries will be available as packages from the `Carbon for AI` library. If
> your application is on Carbon v11 (regardless of front-end framework), you
> will be able to consume the `Carbon for AI` components and patterns via NPM or
> IBM Akamai CDN. However, if your application is on Carbon v10 (regardless of
> front-end framework), you will still be able to consume the `Carbon for AI`
> components via IBM Akamai CDN.

> [!CAUTION] The bridge solutions outlined in this document are only meant to be
> a temporary, stopgap measure to bring in selective, business critical features
> until your project can migrate to v11.

So far we have identified two broad approaches:

- Use Carbon v11 package assets in a v10 application
- Use assets from a CDN in a v10 application

## Use Carbon v11 `@carbon/react` assets in a v10 application

It is possible to run v10 and v11 together without any strenuous configuration.
Package managers and bundlers handle duplicate transitive dependencies with
different versions just fine, though you do have to be aware of what's happening
and the potential caveats you can run into.

> [!NOTE]  
> [Here is a stackblitz example](https://stackblitz.com/edit/github-pdxjpu?file=package.json,src%2FApp.jsx,src%2Findex.scss,src%2Fextra-slug-styles.scss&preset=node=)
> showing it is possible to use various components and styles from v10 and v11
> together, including the new `Slug`.
>
> The example will take a few moments to load because it uses live sass
> compilation, which takes a bit to complete with v10 styles.

At a high level the process for using these together was:

1. Install and configure Carbon v10 - `carbon-components@10.x`,
   `carbon-components-react@7.x`, `carbon-icons@7.x` (or have an existing
   application using these v10 packages)
2. Install `@carbon/react`
3. Configure the `@carbon/react` styles with `@use`
4. Import v11 components from `@carbon/react` and icons from
   `@carbon/react/icons`

### Caveats

The complications we've seen are some teams running into odd errors stemming
from an additional layer of sub/transitive dependencies. Often, projects use
additional library(ies) that proxy Carbon v10, like Cloud PAL. Sometimes the
libraries don't fully proxy carbon but they
[list carbon as hard dependencies](https://github.com/carbon-design-system/ibm-products/blob/7994c5c13da6b467f5ecea5487b2bb8ff20e15bd/packages/security/package.json#L57-L66).

> [!IMPORTANT]  
> So far, **all the errors we've seen are only styling-based (sass) errors**. We
> haven't seen any javascript errors resulting from mixing v10 and v11. It
> commonly presents as Sass errors of "mixin not found", "... is not a number",
> etc. indicating the erroring stylesheet is looking for part of an API that
> can't be found in that version.

If a developer adds `@carbon/react` to their project, configures the styles, and
then sees an error, it's most likely due to the bundler using a v10 carbon
package/dependency when it should be using a v11 one. For instance,

1. A project is using Carbon v10 via `carbon-components@10.x` and
   `carbon-components-react@7.x`
2. A developer installs `@carbon/react` to the project.
3. Both `carbon-components-react@7.x` and `@carbon/react` list `@carbon/layout`
   as a dependency:

| `carbon-components-react@7.x`  | `@carbon/react@1.x`            |
| ------------------------------ | ------------------------------ |
| `"@carbon/layout": "^10.37.2"` | `"@carbon/layout": "^11.20.0"` |

If the developer brings in styles from `@carbon/layout`, which version is used,
v10 or v11? In our tests, it uses v10.

### Potential solutions

Approaches we've evaluated to get around this issue are:

1. Alias the package names
2. Isolate the styles

#### Option 1: Alias the package names

Any package can be aliased to a different name to prevent inadvertent conflicts.
For example:

```sh
npm install @carbon/layout-v11@npm:@carbon/layout@11
```

The goal with this approach is to avoid naming conflicts by either aliasing v10
packages, or the v11 packages. If you alias v10 package names, you'll have to
update all your existing imports. If you alias v11 packages, your existing
imports can stay the same, but new imports for v11 components will have to use
the alias. For these style-only errors, it may be easiest to install and alias
v11 packages.

The reason this works is because when the bundler goes to look for
`@carbon/layout` for instance, it will only use the non-aliased version. This
way you can then specify exactly when/where you want to bring in and use the
aliased version, `@carbon/layout-v11`.

#### Option 2: Isolate the styles

The goal with this approach is to totally separate the v10 and v11 styles into
separate stylesheets that are loaded independently via webpack.
[Here's an example](https://github.ibm.com/alchemy-containers/ui-dev/blob/master/lib/webpack/index.js)
from a cloud team using this approach.

The reason this works is that the imports/use statements are totally separate
from one another, which prevents the sass global namespace from being polluted
with invalid stylesheets from the other version. v10 styles import
`carbon-components` stylesheets and related sub-dependencies. v11 styles
`@use '@carbon/react` stylesheets and related sub-dependencies.

For bundlers other than webpack it may be more difficult to separate these into
isolated execution contexts.

### Impacts to bundle size

Bundle size will temporarily increase with these approaches. Most teams that
have taken this route are okay with paying this bundle-size "price" to
facilitate the migration. It's only temporary, and eventually they will be able
to remove the `carbon-components` styles and `carbon-components-react` js once
they're fully migrated to v11.

#### Impact to javascript bundle size

For javascript imports, treeshaking will still work as you'd expect to only
bring in the components you end up using. Icons are bucketed in both v10 and
v11, and if you import a `@carbon/react` component that uses an icon, a
collection of new icons in the same bucket will end up in your bundle.

##### Mitigation

You can reduce the likelihood of this by avoiding using `@carbon/react/icons`
until you migrate all your icon usages at once. We have a codemod available
through `@carbon/upgrade` to assist with
[this migration](https://carbondesignsystem.com/migrating/guide/develop#step-5:-update-icon-sizes-and-imports).

```
npx @carbon/upgrade migrate icons-react-size-prop --write
npx @carbon/upgrade migrate update-carbon-icons-react-import-to-carbon-react --write
```

#### Impact to style/css bundle size

Style bundle size is going to increase because you're including new styles for
v11. Most v10 projects are going to already be loading all the styles available
through `carbon-components`, then by adding `@carbon/react` styles it'll
probably nearly double in size of total final css output. These two packages use
different prefixes for all the selectors so there's no risk of conflicts, but
there's effectively quite a bit of duplication while you're running both
packages at the same time.

##### Mitigation

You can mitigate the scope of this increase by selectively `@import` or `@use`
only the styles you need.
[Here's an updated version of my initial example](https://stackblitz.com/edit/github-pdxjpu-15f9fc?file=src%2Findex.scss&preset=node=)
that only brings in the individual style modules required for the components on
the page: `Button`, `Accordion`, `Slug` (and therefore `Toggletip`, but this
will be included automatically in the future,
https://github.com/carbon-design-system/carbon/issues/15341).

### Things to avoid

We've seen the following things cause issues:

- Don't `@use` or `@import` `@carbon/styles`, use `@carbon/react` instead
- Don't `@use` or `@import` elements packages (`@carbon/colors`, `@carbon/grid`,
  etc.) directly, use the re-exports from `@carbon/react` -
  `@carbon/react/scss/colors`, `@carbon/react/scss/grid`, etc.)
- Avoid bringing in anything more than you're using - avoid things like
  `import * from '@carbon/react'`;
- Don't deduplicate dependencies. You want multiple versions of carbon packages
  when using both versions together.
- [`overrides`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) -
  these can be incredibly tricky to get right. Only use them as a last resort.
  Since we want to use multiple versions of the same dependency, you have to be
  careful and use nesting to ensure you're only overriding the sub-dependency
  you intend to. This may be quite deep depending on your dependency tree.

### Is it worth it?

It depends on what your team views as an acceptable risk and amount of
potentially incurred technical debt from this approach for your current
application stack. For some teams, this additional overhead is worth it to bide
time avoiding a full migration to v11 right now. For others, they'd prefer to
work on the actual v11 migration instead of adding more tech debt to their
stack. The decision also heavily relies on if the project is using 1 or more PAL
libraries, and how intense the configuration of those styles is.

This thinking applies to all the approaches outlined in this document whether it
be v10/v11 react mixed use, using web-components in a react/angular app, or
using assets from a CDN. The end result is the same: the project fulfills the
immediate need of being able to use v11 things like `Slug` but each path
ultimately results in additional tech debt to be paid off later.

## Use assets from IBM's Akamai CDN (hosted by IBM corporate webmaster team) in a v10 application

This approach will be documented in more depth soon.

### Caveats

### Solution

### Impacts to bundle size

### Things to avoid

### Is it worth it?
