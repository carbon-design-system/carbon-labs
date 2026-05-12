import React from 'react';
import { ArrowRight } from '@carbon/icons-react';
import { Link, Stack } from '@carbon/react';
import './welcome.scss';
export const Welcome = () => {
  return (
    <>
      <div className="welcome__container">
        <h2 className="welcome__heading">@carbon-labs</h2>
        <Stack>
          <Link
            href="https://github.com/carbon-design-system/carbon-labs"
            className="welcome__link"
            renderIcon={ArrowRight}>
            GitHub repo
          </Link>
          <Link
            href="https://github.com/carbon-design-system/carbon-labs?tab=readme-ov-file#-contributing"
            className="welcome__link"
            renderIcon={ArrowRight}>
            How to contribute
          </Link>
          <Link
            href="https://carbondesignsystem.com/"
            className="welcome__link"
            renderIcon={ArrowRight}>
            Carbon Design System
          </Link>
          <Link
            href="https://pages.github.ibm.com/carbon/ibm-products/contributing/carbon-labs/"
            className="welcome__link"
            renderIcon={ArrowRight}>
            Carbon Labs (IBM internal)
          </Link>
          <Link
            href="https://github.com/carbon-design-system/carbon/blob/main/SECURITY.md"
            className="welcome__link"
            renderIcon={ArrowRight}>
            Security policy
          </Link>
        </Stack>
      </div>
    </>
  );
};
