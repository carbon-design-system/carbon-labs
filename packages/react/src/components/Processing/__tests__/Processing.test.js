/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import Processing from '../components/Processing';

jest.mock('./processing.scss', () => ({}));

describe('Processing', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<Processing />);
      expect(container).toMatchSnapshot();
    });

    it('should render with custom className and aria-label', () => {
      const { container } = render(
        <Processing className="custom-class" label="Custom loading state" />
      );
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveClass('custom-class');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Custom loading state'
      );
    });

    it('should apply data-ai attribute when ai prop is true', () => {
      const { container } = render(<Processing ai />);
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveAttribute('data-ai');
    });

    it('exposes imperative handle methods via ref', () => {
      const ref = React.createRef();
      render(<Processing ref={ref} />);
      expect(typeof ref.current.triggerTriangle).toBe('function');
      expect(typeof ref.current.triggerSquare).toBe('function');
      expect(typeof ref.current.triggerWiggle).toBe('function');
      expect(typeof ref.current.triggerOut).toBe('function');
    });
  });
});
