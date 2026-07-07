# Carbon Token Snippets

> SCSS snippets for Carbon Design System tokens, mixins, and functions

This VSCode extension provides code snippets for Carbon Design System SCSS
development, making it easy to use Carbon tokens, mixins, and functions in your
stylesheets.

## Demo

![Demo](./packages/vscode-snippets-extension/demo.gif)

> Type `theme`, `type`, or `$spacing` to see snippets in action

## Features

- **Spacing Tokens** - Quick access to all Carbon spacing tokens ($spacing-01
  through $spacing-13)
- **Typography Styles** - Type style mixins for consistent typography
- **Motion Tokens** - Duration tokens and motion mixins
- **Theme Tokens** - Theme-related snippets
- **Utility Imports** - Quick @use imports for Carbon modules
- **BEM Patterns** - Block class BEM pattern generator
- **Linter Disables** - Stylelint disable comments

## Usage

After installation, snippets are available in all SCSS files. Start typing a
snippet prefix and VSCode will suggest completions.

### Example Snippets

#### Spacing Tokens

Type `$spa` or `$spacing` to see all spacing tokens:

```scss
$spacing-01  // 0.125rem (2px)
$spacing-05  // 1rem (16px)
$spacing-10  // 4rem (64px)
```

#### Typography

Type `type` or `$label`, `$body`, `$heading` to access typography styles:

```scss
@include type-style('label-01'); // Field labels
@include type-style('body-01'); // Body text
@include type-style('heading-01'); // Headings
```

#### Motion

Type `$duration` or `@include motion` for motion tokens:

```scss
$duration-fast-01      // 70ms
$duration-moderate-01  // 150ms
@include motion(entrance, productive);
```

#### Theme

Type `theme` or `$background`, `$layer`, `$text` to access theme tokens:

```scss
$background           // Default page background
$layer-01             // Container color
$text-primary         // Primary text color
```

#### Imports

Type `@use` followed by module name:

```scss
@use spacing // @use '@carbon/react/scss/spacing' as *;
  @use theme // @use '@carbon/react/scss/theme' as *;
  @use type; // @use '@carbon/react/scss/type' as *;
```

#### BEM Pattern

Type `block-class` to generate a BEM block class structure:

```scss
$block-class: 'component-name';

.#{$block-class} {
  // styles for $block-class
}
```

## Snippet Categories

### General

- Block class BEM pattern
- @use imports for Carbon modules (breakpoint, config, spacing, theme, type,
  motion)

### Spacing

- All spacing tokens ($spacing-01 through $spacing-13)
- Includes pixel and rem values in descriptions

### Typography

- All type-style mixins (code, label, helper-text, body, heading, display, etc.)
- Descriptive names for each style's use case

### Motion

- Duration tokens ($duration-fast-01, $duration-moderate-01, etc.)
- Motion mixins (@include motion)

### Theme

- Theme-related snippets and utilities

### Linter Disables

- Stylelint disable comments for common cases

## Compatibility

This extension works with:

- Visual Studio Code
- VSCode-based IDEs (Cursor, VSCodium, etc.)

## Related

This extension is part of the
[Carbon Labs](https://github.com/carbon-design-system/carbon-labs) project.

For project-level snippet installation via npm, see
[@carbon-labs/vscode-snippets](https://www.npmjs.com/package/@carbon-labs/vscode-snippets).

## License

Apache-2.0

## Contributing

This extension is part of the Carbon Labs monorepo. Contributions are welcome!

Visit the
[Carbon Labs repository](https://github.com/carbon-design-system/carbon-labs) to
contribute.
