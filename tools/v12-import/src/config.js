/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Where the source keeps its parts, where they land in the lane, and how
// each kind of import is rewritten.

export const CONFIG = {
  source: {
    name: 'carbon-next',
    kitRoot: 'packages/kit/src',
    kitPackage: '@carbon-next/kit',
    docs: 'docs/components',
    ledger: 'docs/carbon-labs/departures-ledger.md',
    // The content check's list of names that never go in public text.
    names: 'scripts/check-content.mjs',
  },
  target: {
    lane: 'packages/react/src/v12/components',
    seamIndex: 'packages/v12-motion/src/index.ts',
    manifest: 'v12.manifest.json',
    telemetry: 'packages/react/src/v12/components/DatePicker/telemetry.yml',
    labsPrefix: '@carbon-labs/react-',
    // A lane package named other than its kit folder, where the folder's own
    // name is another workspace's.
    laneNames: { processing: 'processing-v2', 'date-picker': 'date-picker-v2' },
    // A lane folder named other than its kit folder, where the folder is
    // another package's (carbon-labs' own v12 DatePicker): its stories' title
    // follows the folder; the component keeps its name.
    laneFolders: { 'date-picker': 'DatePickerV2' },
  },
  seam: {
    js: '@carbon-labs/v12-motion',
    scss: '@carbon-labs/v12-motion/scss',
    // The seam's package, whose subpaths (`./selection`, from
    // `src/selection.ts`) each forward one carbon-motion module whole.
    packageJson: 'packages/v12-motion/package.json',
    // carbon-motion's token layer, which every v12 page loads: the first
    // that exists, in the carbon-labs checkout.
    tokensCss: [
      'packages/v12-motion/es/tokens.css',
      'node_modules/@carbon-labs/motion-core/tokens/tokens.css',
    ],
    // carbon-motion's packages by their published names: a package the tool
    // brings whole imports them so.
    published: {
      '@carbon-motion/core': '@carbon-labs/motion-core',
      '@carbon-motion/react': '@carbon-labs/motion-react',
    },
    from: [
      /^@carbon-motion\/(core|react)(\/.*)?$/,
      /^@carbon-next\/motion-core(\/.*)?$/,
    ],
  },
  styles: {
    // The kit's shared styles folder and the lane package it moves to.
    folder: 'styles',
    package: '@carbon-labs/v12-styles',
    scss: '@carbon-labs/v12-styles/scss',
    // Where `--styles` writes the partials, in the package.
    dir: 'packages/v12-styles',
    src: 'src/styles',
  },
  // Imports that stay as they are.
  passthrough: [
    'react',
    'react-dom',
    '@carbon/react',
    '@carbon/styles',
    '@carbon/icons-react',
    'classnames',
  ],
  passthroughPrefixes: ['@carbon-labs/'],
  // A package with tests runs them with vitest, as the kit does.
  testRunner: { vitest: '^4.0.0' },
  // Where test-only packages' versions are read when the root has none.
  versionsFrom: ['package.json', 'packages/react/package.json'],
  // Allowed in test files only.
  testOnly: [
    'vitest',
    '@testing-library/react',
    '@testing-library/user-event',
    '@testing-library/jest-dom',
  ],
  classPrefix: { from: 'cn', to: 'cds' },
  docSections: {
    keep: [
      'Summary',
      'Anatomy',
      'Props',
      'Motion',
      'Reduced motion',
      'Accessibility',
    ],
    drop: ['Decisions', 'Open questions', 'History'],
  },
  // Sentences in a doc's opening paragraph that point into the source repo.
  pointerWords: ['Page', 'Code', 'History', 'Spec', 'Lab', 'Tracker'],
  package: { private: true, labsStatus: 'draft' },
  // Times in a kit folder that are not motion, each with why: allowed, and
  // reported as warnings.
  kitLiterals: {
    'text-input': [
      {
        file: /^components\/text-input\.scss$/,
        match: /\b600000s$/,
        why: 'the autofill hold: a transition long enough that the wash never paints, not a clock',
      },
    ],
  },
  // Whole packages, brought with `--package <id>`: their tree as it is, each
  // root under the target, with the files that don't travel left out.
  packages: {
    'motion-icons-core': {
      from: 'packages/motion-icons-core',
      roots: { src: 'src', test: 'test' },
      tests: ['test/'],
      // Beside the other v12 packages outside the lane (`v12-motion`).
      to: 'packages/v12-motion-icons-core',
      name: '@carbon-labs/motion-icons-core',
      title: 'V12 motion icons core',
      description:
        "Carbon Labs - the motion icons' engine and every icon's spec, framework-free",
      kind: 'core',
      skip: [
        // The optional frameloop adapter on `motion`, which the lane leaves out.
        /^src\/adapters\/motionAnimate\.ts$/,
        /^test\/motion\//,
        // Compared with the source repository's history, which doesn't travel.
        /^test\/parity\//,
        // Builds the package with the source repository's scripts.
        /^test\/dev-switch\.test\.ts$/,
      ],
      // The engine's tween is checked against motion's, frame by frame.
      testOnly: { motion: '^12.0.0 || ^13.0.0' },
      literals: [
        {
          file: /^(src\/ink\.ts|test\/ink\.test\.ts)$/,
          match: /^1ms$/,
          why: 'a 1ms fill transition, so the browser reports the fill colour: not a timing',
        },
      ],
      vitest: {
        include: ['test/**/*.test.{ts,tsx}'],
        // The geometry suites sample every frame of every icon.
        testTimeout: 600000,
        hookTimeout: 120000,
      },
    },
    'motion-icons': {
      from: 'packages/motion-icons',
      roots: { src: '' },
      tests: ['__tests__/'],
      to: 'packages/react/src/v12/components/MotionIcons',
      name: '@carbon-labs/react-motion-icons',
      title: 'V12 motion icons',
      description: 'Carbon Labs - MotionIcons for React (v12)',
      kind: 'lane',
      // The galleries name the web components' tags.
      renames: 'elements',
      // Entries beside the index, each a subpath: `./clock`.
      entries: ['clock.ts'],
      skip: [
        // The optional `motion` entry and what only it uses.
        /^src\/motion\.ts$/,
        /^src\/motion\/FollowMotionConfig\.ts$/,
        /^src\/__tests__\/motionEntry\.test\.tsx$/,
        // A development page, and the source's overview: the docs page comes
        // from the component doc instead.
        /^src\/__dev__\//,
        /^src\/icons\/Overview\.mdx$/,
      ],
      // The stories and the galleries they render, in `__stories__/`.
      stories: {
        files: [
          /^src\/icons\/[\w.]*(Gallery|Page|galleryKit|statusControls|behaviours)[\w.]*\.tsx?$/,
          /^src\/icons\/[\w.]+\.stories\.tsx$/,
        ],
        title: 'V12/Motion Icons',
        doc: 'docs/components/motion-icons.md',
        name: 'MotionIcons',
        // The web components' live examples, beside the galleries: their
        // imports of the elements' sources take the package's exports.
        extra: [
          {
            from: 'packages/motion-icons-wc/docs',
            files: [/^WebComponents\.stories\.tsx$/],
            imports: [
              [
                /^\.\.\/src\/icons\/([\w-]+)\/index$/,
                '@carbon-labs/wc-motion-icons/icons/$1',
              ],
              [
                /^\.\.\/src\/motion-icon$/,
                '@carbon-labs/wc-motion-icons/motion-icon',
              ],
            ],
          },
        ],
      },
      testOnly: {},
      literals: [
        {
          file: /^__tests__\/inkAttach\.test\.tsx$/,
          match: /^1ms$/,
          why: 'the 1ms fill transition the core sets: not a timing',
        },
        {
          file: /^__tests__\/icons\/statusSuite\.ts$/,
          match: /^\d+ms$/,
          why: "frame times in the known slivers' keys: not a timing",
        },
        {
          file: /^__stories__\/behaviours\.tsx$/,
          match: /^\d+ms$/,
          why: "the gallery's prose giving the tokens' values: not a timing",
        },
      ],
      vitest: {
        include: ['__tests__/**/*.test.{ts,tsx}'],
        setupFiles: ['__tests__/setup.ts'],
        globals: true,
        // The geometry suites rasterise every hover frame.
        testTimeout: 120000,
      },
    },
    'motion-icons-wc': {
      from: 'packages/motion-icons-wc',
      roots: { src: 'src', test: 'test' },
      tests: ['test/'],
      // The manifest beside the package, as the lane's web components have it.
      rootFiles: ['custom-elements.json'],
      // Beside the core, under the lint the other imported v12 packages take.
      to: 'packages/v12-motion-icons-wc',
      name: '@carbon-labs/wc-motion-icons',
      title: 'V12 motion icons (web components)',
      description:
        'Carbon Labs - the motion icons as custom elements (Lit), on the same engine',
      kind: 'core',
      renames: 'elements',
      // Lit's properties: class fields don't shadow its accessors.
      compilerOptions: { useDefineForClassFields: false },
      // Copied beside the modules after tsc.
      assets: ['src/preupgrade.css', 'src/carbon-compat.css'],
      exports: {
        './icons/*': './es/icons/*/index.js',
        './elements/*': './es/icons/*/*.js',
        './define': './es/define-all.js',
        './motion-icon': './es/motion-icon.js',
        './ssr': './es/ssr.js',
        './runtime': './es/runtime.js',
        './clock': './es/clock.js',
        './preupgrade.css': './es/preupgrade.css',
        './carbon-compat.css': './es/carbon-compat.css',
        './custom-elements.json': './custom-elements.json',
      },
      skip: [
        // The optional `motion` entry, as in the React package.
        /^src\/motion\.ts$/,
        // Check the source's own build, scripts and prefixed copies.
        /^test\/(dist|dev-switch|define-fields)\.test\.ts$/,
      ],
      // What registers an element on import.
      sideEffects: [
        './es/define-all.js',
        './es/icons/*/index.js',
        './es/motion-icon.js',
        '*.css',
      ],
      customElements: 'custom-elements.json',
      literals: [],
      vitest: {
        include: ['test/**/*.test.{ts,tsx}'],
        // The parity shards sample every frame of every icon.
        testTimeout: 600000,
        hookTimeout: 120000,
      },
    },
  },
  // The source's package names, as the lane names them.
  packageMap: {
    '@carbon-next/motion-icons-core': '@carbon-labs/motion-icons-core',
    '@carbon-next/motion-icons-wc': '@carbon-labs/wc-motion-icons',
    '@carbon-next/motion-icons': '@carbon-labs/react-motion-icons',
  },
  // The web components' names as carbon-labs has its elements: the
  // registration prefix makes the tags (`clabs-motion-icon-copy`), the events
  // and the pip; the generic element is `clabs-motion-icon`.
  elementRenames: [
    [/(?<![\w$-])cn-motion-icon(?![\w-])/g, 'clabs-motion-icon'],
    [/\$\{prefix\}-motion-icon\b/g, '${prefix}-icon'],
    [/(?<![\w-])cn-(icon-|status-pip)/g, 'clabs-motion-$1'],
    [/\bprefix = (["'])cn\1/g, 'prefix = $1clabs-motion$1'],
    [/\bCNMotionIcon\b/g, 'ClabsMotionIcon'],
    [/\bCN(Icon|StatusPip)(?=[A-Z0-9]|\b)/g, 'ClabsMotion$1'],
  ],
  // A package's own dependencies, kept as they are, with their ranges; `seam`
  // takes the seam's range for it.
  packageDependencies: {
    '@carbon/icons': '^11.89.0 || ^12.0.0',
    '@carbon-labs/motion-core': 'seam',
    lit: '^3.1.0',
  },
  // Allowed in a package's tests only, besides `testOnly`.
  packageTestOnly: ['@carbon/icons-react', 'react-dom', /^node:/],
};
