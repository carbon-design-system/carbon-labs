/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlags } from '@carbon/react';
import {
  FileChip,
  kindFromMimeType,
  splitFileName,
} from '../components/FileChip';

describe('FileChip', () => {
  it('is a group named by the full file name, with the cds prefix and its kind', () => {
    render(<FileChip name="Filename.pdf" className="custom" />);
    const chip = screen.getByRole('group', { name: 'Filename.pdf' });
    expect(chip).toHaveClass(
      'cds--file-chip',
      'cds--file-chip--file',
      'custom'
    );
  });

  it('forwards a ref to the root and spreads other props onto it', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<FileChip ref={ref} name="Filename.pdf" data-testid="root" />);
    expect(ref.current).toBe(screen.getByTestId('root'));
  });

  it('cuts a long name in the middle, keeping the extension whole', () => {
    expect(splitFileName('Quarterly-business-review-final-2026.pdf')).toEqual([
      'Quarterly-business-review-final-',
      '2026.pdf',
    ]);
    expect(splitFileName('notes')).toEqual(['n', 'otes']);
    expect(splitFileName('a.pdf')).toEqual(['', 'a.pdf']);

    const { container } = render(
      <FileChip name="Quarterly-business-review-final-2026.pdf" />
    );
    expect(
      container.querySelector('.cds--file-chip__name-end')
    ).toHaveTextContent('2026.pdf');
    // A screen reader reads the whole name, not the visual ellipsis.
    expect(container.querySelector('.cds--file-chip__name')).toHaveTextContent(
      'Quarterly-business-review-final-2026.pdf'
    );
  });

  describe('the full-name tooltip', () => {
    // jsdom lays nothing out, so the widths are set by hand on HTMLElement,
    // shadowing jsdom's own getters on Element until they are deleted.
    function setWidths(scroll: number, client: number) {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get: () => scroll,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: () => client,
      });
    }

    afterEach(() => {
      const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
      delete proto.scrollWidth;
      delete proto.clientWidth;
    });

    it('describes a truncated name with the full name', () => {
      setWidths(300, 120);
      const { container } = render(
        <FileChip name="Quarterly-business-review-final-2026.pdf" />
      );
      const name = container.querySelector('.cds--file-chip__name');
      const id = name?.getAttribute('aria-describedby');
      expect(id).toBeTruthy();
      expect(document.getElementById(id ?? '')).toHaveTextContent(
        'Quarterly-business-review-final-2026.pdf'
      );
    });

    it('adds nothing when the name fits', () => {
      setWidths(80, 120);
      const { container } = render(<FileChip name="Filename.pdf" />);
      expect(
        container.querySelector('.cds--file-chip__name')
      ).not.toHaveAttribute('aria-describedby');
      expect(
        container.querySelector('.cds--file-chip__name-tooltip')
      ).toBeNull();
    });
  });

  it('takes its kind from the MIME type unless told', () => {
    expect(kindFromMimeType('image/png')).toBe('image');
    expect(kindFromMimeType('video/mp4')).toBe('video');
    expect(kindFromMimeType('application/pdf')).toBe('file');
    expect(kindFromMimeType()).toBe('file');

    render(<FileChip name="clip.mp4" mimeType="video/mp4" />);
    expect(screen.getByRole('group')).toHaveClass('cds--file-chip--video');
  });

  it('shows a thumbnail-only image chip, still named for assistive tech', () => {
    const { container } = render(
      <FileChip name="photo.jpg" kind="image" thumbnailSrc="photo.jpg" />
    );
    expect(screen.getByRole('group', { name: 'photo.jpg' })).toBeVisible();
    expect(container.querySelector('.cds--file-chip__name')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('explains an error in words, and names a media chip in error', () => {
    const { container } = render(
      <FileChip
        name="photo.jpg"
        kind="image"
        status="error"
        errorMessage="Unsupported format"
      />
    );
    expect(screen.getByText('Unsupported format')).toHaveClass(
      'cds--file-chip__secondary--error'
    );
    expect(container.querySelector('.cds--file-chip__name')).toHaveTextContent(
      'photo.jpg'
    );
    expect(screen.getByLabelText('Upload failed')).toBeInTheDocument();
  });

  it('announces an upload in progress', () => {
    render(<FileChip name="Filename.pdf" status="uploading" />);
    expect(screen.getByTitle('Uploading')).toBeInTheDocument();
  });

  it('holds the complete check, then settles to idle and says so', () => {
    jest.useFakeTimers();
    const onSuccessEnd = jest.fn();
    render(
      <FileChip
        name="Filename.pdf"
        status="complete"
        onSuccessEnd={onSuccessEnd}
      />
    );
    expect(screen.getByLabelText('Uploaded')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1499);
    });
    expect(screen.getByLabelText('Uploaded')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.queryByLabelText('Uploaded')).toBeNull();
    expect(onSuccessEnd).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('removes by its labelled button, which carries the full name', async () => {
    const onRemove = jest.fn();
    render(
      <FileChip
        name="Quarterly-business-review-final-2026.pdf"
        onRemove={onRemove}
      />
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Quarterly-business-review-final-2026.pdf',
      })
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('removes with a MegaButton: ghost, extra small, icon only', () => {
    render(<FileChip name="Filename.pdf" />);
    expect(
      screen.getByRole('button', { name: 'Remove Filename.pdf' })
    ).toHaveClass(
      'cds--mega-button',
      'cds--mega-button--ghost',
      'cds--mega-button--xs',
      'cds--mega-button--icon-only',
      'cds--file-chip__remove'
    );
  });

  it('plays its exit before removing when motion is allowed', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof matchMedia;
    const onRemove = jest.fn();
    render(<FileChip name="Filename.pdf" onRemove={onRemove} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Filename.pdf' })
    );
    const chip = screen.getByRole('group');
    expect(chip).toHaveClass('cds--file-chip--leaving');
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.animationEnd(chip);
    expect(onRemove).toHaveBeenCalledTimes(1);
    window.matchMedia = matchMedia;
  });

  it('still removes when the exit animation never runs', () => {
    jest.useFakeTimers();
    const matchMedia = window.matchMedia;
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof matchMedia;
    const onRemove = jest.fn();
    render(<FileChip name="Filename.pdf" onRemove={onRemove} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Filename.pdf' })
    );
    expect(onRemove).not.toHaveBeenCalled();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onRemove).toHaveBeenCalledTimes(1);
    window.matchMedia = matchMedia;
    jest.useRealTimers();
  });

  it('renders the same under Carbon’s v12 switch', () => {
    render(
      <FeatureFlags enableV12Release>
        <FileChip name="Filename.pdf" status="error" errorMessage="Too large" />
      </FeatureFlags>
    );
    expect(screen.getByRole('group', { name: 'Filename.pdf' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Remove Filename.pdf' })
    ).toBeInTheDocument();
  });

  it('chooses Carbon’s glyph by extension, and takes an override', () => {
    const Custom = () => <svg data-testid="custom" />;
    render(<FileChip name="data.csv" renderIcon={Custom} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});
