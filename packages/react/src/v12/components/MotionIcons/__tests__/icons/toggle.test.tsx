/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationToggle, Notification } from '../../icons/toggle';
import { MicrophoneToggle, Microphone } from '../../icons/toggle';
import { LockedToggle, Locked } from '../../icons/toggle';
import { LightToggle, Light } from '../../icons/toggle';
import { FlashToggle, Flash } from '../../icons/toggle';
import { FlashOffToggle, FlashOff } from '../../icons/toggle';
import { MicrophoneOffToggle, MicrophoneOff } from '../../icons/toggle';
import { NotificationOffToggle } from '../../icons/toggle';
import { FavoriteToggle, Favorite } from '../../icons/toggle';
import { SendToggle } from '../../icons/toggle';
import { SendAltToggle } from '../../icons/toggle';
import { Send, SendAlt } from '../../icons/operations';
import { MotionIconProvider } from '../../context/MotionIconProvider';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('New Toggle Icons Suite', () => {
  const toggleIcons = [
    {
      name: 'NotificationToggle',
      component: NotificationToggle,
      hoverComponent: Notification,
      clipPrefix: null,
    },
    {
      name: 'MicrophoneToggle',
      component: MicrophoneToggle,
      hoverComponent: Microphone,
      clipPrefix: null,
    },
    {
      name: 'LockedToggle',
      component: LockedToggle,
      hoverComponent: Locked,
      clipPrefix: null,
    },
    {
      name: 'LightToggle',
      component: LightToggle,
      hoverComponent: Light,
      clipPrefix: null,
    },
    {
      name: 'FlashToggle',
      component: FlashToggle,
      hoverComponent: Flash,
      clipPrefix: null,
    },
    {
      name: 'FavoriteToggle',
      component: FavoriteToggle,
      hoverComponent: Favorite,
      clipPrefix: null,
    },
    {
      name: 'SendToggle',
      component: SendToggle,
      hoverComponent: Send,
      clipPrefix: null,
    },
    {
      name: 'SendAltToggle',
      component: SendAltToggle,
      hoverComponent: SendAlt,
      clipPrefix: null,
    },
  ];

  describe('FlashOffToggle', () => {
    it('renders the animated toggle without masks (frame engine)', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <FlashOffToggle size={32} aria-label="Toggle Flash Off" />
        </MotionIconProvider>
      );
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.querySelector('mask, clipPath')).toBeNull();
    });

    it('renders static version when animated={false}', () => {
      const { container } = render(
        <FlashOffToggle
          size={32}
          animated={false}
          aria-label="Toggle Flash Off"
        />
      );
      expect(container.querySelector('[id^="flashoff-mask-"]')).toBeNull();
    });

    it('toggles on/off state on click', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MotionIconProvider animated>
          <FlashOffToggle
            size={32}
            onToggle={onToggle}
            aria-label="Toggle Flash Off"
          />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      if (svg) {
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith('off', expect.any(Boolean));
      }
    });

    it('renders as button when asButton=true', () => {
      render(
        <MotionIconProvider animated>
          <FlashOffToggle size={32} asButton aria-label="Toggle Flash Off" />
        </MotionIconProvider>
      );
      const btn = screen.getByRole('button', { name: 'Toggle Flash Off' });
      expect(btn).toBeInTheDocument();
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    it('renders hover-only FlashOff wrapper without error', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <FlashOff size={32} aria-label="Hover Flash Off" />
        </MotionIconProvider>
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('MicrophoneOffToggle', () => {
    it('renders the animated toggle without masks (frame engine)', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <MicrophoneOffToggle size={32} aria-label="Toggle Microphone Off" />
        </MotionIconProvider>
      );
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.querySelector('mask, clipPath')).toBeNull();
    });

    it('renders static version when animated={false}', () => {
      const { container } = render(
        <MicrophoneOffToggle
          size={32}
          animated={false}
          aria-label="Toggle Microphone Off"
        />
      );
      expect(container.querySelector('[id^="micoff-mask-"]')).toBeNull();
    });

    it('toggles on/off state on click', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MotionIconProvider animated>
          <MicrophoneOffToggle
            size={32}
            onToggle={onToggle}
            aria-label="Toggle Microphone Off"
          />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      if (svg) {
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith('off', expect.any(Boolean));
      }
    });

    it('renders hover-only MicrophoneOff wrapper without error', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <MicrophoneOff size={32} aria-label="Hover Microphone Off" />
        </MotionIconProvider>
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('NotificationOffToggle', () => {
    it('renders animated toggle without masks (the gap is cut geometry)', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <NotificationOffToggle
            size={32}
            aria-label="Toggle Notification Off"
          />
        </MotionIconProvider>
      );
      expect(container.firstChild).not.toBeNull();
      expect(container.querySelector('mask, [mask]')).toBeNull();
    });

    it('renders static version when animated={false}', () => {
      const { container } = render(
        <NotificationOffToggle
          size={32}
          animated={false}
          aria-label="Toggle Notification Off"
        />
      );
      expect(container.querySelector('mask, [mask]')).toBeNull();
    });

    it('toggles on/off state on click', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MotionIconProvider animated>
          <NotificationOffToggle
            size={32}
            onToggle={onToggle}
            aria-label="Toggle Notification Off"
          />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      if (svg) {
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith('off', expect.any(Boolean));
      }
    });
  });

  describe('NotificationOffToggle filled', () => {
    it('renders animated toggle without masks (the gap is cut geometry)', () => {
      const { container } = render(
        <MotionIconProvider animated>
          <NotificationOffToggle
            filled
            size={32}
            aria-label="Toggle Notification Filled Off"
          />
        </MotionIconProvider>
      );
      expect(container.firstChild).not.toBeNull();
      expect(container.querySelector('mask, [mask]')).toBeNull();
    });

    it('renders static version when animated={false}', () => {
      const { container } = render(
        <NotificationOffToggle
          filled
          size={32}
          animated={false}
          aria-label="Toggle Notification Filled Off"
        />
      );
      expect(container.querySelector('mask, [mask]')).toBeNull();
    });

    it('toggles on/off state on click', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MotionIconProvider animated>
          <NotificationOffToggle
            filled
            size={32}
            onToggle={onToggle}
            aria-label="Toggle Notification Filled Off"
          />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      if (svg) {
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith('off', expect.any(Boolean));
      }
    });
  });

  toggleIcons.forEach(
    ({
      name,
      component: Component,
      hoverComponent: HoverComponent,
      clipPrefix,
    }) => {
      describe(name, () => {
        it('renders animated toggle without error', () => {
          const { container } = render(
            <MotionIconProvider animated>
              <Component size={32} aria-label={`Toggle ${name}`} />
            </MotionIconProvider>
          );
          expect(container.firstChild).not.toBeNull();
          if (clipPrefix)
            expect(
              container.querySelector(`[id^="${clipPrefix}"]`)
            ).not.toBeNull();
          // Rebuilt toggles draw the fill as one even-odd path: no clip path or mask.
          else
            expect(
              container.querySelector('mask, clipPath, [mask], [clip-path]')
            ).toBeNull();
        });

        it('renders static version when animated={false}', () => {
          const { container } = render(
            <Component
              size={32}
              animated={false}
              aria-label={`Toggle ${name}`}
            />
          );
          if (clipPrefix)
            expect(container.querySelector(`[id^="${clipPrefix}"]`)).toBeNull();
        });

        it('toggles fill state on click', () => {
          const onToggle = vi.fn();
          const { container } = render(
            <MotionIconProvider animated>
              <Component
                size={32}
                onToggle={onToggle}
                aria-label={`Toggle ${name}`}
              />
            </MotionIconProvider>
          );
          const svg = container.querySelector('svg');
          expect(svg).not.toBeNull();
          if (svg) {
            fireEvent.click(svg);
            expect(onToggle).toHaveBeenCalledWith('on', expect.any(Boolean));
          }
        });

        it('renders as button when asButton=true', () => {
          render(
            <MotionIconProvider animated>
              <Component size={32} asButton aria-label={`Toggle ${name}`} />
            </MotionIconProvider>
          );
          const btn = screen.getByRole('button', { name: `Toggle ${name}` });
          expect(btn).toBeInTheDocument();
          expect(btn.getAttribute('aria-pressed')).toBe('false');
          fireEvent.click(btn);
          expect(btn.getAttribute('aria-pressed')).toBe('true');
        });

        it('renders hover-only wrapper without error', () => {
          const { container } = render(
            <MotionIconProvider animated>
              <HoverComponent size={32} aria-label={`Hover ${name}`} />
            </MotionIconProvider>
          );
          expect(container.firstChild).not.toBeNull();
        });
      });
    }
  );
});

// ─── Controlled mode ─────────────────────────────────────────────────────────
//
// A controlled toggle must follow its `toggled` prop whatever changed it —
// not only its own clicks — and `disableToggle` must block clicks without
// blocking the transition. A theme switch that drives the icon from app
// state needs both.

describe('LockedToggle — controlled', () => {
  /** How much of the house fill is drawn: the length of its even-odd path. */
  function fillRadius(container: HTMLElement): number {
    return (
      container.querySelector('path[fill-rule="evenodd"]')?.getAttribute('d') ??
      ''
    ).length;
  }

  it('animates to the new state when the toggled prop changes without a click', async () => {
    const { container, rerender } = render(
      <MotionIconProvider animated>
        <LockedToggle toggled={false} disableToggle aria-label="Lock" />
      </MotionIconProvider>
    );
    expect(fillRadius(container)).toBe(0);

    rerender(
      <MotionIconProvider animated>
        <LockedToggle toggled disableToggle aria-label="Lock" />
      </MotionIconProvider>
    );
    await waitFor(() => expect(fillRadius(container)).toBeGreaterThan(10));
  });

  it('does not animate a click the parent ignores', async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <MotionIconProvider animated>
        <LockedToggle toggled={false} onToggle={onToggle} aria-label="Lock" />
      </MotionIconProvider>
    );
    fireEvent.click(container.querySelector('svg')!);
    expect(onToggle).toHaveBeenCalledWith('on', expect.any(Boolean));
    await new Promise((r) => setTimeout(r, 250));
    expect(fillRadius(container)).toBe(0);
  });
});

describe('asButton — activation fires once', () => {
  // Keyboard/screen-reader activation clicks the <button> itself, not the
  // SVG. The ancestor-frame click fallback must not also handle it.
  it("a click targeting the icon's own button requests exactly one change", () => {
    const onToggle = vi.fn();
    render(
      <MotionIconProvider animated>
        <LockedToggle
          asButton
          toggled={false}
          onToggle={onToggle}
          aria-label="Lock"
        />
      </MotionIconProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lock' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls the consumer onClick even when disableToggle is set', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    const { container } = render(
      <MotionIconProvider animated>
        <LockedToggle
          disableToggle
          onClick={onClick}
          onToggle={onToggle}
          aria-label="Lock"
        />
      </MotionIconProvider>
    );
    fireEvent.click(container.querySelector('svg')!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe('onToggle — toggled boolean', () => {
  // The second argument always mirrors the `toggled` prop, so
  // `toggled={on} onToggle={(_, next) => setOn(next)}` works even on the
  // *Off* icons, whose `toggled` state is named 'off'.
  it.each([
    ['LockedToggle', LockedToggle, 'on'],
    ['FlashOffToggle', FlashOffToggle, 'off'],
  ] as const)(
    '%s reports (%s-state, true) when turned on',
    (_name, Icon, onState) => {
      const onToggle = vi.fn();
      const { container } = render(
        <MotionIconProvider animated>
          <Icon toggled={false} onToggle={onToggle} aria-label="t" />
        </MotionIconProvider>
      );
      fireEvent.click(container.querySelector('svg')!);
      expect(onToggle).toHaveBeenCalledWith(onState, true);
    }
  );
});
