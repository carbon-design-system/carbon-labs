# Carbon Motion Workshop

A component exploration workspace for **Carbon v12** motion and interaction patterns,
built with React + TypeScript + Storybook.

## Components

| Component | Description |
|-----------|-------------|
| **SkeletonLoader** | Progressive-reveal skeleton with staggered animation |
| **Processing** | In-progress state indicator with status transitions |
| **ContentSwitcher** | Segmented control with keyboard navigation |
| **LoadingSpinner** | Indeterminate circular spinner |
| **IndeterminateBarLoader** | Linear indeterminate progress bar |
| **UniversalPromptBar** | AI prompt input bar |
| **MotionAvatar** | Animated presence indicator for AI states |

## Local development

```bash
cd carbon-motion-workshop
npm install
npm run storybook
```

Storybook starts at [http://localhost:6006](http://localhost:6006).

## Building Storybook

```bash
npm run build-storybook
```

Outputs to `storybook-static/`.

## Deployed review site

The Storybook is automatically deployed to GitHub Pages on every push to `main`
(when files under `carbon-motion-workshop/` change):

```
https://<org>.github.io/<repo>/workshop/
```

Replace `<org>` and `<repo>` with the actual GitHub organisation and repository names.

## Token layer

All components use a `--cmw-*` CSS custom property layer defined in `src/tokens/`.
See [`src/tokens/README.md`](src/tokens/README.md) for the full reference.

## Structure

```
carbon-motion-workshop/
├── .storybook/          # Storybook config (main.ts, preview.tsx)
├── src/
│   ├── components/      # 7 React components (TSX + CSS Modules)
│   ├── hooks/           # useAnimation, useReducedMotion, useSkeletonAnimation
│   ├── stories/         # CSF3 story files + Introduction.mdx
│   ├── tokens/          # --cmw-* token layer (index, themes, motion)
│   ├── index.css        # Global styles entry point
│   └── main.tsx         # App entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
