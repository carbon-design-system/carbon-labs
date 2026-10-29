/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemMessage } from '../components/SystemMessage';

describe('SystemMessage', () => {
  it('says what happened', () => {
    render(<SystemMessage text="Model changed to Granite 3.1" />);
    expect(
      screen.getByText('Model changed to Granite 3.1')
    ).toBeInTheDocument();
  });

  it('applies the cds prefix and a custom class name', () => {
    const { container } = render(
      <SystemMessage className="custom-class" text="Hello" />
    );
    const node = container.firstElementChild;
    expect(node).toHaveClass('cds--system-message');
    expect(node).toHaveClass('custom-class');
  });

  it('forwards a ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SystemMessage ref={ref} text="Hello" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional props onto the root element', () => {
    render(<SystemMessage data-testid="root" text="Hello" />);
    expect(screen.getByTestId('root')).toHaveTextContent('Hello');
  });

  it('waits its turn at status, and interrupts at alert', () => {
    const { rerender } = render(
      <SystemMessage data-testid="root" text="Model changed to Granite 3.1" />
    );
    const node = screen.getByTestId('root');
    expect(node).toHaveAttribute('role', 'status');
    expect(node).toHaveAttribute('aria-live', 'polite');

    rerender(
      <SystemMessage
        data-testid="root"
        severity="alert"
        text="Conversation cleared — 14 messages removed"
      />
    );
    expect(node).toHaveAttribute('role', 'alert');
    expect(node).toHaveAttribute('aria-live', 'assertive');
  });

  it('carries the glyph only at alert, and never by colour alone', () => {
    const { container, rerender } = render(<SystemMessage text="Hello" />);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.firstElementChild).not.toHaveClass(
      'cds--system-message--alert'
    );

    rerender(<SystemMessage severity="alert" text="Hello" />);
    // the glyph and the role carry it too, so the ink is never on its own
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(
      'cds--system-message--alert'
    );
  });

  it('draws a boundary between two rules, hidden from the reader', () => {
    const { container } = render(
      <SystemMessage variant="divider" text="Today" />
    );
    const rules = container.querySelectorAll('.cds--system-message__rule');
    expect(rules).toHaveLength(2);
    rules.forEach((rule) => {
      expect(rule).toHaveAttribute('aria-hidden', 'true');
    });
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('gives a boundary no severity, however it is asked for', () => {
    const { container } = render(
      <SystemMessage variant="divider" severity="alert" text="Today" />
    );
    // a boundary is not something that went wrong: no glyph, no alert ink,
    // and it does not interrupt
    expect(container.querySelector('svg')).toBeNull();
    expect(container.firstElementChild).not.toHaveClass(
      'cds--system-message--alert'
    );
    expect(container.firstElementChild).toHaveAttribute('role', 'status');
  });

  it('takes its text as a string, not as markup', () => {
    render(<SystemMessage text="<b>Model</b> changed" />);
    // the angle brackets survive: a notice is a fact, not something a party
    // said, so nothing in it is rendered as markup
    expect(screen.getByText('<b>Model</b> changed')).toBeInTheDocument();
  });
});
