import {
  HeaderDivider,
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '@carbon-labs/react-ui-shell';
import {
  Button,
  ExpandableSearch,
  HeaderGlobalAction,
  HeaderGlobalBar,
  MenuButton,
  MenuItemRadioGroup,
} from '@carbon/react';
import {
  Help,
  Notification,
  UserAvatar,
  SquareOutline,
} from '@carbon/react/icons';
import { useRef, useState } from 'react';
import { Link } from 'react-router';

const options = {
  Fruits: ['Apple', 'Banana', 'Orange'],
  Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
  Animals: ['Cat', 'Dog', 'Snake'],
};

export const HeaderGlobalBarExample = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const headerRef = useRef(null);

  return (
    <HeaderGlobalBar>
      <ExpandableSearch
        size='lg'
        labelText='Search'
        closeButtonLabelText='Clear search input'
        id='search-expandable-1'
      />
      <HeaderGlobalAction
        aria-label='Custom action'
        tooltipHighContrast={false}
      >
        <SquareOutline size={20} />
      </HeaderGlobalAction>
      <HeaderPopover align='bottom-right'>
        <HeaderPopoverButton align='bottom' label='Help'>
          <Help size={20} />
        </HeaderPopoverButton>
        <HeaderPopoverContent>
          <p>
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
          </p>
          <HeaderPopoverActions>
            <Link href='#'>Link action</Link>
            <Button size='sm'>Button</Button>
          </HeaderPopoverActions>
        </HeaderPopoverContent>
      </HeaderPopover>
      <HeaderPopover align='bottom-right'>
        <HeaderPopoverButton align='bottom' label='Notifications'>
          <Notification size={20} />
        </HeaderPopoverButton>
        <HeaderPopoverContent>
          <p>
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
          </p>
          <HeaderPopoverActions>
            <Link href='#'>Link action</Link>
            <Button size='sm'>Button</Button>
          </HeaderPopoverActions>
        </HeaderPopoverContent>
      </HeaderPopover>
      <HeaderDivider />
      <MenuButton
        menuTarget={headerRef.current}
        kind='ghost'
        label={selectedCategory || 'Select Category'}
      >
        <MenuItemRadioGroup
          label='Category'
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
        kind='ghost'
        label={selectedItem || 'Select Item'}
        disabled={!selectedCategory}
      >
        <MenuItemRadioGroup
          label='Items'
          items={selectedCategory ? options[selectedCategory] : []}
          selectedItem={selectedItem || null}
          onChange={(newItem) => setSelectedItem(newItem)}
        />
      </MenuButton>
      <HeaderDivider />
      <HeaderPopover align='bottom-right'>
        <HeaderPopoverButton align='bottom' label='Profile'>
          <UserAvatar size={20} />
        </HeaderPopoverButton>
        <HeaderPopoverContent>
          <p>
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
          </p>
          <HeaderPopoverActions>
            <Link href='#'>Link action</Link>
            <Button size='sm'>Button</Button>
          </HeaderPopoverActions>
        </HeaderPopoverContent>
      </HeaderPopover>
    </HeaderGlobalBar>
  );
};
