/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { Toc, TocItem, TocList, TocSection, TocSections } from '../index';

jest.mock('./whats-new.scss', () => ({}));
describe('Toc', () => {
  // const prefix = 'clabs--whats-new';
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    Element.prototype.scrollTo = jest.fn();
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      /**
       * observe mock
       */
      observe: () => null,
      /**
       * unobserve mock
       */
      unobserve: () => null,
      /**
       * disconnect mock
       */
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });
  describe('renders as expected - Component API', () => {
    it('should match snapshot', async () => {
      const { container, getByTestId } = render(
        <Toc>
          <TocList data-testid="TestTocList">
            <TocItem data-testid="TestTocListItem">List item 1</TocItem>
          </TocList>
          <TocSections data-testid="TestTocSections">
            <TocSection data-testid="TestTocSection">Section 1</TocSection>
          </TocSections>
        </Toc>
      );

      const tocListElement = getByTestId('TestTocList');
      const tocListItemElement = getByTestId('TestTocListItem');
      const tocSectionsElement = getByTestId('TestTocSections');
      const tocSectionElement = getByTestId('TestTocSection');
      expect(container).toMatchSnapshot();
      expect(tocListElement).toBeInTheDocument();
      expect(tocListItemElement).toBeInTheDocument();
      expect(tocSectionsElement).toBeInTheDocument();
      expect(tocSectionElement).toBeInTheDocument();
    });

    it('should display the correct number of TocItem elements within the TocList', async () => {
      render(
        <Toc>
          <TocList>
            <TocItem>List item 1</TocItem>
            <TocItem>List item 2</TocItem>
            <TocItem>List item 3</TocItem>
          </TocList>
          <TocSections>
            <TocSection>Section 1</TocSection>
            <TocSection>Section 2</TocSection>
            <TocSection>Section 3</TocSection>
          </TocSections>
        </Toc>
      );

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  describe('TocList / TocItem - Component API', () => {
    it('applies a custom class', () => {
      const tocListClass = 'testList2';
      const tocItemClass = 'testItem99';
      const tocSectionClass = 'testSection42';

      const { getByTestId } = render(
        <Toc>
          <TocList className={tocListClass} data-testid="TestTocList">
            <TocItem className={tocItemClass} data-testid="TestTocListItem">
              List item 1
            </TocItem>
          </TocList>
          <TocSections>
            <TocSection
              as="div"
              className={tocSectionClass}
              data-testid="TestTocSection">
              Section 1
            </TocSection>
          </TocSections>
        </Toc>
      );
      const listElement = getByTestId('TestTocList');
      const itemElement = getByTestId('TestTocListItem');
      const sectionElement = getByTestId('TestTocSection');

      expect(listElement).toHaveClass(tocListClass);
      expect(itemElement).toHaveClass(tocItemClass);
      expect(sectionElement).toHaveClass(tocSectionClass);
    });
  });

  describe('TocSections / TocSection - Component API', () => {
    it('applies a custom class', () => {
      const tocSectionsClass = 'testSections3';
      const tocSectionClass = 'testSection87';

      const { getByTestId } = render(
        <Toc>
          <TocList>
            <TocItem>List item 1</TocItem>
          </TocList>
          <TocSections
            className={tocSectionsClass}
            data-testid="TestTocSections">
            <TocSection
              className={tocSectionClass}
              data-testid="TestTocSection">
              Section 1
            </TocSection>
          </TocSections>
        </Toc>
      );
      const sectionsElement = getByTestId('TestTocSections');
      const sectionElement = getByTestId('TestTocSection');

      expect(sectionsElement).toHaveClass(tocSectionsClass);
      expect(sectionElement).toHaveClass(tocSectionClass);
    });
  });
});
