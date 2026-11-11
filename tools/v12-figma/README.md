# V12 design sync

The code side of keeping a design library in step with the v12 components. It
writes what code says about tokens, components, motion and docs as four
snapshots in `figma-sync/`, and checks in CI that they are current. A design
file's own snapshot, exported from the library, has the same shape; comparing
the two is a later step, and happens outside this repository.

Nothing here reads a design file or needs network access, and the snapshots hold
code facts only: the public repository never carries a design file's key or a
node's id.

## Commands

```sh
yarn v12:figma snapshot                    # writes all four
yarn v12:figma snapshot tokens components  # writes those
yarn v12:figma snapshot --check            # writes nothing; exits 1 when one is stale
```

CI runs `--check`. After a change to a theme, a proposal, a story's `argTypes`
or `parameters.v12`, a docs page, a mixed colour, the manifest or the
carbon-motion version, run `yarn v12:figma snapshot` and commit the files.

## The snapshots

Each file starts with its `schema` and `side: "code"`, and holds no commit, date
or path outside the repository, so the same tree always writes the same bytes.

- **`tokens.code.json`**: one entry per variable a library would hold, with its
  CSS name (`--cds-layer-01`), its name as a variable path (`layer/01`), its
  collection, type, status, scopes, first sentence of description, and a value
  per mode.
  - `v12 / Theme`: the v12 themes from
    `packages/react/.storybook/v12-themes/themes.json` in modes `v12-light` and
    `v12-dark` (hex, OKLCH and whether sRGB can show it), and Carbon's value of
    the same token in `white`, `g10`, `g90` and `g100`, from `@carbon/themes`,
    where Carbon has the token.
  - `v12 / Proposals`: each component's `proposals/tokens.json`. A value is an
    alias (`{ "alias": "--cds-layer-01" }`), a colour (the hex fallback, the
    OKLCH value and its gamut), or a dimension in px. White's value also serves
    `v12-light`, and g100's `v12-dark`, as in `proposals.scss`.
  - `v12 / Explorations`: the explorations with one numeric value.
  - `v12 / Motion`: carbon-motion's durations, easings, distances, scales and
    stagger steps, at the version the lane installs.
- **`components.code.json`**: one entry per manifest row, by its logical key
  (`v12/button`), with its `figma` block, story ids, docs id, the props a
  component property would carry (`VARIANT` with its values in code order,
  `BOOLEAN`, `TEXT`, `INSTANCE_SWAP`, `SLOT`), the props that never become one,
  the states and motion items from `parameters.v12`, its departures, and its
  mixed colours (below). A prop in the shared vocabulary, or in the row's
  `figma.props`, is marked `surface`.
- **`motion.code.json`**: every carbon-motion token with its status (from
  `docs/v12/motion-contract.md`) and value at 1x; the seam's exports; and per
  row, its motion items with the tokens each owns, its reduced behaviour and the
  seam names it imports.
- **`docs.code.json`**: per row with a docs page, its summary and first
  sentence, the description a library component starts with.

The stories are read without running them: option lists are followed through
imports to their constants. A list that cannot be read that way is kept as
`"values": null` with the source it came from, never guessed.

## Mixed colours

Many hover and press colours are mixed in the browser with `color-mix()`, mostly
in sRGB, a few in OKLCH or OKLab. A design file cannot evaluate that, and the
result depends on the cascade (custom properties, `currentColor`, the theme). So
each mixed colour is listed with its file, selector, property, state, colour
space and expression, and a value per theme that is a placeholder,
`{ "pending": "browser-render" }`, until a browser render fills it.

A render writes `figma-sync/state-colors.resolved.json`:

```json
{
  "entries": [
    {
      "row": "tag",
      "file": "packages/react/src/v12/components/Tag/components/tag.scss",
      "selector": ".cds-tag--selectable",
      "property": "--rollover-hover",
      "expression": "color-mix( in srgb, var(--cds-text-primary, #161616) 8%, transparent )",
      "values": { "white": { "hex": "#161616", "alpha": 0.08 } }
    }
  ]
}
```

The snapshot takes a value from it only while the expression is unchanged; after
a change the value is pending again and marked `"stale": true`.

## The manifest's `figma` block

Each manifest row may carry a block of logical names:

```json
"figma": { "key": "v12/button", "status": "unmapped" }
```

`status` is `unmapped` or `code-only` until a library export can be checked
against; `scaffolded`, `mapped` and `figma-only` are refused until then. A
code-only row has only a key and a status. Keys are unique and look like
`v12/<name>`. The check refuses an unknown field and anything shaped like a
node's id. A row without a block takes the default: `code-only` for style rows,
shared kits and providers, `unmapped` for the rest.

## Leaks

`yarn v12:check` reads this folder and `figma-sync/` for the lane's usual leaks
and for anything that identifies a design file: node ids, file keys and the
field names a private id map uses. A contrast ratio (`4.5:1`) is not an id.

## Known gaps

- Props come from the stories' `argTypes` and `args`, not from the components'
  types: a prop no story names is not listed.
- The density and shape collections are named as modes only; their values are
  not read yet.
- Nothing fills the mixed colours yet: every value is pending.
