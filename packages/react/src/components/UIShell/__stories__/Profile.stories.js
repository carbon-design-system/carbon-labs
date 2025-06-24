/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef } from 'react';
import mdx from './Profile.mdx';

import { UserInfo } from '../components/UserInfo';
import {
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';
import { HeaderDivider } from '../components/HeaderDivider';
import { TrialCountdown } from '../components/TrialCountdown';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  MenuButton,
  MenuItemRadioGroup,
  ExpandableSearch,
  Link,
  Button,
} from '@carbon/react';
import {
  Notification,
  SquareOutline,
  UserAvatar,
  Help,
  ShoppingCart,
  Share,
  User,
} from '@carbon/icons-react';

import '../components/ui-shell.scss';

export default {
  title: 'Components/UIShell/Profile',
  component: UserInfo,
  parameters: {
      docs: {
        page: mdx,
      },
    },
};

/**
 * Story for Profile
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => {
  const headerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const options = {
    Fruits: ['Apple', 'Banana', 'Orange'],
    Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
    Animals: ['Cat', 'Dog', 'Snake'],
  };

  return (
    <Header aria-label="IBM Platform Name" ref={headerRef}>
      <SkipToContent />
      <HeaderName href="http://www.carbondesignsystem.com" prefix="IBM">
        [Platform]
      </HeaderName>
      <HeaderPopover align="bottom">
        <HeaderPopoverButton label="Trial Countdown" as={Button} kind="ghost">
          <TrialCountdown count={30} />
        </HeaderPopoverButton>
        <HeaderPopoverContent>
          <p>Your trial ends on May 13, 2025</p>
          <Link href="#" renderIcon={Share}>
            Invite team members
          </Link>
          <Link href="#" renderIcon={User}>
            Contact sales
          </Link>
          <Button size="sm" renderIcon={ShoppingCart}>
            Buy
          </Button>
        </HeaderPopoverContent>
      </HeaderPopover>
      <HeaderGlobalBar>
        <ExpandableSearch
          size="lg"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          id="search-expandable-1"
        />
        <HeaderGlobalAction
          aria-label="Custom action"
          tooltipHighContrast={false}>
          <SquareOutline size={20} />
        </HeaderGlobalAction>
        <HeaderPopover align="bottom-right">
          <HeaderPopoverButton align="bottom" label="Help">
            <Help size={20} />
          </HeaderPopoverButton>
          <HeaderPopoverContent>
            <p>
              Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
              do eiusmod tempor incididunt ut fsil labore et dolore magna
              aliqua.
            </p>
            <HeaderPopoverActions>
              <Link href="#">Link action</Link>
              <Button size="sm">Button</Button>
            </HeaderPopoverActions>
          </HeaderPopoverContent>
        </HeaderPopover>
        <HeaderPopover align="bottom-right">
          <HeaderPopoverButton align="bottom" label="Notifications">
            <Notification size={20} />
          </HeaderPopoverButton>
          <HeaderPopoverContent>
            <p>
              Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
              do eiusmod tempor incididunt ut fsil labore et dolore magna
              aliqua.
            </p>
            <HeaderPopoverActions>
              <Link href="#">Link action</Link>
              <Button size="sm">Button</Button>
            </HeaderPopoverActions>
          </HeaderPopoverContent>
        </HeaderPopover>
        <HeaderDivider />
        <MenuButton
          menuTarget={headerRef.current}
          kind="ghost"
          label={selectedCategory || 'Select Category'}>
          <MenuItemRadioGroup
            label="Category"
            items={Object.keys(options)}
            selectedItem={selectedCategory || null}
            onChange={(newCategory) => {
              setSelectedCategory(newCategory);
              setSelectedItem('');
            }}
          />
        </MenuButton>
        <MenuButton
          menuTarget={headerRef.current}
          kind="ghost"
          label={selectedItem || 'Select Item'}
          disabled={!selectedCategory}>
          <MenuItemRadioGroup
            label="Items"
            items={selectedCategory ? options[selectedCategory] : []}
            selectedItem={selectedItem || null}
            onChange={(newItem) => setSelectedItem(newItem)}
          />
        </MenuButton>
        <HeaderDivider />
        <HeaderPopover align="bottom-right">
          <HeaderPopoverButton align="bottom" label="Profile">
            <UserAvatar size={20} />
          </HeaderPopoverButton>
          <HeaderPopoverContent>
            <UserInfo name="Thomas J. Watson" email="thomas.watson@ibm.com" />
          </HeaderPopoverContent>
        </HeaderPopover>
      </HeaderGlobalBar>
    </Header>
  );
};
