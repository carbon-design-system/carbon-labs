# v12 explorations

The one shared reference for **explorations**: styles a v12 component is trying
that Carbon v12 has not decided. Each is temporary. It evolves inline, and it
becomes a recommendation for v12 or it is removed.

- `radius-field` (radius): 6px (0.375rem). Would become: new.
- `corner-smoothing` (smoothing): 40%. Would become: new.
- `hover-emboss` (elevation): raised: drop 0 2px 4px 0 black @0.20; inset 0 1px
  0.5px 0 white @0.28; inset 0 -1px 0.5px 0 black @0.18. Would become: new.
- `elevated` (elevation): drop 0 8px 24px 2px black @0.40. Would become:
  box-shadow.
- `primary-rest` (other): rest
  $text-primary fill / $text-inverse label; hover
  $button-primary-hover; active
  $button-primary-active; selected
  $button-primary. Would become:
  button-primary.

## Using one

```scss
@use '../../../explorations' as explore;

.#{$prefix}--probe {
  // @carbon-explore radius-field — fields read as touchable, not as buttons. TBD
  border-radius: explore.$explore-radius-field;
}
```

- **Mark every use** with `// @carbon-explore <name> — <reason>. <ref>` on the
  line above. `<ref>` is `carbon#NNNN`, `carbon-labs#NNNN` or `TBD`.
- **Take the value from here.** Never copy it, never re-declare an `explore-*`
  locally, and never `@use` this module `with (…)`.
- **A new exploration** is an entry in `explorations.json` and a declaration in
  `_index.scss`, in the same PR.

## At graduation

Every use is resolved before its component leaves labs. Either it is adopted,
becoming a `@carbon-proposal` with its token in `proposals/tokens.json`, or it
is removed. A component never reaches core carrying an exploration, so nothing
graduates as a one-off copy. `graduation-ready` names every unresolved use.
