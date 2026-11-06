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

function box(top: number, height: number) {
  return {
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 24,
    width: 24,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

/**
 * jsdom gives every box zero height, so the rail has to be told its geometry
 * — the track and each slot, since the rail measures the slots themselves.
 * Slots are laid out at the rest pitch and then pushed by `data-push`, the
 * way the stylesheet does it.
 */
function sizeTrack(track: HTMLElement, pitch = 14, top = 0, push = 5) {
  const slots = Array.from(track.children) as HTMLElement[];
  jest
    .spyOn(track, 'getBoundingClientRect')
    .mockReturnValue(box(top, pitch * slots.length));
  slots.forEach((slot, index) => {
    jest.spyOn(slot, 'getBoundingClientRect').mockImplementation(() => {
      const shift =
        slot.dataset.push === 'up'
          ? -push
          : slot.dataset.push === 'down'
            ? push
            : 0;
      return box(top + index * pitch + shift, pitch);
    });
  });
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
  });

  it('keeps the card for the iteration being reached for, not for rest', () => {
    const { container } = rail({ current: 'a', defaultValue: 'b' });
    const slider = screen.getByRole('slider');
    expect(container.querySelector('.cds--history-marker-card')).toBeNull();

    sizeTrack(slider);
    // 56 tall over four marks: 14 each, so 20px down is the second.
    // jsdom has no PointerEvent, so the pointer move is a MouseEvent under
    // the name React listens for.
    fireEvent(
      slider,
      new MouseEvent('pointermove', { bubbles: true, clientY: 20 })
    );
    const card = container.querySelector('.cds--history-marker-card');
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card).toHaveTextContent('Iteration 2');
    expect(card).toHaveTextContent('Drafted the table');

    fireEvent.pointerLeave(slider.parentElement as HTMLElement);
    expect(container.querySelector('.cds--history-marker-card')).toBeNull();
  });

  it('keeps one card between marks and changes its words', () => {
    const { container } = rail({ current: 'a' });
    const slider = screen.getByRole('slider');
    sizeTrack(slider);
    const move = (clientY: number) =>
      fireEvent(
        slider,
        new MouseEvent('pointermove', { bubbles: true, clientY })
      );

    move(20);
    const first = container.querySelector('.cds--history-marker-card');
    expect(first).toHaveTextContent('Iteration 2');
    // arriving, so it appears where it is wanted rather than travelling
    expect(first).not.toHaveClass('cds--history-rail__card--sliding');

    move(45);
    const second = container.querySelector('.cds--history-marker-card');
    expect(second).toBe(first);
    expect(second).toHaveTextContent('Iteration 3');
    expect(second).toHaveClass('cds--history-rail__card--sliding');
  });

  it('parts the marks around the one being reached for, and only then', () => {
    const { container } = rail({ current: 'a' });
    const slider = screen.getByRole('slider');
    const pushes = () =>
      [...container.querySelectorAll('.cds--history-rail__slot')].map(
        (slot) => (slot as HTMLElement).dataset.push
      );
    expect(pushes()).toEqual([undefined, undefined, undefined, undefined]);

    sizeTrack(slider);
    fireEvent(
      slider,
      new MouseEvent('pointermove', { bubbles: true, clientY: 20 })
    );
    // the second mark holds its place; everything above and below parts
    expect(pushes()).toEqual(['up', 'at', 'down', 'down']);

    fireEvent.pointerLeave(slider.parentElement as HTMLElement);
    expect(pushes()).toEqual([undefined, undefined, undefined, undefined]);
  });

  it('hits the marks where the push leaves them, not where they started', () => {
    const onChange = jest.fn();
    rail({ current: 'a', onChange });
    const slider = screen.getByRole('slider');
    sizeTrack(slider);
    // With the second mark reached for, the third has moved 5 down: its band
    // starts at 33 rather than 28, so 30 is still the second.
    fireEvent(
      slider,
      new MouseEvent('pointermove', { bubbles: true, clientY: 20 })
    );
    fireEvent.click(slider, { clientY: 30 });
    expect(onChange).toHaveBeenCalledWith(items[1], 1);
  });

  it('shows the card to the keyboard while the rail has focus', () => {
    const { container } = rail({ current: 'a', defaultValue: 'b' });
    const slider = screen.getByRole('slider');
    fireEvent.focus(slider);
    expect(
      container.querySelector('.cds--history-marker-card')
    ).toHaveTextContent('Iteration 2');
    fireEvent.blur(slider);
    expect(container.querySelector('.cds--history-marker-card')).toBeNull();
  });

  it('keeps the selected mark blue whether or not the card is up', () => {
    const { container } = rail({ current: 'a', defaultValue: 'd' });
    const marks = container.querySelectorAll('.cds--history-marker');
    expect(container.querySelector('.cds--history-marker-card')).toBeNull();
    expect(marks[3]).toHaveClass('cds--history-marker--highlighted');
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
