/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useRef, useEffect } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import cx from 'classnames';

/** Primary UI component for user interaction */

interface ResizeBarProps {
  orientation: 'horizontal' | 'vertical';

  /**
   * Mode for announcing.
   *
   * - "pixels" enables announcing in pixel values.
   * - "percentage" enables announcing in percentage values.
   * - "none" disables announcing mode.
   *
   * Note: Percentages will not work for single panels as there is no comparison value to derive the percentage.
   */
  mode?: 'pixels' | 'percentage' | 'none';

  onResize?: (delta: number, isKeyboardEvent: boolean) => void;
  onResizeEnd?: () => void;
  onDoubleClick?: () => string | void;

  // Any other additional props
  [key: string]: any;
}

export const ResizeBar = ({
  orientation,
  mode = 'pixels',
  onResize,
  onResizeEnd,
  onDoubleClick,
  ...rest
}: ResizeBarProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--resize-bar`;

  const ref = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentSizes = useRef({
    prev: { width: 0, height: 0 },
    next: { width: 0, height: 0 },
  });
  const initialSizes = useRef({
    prev: { width: 0, height: 0 },
    next: { width: 0, height: 0 },
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;
    const rect = (el: Element) => el?.getBoundingClientRect();

    initialSizes.current = {
      prev: prev
        ? { width: rect(prev).width, height: rect(prev).height }
        : { width: 0, height: 0 },
      next: next
        ? { width: rect(next).width, height: rect(next).height }
        : { width: 0, height: 0 },
    };
  }, []);

  // a11y effect
  useEffect(() => {
    if (!ref.current || mode === 'none' || onDoubleClick) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      const prev = ref.current?.previousElementSibling as HTMLElement;
      const next = ref.current?.nextElementSibling as HTMLElement;
      const prop = orientation === 'horizontal' ? 'height' : 'width';
      let message = '';

      if (mode === 'pixels') {
        if (prev) {
          const size = Math.round(prev.getBoundingClientRect()[prop]);
          message = `${
            orientation === 'horizontal' ? 'Top' : 'Left'
          } panel: ${size}px`;
        }
        if (next) {
          const size = Math.round(next.getBoundingClientRect()[prop]);
          if (prev) {
            message += `, ${
              orientation === 'horizontal' ? 'Bottom' : 'Right'
            } panel: ${size}px`;
          } else {
            message = `${
              orientation === 'horizontal' ? 'Bottom' : 'Right'
            } panel: ${size}px`;
          }
        }
      } else if (mode === 'percentage') {
        const container = prev?.parentElement || next?.parentElement;
        if (!container) {
          return;
        }

        const totalSize = container.getBoundingClientRect()[prop];

        if (prev) {
          const percentage = Math.round(
            (prev.getBoundingClientRect()[prop] / totalSize) * 100
          );
          message = `${
            orientation === 'horizontal' ? 'Top' : 'Left'
          } panel: ${percentage}%`;
        }
        if (next) {
          const percentage = Math.round(
            (next.getBoundingClientRect()[prop] / totalSize) * 100
          );
          if (prev) {
            message += `, ${
              orientation === 'horizontal' ? 'Bottom' : 'Right'
            } panel: ${percentage}%`;
          } else {
            message = `${
              orientation === 'horizontal' ? 'Bottom' : 'Right'
            } panel: ${percentage}%`;
          }
        }
      }

      ref.current?.setAttribute('aria-label', message);
    });

    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;

    prev && resizeObserver.observe(prev);
    next && resizeObserver.observe(next);

    return () => {
      resizeObserver?.disconnect();
    };
  }, [orientation, mode, onDoubleClick]);

  const updateSizes = (delta: number, isKeyboardEvent: boolean) => {
    if (!ref.current) {
      return;
    }

    if (onResize) {
      onResize(delta, isKeyboardEvent);
      return;
    }

    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;
    const prop = orientation === 'horizontal' ? 'height' : 'width';

    if (prev) {
      const newSize = currentSizes.current.prev[prop] + delta;
      prev.style[prop] = `${newSize}px`;
    }
    if (next) {
      const newSize = currentSizes.current.next[prop] - delta;
      next.style[prop] = `${newSize}px`;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) {
      return;
    }
    e.preventDefault();

    const delta =
      orientation === 'horizontal'
        ? e.clientY - startPos.current.y
        : e.clientX - startPos.current.x;
    updateSizes(delta, false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!ref.current) {
      return;
    }

    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;
    const rect = (el: Element) => el?.getBoundingClientRect();
    prev && (prev.style.transition = 'none');
    next && (next.style.transition = 'none');

    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    currentSizes.current = {
      prev: prev
        ? { width: rect(prev).width, height: rect(prev).height }
        : { width: 0, height: 0 },
      next: next
        ? { width: rect(next).width, height: rect(next).height }
        : { width: 0, height: 0 },
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    if (!ref.current) {
      return;
    }
    isResizing.current = false;
    if (onResizeEnd) {
      onResizeEnd();
    }
    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;
    if (prev) {
      prev.style.transition = '';
    }
    if (next) {
      next.style.transition = '';
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      ![
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(e.key)
    )
      {return}
    e.preventDefault();

    if (!ref.current) {
      return;
    }
    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;
    const rect = (el: Element) => el?.getBoundingClientRect();

    currentSizes.current = {
      prev: prev
        ? { width: rect(prev).width, height: rect(prev).height }
        : { width: 0, height: 0 },
      next: next
        ? { width: rect(next).width, height: rect(next).height }
        : { width: 0, height: 0 },
    };

    const step = e.shiftKey ? 25 : 5;
    let delta = 0;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowUp') {
        delta = -step;
      }
      if (e.key === 'ArrowDown') {
        delta = step;
      }
      if (e.key === 'Home') {
        delta = -currentSizes.current.prev.height;
      }
      if (e.key === 'End') {
        delta = currentSizes.current.next?.height || 0;
      }
    } else {
      if (e.key === 'ArrowLeft') {
        delta = -step;
      }
      if (e.key === 'ArrowRight') {
        delta = step;
      }
      if (e.key === 'Home') {
        delta = -currentSizes.current.prev.width;
      }
      if (e.key === 'End') {
        delta = currentSizes.current.next?.width || 0;
      }
    }

    updateSizes(delta, true);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!ref.current) {
      return;
    }

    const prev = ref.current.previousElementSibling as HTMLElement;
    const next = ref.current.nextElementSibling as HTMLElement;

    if (onDoubleClick) {
      onDoubleClick();
    } else {
      const prop = orientation === 'horizontal' ? 'height' : 'width';
      if (prev) {
        prev.style[prop] = `${initialSizes.current.prev[prop]}px`;
      }
      if (next) {
        next.style[prop] = `${initialSizes.current.next[prop]}px`;
      }

      if (mode === 'pixels') {
        const message =
          prev && next
            ? `Reset to initial size. ${
                orientation === 'horizontal' ? 'Top' : 'Left'
              } panel: ${Math.round(initialSizes.current.prev[prop])}px, ${
                orientation === 'horizontal' ? 'Bottom' : 'Right'
              } panel: ${Math.round(initialSizes.current.next[prop])}px`
            : prev
            ? `Reset to initial size. Panel: ${Math.round(
                initialSizes.current.prev[prop]
              )}px`
            : `Reset to initial size. Panel: ${Math.round(
                initialSizes.current.next[prop]
              )}px`;
        ref.current.setAttribute('aria-label', message);
      } else if (mode === 'percentage') {
        const container = prev?.parentElement || next?.parentElement;
        if (container) {
          const totalSize = container.getBoundingClientRect()[prop];
          const prevPercentage = prev
            ? Math.round((initialSizes.current.prev[prop] / totalSize) * 100)
            : 0;
          const nextPercentage = next
            ? Math.round((initialSizes.current.next[prop] / totalSize) * 100)
            : 0;

          const message =
            prev && next
              ? `Reset to initial size. ${
                  orientation === 'horizontal' ? 'Top' : 'Left'
                } panel: ${prevPercentage}%, ${
                  orientation === 'horizontal' ? 'Bottom' : 'Right'
                } panel: ${nextPercentage}%`
              : prev
              ? `Reset to initial size. Panel: ${prevPercentage}%`
              : `Reset to initial size. Panel: ${nextPercentage}%`;
          ref.current.setAttribute('aria-label', message);
        }
      }
    }

    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      {...rest}
      ref={rest.ref || ref}
      role="separator"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
      aria-live="polite"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={cx([
        blockClass,
        `${blockClass}--${orientation}`,
        rest.className,
      ])}>
      <span className="sr-only">
        Use arrow keys to resize, hold Shift for larger steps. Double-click to
        reset.
      </span>
    </div>
  );
};
