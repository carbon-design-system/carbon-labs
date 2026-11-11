/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The review app (tools/v12-review), in the v12 Storybook's own build so it
// runs on the same stories, styles and props. Open it on its own, with none
// of Storybook round it: v12/review-app, which opens
// iframe.html?id=v12-review--app&viewMode=story (../static).

import React from 'react';
import { ReviewApp } from '@carbon-labs/v12-review';
import type { StoryFiles } from '@carbon-labs/v12-review';

/** The bundler's `require.context`; it reads each call as written, so each is spelled out. */
type Context = StoryFiles & ((key: string) => ReturnType<StoryFiles>);
interface Bundler {
  context: (dir: string, deep: boolean, re: RegExp, mode: 'lazy') => Context;
}

/** Every component's story file, loaded when its page opens. */
const components = (require as unknown as Bundler).context(
  '../../components',
  true,
  /^\.\/[^/]+\/__stories__\/[^/]+\.stories\.tsx$/,
  'lazy'
);

/** The experiences (apps built from the components), each read as a component's folder. */
const experiences = (require as unknown as Bundler).context(
  '../../experiences/__stories__',
  false,
  /^\.\/[^/]+\.stories\.tsx$/,
  'lazy'
);
const EXPERIENCE = /^\.\/([^/]+)\/__stories__\/\1\.stories\.tsx$/;
const stories: StoryFiles = Object.assign(
  (key: string) => {
    const m = EXPERIENCE.exec(key);
    return m && !components.keys().includes(key)
      ? experiences(`./${m[1]}.stories.tsx`)
      : components(key);
  },
  {
    keys: () => [
      ...components.keys(),
      ...experiences
        .keys()
        .map((k) =>
          k.replace(
            /^\.\/([^/]+)\.stories\.tsx$/,
            './$1/__stories__/$1.stories.tsx'
          )
        ),
    ],
  }
);

export default {
  title: 'V12/Review',
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    v12: { app: true, motion: [], reduced: {}, states: ['rest'] },
    // The review app is a whole site, not a component: an accessibility scan
    // after each render blocks the page for seconds. Each component's own
    // stories keep their checks.
    a11y: { disable: true },
  },
};

/** The review app. It applies its own picks; Storybook's toolbar doesn't reach it. */
export const App = {
  render: () => <ReviewApp stories={stories} />,
};
