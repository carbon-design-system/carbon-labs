/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom

/** @jsxRuntime automatic */

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

/** What the listening toggle was last given: the icon's own motion is the icon's tests'. */
const icon = vi.hoisted(() => ({
  props: {} as { toggled?: boolean; level?: unknown },
}));
vi.mock('@carbon-labs/react-motion-icons', async (original) => ({
  ...(await original<Record<string, unknown>>()),
  MicrophoneListeningToggle: (p: { toggled?: boolean; level?: unknown }) => {
    icon.props = p;
    return <svg data-icon="listening" data-toggled={String(!!p.toggled)} />;
  },
}));

import { DictationButton } from '../components/DictationButton';
import { PromptInput } from '../components/PromptInput';

// jsdom has no layout, no Web Animations and no media queries: stand-ins.
beforeAll(() => {
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = () =>
    ({
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      currentTime: 0,
      cancel() {},
      finish() {},
      play() {},
      pause() {},
      reverse() {},
      commitStyles() {},
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as Animation;
  Object.defineProperty(document, 'timeline', {
    configurable: true,
    value: { currentTime: 0 },
  });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});
afterEach(cleanup);

const mic = (c: HTMLElement) => c.querySelector<HTMLButtonElement>('button')!;
const live = (c: HTMLElement) =>
  c.querySelector('.cds-dictation-live')!.textContent;

describe('DictationButton', () => {
  it('rests as the microphone: a toggle, not pressed, not busy', () => {
    const { container } = render(
      <DictationButton listening={false} onListeningChange={() => {}} />
    );
    const b = mic(container);
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(b.hasAttribute('aria-busy')).toBe(false);
    expect(b.classList.contains('cds-dictation--listening')).toBe(false);
    expect(icon.props.toggled).toBe(false);
    expect(container.querySelector('.cds-dictation__spinner')).toBeNull();
    expect(live(container)).toBe('');
  });

  it('connecting: busy and pressed, the spinner in the icon’s place, the toggle still off', () => {
    const { container } = render(
      <DictationButton
        listening={false}
        connecting
        onListeningChange={() => {}}
      />
    );
    const b = mic(container);
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.classList.contains('cds-dictation--listening')).toBe(false);
    expect(container.querySelector('.cds-dictation__spinner')).not.toBeNull();
    expect(icon.props.toggled).toBe(false);
  });

  it('listening: pressed and filled, the toggle on, the level passed through', () => {
    const level = () => 0.5;
    const { container, rerender } = render(
      <DictationButton listening onListeningChange={() => {}} level={level} />
    );
    const b = mic(container);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.hasAttribute('aria-busy')).toBe(false);
    expect(b.classList.contains('cds-dictation--listening')).toBe(true);
    expect(icon.props.toggled).toBe(true);
    expect(icon.props.level).toBe(level);
    rerender(
      <DictationButton listening onListeningChange={() => {}} level={0.8} />
    );
    expect(icon.props.level).toBe(0.8);
  });

  it('a press starts; a press while connecting or listening stops', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <DictationButton listening={false} onListeningChange={onChange} />
    );
    fireEvent.click(mic(container));
    expect(onChange).toHaveBeenLastCalledWith(true);
    rerender(
      <DictationButton
        listening={false}
        connecting
        onListeningChange={onChange}
      />
    );
    fireEvent.click(mic(container));
    expect(onChange).toHaveBeenLastCalledWith(false);
    rerender(<DictationButton listening onListeningChange={onChange} />);
    fireEvent.click(mic(container));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('says the state politely as it changes: listening, then stopped', () => {
    const { container, rerender } = render(
      <DictationButton listening={false} onListeningChange={() => {}} />
    );
    const region = container.querySelector('.cds-dictation-live')!;
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    rerender(
      <DictationButton
        listening={false}
        connecting
        onListeningChange={() => {}}
      />
    );
    expect(live(container)).toBe('');
    rerender(<DictationButton listening onListeningChange={() => {}} />);
    expect(live(container)).toBe('Listening');
    rerender(
      <DictationButton listening={false} onListeningChange={() => {}} />
    );
    expect(live(container)).toBe('Dictation stopped');
  });
});

describe('PromptInput dictation', () => {
  it('passes connecting and level to the microphone, with no popover over the prompt', () => {
    const level = () => 0.25;
    const { container, rerender } = render(
      <PromptInput listening={false} connecting level={level} />
    );
    const b = container.querySelector<HTMLButtonElement>('.cds-dictation')!;
    expect(b.getAttribute('aria-busy')).toBe('true');
    rerender(<PromptInput listening level={level} />);
    expect(icon.props.toggled).toBe(true);
    expect(icon.props.level).toBe(level);
    expect(container.querySelector('.cds-popover')).toBeNull();
    expect(container.querySelector('.cds-dictation-status')).toBeNull();
    expect(document.querySelector('.cds-dictation-anchor')).toBeNull();
    expect(live(container)).toBe('Listening');
  });

  it('takes its own words for the announcement', () => {
    const { container, rerender } = render(<PromptInput listening={false} />);
    act(() =>
      rerender(<PromptInput listening dictationListeningText="Écoute" />)
    );
    expect(live(container)).toBe('Écoute');
  });
});
