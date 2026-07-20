/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect, useState } from 'react';
import mdx from './RegistrationFlow.mdx';
import { RegistrationFlow } from '../components/RegistrationFlow';
import { RegistrationMasthead } from '../components/RegistrationMasthead';
import { RegistrationContent } from '../components/RegistrationContent';
import { RegistrationGreeting } from '../components/RegistrationGreeting';
import { RegistrationViewContainer } from '../components/RegistrationViewContainer';
import { RegistrationStepIndicator } from '../components/RegistrationStepIndicator';
import { RegistrationViewStack } from '../components/RegistrationViewStack';
import { RegistrationView } from '../components/RegistrationView';
import { RegistrationViewFooter } from '../components/RegistrationViewFooter';
import '../components/registration-flow.scss';
import urxBg from './images/urx-bg-full.png';
import { initCarousel } from '@carbon/utilities';
import { Button, Checkbox, FormGroup, Stack, TextInput } from '@carbon/react';
import { Details } from '../components/Details';
import './RegistrationFlow.stories.scss';

export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationFlow,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationFlow
 */
export const Default = () => {
  const viewStackRef = useRef(null);
  const [viewStackProgress, setViewStackProgress] = useState(0);
  useEffect(() => {
    const container = document.getElementById('ViewStackContainer');
    const config = {
      onViewChangeEnd: (endData) => {
        const numerator = endData.currentIndex + 1;
        const denominator = endData.totalViews;
        const percentage = numerator / denominator;
        if (!isNaN(percentage)) {
          setViewStackProgress(percentage);
        }
      },
      excludeSwipeSupport: true,
      useMaxHeight: true,
    };
    console.log('INIT NOW....');
    viewStackRef.current = initCarousel(container, config);
  }, []);

  return (
    <RegistrationFlow backgroundImage={urxBg}>
      <RegistrationMasthead />
      <RegistrationContent>
        <RegistrationGreeting
          title="IBM Product"
          description="Description here"
        />
        <RegistrationViewContainer title="Registration title here">
          <RegistrationStepIndicator
            currentIndex={1}
            progress={viewStackProgress}
            stepLabels={['Flow 1', 'Flow 2', 'Flow 3']}
          />
          <RegistrationViewStack id="ViewStackContainer">
            {/* VIEW 1 */}
            <RegistrationView>
              <Stack gap={7}>
                <TextInput
                  id="test2"
                  labelText="Text Input label"
                  placeholder="Placeholder text"
                />
                <TextInput
                  type="password"
                  required
                  id="test4"
                  labelText="Password"
                  invalid
                  invalidText="Your password must be at least 6 characters as well as contain at least one uppercase, one lowercase, and one number."
                />
                <Details title="Title" subtitle="This is the subtitle">
                  <>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nullam lacinia quis libero a vestibulum. Vivamus blandit
                      posuere rhoncus:
                    </p>
                    <ul>
                      <li>Mauris imperdiet iaculis auctor.</li>
                      <li>
                        Aliquam vulputate mi sed risus varius, ut imperdiet
                        libero pharetra.
                      </li>
                      <li>
                        Donec accumsan ex risus, ac iaculis nulla ultricies nec.
                      </li>
                    </ul>
                    <Button
                      className="full-width-button"
                      kind="tertiary"
                      href="http://www.ibm.com">
                      Go to the IBM website
                    </Button>
                  </>
                </Details>
              </Stack>
              <RegistrationViewFooter>
                <Button
                  kind="primary"
                  onClick={() => viewStackRef.current?.next()}>
                  Next
                </Button>
              </RegistrationViewFooter>
            </RegistrationView>
            {/* VIEW 2 */}
            <RegistrationView>
              <Stack gap={7}>
                <FormGroup legendText="">
                  <Checkbox
                    defaultChecked
                    labelText="Checkbox label"
                    id="checkbox-0"
                  />
                  <Checkbox labelText="Checkbox label" id="checkbox-1" />
                  <Checkbox
                    disabled
                    labelText="Checkbox label"
                    id="checkbox-2"
                  />
                </FormGroup>
                <TextInput
                  id="test5"
                  labelText="Text Input label"
                  placeholder="Placeholder text"
                />
                <TextInput
                  id="test6"
                  labelText="Text Input label"
                  placeholder="Placeholder text"
                />
                <TextInput
                  id="test7"
                  labelText="Text Input label"
                  placeholder="Placeholder text"
                />
              </Stack>
              <RegistrationViewFooter>
                <Button
                  kind="secondary"
                  onClick={() => viewStackRef.current?.prev()}>
                  Previous
                </Button>
                <Button
                  kind="primary"
                  onClick={() => viewStackRef.current?.next()}>
                  Next
                </Button>
              </RegistrationViewFooter>
            </RegistrationView>
            {/* VIEW 3 */}
            <RegistrationView>
              <Stack gap={7}>
                <TextInput
                  id="test55"
                  labelText="Text Input label"
                  placeholder="Placeholder text"
                />
              </Stack>
              <RegistrationViewFooter>
                <Button
                  kind="secondary"
                  onClick={() => viewStackRef.current?.prev()}>
                  Previous
                </Button>
                <Button kind="primary" onClick={() => alert('submit')}>
                  Submit
                </Button>
              </RegistrationViewFooter>
            </RegistrationView>
          </RegistrationViewStack>
        </RegistrationViewContainer>
      </RegistrationContent>
    </RegistrationFlow>
  );
};
