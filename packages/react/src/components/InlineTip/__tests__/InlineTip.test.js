/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { InlineTip } from '../components/InlineTip';
import { InlineTipButton } from '../components/InlineTipButton';
import { InlineTipLink } from '../components/InlineTipLink';
import { getComponentText } from '../components/utils';

jest.mock('../components/inline-tip.scss', () => ({}));

const blockClass = 'clabs--inline-tip';
const componentName = InlineTip.displayName;

const title = 'Tip title';
const children = 'hello, world';
const buttonLabel = 'Click me';
const tertiaryButtonLabel = 'Show me';
const linkLabel = 'Learn more';
const readMoreLabel = 'Read more';
const readLessLabel = 'Read less';
const className = 'test-class-name';
const dataTestId = 'inline-tip-test';

describe(componentName, () => {
  it('renders a complementary InlineTip', () => {
    render(<InlineTip title={title}>{children}</InlineTip>);
    expect(screen.getByRole('complementary')).toHaveClass(blockClass);
  });

  it('renders the title and labels the region with it', () => {
    render(<InlineTip title={title}>{children}</InlineTip>);
    const heading = screen.getByRole('heading', { name: title });
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'aria-labelledby',
      heading.id
    );
  });

  it('renders children', () => {
    render(<InlineTip title={title}>{children}</InlineTip>);
    expect(screen.getByText(children)).toBeInTheDocument();
  });

  it('renders an InlineTipButton action', () => {
    render(
      <InlineTip
        title={title}
        action={<InlineTipButton>{buttonLabel}</InlineTipButton>}>
        {children}
      </InlineTip>
    );
    expect(screen.getByText(buttonLabel)).toHaveClass(`${blockClass}__button`);
  });

  it('renders an InlineTipLink action', () => {
    render(
      <InlineTip
        title={title}
        action={
          <InlineTipLink href="https://www.ibm.com" target="_blank">
            {linkLabel}
          </InlineTipLink>
        }>
        {children}
      </InlineTip>
    );
    expect(screen.getByText(linkLabel).closest('a')).toHaveClass(
      `${blockClass}__link`
    );
  });

  it('renders the close button and calls onClose', async () => {
    const onClose = jest.fn();
    render(
      <InlineTip title={title} onClose={onClose}>
        {children}
      </InlineTip>
    );
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses closeIconDescription as the close button label', () => {
    render(
      <InlineTip title={title} closeIconDescription="Dismiss tip">
        {children}
      </InlineTip>
    );
    expect(
      screen.getByRole('button', { name: 'Dismiss tip' })
    ).toBeInTheDocument();
  });

  it('renders the tertiary button and calls onClick', async () => {
    const onClick = jest.fn();
    render(
      <InlineTip
        title={title}
        tertiaryButtonLabel={tertiaryButtonLabel}
        onClick={onClick}>
        {children}
      </InlineTip>
    );
    await userEvent.click(screen.getByText(tertiaryButtonLabel));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders collapsed and expands when the toggle is clicked', async () => {
    const { container } = render(
      <InlineTip
        title={title}
        collapsible
        expandButtonLabel={readMoreLabel}
        collapseButtonLabel={readLessLabel}
        action={<InlineTipButton>{buttonLabel}</InlineTipButton>}>
        {children}
      </InlineTip>
    );
    expect(screen.getByText(readMoreLabel)).toBeInTheDocument();
    expect(
      container.querySelector(`.${blockClass}__preview-text`)
    ).toBeInTheDocument();
    // The action is hidden while collapsed
    expect(screen.queryByText(buttonLabel)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: readMoreLabel }));
    expect(screen.getByText(readLessLabel)).toBeInTheDocument();
    expect(
      container.querySelector(`.${blockClass}__preview-text`)
    ).not.toBeInTheDocument();
    expect(screen.getByText(buttonLabel)).toBeInTheDocument();
  });

  it('disables the collapse toggle when media is rendered', () => {
    render(
      <InlineTip
        title={title}
        collapsible
        expandButtonLabel={readMoreLabel}
        renderMedia={() => <img alt="img" src="image.png" />}>
        {children}
      </InlineTip>
    );
    expect(screen.queryByText(readMoreLabel)).not.toBeInTheDocument();
  });

  it('renders media', () => {
    render(
      <InlineTip
        title={title}
        renderMedia={() => <img alt="img" src="image.png" />}>
        {children}
      </InlineTip>
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toHaveClass(
      `${blockClass}__has-media`
    );
  });

  it('renders the wide format by default', () => {
    render(<InlineTip title={title}>{children}</InlineTip>);
    expect(screen.getByRole('complementary')).toHaveClass(
      `${blockClass}__wide`
    );
  });

  it('renders the narrow format', () => {
    render(
      <InlineTip title={title} narrow>
        {children}
      </InlineTip>
    );
    expect(screen.getByRole('complementary')).toHaveClass(
      `${blockClass}__narrow`
    );
  });

  it('applies the left gutter only when not narrow', () => {
    const { rerender } = render(
      <InlineTip title={title} withLeftGutter>
        {children}
      </InlineTip>
    );
    expect(screen.getByRole('complementary')).toHaveClass(
      `${blockClass}__with-left-gutter`
    );
    rerender(
      <InlineTip title={title} withLeftGutter narrow>
        {children}
      </InlineTip>
    );
    expect(screen.getByRole('complementary')).not.toHaveClass(
      `${blockClass}__with-left-gutter`
    );
  });

  it('applies className to the containing node', () => {
    render(
      <InlineTip title={title} className={className}>
        {children}
      </InlineTip>
    );
    expect(screen.getByRole('complementary')).toHaveClass(className);
  });

  it('adds additional props to the containing node', () => {
    render(
      <InlineTip title={title} data-testid={dataTestId}>
        {children}
      </InlineTip>
    );
    expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
  });

  it('forwards a ref to the containing node', () => {
    const ref = React.createRef();
    render(
      <InlineTip title={title} ref={ref}>
        {children}
      </InlineTip>
    );
    expect(ref.current).toHaveClass(blockClass);
  });
});

describe('InlineTipButton', () => {
  it('applies className and forwards a ref', () => {
    const ref = React.createRef();
    render(
      <InlineTipButton className={className} ref={ref}>
        {buttonLabel}
      </InlineTipButton>
    );
    expect(ref.current).toHaveClass(className);
    expect(ref.current).toHaveClass(`${blockClass}__button`);
  });
});

describe('InlineTipLink', () => {
  it('applies className and forwards a ref', () => {
    const ref = React.createRef();
    render(
      <InlineTipLink className={className} href="https://www.ibm.com" ref={ref}>
        {linkLabel}
      </InlineTipLink>
    );
    expect(ref.current).toHaveClass(className);
    expect(ref.current).toHaveClass(`${blockClass}__link`);
  });
});

describe('getComponentText', () => {
  it('joins the text of nested React nodes', () => {
    const nodes = [
      'plain',
      <b key="b">bold</b>,
      <span key="s">
        <i>italic</i>
      </span>,
    ];
    expect(getComponentText(nodes)).toBe('plain bold italic');
  });

  it('returns a single space for a node without text', () => {
    expect(getComponentText(<hr />)).toBe(' ');
  });
});
