/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import {
  IconTab,
  Tab,
  TabList,
  TabListVertical,
  TabPanel,
  TabPanels,
  Tabs,
  TabsVertical,
} from '../index';

// jsdom has no layout, no Web Animations and no fonts: stand-ins.
beforeAll(() => {
  const done = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = () => done as unknown as Animation;
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), load: () => Promise.resolve([]) },
  });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe('Tabs refs', () => {
  it('points a Tab’s and an IconTab’s ref at its button, and a TabPanel’s at its panel', () => {
    const tab = createRef<HTMLButtonElement>();
    const icon = createRef<HTMLButtonElement>();
    const panel = createRef<HTMLDivElement>();
    const { unmount } = render(
      <Tabs>
        <TabList aria-label="Views">
          <Tab ref={tab}>Overview</Tab>
          <IconTab ref={icon} label="Settings">
            <span>⚙</span>
          </IconTab>
        </TabList>
        <TabPanels>
          <TabPanel ref={panel}>The overview</TabPanel>
          <TabPanel>The settings</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(tab.current).toBeInstanceOf(HTMLButtonElement);
    expect(tab.current).toHaveAttribute('role', 'tab');
    expect(tab.current).toHaveTextContent('Overview');
    expect(icon.current).toHaveAttribute('aria-label', 'Settings');
    expect(panel.current).toHaveAttribute('role', 'tabpanel');
    expect(panel.current).toHaveTextContent('The overview');
    unmount();
    expect(tab.current).toBeNull();
    expect(panel.current).toBeNull();
  });

  it('calls a callback ref, in vertical tabs too', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    render(
      <TabsVertical>
        <TabListVertical aria-label="Sections">
          <Tab ref={(el) => seen.push(el)}>General</Tab>
          <Tab>Billing</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel>General settings</TabPanel>
          <TabPanel>Billing settings</TabPanel>
        </TabPanels>
      </TabsVertical>
    );
    expect(seen.at(-1)).toHaveTextContent('General');
  });
});
