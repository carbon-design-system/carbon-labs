/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CodeSnippet } from '../components/CodeSnippet';
import { InlineCode } from '../components/InlineCode';
import { highlight } from '../components/highlight';

const long = Array.from({ length: 12 }, (_, i) => `const a${i} = ${i};`).join(
  '\n'
);

describe('CodeSnippet', () => {
  it('shows the language and the line count, and names the code region', () => {
    render(<CodeSnippet language="JavaScript" code={'a();\nb();'} />);
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('2 lines')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'JavaScript code' })
    ).toBeInTheDocument();
  });

  it('keeps the line numbers out of the accessibility tree', () => {
    const { container } = render(<CodeSnippet code={'a();\nb();'} />);
    const numbers = container.querySelector('.cds--code-snippet__numbers');
    expect(numbers).toHaveAttribute('aria-hidden', 'true');
    expect(numbers?.textContent).toBe('1\n2');
  });

  it('collapses code longer than collapsedLines, and Show more opens it', () => {
    const onExpandedChange = jest.fn();
    render(
      <CodeSnippet
        code={long}
        collapsedLines={9}
        onExpandedChange={onExpandedChange}
      />
    );
    const toggle = screen.getByRole('button', { name: 'Show more' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('shows short code whole, with no toggle', () => {
    render(<CodeSnippet code="a();" />);
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull();
  });

  it('copies the code exactly and says Copied', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = jest.fn();
    render(<CodeSnippet code={'a();\nb();'} onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    });
    expect(writeText).toHaveBeenCalledWith('a();\nb();');
    expect(onCopy).toHaveBeenCalledWith('a();\nb();');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('colours tokens, and highlight false shows plain code', () => {
    const { container, rerender } = render(
      <CodeSnippet code="const gulp = require('gulp');" />
    );
    expect(
      container.querySelector('.cds--code-snippet__token--keyword')
    ).toHaveTextContent('const');
    expect(
      container.querySelector('.cds--code-snippet__token--function')
    ).toHaveTextContent('require');
    expect(
      container.querySelector('.cds--code-snippet__token--string')
    ).toHaveTextContent("'gulp'");
    rerender(
      <CodeSnippet code="const gulp = require('gulp');" highlight={false} />
    );
    expect(container.querySelector('[class*="__token--"]')).toBeNull();
  });
});

describe('highlight', () => {
  it('covers every character, in order', () => {
    const source = "// note\nconst x = f(1, 'two'); # tail";
    expect(
      highlight(source)
        .map((token) => token.text)
        .join('')
    ).toBe(source);
  });
});

describe('InlineCode', () => {
  it('renders a code element with the cds class', () => {
    render(<InlineCode className="custom">page.py</InlineCode>);
    const node = screen.getByText('page.py');
    expect(node.tagName).toBe('CODE');
    expect(node).toHaveClass('cds--inline-code', 'custom');
  });
});
