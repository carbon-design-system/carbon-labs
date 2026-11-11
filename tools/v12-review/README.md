# v12 review

Every v12 component in one app, for reviewing the set: a side nav by category, a
searchable home, and one page per component with each of its stories, its
settings, its motion and its props. One set of picks (theme, density, corners,
reduced motion, clock, direction) applies to everything. The themes are v12
light (the default) and v12 dark; the header and the side nav stay v12 dark, and
the theme pick is the workspace's. A v11 theme kept from before is read as the
v12 theme of its side.
The side nav folds to a strip of its toggle and a search button, the filter's
field folding into the button.

It's built from the v12 components themselves (AppShell, Header, SideNav,
PageHeader, Tabs, Link, Search, Popover, the form controls) and driven by their
stories, so it can't drift from them: a new component shows up by itself. Each
page's title is in a ghost PageHeader; on a component's page its tabs go to each
section.

## Opening it

It runs inside the v12 Storybook's build, with none of Storybook around it:

```
<storybook>/v12/review-app
```

That short address opens the app's own page,
`<storybook>/iframe.html?id=v12-review--app&viewMode=story`, which works too.
Locally, with `STORYBOOK_INCLUDE_V12=true yarn storybook` in `packages/react`,
that's `http://localhost:6008/v12/review-app`. Each page has its own address
(`#/components/button`, and `#/components/button/kinds` for one story), and
links to the same story in Storybook.

## How a page is made

- **Stories:** each export of the component's stories file, in its own order,
  composed with its args and decorators (`composeStories`). The comment above
  each story is its description.
- **Settings:** the first story's args and the choices its file's `argTypes`
  give.
- **Text:** the summary and the sections of the component's docs page
  (`__stories__/<Name>.mdx`), read into `src/content.json` by
  `yarn workspace @carbon-labs/v12-review content`. Run it after changing a docs
  page; `content --check` fails when the map is out of date.
- **Motion:** the docs page's Motion and Reduced motion sections, and the motion
  items the stories declare in `parameters.v12`.
- **Props:** from the props information Storybook's build attaches to the
  component.

A component whose stories open over a page or fill one (`FRAMED` in
`src/categories.ts`) runs each story in a frame of its own, two at a time; the
rest run in the page, each in a stage that holds what it fixes to the screen.
The categories are shared with the catalog story.
