/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Copy, Renew, ThumbsUp } from '@carbon/icons-react';
import { ChatThread } from '../components/ChatThread';
import { ChatMessage, ChatMessageAction } from '../components/ChatMessage';

function thread(children: React.ReactNode, props = {}) {
  return render(
    <ChatThread label="Conversation with the assistant" {...props}>
      {children}
    </ChatThread>
  );
}

describe('ChatThread', () => {
  it('is a named ordered list of turns', () => {
    thread(
      <>
        <ChatMessage from="user">Hello</ChatMessage>
        <ChatMessage from="assistant">Hi</ChatMessage>
      </>
    );
    const list = screen.getByRole('list', {
      name: 'Conversation with the assistant',
    });
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('carries one polite live region for the whole thread', () => {
    const { container, rerender } = thread(
      <ChatMessage from="assistant">Thinking</ChatMessage>
    );
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('');
    rerender(
      <ChatThread
        label="Conversation with the assistant"
        announcement="New reply: themes first.">
        <ChatMessage from="assistant">Here it is</ChatMessage>
      </ChatThread>
    );
    expect(live).toHaveTextContent('New reply: themes first.');
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
  });

  it('sets the rhythm itself, so a turn carries no margin', () => {
    const { container } = thread(<ChatMessage from="user">Hello</ChatMessage>, {
      density: 'compact',
      align: 'top',
    });
    const list = container.querySelector('ol');
    expect(list).toHaveClass('cds--chat-thread--compact');
    expect(list).toHaveClass('cds--chat-thread--top');
  });

  it('defaults to a conversation that sits against the composer', () => {
    const { container } = thread(<ChatMessage from="user">Hello</ChatMessage>);
    expect(container.querySelector('ol')).toHaveClass(
      'cds--chat-thread--bottom'
    );
  });
});

describe('ChatMessage', () => {
  it('says who spoke, in the class rather than only in the layout', () => {
    thread(
      <>
        <ChatMessage from="user">Hello</ChatMessage>
        <ChatMessage from="assistant">Hi</ChatMessage>
      </>
    );
    const [user, assistant] = screen.getAllByRole('listitem');
    expect(user).toHaveClass('cds--chat-message--user');
    expect(assistant).toHaveClass('cds--chat-message--assistant');
  });

  it('has no footer at all when there is nothing to put in it', () => {
    const { container } = thread(
      <ChatMessage from="assistant">Hi</ChatMessage>
    );
    expect(container.querySelector('.cds--chat-message__footer')).toBeNull();
  });

  it('keeps its actions reachable by keyboard while they are unseen', async () => {
    thread(
      <ChatMessage
        from="assistant"
        actions={
          <>
            <ChatMessageAction icon={ThumbsUp} label="Good response" />
            <ChatMessageAction icon={Renew} label="Regenerate" />
          </>
        }>
        Hi
      </ChatMessage>
    );
    const good = screen.getByRole('button', { name: 'Good response' });
    await userEvent.tab();
    expect(good).toHaveFocus();
  });

  it('calls back when an action is pressed', async () => {
    const onClick = jest.fn();
    thread(
      <ChatMessage
        from="user"
        actions={
          <ChatMessageAction icon={Copy} label="Copy" onClick={onClick} />
        }>
        Hello
      </ChatMessage>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a cast vote as pressed, not by colour alone', () => {
    thread(
      <ChatMessage
        from="assistant"
        actions={
          <ChatMessageAction icon={ThumbsUp} label="Good response" isSelected />
        }>
        Hi
      </ChatMessage>
    );
    expect(
      screen.getByRole('button', { name: 'Good response' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('puts the timestamp beside the actions, costing no line at rest', () => {
    const { container } = thread(
      <ChatMessage
        from="user"
        timestamp="13:37"
        actions={<ChatMessageAction icon={Copy} label="Copy" />}>
        Hello
      </ChatMessage>
    );
    const footer = container.querySelector('.cds--chat-message__footer');
    expect(footer).not.toBeNull();
    expect(within(footer as HTMLElement).getByText('13:37')).toBeVisible();
    expect(
      within(footer as HTMLElement).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument();
  });

  it('forwards a ref to the turn', () => {
    const ref = React.createRef<HTMLLIElement>();
    thread(
      <ChatMessage from="user" ref={ref}>
        Hello
      </ChatMessage>
    );
    expect(ref.current).toBeInstanceOf(HTMLLIElement);
  });
});
