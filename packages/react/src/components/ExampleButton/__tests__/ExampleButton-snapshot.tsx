// Component.test.tsx
import { render } from '@testing-library/react';
import {ExampleButton} from '../components/ExampleButton';
import React from 'react';
describe('YourComponent', () => {
  it('should match snapshot', () => {
    const { container } = render(<ExampleButton />);
    expect(container).toMatchSnapshot();
  });
});