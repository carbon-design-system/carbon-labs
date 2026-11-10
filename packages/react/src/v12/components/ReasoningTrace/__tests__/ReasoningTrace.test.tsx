/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReasoningTrace } from '../components/ReasoningTrace';
import { ReasoningStep } from '../components/ReasoningStep';

describe('ReasoningTrace', () => {
  it('is a disclosure: the header controls the panel', () => {
    const onOpenChange = jest.fn();
    const { container } = render(
      <ReasoningTrace
        label="Complete"
        duration="1m 48s"
        onOpenChange={onOpenChange}>
        <ReasoningStep label="Read files" />
      </ReasoningTrace>
    );
    const header = screen.getByRole('button', { name: /Complete/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    const panel = container.querySelector(
      `#${CSS.escape(header.getAttribute('aria-controls') ?? '')}`
    );
    expect(panel).not.toHaveClass('cds--reasoning-trace__panel--open');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveClass('cds--reasoning-trace__panel--open');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('leads with the thinking animation only while thinking', () => {
    const { container, rerender } = render(
      <ReasoningTrace label="Thinking" status="running" />
    );
    expect(container.querySelector('.cds--thinking-indicator')).not.toBeNull();
    rerender(
      <ReasoningTrace label="Running" status="running" thinking={false} />
    );
    expect(container.querySelector('.cds--thinking-indicator')).toBeNull();
    rerender(<ReasoningTrace label="Complete" status="complete" thinking />);
    expect(container.querySelector('.cds--thinking-indicator')).toBeNull();
  });

  it('announces when it resolves', () => {
    const { container, rerender } = render(
      <ReasoningTrace label="Thinking" duration="22s" status="running" />
    );
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('');
    rerender(
      <ReasoningTrace label="Complete" duration="1m 48s" status="complete" />
    );
    expect(live).toHaveTextContent('Complete, 1m 48s');
  });

  it('puts steps in an ordered list inside the card', () => {
    render(
      <ReasoningTrace label="Complete" defaultOpen>
        <ReasoningStep label="Read files" />
        <ReasoningStep label="Ran a command" />
      </ReasoningTrace>
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('leaves other content, such as code, outside the card', () => {
    const { container } = render(
      <ReasoningTrace label="Running" status="running" defaultOpen>
        <div data-testid="code" />
      </ReasoningTrace>
    );
    expect(screen.getByTestId('code')).toBeInTheDocument();
    expect(container.querySelector('.cds--reasoning-trace__card')).toBeNull();
  });

  it('adds the details button, worded by status', () => {
    const onViewDetails = jest.fn();
    const { rerender } = render(
      <ReasoningTrace
        label="Thinking"
        status="running"
        defaultOpen
        onViewDetails={onViewDetails}
        detailsOpen={false}
        detailsControls="canvas">
        <ReasoningStep label="Read files" />
      </ReasoningTrace>
    );
    const details = screen.getByRole('button', { name: 'Planning…' });
    expect(details).toHaveAttribute('aria-controls', 'canvas');
    expect(details).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(details);
    expect(onViewDetails).toHaveBeenCalled();
    rerender(
      <ReasoningTrace
        label="Complete"
        status="complete"
        defaultOpen
        onViewDetails={onViewDetails}>
        <ReasoningStep label="Read files" />
      </ReasoningTrace>
    );
    expect(
      screen.getByRole('button', { name: 'View plan details' })
    ).toBeInTheDocument();
  });
});

describe('ReasoningStep', () => {
  function inList(node: React.ReactElement) {
    return render(<ol>{node}</ol>);
  }

  it('has no disclosure without detail', () => {
    inList(<ReasoningStep label="Read files" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Read files')).toBeInTheDocument();
  });

  it('opens to its detail', () => {
    inList(<ReasoningStep label="Read files">Three models</ReasoningStep>);
    const toggle = screen.getByRole('button', { name: 'Read files' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Three models')).not.toBeVisible();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Three models')).toBeVisible();
  });

  it('says a failed step failed, in words', () => {
    inList(<ReasoningStep status="failed" label="Reached the tracker" />);
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Failed: Reached the tracker'
    );
  });

  it('marks the running step with Carbon Loading', () => {
    const { container } = inList(
      <ReasoningStep status="running" label="Reading files" />
    );
    expect(container.querySelector('.cds--loading')).not.toBeNull();
    expect(screen.getByRole('listitem')).toHaveClass(
      'cds--reasoning-step--running'
    );
  });
});
