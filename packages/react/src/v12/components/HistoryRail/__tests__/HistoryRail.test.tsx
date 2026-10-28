/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryRail } from '../components/HistoryRail';
import { HistoryMarkerCard } from '../components/HistoryMarkerCard';
import type { HistoryIteration } from '../components/HistoryRail';

const items: HistoryIteration[] = [
  { id: 'a', label: 'Iteration 1', description: 'Started from the brief' },
  { id: 'b', label: 'Iteration 2', description: 'Drafted the table' },
  {
    id: 'c',
    label: 'Iteration 3',
    description: 'The run timed out',
    status: 'failed',
  },
  { id: 'd', label: 'Iteration 4', description: 'Raised the headroom' },
];

function rail(props = {}) {
  return render(
    <HistoryRail
      label="History of this conversation"
      items={items}
      {...props}
    />
  );
}

/** jsdom gives every box zero height, so the track has to be told its size. */
function sizeTrack(track: HTMLElement, height = 56, top = 0) {
  jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 24,
    width: 24,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('HistoryRail', () => {
  it('is one control, not one per iteration', () => {
    const { container } = rail({ current: 'd' });
    expect(screen.getAllByRole('slider')).toHaveLength(1);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    // the marks are decoration; the slider carries the meaning
    expect(container.querySelectorAll('.cds--history-marker')).toHaveLength(4);
  });

  it('is one tab stop', async () => {
    rail({ current: 'd' });
    await userEvent.tab();
    expect(screen.getByRole('slider')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('slider')).not.toHaveFocus();
  });

  it('says where it is, and what changed there', () => {
    rail({ current: 'd', defaultValue: 'b' });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '4');
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Iteration 2, 2 of 4. Drafted the table'
    );
  });

  it('steps with the arrows, and jumps with Home and End', async () => {
    const onChange = jest.fn();
    rail({ current: 'd', defaultValue: 'b', onChange });
    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(items[2], 2);
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(items[1], 1);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(items[0], 0);
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(items[3], 3);
  });

  it('stops at both ends instead of wrapping', async () => {
    const onChange = jest.fn();
    rail({ defaultValue: 'a', onChange });
    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{End}{ArrowDown}');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('lands a click on the nearest iteration, wherever on the track it falls', () => {
    const onChange = jest.fn();
    rail({ current: 'a', onChange });
    const slider = screen.getByRole('slider');
    sizeTrack(slider);
    // 56 tall over four marks: 14 each, so 40px down is the third.
    // fireEvent, not userEvent: the click has to carry a real clientY.
    fireEvent.click(slider, { clientY: 40 });
    expect(onChange).toHaveBeenCalledWith(items[2], 2);
  });

  it('marks the live iteration apart from the one being looked at', () => {
    const { container } = rail({ current: 'a', defaultValue: 'd' });
    const marks = container.querySelectorAll('.cds--history-marker');
    expect(marks[0]).toHaveClass('cds--history-marker--current');
    expect(marks[3]).toHaveClass('cds--history-marker--highlighted');
  });

  it('shows a failed run as failed', () => {
    const { container } = rail({ current: 'a' });
    const marks = container.querySelectorAll('.cds--history-marker');
    expect(marks[2]).toHaveClass('cds--history-marker--failed');
  });

  it('holds a long history to what fits, keeping the selection in view', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      id: `${i}`,
      label: `Iteration ${i + 1}`,
    }));
    const { container } = render(
      <HistoryRail
        label="History"
        items={many}
        maxMarks={10}
        defaultValue="20"
      />
    );
    expect(container.querySelectorAll('.cds--history-marker')).toHaveLength(10);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '21');
    expect(screen.getByText('Iteration 21')).toBeInTheDocument();
  });

  it('does not say the card twice: the slider already reads it', () => {
    const { container } = rail({ current: 'a', defaultValue: 'b' });
    const card = container.querySelector('.cds--history-marker-card');
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card).toHaveTextContent('Iteration 2');
    expect(card).toHaveTextContent('Drafted the table');
  });

  it('takes a translation for what is read out', () => {
    rail({
      defaultValue: 'a',
      translations: {
        valueText: (iteration, position, total) =>
          `Version ${position} sur ${total} : ${iteration.label}`,
      },
    });
    expect(screen.getByRole('slider')).toHaveAttribute(
      'aria-valuetext',
      'Version 1 sur 4 : Iteration 1'
    );
  });
});

describe('HistoryMarkerCard', () => {
  it('carries a label on its own, and a description when there is one', () => {
    const { container, rerender } = render(
      <HistoryMarkerCard label="Iteration 1" />
    );
    expect(screen.getByText('Iteration 1')).toBeInTheDocument();
    expect(
      container.querySelector('.cds--history-marker-card__description')
    ).toBeNull();
    rerender(<HistoryMarkerCard label="Iteration 1" description="Edited" />);
    expect(screen.getByText('Edited')).toBeInTheDocument();
  });
});
