/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { readPage } from './content.js';

describe('a docs page read for the app', () => {
  it('keeps the title, the summary and the sections, and drops the JSX and Props', () => {
    const mdx = [
      "import { Canvas, Meta } from '@storybook/addon-docs/blocks';",
      "import * as S from './X.stories.tsx';",
      '',
      '<Meta of={S} />',
      '',
      '# Thing',
      '',
      'What it is.',
      '',
      '<Canvas',
      '  of={S.Default}',
      '/>',
      '',
      '## Motion',
      '',
      '- It moves.',
      '',
      '## Props',
      '',
      '<ArgTypes of={S} />',
    ].join('\n');
    expect(readPage(mdx)).toEqual({
      title: 'Thing',
      summary: 'What it is.',
      sections: [{ title: 'Motion', text: '- It moves.' }],
    });
  });

  it('drops a row of links under the title, and takes the Overview when there is no summary', () => {
    const mdx = [
      '# Date picker',
      '[Source](https://x.test)',
      '&nbsp;|&nbsp;',
      '[Usage](https://y.test)',
      '## Table of contents',
      '- Overview',
      '## Overview',
      'A field for a date.',
    ].join('\n');
    expect(readPage(mdx)).toEqual({
      title: 'Date picker',
      summary: 'A field for a date.',
      sections: [{ title: 'Overview', text: 'A field for a date.' }],
    });
  });

  it('leaves out the owner block, MDX comments and the blocks they mark', () => {
    const mdx = [
      '# Chip',
      '',
      '- **Initiative owner(s):** A. Person (@someone)',
      '- **Status:** Draft',
      '- **Target library:** @carbon/react',
      '- **Target library maintainer(s) / PR Reviewer(s):** to be named by the',
      '  initiative owner',
      '- **Support channel:** `#carbon-labs`',
      '',
      '{/* report:status */}',
      '> **Readiness:** not ready.',
      '{/* /report:status */}',
      '{/* <!-- START doctoc generated TOC --> */}',
      '',
      '## Overview',
      '',
      '{/* create:problem-statement */}',
      '{/*',
      ' * Replace this block.',
      ' */}',
      'A chip for a file.',
    ].join('\n');
    expect(readPage(mdx)).toEqual({
      title: 'Chip',
      summary: 'A chip for a file.',
      sections: [{ title: 'Overview', text: 'A chip for a file.' }],
    });
  });
});
