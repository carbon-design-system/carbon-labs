/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Dropdown } from '@carbon/react';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { MdxComponent, NonScalarNode } from '../interfaces';
import { withPrefix } from '../utils';
import { TabContext } from './tabs';

interface SelectProps {
  _id: string;
  children: NonScalarNode;
}

export const Select: MdxComponent<SelectProps> = ({ children, _id }) => {
  const { setActiveTab } = useContext(TabContext);
  const items = React.Children.map(children, (child, index) => ({
    index,
    label: child.props.label,
  }));

  return (
    // @ts-ignore
    <Dropdown
      size="md"
      onChange={({ selectedItem }: { selectedItem: { index: number } }) =>
        setActiveTab(selectedItem.index)
      }
      initialSelectedItem={items?.[0]}
      label="tab selection"
      items={items}
      id={_id}
      className={withPrefix('tab-dropdown')}
    />
  );
};

Select.propTypes = {
  _id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.arrayOf(PropTypes.element.isRequired).isRequired,
  ]).isRequired,
};

export default Select;
